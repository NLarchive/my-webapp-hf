/**
 * Project API Routes
 * Endpoints for project information and structure
 */

import express from 'express';
import { projectService } from '../services/project.js';
import { logger } from '../config/logger.js';

const router = express.Router();

/**
 * GET /api/project/structure
 * Get project structure
 */
router.get('/structure', async (req, res) => {
  try {
    const structure = await projectService.getProjectStructure();

    res.json({
      success: true,
      structure,
    });
  } catch (error) {
    logger.error('Failed to get structure', { error: error.message });
    res.status(500).json({
      error: 'Failed to retrieve project structure',
      details: error.message,
    });
  }
});

/**
 * GET /api/project/file
 * Get file content (with path query param)
 */
router.get('/file', async (req, res) => {
  try {
    const { path } = req.query;

    if (!path) {
      return res.status(400).json({
        error: 'Missing required query parameter: path',
      });
    }

    const content = await projectService.getFileContent(path);

    res.json({
      success: true,
      path,
      content,
    });
  } catch (error) {
    logger.error('Failed to get file', { error: error.message });
    res.status(500).json({
      error: 'Failed to retrieve file',
      details: error.message,
    });
  }
});

/**
 * GET /api/project/readme
 * Get README content
 */
router.get('/readme', async (req, res) => {
  try {
    const content = await projectService.getReadme();

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    logger.error('Failed to get README', { error: error.message });
    res.status(500).json({
      error: 'Failed to retrieve README',
    });
  }
});

/**
 * GET /api/project/dockerfile
 * Get Dockerfile content
 */
router.get('/dockerfile', async (req, res) => {
  try {
    const content = await projectService.getDockerfile();

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    logger.error('Failed to get Dockerfile', { error: error.message });
    res.status(500).json({
      error: 'Failed to retrieve Dockerfile',
    });
  }
});

/**
 * GET /api/project/source-files
 * Get list of source files
 */
router.get('/source-files', async (req, res) => {
  try {
    const files = await projectService.getSourceFiles();

    res.json({
      success: true,
      files,
      count: files.length,
    });
  } catch (error) {
    logger.error('Failed to get source files', { error: error.message });
    res.status(500).json({
      error: 'Failed to retrieve source files',
    });
  }
});

export default router;
