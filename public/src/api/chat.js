/**
 * Chat API Routes
 * WebSocket and HTTP endpoints for chat functionality
 */

import express from 'express';
import { chatAgent } from '../agents/chat.js';
import { logger } from '../config/logger.js';

const router = express.Router();

/**
 * POST /api/chat/message
 * Send message and get response
 */
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        error: 'Missing required fields: sessionId, message',
      });
    }

    const response = await chatAgent.processMessage(sessionId, message);

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Chat message processing failed', { error: error.message });
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message,
    });
  }
});

/**
 * GET /api/chat/history/:sessionId
 * Get conversation history
 */
router.get('/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = chatAgent.getHistory(sessionId);

    res.json({
      sessionId,
      messageCount: history.length,
      messages: history,
    });
  } catch (error) {
    logger.error('Failed to get chat history', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

/**
 * POST /api/chat/start
 * Start new conversation
 */
router.post('/start', (req, res) => {
  try {
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const context = chatAgent.startConversation(sessionId);

    res.json({
      success: true,
      sessionId,
      context,
    });
  } catch (error) {
    logger.error('Failed to start conversation', { error: error.message });
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

/**
 * DELETE /api/chat/clear/:sessionId
 * Clear conversation
 */
router.delete('/clear/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    chatAgent.clearConversation(sessionId);

    res.json({
      success: true,
      message: 'Conversation cleared',
    });
  } catch (error) {
    logger.error('Failed to clear conversation', { error: error.message });
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
});

/**
 * GET /api/chat/stats
 * Get chat statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = {
      activeConversations: chatAgent.getActiveConversationCount(),
      timestamp: new Date().toISOString(),
    };

    res.json(stats);
  } catch (error) {
    logger.error('Failed to get chat stats', { error: error.message });
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
