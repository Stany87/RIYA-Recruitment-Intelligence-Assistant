const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const agencyScope = require('../middleware/agencyScope');

const router = express.Router();

// Apply auth and agency scoping at router level
router.use(auth);
router.use(agencyScope);

/**
 * GET /api/v1/jobs
 * List all jobs for the agency with dynamic candidate counts
 */
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { agencyId: req.agencyId };

    if (status && status !== 'all') {
      query.status = status;
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();

    // Dynamically calculate applicant counts to keep them 100% accurate
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const count = await Candidate.countDocuments({
          agencyId: req.agencyId,
          jobId: job._id,
        });
        return {
          ...job,
          applicantCount: count,
        };
      })
    );

    res.json({
      success: true,
      data: jobsWithCounts,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/jobs/:id
 * Retrieve details for a single job
 */
router.get('/:id', async (req, res, next) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      agencyId: req.agencyId,
    }).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    // Dynamic candidate count
    const count = await Candidate.countDocuments({
      agencyId: req.agencyId,
      jobId: job._id,
    });
    job.applicantCount = count;

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/jobs/:id/funnel
 * Get stage distribution of candidates for a specific job
 */
router.get('/:id/funnel', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Job ID' });
    }

    const stageCounts = await Candidate.aggregate([
      {
        $match: {
          agencyId: req.user.agencyId,
          jobId: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
        },
      },
    ]);

    const stageMap = {};
    Candidate.STAGES.forEach((s) => (stageMap[s] = 0));
    stageCounts.forEach((c) => (stageMap[c._id] = c.count));

    res.json({
      success: true,
      data: stageMap,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/jobs
 * Create a new job vacancy
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      title,
      department,
      location,
      type,
      experienceMin,
      salaryMin,
      salaryMax,
      currency,
      description,
      requirements,
      niceToHave,
      status,
      closingDate,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required.',
      });
    }

    const newJob = await Job.create({
      agencyId: req.agencyId,
      createdBy: req.user._id,
      title: title.trim(),
      department: department || '',
      location: location || '',
      type: type || 'full-time',
      experienceMin: experienceMin || 0,
      salaryMin: salaryMin || null,
      salaryMax: salaryMax || null,
      currency: currency || 'INR',
      description: description || '',
      requirements: requirements || [],
      niceToHave: niceToHave || [],
      status: status || 'active',
      closingDate: closingDate || null,
    });

    // Log Activity
    await Activity.create({
      agencyId: req.agencyId,
      entityType: 'job',
      entityId: newJob._id,
      action: 'job_created',
      performedBy: req.user._id,
      metadata: { jobTitle: newJob.title },
    });

    res.status(201).json({
      success: true,
      message: 'Job description created successfully.',
      data: newJob,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/jobs/:id
 * Update an existing job details
 */
router.put('/:id', async (req, res, next) => {
  try {
    const {
      title,
      department,
      location,
      type,
      experienceMin,
      salaryMin,
      salaryMax,
      currency,
      description,
      requirements,
      niceToHave,
      status,
      closingDate,
    } = req.body;

    const job = await Job.findOne({
      _id: req.params.id,
      agencyId: req.agencyId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    if (title !== undefined) job.title = title.trim();
    if (department !== undefined) job.department = department;
    if (location !== undefined) job.location = location;
    if (type !== undefined) job.type = type;
    if (experienceMin !== undefined) job.experienceMin = experienceMin;
    if (salaryMin !== undefined) job.salaryMin = salaryMin;
    if (salaryMax !== undefined) job.salaryMax = salaryMax;
    if (currency !== undefined) job.currency = currency;
    if (description !== undefined) job.description = description;
    if (requirements !== undefined) job.requirements = requirements;
    if (niceToHave !== undefined) job.niceToHave = niceToHave;
    if (status !== undefined) job.status = status;
    if (closingDate !== undefined) job.closingDate = closingDate;

    await job.save();

    // Log Activity
    await Activity.create({
      agencyId: req.agencyId,
      entityType: 'job',
      entityId: job._id,
      action: 'job_updated',
      performedBy: req.user._id,
      metadata: { jobTitle: job.title },
    });

    res.json({
      success: true,
      message: 'Job description updated successfully.',
      data: job,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/jobs/:id
 * Soft or hard delete a job
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      agencyId: req.agencyId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    // Log Activity
    await Activity.create({
      agencyId: req.agencyId,
      entityType: 'job',
      entityId: job._id,
      action: 'job_deleted',
      performedBy: req.user._id,
      metadata: { jobTitle: job.title },
    });

    res.json({
      success: true,
      message: 'Job description deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/jobs/:id/sync
 * Mocks the synchronization of a job description to Relevance AI KB
 */
router.post('/:id/sync', async (req, res, next) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      agencyId: req.agencyId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    // Mocks sync action
    await Activity.create({
      agencyId: req.agencyId,
      entityType: 'job',
      entityId: job._id,
      action: 'job_kb_synced',
      performedBy: req.user._id,
      metadata: { jobTitle: job.title },
    });

    res.json({
      success: true,
      message: `Successfully synchronized '${job.title}' to RIYA Knowledge Base.`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
