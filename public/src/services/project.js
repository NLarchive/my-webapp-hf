/**
 * Project Service
 * Reads and analyzes project files from the repository
 */

import { githubService } from './github.js';
import { logger } from '../config/logger.js';

class ProjectService {
  constructor() {
    this.cachedProjectStructure = null;
    this.cacheExpiry = 0;
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get project structure
   * @returns {Promise<Object>} Project structure
   */
  async getProjectStructure() {
    const now = Date.now();
    
    if (this.cachedProjectStructure && now < this.cacheExpiry) {
      logger.debug('Using cached project structure');
      return this.cachedProjectStructure;
    }

    try {
      const root = await githubService.listFiles('');
      const structure = {
        files: [],
        directories: [],
        timestamp: new Date().toISOString(),
      };

      for (const item of root) {
        if (item.type === 'file') {
          structure.files.push({
            name: item.name,
            path: item.path,
            size: item.size,
          });
        } else if (item.type === 'dir') {
          structure.directories.push({
            name: item.name,
            path: item.path,
          });
        }
      }

      this.cachedProjectStructure = structure;
      this.cacheExpiry = now + this.CACHE_TTL;

      logger.info('Project structure retrieved', {
        files: structure.files.length,
        dirs: structure.directories.length,
      });

      return structure;
    } catch (error) {
      logger.warn('Failed to get project structure from GitHub', { error: error.message });
      // Return mock structure for demo/testing
      return this.getMockProjectStructure();
    }
  }

  /**
   * Get mock project structure for demo
   * @returns {Object} Mock structure
   */
  getMockProjectStructure() {
    return {
      files: [
        { name: 'package.json', path: 'package.json', size: 850 },
        { name: 'Dockerfile', path: 'Dockerfile', size: 320 },
        { name: 'README.md', path: 'README.md', size: 2050 },
        { name: '.env.example', path: '.env.example', size: 450 },
        { name: '.gitignore', path: '.gitignore', size: 280 },
      ],
      directories: [
        { name: 'public', path: 'public' },
        { name: 'src', path: 'src' },
        { name: 'assets', path: 'assets' },
        { name: 'scripts', path: 'scripts' },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get specific file content
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} File content
   */
  async getFileContent(filePath) {
    try {
      const response = await githubService.getFileContents(filePath);
      
      if (response.type === 'file') {
        // Decode base64 content
        return Buffer.from(response.content, 'base64').toString('utf-8');
      }
      
      throw new Error('Path is not a file');
    } catch (error) {
      logger.error('Failed to read file', { error: error.message, filePath });
      throw error;
    }
  }

  /**
   * Scan project for common issues
   * @returns {Promise<Object>} Scan results
   */
  async scanForIssues() {
    try {
      const structure = await this.getProjectStructure();
      const issues = [];

      // Check for missing critical files
      const criticalFiles = ['package.json', 'README.md', 'Dockerfile'];
      const fileNames = structure.files.map((f) => f.name);

      for (const file of criticalFiles) {
        if (!fileNames.includes(file)) {
          issues.push({
            type: 'missing_file',
            severity: 'high',
            file,
            message: `Critical file missing: ${file}`,
          });
        }
      }

      // Check for common security issues
      if (fileNames.includes('.env')) {
        issues.push({
          type: 'security',
          severity: 'critical',
          file: '.env',
          message: '.env file should not be committed',
        });
      }

      // Check for outdated dependencies (if package.json exists)
      if (fileNames.includes('package.json')) {
        try {
          const packageJson = await this.getFileContent('package.json');
          const pkg = JSON.parse(packageJson);
          
          // Check if dependencies are very old (would need date comparison)
          if (pkg.dependencies) {
            issues.push({
              type: 'warning',
              severity: 'medium',
              file: 'package.json',
              message: 'Review and update dependencies periodically',
            });
          }
        } catch (e) {
          logger.warn('Failed to parse package.json', { error: e.message });
        }
      }

      logger.info('Project scan completed', { issuesFound: issues.length });
      return {
        issues,
        timestamp: new Date().toISOString(),
        scanDuration: 'immediate',
      };
    } catch (error) {
      logger.error('Project scan failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get README content
   * @returns {Promise<string>} README content
   */
  async getReadme() {
    try {
      return await this.getFileContent('README.md');
    } catch (error) {
      logger.warn('Failed to read README from GitHub', { error: error.message });
      // Return mock README
      return this.getMockReadme();
    }
  }

  /**
   * Get mock README for demo
   * @returns {string} Mock README content
   */
  getMockReadme() {
    return `# AI Agent for GitHub Project Management

An intelligent AI agent deployed on Hugging Face Spaces that scans GitHub projects, generates documentation, detects issues, and provides a chat interface.

## Features

- 🤖 **Automated Project Scanning** - Periodically scans project structure
- 📚 **Auto-Generated Documentation** - Creates comprehensive project docs
- 💬 **AI Chat Interface** - Chat with Gemini AI about your project
- 🔐 **Secure GitHub Integration** - GitHub App authentication

## Quick Start

\`\`\`bash
cd public
npm install
npm start
\`\`\`

Visit http://localhost:7860

## Configuration

Set these environment variables:
- GEMINI_API_KEY: Your Gemini API key
- GITHUB_TOKEN: Your GitHub token (or use GitHub App auth)

## API Endpoints

- GET /health - Health check
- POST /api/chat/send - Send chat message
- POST /api/scanner/scan - Trigger project scan
- GET /api/project/structure - Get project structure`;
  }

  /**
   * Get Dockerfile
   * @returns {Promise<string>} Dockerfile content
   */
  async getDockerfile() {
    try {
      return await this.getFileContent('Dockerfile');
    } catch (error) {
      logger.warn('Failed to read Dockerfile from GitHub', { error: error.message });
      // Return mock Dockerfile
      return this.getMockDockerfile();
    }
  }

  /**
   * Get mock Dockerfile for demo
   * @returns {string} Mock Dockerfile content
   */
  getMockDockerfile() {
    return `FROM node:18-alpine

WORKDIR /app

COPY public/package*.json ./

RUN npm ci --omit=dev

COPY public .

EXPOSE 7860

ENV NODE_ENV=production
ENV PORT=7860

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:7860/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]`;
  }

  /**
   * Get list of source files (JS, TS, etc)
   * @returns {Promise<Array>} Source files
   */
  async getSourceFiles() {
    try {
      const structure = await this.getProjectStructure();
      const extensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go'];
      
      return structure.files.filter((f) =>
        extensions.some((ext) => f.name.endsWith(ext))
      );
    } catch (error) {
      logger.error('Failed to get source files', { error: error.message });
      return [];
    }
  }
}

export const projectService = new ProjectService();
