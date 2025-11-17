/**
 * Logger Service
 * Centralized logging for all modules
 */

import { config } from './env.js';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const LEVEL_NAMES = {
  0: 'ERROR',
  1: 'WARN',
  2: 'INFO',
  3: 'DEBUG',
};

const currentLevel = LOG_LEVELS[config.LOG_LEVEL] ?? 2;

export const logger = {
  error: (message, data = {}) => {
    if (currentLevel >= LOG_LEVELS.error) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, data);
    }
  },
  
  warn: (message, data = {}) => {
    if (currentLevel >= LOG_LEVELS.warn) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
    }
  },
  
  info: (message, data = {}) => {
    if (currentLevel >= LOG_LEVELS.info) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
    }
  },
  
  debug: (message, data = {}) => {
    if (currentLevel >= LOG_LEVELS.debug) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
    }
  },
};
