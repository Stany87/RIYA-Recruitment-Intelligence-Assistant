const express = require('express');
const Candidate = require('../models/Candidate');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const agencyScope = require('../middleware/agencyScope');

const router = express.Router();

// Apply auth + agency scoping at router level — every route below is protected
router.use(auth);
router.use(agencyScope);

/**
 * GET /api/v1/candidates
 * List candidates with pagination, filtering, search, and sorting.
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 25,
      search,
      stage,
      recommendation,
      sort = '-createdAt',
    } = req.query;

    const query = { agencyId: req.agencyId };

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by stage (comma-separated for multi-select)
    if (stage) {
      const stages = stage.split(',').map((s) => s.trim());
      query.stage = { $in: stages };
    }

    // Filter by AI recommendation
    if (recommendation && recommendation !== 'all') {
      query.aiRecommendation = recommendation.toUpperCase();
    }

    // Build sort object
    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [candidates, total] = await Promise.all([
      Candidate.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Candidate.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        candidates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/candidates/stages
 * Get candidate counts grouped by stage (for kanban column headers).
 */
router.get('/stages', async (req, res, next) => {
  try {
    const counts = await Candidate.aggregate([
      { $match: { agencyId: req.user.agencyId } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]);

    const stageMap = {};
    Candidate.STAGES.forEach((s) => (stageMap[s] = 0));
    counts.forEach((c) => (stageMap[c._id] = c.count));

    res.json({ success: true, data: stageMap });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/candidates/:id
 * Get a single candidate by ID (scoped to agency).
 */
router.get('/:id', async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      agencyId: req.agencyId,
    }).lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found.',
      });
    }

    res.json({ success: true, data: candidate });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/candidates/sync
 *
 * ONE-TIME MIGRATION UTILITY — not an ongoing pipeline.
 *
 * Imports candidate data from a JSON payload (sourced from Google Sheets
 * or any external system). Upserts by email within the agency:
 *   - New candidates are created with stage 'ai_screened'
 *   - Existing candidates: only AI fields are updated
 *     (stage, recruiterNotes, recruiterScore are NEVER overwritten)
 *
 * Request body: { candidates: [{ name, email, jobAppliedFor, aiScore,
 *   aiRecommendation, strengths, gaps, redFlags, ... }] }
 *
 * This route is flagged as a migration utility. For production,
 * RIYA should write directly to MongoDB via the API.
 */
router.post('/sync', async (req, res, next) => {
  try {
    const { candidates } = req.body;

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must contain a non-empty "candidates" array.',
      });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (const row of candidates) {
      try {
        if (!row.name || !row.email) {
          skipped++;
          continue;
        }

        const existing = await Candidate.findOne({
          agencyId: req.agencyId,
          email: row.email.toLowerCase(),
        });

        if (existing) {
          // Update AI fields only — never overwrite recruiter data
          existing.aiScore = row.aiScore ?? existing.aiScore;
          existing.aiRecommendation =
            row.aiRecommendation ?? existing.aiRecommendation;
          existing.jobAppliedFor =
            row.jobAppliedFor ?? existing.jobAppliedFor;
          if (row.strengths || row.gaps || row.redFlags) {
            existing.aiScreeningData = {
              ...existing.aiScreeningData?.toObject?.() || {},
              strengths: row.strengths || existing.aiScreeningData?.strengths || [],
              gaps: row.gaps || existing.aiScreeningData?.gaps || [],
              redFlags: row.redFlags || existing.aiScreeningData?.redFlags || [],
              screenedAt: new Date(),
            };
          }
          await existing.save();
          updated++;
        } else {
          // Create new candidate
          await Candidate.create({
            agencyId: req.agencyId,
            name: row.name.trim(),
            email: row.email.toLowerCase().trim(),
            phone: row.phone || '',
            location: row.location || '',
            jobAppliedFor: row.jobAppliedFor || '',
            aiScore: row.aiScore ?? null,
            aiRecommendation: row.aiRecommendation || null,
            aiScreeningData: {
              strengths: row.strengths || [],
              gaps: row.gaps || [],
              redFlags: row.redFlags || [],
              screenedAt: row.aiScore != null ? new Date() : null,
            },
            stage: row.aiScore != null ? 'ai_screened' : 'new_application',
            stageHistory: [
              {
                stage:
                  row.aiScore != null ? 'ai_screened' : 'new_application',
                movedBy: 'system',
                movedAt: new Date(),
                note: 'Imported via sheet sync migration',
              },
            ],
            source: 'sheet_sync',
          });
          created++;
        }
      } catch (err) {
        errors.push({ email: row.email, error: err.message });
        skipped++;
      }
    }

    // Log the sync activity
    await Activity.create({
      agencyId: req.agencyId,
      entityType: 'candidate',
      entityId: req.user._id,
      action: 'candidates_synced',
      performedBy: req.user._id,
      metadata: { created, updated, skipped, errorCount: errors.length },
    });

    res.json({
      success: true,
      data: { created, updated, skipped, errors: errors.slice(0, 10) },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/candidates/:id/stage
 * Move candidate to a new pipeline stage.
 * Logs to stageHistory and creates an Activity record.
 */
router.patch('/:id/stage', async (req, res, next) => {
  try {
    const { stage, note } = req.body;

    if (!stage || !Candidate.STAGES.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage. Must be one of: ${Candidate.STAGES.join(', ')}`,
      });
    }

    const candidate = await Candidate.findOne({
      _id: req.params.id,
      agencyId: req.agencyId,
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found.',
      });
    }

    const previousStage = candidate.stage;
    candidate.stage = stage;
    candidate.stageHistory.push({
      stage,
      movedBy: req.user._id,
      movedAt: new Date(),
      note: note || '',
    });

    await candidate.save();

    // Log activity
    await Activity.create({
      agencyId: req.agencyId,
      entityType: 'candidate',
      entityId: candidate._id,
      action: 'stage_changed',
      performedBy: req.user._id,
      metadata: {
        previousStage,
        newStage: stage,
        candidateName: candidate.name,
      },
    });

    res.json({ success: true, data: candidate });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/candidates/:id/notes
 * Update recruiter notes for a candidate.
 */
router.patch('/:id/notes', async (req, res, next) => {
  try {
    const { recruiterNotes } = req.body;

    const candidate = await Candidate.findOneAndUpdate(
      { _id: req.params.id, agencyId: req.agencyId },
      { recruiterNotes },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found.',
      });
    }

    res.json({ success: true, data: candidate });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/candidates/:id/recruiter-score
 * Set recruiter score override (1-10).
 */
router.patch('/:id/recruiter-score', async (req, res, next) => {
  try {
    const { recruiterScore } = req.body;

    if (
      recruiterScore != null &&
      (recruiterScore < 1 || recruiterScore > 10)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Recruiter score must be between 1 and 10.',
      });
    }

    const candidate = await Candidate.findOneAndUpdate(
      { _id: req.params.id, agencyId: req.agencyId },
      { recruiterScore },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found.',
      });
    }

    // Log activity
    await Activity.create({
      agencyId: req.agencyId,
      entityType: 'candidate',
      entityId: candidate._id,
      action: 'recruiter_score_set',
      performedBy: req.user._id,
      metadata: {
        score: recruiterScore,
        candidateName: candidate.name,
      },
    });

    res.json({ success: true, data: candidate });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
