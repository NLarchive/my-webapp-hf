/**
 * Documentation API Routes
 * Endpoints for generating project documentation
 */

import express from 'express';
import { docGeneratorAgent } from '../agents/doc-generator.js';
import { projectService } from '../services/project.js';
import { logger } from '../config/logger.js';

const router = express.Router();

/**
 * POST /api/docs/project
 * Generate project documentation
 */
router.post('/project', async (req, res) => {
  try {
    logger.info('Generating project documentation');
    const structure = await projectService.getProjectStructure();
    const doc = await docGeneratorAgent.generateProjectDocumentation(structure);

    res.json({
      success: true,
      documentation: doc,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to generate project documentation', { error: error.message });
    res.status(500).json({
      error: 'Documentation generation failed',
      details: error.message,
    });
  }
});

/**
 * POST /api/docs/file
 * Generate documentation for a specific file
 */
router.post('/file', async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        error: 'Missing required field: filePath',
      });
    }

    logger.info('Generating file documentation', { file: filePath });
    const doc = await docGeneratorAgent.generateFileDocumentation(filePath);

    res.json({
      success: true,
      file: filePath,
      documentation: doc,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to generate file documentation', { error: error.message });
    res.status(500).json({
      error: 'File documentation generation failed',
      details: error.message,
    });
  }
});

/**
 * POST /api/docs/readme
 * Generate README for project
 */
router.post('/readme', async (req, res) => {
  try {
    logger.info('Generating README');
    const readme = await docGeneratorAgent.generateReadme();

    res.json({
      success: true,
      readme,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to generate README', { error: error.message });
    res.status(500).json({
      error: 'README generation failed',
      details: error.message,
    });
  }
});

export default router;
