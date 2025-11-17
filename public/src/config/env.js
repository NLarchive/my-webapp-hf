/**
 * Environment Configuration
 * Centralized configuration management for all services
 */

export const config = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // API Keys
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  HF_TOKEN: process.env.HF_TOKEN || '',
  
  // GitHub
  GITHUB_REPO: process.env.GITHUB_REPO || 'NLarchive/my-webapp-hf',
  GITHUB_OWNER: process.env.GITHUB_OWNER || 'NLarchive',
  GITHUB_BRANCH: process.env.GITHUB_BRANCH || 'main',
  
  // Hugging Face
  HF_SPACE_NAME: process.env.HF_SPACE_NAME || 'my-webapp-hf',
  HF_SPACE_URL: process.env.HF_SPACE_URL || 'https://huggingface.co/spaces/NLarchive/my-webapp-hf',
  
  // Scanner Configuration
  SCAN_INTERVAL: parseInt(process.env.SCAN_INTERVAL || '3600000', 10), // 1 hour in ms
  ENABLE_AUTO_FIX: process.env.ENABLE_AUTO_FIX === 'true',
  AUTO_COMMIT: process.env.AUTO_COMMIT === 'true',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  DEBUG: process.env.DEBUG === 'true',
};

export function validateConfig() {
  const required = ['GEMINI_API_KEY', 'GITHUB_TOKEN'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  
  return true;
}
