const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const Agency = require('../models/Agency');
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');
const agencyScope = require('../middleware/agencyScope');

const router = express.Router();

// Apply auth & agency scoping middleware
router.use(auth);
router.use(agencyScope);

/**
 * GET /api/v1/chat/messages
 * Retrieves last 50 chat messages for the agency
 */
router.get('/messages', async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ agencyId: req.agencyId })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/chat/messages
 * Sends a message, triggers the AI agent, persists both user and assistant replies
 */
router.post('/messages', async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.',
      });
    }

    // 1. Get Agency to check settings
    const agency = await Agency.findById(req.agencyId);
    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found.',
      });
    }

    // 2. Save User Message
    const userMsg = await ChatMessage.create({
      agencyId: req.agencyId,
      userId: req.user._id,
      role: 'user',
      content: message.trim(),
    });

    // 3. Get AI Response
    let replyContent = '';
    try {
      replyContent = await aiService.sendMessage(agency, req.user._id, message);
    } catch (err) {
      replyContent = `Error: ${err.message}`;
    }

    // 4. Save Assistant Response
    const aiMsg = await ChatMessage.create({
      agencyId: req.agencyId,
      userId: req.user._id,
      role: 'assistant',
      content: replyContent,
    });

    res.json({
      success: true,
      data: {
        userMessage: userMsg,
        aiMessage: aiMsg,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/chat/messages
 * Clears message history for the agency
 */
router.delete('/messages', async (req, res, next) => {
  try {
    await ChatMessage.deleteMany({ agencyId: req.agencyId });

    res.json({
      success: true,
      message: 'Chat history cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
