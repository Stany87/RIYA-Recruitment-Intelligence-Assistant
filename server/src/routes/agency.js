const express = require('express');
const Agency = require('../models/Agency');
const relevanceService = require('../services/relevanceService');
const auth = require('../middleware/auth');
const agencyScope = require('../middleware/agencyScope');

const router = express.Router();

// Apply auth & agency scoping middleware
router.use(auth);
router.use(agencyScope);

/**
 * Helper to mask API Key
 */
function maskApiKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return `••••••••${key.slice(-4)}`;
}

/**
 * GET /api/v1/agency/settings
 * Retrieves agency settings (masked)
 */
router.get('/settings', async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.agencyId).lean();
    if (!agency) {
      return res.status(404).json({ success: false, message: 'Agency not found.' });
    }

    // Prepare settings for client
    const responseSettings = {
      sheetsId: agency.settings?.sheetsId || '',
      autoScreening: agency.settings?.autoScreening ?? true,
      connectedGmail: agency.settings?.connectedGmail || '',
      riyaAgentId: agency.settings?.riyaAgentId || '',
      riyaProjectId: agency.settings?.riyaProjectId || '',
      riyaRegionCode: agency.settings?.riyaRegionCode || '',
      riyaApiKey: maskApiKey(agency.settings?.riyaApiKey),
      hasRiyaApiKey: !!agency.settings?.riyaApiKey,
      notifyOnShortlist: agency.settings?.notifyOnShortlist ?? false,
    };

    res.json({
      success: true,
      data: responseSettings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/agency/settings
 * Updates agency settings
 */
router.put('/settings', async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.agencyId);
    if (!agency) {
      return res.status(404).json({ success: false, message: 'Agency not found.' });
    }

    const {
      sheetsId,
      autoScreening,
      connectedGmail,
      riyaAgentId,
      riyaProjectId,
      riyaRegionCode,
      riyaApiKey,
      notifyOnShortlist,
    } = req.body;

    // Initialize settings if empty
    if (!agency.settings) {
      agency.settings = {};
    }

    // Standard updates
    if (sheetsId !== undefined) agency.settings.sheetsId = sheetsId;
    if (autoScreening !== undefined) agency.settings.autoScreening = autoScreening;
    if (connectedGmail !== undefined) agency.settings.connectedGmail = connectedGmail;
    if (riyaAgentId !== undefined) agency.settings.riyaAgentId = riyaAgentId;
    if (riyaProjectId !== undefined) agency.settings.riyaProjectId = riyaProjectId;
    if (riyaRegionCode !== undefined) agency.settings.riyaRegionCode = riyaRegionCode;
    if (notifyOnShortlist !== undefined) agency.settings.notifyOnShortlist = notifyOnShortlist;

    // API Key update logic (do not overwrite if sent as masked)
    if (riyaApiKey !== undefined && riyaApiKey.trim() !== '') {
      const isMasked = riyaApiKey.includes('••') || riyaApiKey.includes('••');
      if (!isMasked) {
        agency.settings.riyaApiKey = riyaApiKey.trim();
      }
    } else if (riyaApiKey === '') {
      agency.settings.riyaApiKey = '';
    }

    await agency.save();

    // Return updated settings (masked)
    const responseSettings = {
      sheetsId: agency.settings.sheetsId || '',
      autoScreening: agency.settings.autoScreening,
      connectedGmail: agency.settings.connectedGmail || '',
      riyaAgentId: agency.settings.riyaAgentId || '',
      riyaProjectId: agency.settings.riyaProjectId || '',
      riyaRegionCode: agency.settings.riyaRegionCode || '',
      riyaApiKey: maskApiKey(agency.settings.riyaApiKey),
      hasRiyaApiKey: !!agency.settings.riyaApiKey,
      notifyOnShortlist: agency.settings.notifyOnShortlist,
    };

    res.json({
      success: true,
      message: 'Settings updated successfully.',
      data: responseSettings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/agency/settings/test-relevance
 * Test connection to Relevance AI agent trigger
 */
router.post('/settings/test-relevance', async (req, res, next) => {
  try {
    const { riyaAgentId, riyaApiKey, riyaProjectId, riyaRegionCode } = req.body;

    let finalApiKey = riyaApiKey;

    // If key is masked, retrieve from DB
    const isMasked = riyaApiKey?.includes('••') || riyaApiKey?.includes('••');
    if (isMasked || !riyaApiKey) {
      const agency = await Agency.findById(req.agencyId);
      if (agency && agency.settings?.riyaApiKey) {
        finalApiKey = agency.settings.riyaApiKey;
      }
    }

    if (!riyaAgentId || !finalApiKey || !riyaProjectId || !riyaRegionCode) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID, API Key, Project ID, and Region Code are all required to test connection.',
      });
    }

    try {
      await relevanceService.testConnection(
        riyaAgentId,
        finalApiKey,
        riyaProjectId,
        riyaRegionCode
      );
      res.json({
        success: true,
        message: 'Successfully connected to Relevance AI agent!',
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: `Connection test failed: ${err.message}`,
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
