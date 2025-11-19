/**
 * Scanner API Routes
 * Endpoints for project scanning and issue detection
 */

import express from 'express';
import { scannerAgent } from '../agents/scanner.js';
import { projectService } from '../services/project.js';
import { logger } from '../config/logger.js';

const router = express.Router();

/**
 * POST /api/scanner/scan
 * Trigger manual scan
 */
router.post('/scan', async (req, res) => {
  try {
    logger.info('Manual scan triggered');
    const report = await scannerAgent.performScan();

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    logger.error('Scan failed', { error: error.message });
    res.status(500).json({
      error: 'Scan failed',
      details: error.message,
    });
  }
});

/**
 * POST /api/scanner/modify
 * Trigger auto-modifications
 */
router.post('/modify', async (req, res) => {
  try {
    logger.info('Auto-modifications triggered manually');

    // First perform a scan
    const report = await scannerAgent.performScan();

    // Then perform modifications
    await scannerAgent.performAutoModifications(report);

    res.json({
      success: true,
      message: 'Auto-modifications completed',
      report,
    });
  } catch (error) {
    logger.error('Auto-modifications failed', { error: error.message });
    res.status(500).json({
      error: 'Auto-modifications failed',
      details: error.message,
    });
  }
});

/**
 * GET /api/scanner/last-report
 * Get last scan report
 */
router.get('/last-report', (req, res) => {
  try {
    const report = scannerAgent.getLastScan();

    if (!report) {
      return res.status(404).json({
        error: 'No scan report available yet',
      });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    logger.error('Failed to get report', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve report' });
  }
});

/**
 * GET /api/scanner/issues
 * Get detected issues
 */
router.get('/issues', async (req, res) => {
  try {
    const issues = await projectService.scanForIssues();

    res.json({
      success: true,
      ...issues,
    });
  } catch (error) {
    logger.error('Failed to scan issues', { error: error.message });
    res.status(500).json({
      error: 'Failed to scan issues',
      details: error.message,
    });
  }
});

/**
 * POST /api/scanner/start-continuous
 * Start continuous scanning
 */
router.post('/start-continuous', (req, res) => {
  try {
    scannerAgent.startPeriodicScanning();

    res.json({
      success: true,
      message: 'Continuous scanning started',
    });
  } catch (error) {
    logger.error('Failed to start scanning', { error: error.message });
    res.status(500).json({ error: 'Failed to start scanning' });
  }
});

/**
 * POST /api/scanner/stop-continuous
 * Stop continuous scanning
 */
router.post('/stop-continuous', (req, res) => {
  try {
    scannerAgent.stopScanning();

    res.json({
      success: true,
      message: 'Continuous scanning stopped',
    });
  } catch (error) {
    logger.error('Failed to stop scanning', { error: error.message });
    res.status(500).json({ error: 'Failed to stop scanning' });
  }
});

export default router;
