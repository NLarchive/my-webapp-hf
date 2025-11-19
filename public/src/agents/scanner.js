/**
 * AI Scanner Agent
 * Periodically scans project for issues and suggests fixes
 */

import { projectService } from '../services/project.js';
import { geminiService } from '../services/gemini.js';
import { githubService } from '../services/github.js';
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
