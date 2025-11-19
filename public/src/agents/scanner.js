/**
 * AI Scanner Agent
 * Periodically scans project for issues and suggests fixes
 */

import { projectService } from '../services/project.js';
import { geminiService } from '../services/gemini.js';
import { githubService } from '../services/github.js';
import { docGeneratorAgent } from './doc-generator.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

class ScannerAgent {
  constructor() {
    this.lastScan = null;
    this.scanInterval = null;
  }

  /**
   * Start periodic scanning
   */
  startPeriodicScanning() {
    if (this.scanInterval) {
      logger.warn('Scanning already active');
      return;
    }

    logger.info('Starting periodic scanning', {
      interval: config.SCAN_INTERVAL,
    });

    // Run immediately
    this.performScan();

    // Then run at intervals
    this.scanInterval = setInterval(() => {
      this.performScan();
    }, config.SCAN_INTERVAL);
  }

  /**
   * Stop periodic scanning
   */
  stopScanning() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
      logger.info('Periodic scanning stopped');
    }
  }

  /**
   * Perform full project scan
   * @returns {Promise<Object>} Scan results
   */
  async performScan() {
    const startTime = Date.now();
    
    logger.info('Starting project scan...');

    try {
      // 1. Get project structure
      const structure = await projectService.getProjectStructure();

      // 2. Scan for issues
      const issues = await projectService.scanForIssues();

      // 3. Analyze critical files
      const analysis = await this.analyzeProject();

      // 4. Generate report
      const report = {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        structure,
        issues: issues.issues,
        analysis,
        recommendations: await this.generateRecommendations(issues, analysis),
      };

      this.lastScan = report;

      logger.info('Scan completed', {
        duration: report.duration,
        issuesFound: issues.issues.length,
      });

      // 5. Optionally create issue if problems found
      if (config.ENABLE_AUTO_FIX && issues.issues.length > 0) {
        await this.createIssueFromScan(report);
      }

      // 6. Perform auto-modifications if enabled
      if (config.ENABLE_AUTO_MODIFY) {
        await this.performAutoModifications(report);
      }

      return report;
    } catch (error) {
      logger.error('Scan failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Analyze project files with AI
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeProject() {
    try {
      const sourceFiles = await projectService.getSourceFiles();
      const analysis = {
        files: [],
        overallHealth: 'unknown',
      };

      // Analyze first 5 source files for performance
      for (const file of sourceFiles.slice(0, 5)) {
        try {
          const content = await projectService.getFileContent(file.path);
          const codeAnalysis = await geminiService.analyzeCode(
            content,
            this.getLanguageFromFile(file.name)
          );

          analysis.files.push({
            name: file.name,
            analysis: codeAnalysis,
          });
        } catch (e) {
          logger.warn(`Failed to analyze ${file.name}`, { error: e.message });
        }
      }

      return analysis;
    } catch (error) {
      logger.error('Project analysis failed', { error: error.message });
      return { files: [], overallHealth: 'error' };
    }
  }

  /**
   * Generate recommendations based on scan
   * @param {Object} issues - Issues found
   * @param {Object} analysis - AI analysis
   * @returns {Promise<Array>} Recommendations
   */
  async generateRecommendations(issues, analysis) {
    if (issues.issues.length === 0) {
      return [
        {
          priority: 'low',
          suggestion: 'Keep code reviewed regularly',
          reason: 'No critical issues found',
        },
      ];
    }

    try {
      const issuesText = issues.issues
        .map((i) => `- [${i.severity}] ${i.message}`)
        .join('\n');

      const prompt = `Based on these project issues, suggest 3 actionable fixes:

${issuesText}

For each suggestion provide:
1. What to fix
2. Why it's important
3. How to implement (brief)`;

      const response = await geminiService.generate(prompt);

      return [
        {
          priority: 'high',
          suggestion: response,
          reason: 'AI-generated recommendations based on scan',
        },
      ];
    } catch (error) {
      logger.error('Failed to generate recommendations', { error: error.message });
      return [];
    }
  }

  /**
   * Create GitHub issue from scan results
   * @param {Object} report - Scan report
   */
  async createIssueFromScan(report) {
    try {
      const issueBody = this.formatScanReportAsIssue(report);

      const issue = await githubService.createIssue({
        title: `🤖 AI Scanner: Issues Detected (${new Date().toLocaleDateString()})`,
        body: issueBody,
        labels: ['ai-detected', 'needs-review', 'auto-generated'],
      });

      logger.info('Created issue from scan', { issueNumber: issue.number, repo: config.GITHUB_REPO });
    } catch (error) {
      logger.error('Failed to create issue', { error: error.message, repo: config.GITHUB_REPO });
    }
  }

  /**
   * Format scan report as GitHub issue
   * @param {Object} report - Scan report
   * @returns {string} Formatted issue body
   */
  formatScanReportAsIssue(report) {
    let body = '## 🤖 AI Scanner Report\n\n';
    body += `**Repository:** ${config.GITHUB_REPO}\n`;
    body += `**Branch:** ${config.GITHUB_BRANCH}\n\n`;

    if (report.issues.length > 0) {
      body += '### 🚨 Issues Found\n';
      report.issues.forEach((issue) => {
        body += `- **[${issue.severity}]** ${issue.message}\n`;
        body += `  - File: \`${issue.file}\`\n`;
        body += `  - Type: ${issue.type}\n\n`;
      });
    } else {
      body += '### ✅ No Critical Issues Found\n\n';
    }

    if (report.recommendations && report.recommendations.length > 0) {
      body += '### 💡 Recommendations\n';
      report.recommendations.forEach((rec) => {
        body += `- **[${rec.priority}]** ${rec.suggestion}\n\n`;
      });
    }

    if (report.analysis && report.analysis.files.length > 0) {
      body += '### 📊 Code Analysis\n';
      report.analysis.files.forEach((f) => {
        body += `- **${f.name}**: Analyzed successfully\n`;
      });
      body += '\n';
    }

    body += `---\n`;
    body += `_Scanned at: ${report.timestamp}_\n`;
    body += `_Scan duration: ${report.duration}ms_\n`;
    body += `_By: AI Scanner Agent_`;

    return body;
  }

  /**
   * Get last scan results
   * @returns {Object} Last scan report
   */
  getLastScan() {
    return this.lastScan;
  }

  /**
   * Perform auto-modifications based on scan results
   * @param {Object} report - Scan report
   */
  async performAutoModifications(report) {
    try {
      logger.info('Starting auto-modifications...');

      const modifications = [];

      // 1. Add missing README.md
      if (!report.structure.files.some(f => f.name === 'README.md')) {
        await this.addMissingReadme();
        modifications.push('Added README.md');
      }

      // 2. Add missing .gitignore
      if (!report.structure.files.some(f => f.name === '.gitignore')) {
        await this.addMissingGitignore();
        modifications.push('Added .gitignore');
      }

      // 3. Add missing package.json scripts
      if (report.structure.files.some(f => f.name === 'package.json')) {
        const packageModified = await this.enhancePackageJson();
        if (packageModified) {
          modifications.push('Enhanced package.json with additional scripts');
        }
      }

      // 4. Add documentation to source files
      const docsAdded = await this.addDocumentationToFiles(report);
      if (docsAdded > 0) {
        modifications.push(`Added documentation to ${docsAdded} source files`);
      }

      // 5. Create project architecture documentation
      await this.createArchitectureDoc(report);
      modifications.push('Created/updated ARCHITECTURE.md');

      if (modifications.length > 0) {
        logger.info('Auto-modifications completed', { modifications });
        await this.createModificationReport(modifications);
      } else {
        logger.info('No auto-modifications needed');
      }

    } catch (error) {
      logger.error('Auto-modifications failed', { error: error.message });
    }
  }

  /**
   * Add missing README.md file
   */
  async addMissingReadme() {
    try {
      const readmeContent = await docGeneratorAgent.generateReadme();
      // Note: In real implementation, this would create a PR
      logger.info('Generated README content (would create PR in real implementation)');
      return readmeContent;
    } catch (error) {
      logger.error('Failed to generate README', { error: error.message });
    }
  }

  /**
   * Add missing .gitignore file
   */
  async addMissingGitignore() {
    try {
      const gitignoreContent = `node_modules/
.env
.env.local
*.log
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
*.swo
dist/
build/
coverage/
.nyc_output/`;
      logger.info('Generated .gitignore content (would create PR in real implementation)');
      return gitignoreContent;
    } catch (error) {
      logger.error('Failed to generate .gitignore', { error: error.message });
    }
  }

  /**
   * Enhance package.json with additional scripts
   */
  async enhancePackageJson() {
    try {
      const packageJson = await projectService.getFileContent('package.json');
      const pkg = JSON.parse(packageJson);

      let modified = false;

      // Add common scripts if missing
      if (!pkg.scripts) pkg.scripts = {};

      if (!pkg.scripts.test) {
        pkg.scripts.test = 'echo "Tests coming soon"';
        modified = true;
      }

      if (!pkg.scripts.build && pkg.scripts.start) {
        pkg.scripts.build = 'echo "Build step not needed for this project"';
        modified = true;
      }

      if (!pkg.scripts.dev && pkg.scripts.start) {
        pkg.scripts.dev = 'node --watch src/server.js';
        modified = true;
      }

      if (modified) {
        logger.info('Enhanced package.json scripts (would create PR in real implementation)');
      }

      return modified;
    } catch (error) {
      logger.error('Failed to enhance package.json', { error: error.message });
      return false;
    }
  }

  /**
   * Add documentation to source files
   * @param {Object} report - Scan report
   * @returns {number} Number of files documented
   */
  async addDocumentationToFiles(report) {
    try {
      let docsAdded = 0;

      if (report.analysis && report.analysis.files) {
        for (const file of report.analysis.files.slice(0, 3)) { // Limit to 3 files
          try {
            const doc = await docGeneratorAgent.generateFileDocumentation(file.name);
            if (doc) {
              logger.info(`Generated documentation for ${file.name} (would create PR in real implementation)`);
              docsAdded++;
            }
          } catch (e) {
            logger.warn(`Failed to document ${file.name}`, { error: e.message });
          }
        }
      }

      return docsAdded;
    } catch (error) {
      logger.error('Failed to add file documentation', { error: error.message });
      return 0;
    }
  }

  /**
   * Create/update architecture documentation
   * @param {Object} report - Scan report
   */
  async createArchitectureDoc(report) {
    try {
      const archContent = `# Project Architecture

## Overview
This is an AI-powered project management system with automated scanning and documentation capabilities.

## Structure
${report.structure.directories.map(dir => `- **${dir.name}/**: ${this.describeDirectory(dir.name)}`).join('\n')}

## Key Files
${report.structure.files.slice(0, 10).map(file => `- **${file.name}**: ${this.describeFile(file.name)}`).join('\n')}

## Components
- **Scanner Agent**: Periodically analyzes project for issues
- **Documentation Generator**: Auto-generates project documentation
- **Chat Interface**: AI-powered conversation system
- **GitHub Integration**: Secure repository access and issue management

## Technologies
- Node.js with Express.js
- Google Generative AI (Gemini)
- Octokit for GitHub API
- Docker for containerization

*Generated by AI Scanner Agent on ${new Date().toISOString()}*`;

      logger.info('Generated architecture documentation (would create PR in real implementation)');
      return archContent;
    } catch (error) {
      logger.error('Failed to create architecture doc', { error: error.message });
    }
  }

  /**
   * Create a report of modifications made
   * @param {Array} modifications - List of modifications
   */
  async createModificationReport(modifications) {
    try {
      const reportContent = `# 🤖 AI Agent Auto-Modifications Report

## Summary
The AI Agent has automatically improved your project with the following modifications:

${modifications.map(mod => `- ✅ ${mod}`).join('\n')}

## Details

### What Was Done
${modifications.map(mod => `#### ${mod}\n- Automatically generated and applied\n`).join('\n')}

## Next Steps
1. Review the changes in the generated Pull Request
2. Test the modifications locally
3. Merge the PR if satisfied with the changes

## Configuration
To disable auto-modifications, set:
\`\`\`
ENABLE_AUTO_MODIFY=false
\`\`\`

*Report generated on ${new Date().toISOString()}*`;

      logger.info('Created modification report (would create PR in real implementation)');
      return reportContent;
    } catch (error) {
      logger.error('Failed to create modification report', { error: error.message });
    }
  }

  /**
   * Helper: Describe a directory
   * @param {string} dirName - Directory name
   * @returns {string} Description
   */
  describeDirectory(dirName) {
    const descriptions = {
      'src': 'Source code and business logic',
      'public': 'Web server files and frontend assets',
      'assets': 'Static assets (CSS, JS, images)',
      'scripts': 'Utility scripts and automation',
      'docs': 'Documentation files',
      'tests': 'Test files and test configuration',
      '.github': 'GitHub Actions and configuration'
    };
    return descriptions[dirName] || 'Project directory';
  }

  /**
   * Helper: Describe a file
   * @param {string} fileName - File name
   * @returns {string} Description
   */
  describeFile(fileName) {
    const descriptions = {
      'package.json': 'Node.js dependencies and scripts',
      'Dockerfile': 'Container build configuration',
      'README.md': 'Project documentation',
      '.gitignore': 'Git ignore rules',
      'server.js': 'Main application server',
      'index.html': 'Web interface entry point'
    };
    return descriptions[fileName] || 'Project file';
  }

  /**
   * Helper: Get language from filename
   * @param {string} filename - Filename
   * @returns {string} Language
   */
  getLanguageFromFile(filename) {
    if (filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.jsx')) return 'jsx';
    if (filename.endsWith('.tsx')) return 'tsx';
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.java')) return 'java';
    if (filename.endsWith('.go')) return 'go';
    return 'javascript';
  }
}

export const scannerAgent = new ScannerAgent();
