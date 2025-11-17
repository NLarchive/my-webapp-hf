/**
 * GitHub Service
 * Handles GitHub API interactions (PR creation, issue creation, commits, etc.)
 */

import axios from 'axios';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

class GitHubService {
  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `token ${config.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
  }

  /**
   * Create a GitHub issue
   * @param {Object} issue - Issue details
   * @returns {Promise<Object>} Created issue
   */
  async createIssue(issue) {
    try {
      const { title, body, labels = [], assignees = [] } = issue;
      
      const response = await this.api.post(
        `/repos/${config.GITHUB_REPO}/issues`,
        { title, body, labels, assignees }
      );

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
      const {
        title,
        body,
        head,
        base = config.GITHUB_BRANCH,
        draft = false,
      } = pr;

      const response = await this.api.post(
        `/repos/${config.GITHUB_REPO}/pulls`,
        { title, body, head, base, draft }
      );

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
      const response = await this.api.get(
        `/repos/${config.GITHUB_REPO}/contents/${path}`
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get file contents', { error: error.message, path });
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
      const response = await this.api.post(
        `/repos/${config.GITHUB_REPO}/actions/workflows/${workflowId}/dispatches`,
        {
          ref: config.GITHUB_BRANCH,
          inputs,
        }
      );

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
      const response = await this.api.get(`/repos/${config.GITHUB_REPO}`);
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
      const response = await this.api.get(
        `/repos/${config.GITHUB_REPO}/issues`,
        { params: { state } }
      );
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
      const response = await this.api.post(
        `/repos/${config.GITHUB_REPO}/issues/${issueNumber}/comments`,
        { body }
      );

      logger.info('Issue comment added', { issueNumber });
      return response.data;
    } catch (error) {
      logger.error('Failed to add issue comment', { error: error.message });
      throw error;
    }
  }
}

export const githubService = new GitHubService();
