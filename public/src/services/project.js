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
      logger.error('Failed to get project structure', { error: error.message });
      throw error;
    }
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
      logger.warn('Failed to read README', { error: error.message });
      return null;
    }
  }

  /**
   * Get Dockerfile
   * @returns {Promise<string>} Dockerfile content
   */
  async getDockerfile() {
    try {
      return await this.getFileContent('Dockerfile');
    } catch (error) {
      logger.warn('Failed to read Dockerfile', { error: error.message });
      return null;
    }
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
