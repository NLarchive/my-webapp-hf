/**
 * GitHub Service
 * Handles GitHub API interactions (PR creation, issue creation, commits, etc.)
 */

import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

class GitHubService {
  constructor() {
    this.octokit = null;
    this.initialized = false;
  }

  async ensureInitialized() {
    if (this.initialized) return;
    
    try {
      // Try GitHub App authentication first
      if (config.GH_APP_ID && config.GH_APP_PRIVATE_KEY_B64 && config.GH_APP_INSTALLATION_ID) {
        const privateKey = Buffer.from(config.GH_APP_PRIVATE_KEY_B64, 'base64').toString('utf8');

        const auth = createAppAuth({
          appId: config.GH_APP_ID,
          privateKey,
          installationId: config.GH_APP_INSTALLATION_ID,
        });

        this.octokit = new Octokit({
          authStrategy: auth,
          auth: { type: 'installation' },
        });

        logger.info('GitHub App authentication initialized');
      }
      // Fallback to personal access token
      else if (config.GITHUB_TOKEN) {
        this.octokit = new Octokit({
          auth: config.GITHUB_TOKEN,
        });

        logger.info('GitHub token authentication initialized');
      }
      else {
        logger.warn('No GitHub authentication configured - read-only mode');
        // Use unauthenticated client (rate limited)
        this.octokit = new Octokit();
      }
      
      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize GitHub client', { error: error.message });
      throw error;
    }
  }

  /**
   * Create a GitHub issue
   * @param {Object} issue - Issue details
   * @returns {Promise<Object>} Created issue
   */
  async createIssue(issue) {
    try {
      await this.ensureInitialized();
      const { title, body, labels = [], assignees = [] } = issue;

      const response = await this.octokit.issues.create({
        owner: config.GITHUB_OWNER,
        repo: config.GITHUB_REPO.split('/')[1],
        title,
        body,
        labels,
        assignees,
      });

      logger.info('GitHub issue created', { issueNumber: response.data.number });
      return response.data;
    } catch (error) {
      logger.error('Failed to create GitHub issue', { error: error.message });
      throw error;
    }
  }

  /**
   * Create a pull request
   * @param {Object} pr - PR details
   * @returns {Promise<Object>} Created PR
   */
  async createPullRequest(pr) {
    try {
      await this.ensureInitialized();
      const {
        title,
        body,
        head,
        base = config.GITHUB_BRANCH,
        draft = false,
      } = pr;

      const response = await this.octokit.pulls.create({
        owner: config.GITHUB_OWNER,
        repo: config.GITHUB_REPO.split('/')[1],
        title,
        body,
        head,
        base,
        draft,
      });

      logger.info('GitHub PR created', { prNumber: response.data.number });
      return response.data;
    } catch (error) {
      logger.error('Failed to create GitHub PR', { error: error.message });
      throw error;
    }
  }

  /**
   * Get repository contents
   * @param {string} path - File path
   * @returns {Promise<Object>} File contents
   */
  async getFileContents(path = '') {
    try {
      await this.ensureInitialized();
      const response = await this.octokit.repos.getContent({
        owner: config.GITHUB_OWNER,
        repo: config.GITHUB_REPO.split('/')[1],
        path,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get file contents', { error: error.message, path });
      // If the error indicates bad credentials, retry with unauthenticated client
      if (error.status === 401 || /Bad credentials/i.test(error.message)) {
        logger.warn('GitHub auth failed, retrying unauthenticated (read-only)');
        this.octokit = new Octokit();
        try {
          const response = await this.octokit.repos.getContent({
            owner: config.GITHUB_OWNER,
            repo: config.GITHUB_REPO.split('/')[1],
            path,
          });
          return response.data;
        } catch (e) {
          logger.error('Retry without auth failed', { error: e.message, path });
          throw e;
        }
      }
      throw error;
    }
  }

  /**
   * List files in directory
   * @param {string} path - Directory path
   * @returns {Promise<Array>} File list
   */
  async listFiles(path = '') {
    try {
      const contents = await this.getFileContents(path);
      
      if (Array.isArray(contents)) {
        return contents;
      }
      return [contents];
    } catch (error) {
      logger.error('Failed to list files', { error: error.message, path });
      throw error;
    }
  }

  /**
   * Trigger a GitHub Actions workflow
   * @param {string} workflowId - Workflow ID or filename
   * @param {Object} inputs - Workflow inputs
   * @returns {Promise<Object>} Dispatch result
   */
  async triggerWorkflow(workflowId, inputs = {}) {
    try {
      await this.ensureInitialized();
      const response = await this.octokit.actions.createWorkflowDispatch({
        owner: config.GITHUB_OWNER,
        repo: config.GITHUB_REPO.split('/')[1],
        workflow_id: workflowId,
        ref: config.GITHUB_BRANCH,
        inputs,
      });

      logger.info('Workflow triggered', { workflowId });
      return response.data;
    } catch (error) {
      logger.error('Failed to trigger workflow', { error: error.message });
      throw error;
    }
  }

  /**
   * Get repository information
   * @returns {Promise<Object>} Repository info
   */
  async getRepoInfo() {
    try {
      await this.ensureInitialized();
      const response = await this.octokit.repos.get({
        owner: config.GITHUB_OWNER,
        repo: config.GITHUB_REPO.split('/')[1],
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to get repo info', { error: error.message });
      throw error;
    }
  }

  /**
   * Get list of issues
   * @param {string} state - 'open' or 'closed'
   * @returns {Promise<Array>} Issues list
   */
  async listIssues(state = 'open') {
    try {
      await this.ensureInitialized();
      const response = await this.octokit.issues.listForRepo({
        owner: config.GITHUB_OWNER,
        repo: config.GITHUB_REPO.split('/')[1],
        state,
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to list issues', { error: error.message });
      throw error;
    }
  }

  /**
   * Add comment to issue
   * @param {number} issueNumber - Issue number
   * @param {string} body - Comment body
   * @returns {Promise<Object>} Comment result
   */
  async addIssueComment(issueNumber, body) {
    try {
      await this.ensureInitialized();
      const response = await this.octokit.issues.createComment({
        owner: config.GITHUB_OWNER,
        repo: config.GITHUB_REPO.split('/')[1],
        issue_number: issueNumber,
        body,
      });

      logger.info('Issue comment added', { issueNumber });
      return response.data;
    } catch (error) {
      logger.error('Failed to add issue comment', { error: error.message });
      throw error;
    }
  }
}

export const githubService = new GitHubService();
