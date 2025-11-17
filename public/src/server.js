/**
 * Main Server Entry Point
 * Express server setup with API routes and scheduled tasks
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config, validateConfig } from './config/env.js';
import { logger } from './config/logger.js';
import { scannerAgent } from './agents/scanner.js';

// API Routes
import chatRoutes from './api/chat.js';
import scannerRoutes from './api/scanner.js';
import projectRoutes from './api/project.js';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/project', projectRoutes);

// Serve static files
app.use(express.static('public'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({
    error: 'Internal server error',
    message: config.DEBUG ? err.message : 'Something went wrong',
  });
});

// Start server
async function startServer() {
  try {
    // Validate configuration
    validateConfig();

    // Start server
    app.listen(config.PORT, () => {
      logger.info(`Server started on port ${config.PORT}`);
    });

    // Start scanner if enabled
    if (config.ENABLE_AUTO_FIX) {
      scannerAgent.startPeriodicScanning();
    } else {
      logger.info('Auto-fix is disabled');
    }
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  scannerAgent.stopScanning();
  process.exit(0);
});

startServer();
