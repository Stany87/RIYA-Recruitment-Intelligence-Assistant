const express = require('express');
const Candidate = require('../models/Candidate');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const agencyScope = require('../middleware/agencyScope');

const router = express.Router();

router.use(auth);
router.use(agencyScope);

/**
 * GET /api/v1/dashboard/stats
 * Aggregated dashboard statistics for the agency.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCandidates,
      inReview,
      shortlistedThisWeek,
      interviewsThisWeek,
      placementsThisMonth,
      stageCounts,
    ] = await Promise.all([
      Candidate.countDocuments({ agencyId: req.agencyId }),
      Candidate.countDocuments({
        agencyId: req.agencyId,
        stage: 'under_review',
      }),
      Candidate.countDocuments({
        agencyId: req.agencyId,
        stage: 'shortlisted',
        'stageHistory.movedAt': { $gte: startOfWeek },
      }),
      Candidate.countDocuments({
        agencyId: req.agencyId,
        stage: 'interview',
      }),
      Candidate.countDocuments({
        agencyId: req.agencyId,
        stage: 'hired',
        'stageHistory.movedAt': { $gte: startOfMonth },
      }),
      Candidate.aggregate([
        { $match: { agencyId: req.user.agencyId } },
        { $group: { _id: '$stage', count: { $sum: 1 } } },
      ]),
    ]);

    // Build stage distribution map
    const stageDistribution = {};
    Candidate.STAGES.forEach((s) => (stageDistribution[s] = 0));
    stageCounts.forEach((c) => (stageDistribution[c._id] = c.count));

    res.json({
      success: true,
      data: {
        totalCandidates,
        inReview,
        shortlistedThisWeek,
        interviewsThisWeek,
        placementsThisMonth,
        stageDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/dashboard/activity
 * Recent activity feed for the agency (last 20 events).
 */
router.get('/activity', async (req, res, next) => {
  try {
    const activities = await Activity.find({ agencyId: req.agencyId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
