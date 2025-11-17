/**
 * Chat Agent
 * Handles user conversations and AI-powered requests
 */

import { geminiService } from '../services/gemini.js';
import { projectService } from '../services/project.js';
import { githubService } from '../services/github.js';
import { logger } from '../config/logger.js';

class ChatAgent {
  constructor() {
    this.conversations = new Map();
  }

  /**
   * Start new conversation
   * @param {string} sessionId - Unique session ID
   * @returns {Object} Conversation context
   */
  startConversation(sessionId) {
    const context = {
      sessionId,
      startedAt: new Date().toISOString(),
      messages: [],
      projectContext: null,
    };

    this.conversations.set(sessionId, context);
    logger.debug('Conversation started', { sessionId });

    return context;
  }

  /**
   * Process user message
   * @param {string} sessionId - Session ID
   * @param {string} message - User message
   * @returns {Promise<string>} AI response
   */
  async processMessage(sessionId, message) {
    let context = this.conversations.get(sessionId);

    if (!context) {
      context = this.startConversation(sessionId);
    }

    // Load project context if needed
    if (!context.projectContext) {
      try {
        context.projectContext = await projectService.getProjectStructure();
        context.projectContext.readme = await projectService.getReadme();
      } catch (e) {
        logger.warn('Failed to load project context', { error: e.message });
      }
    }

    // Add message to history
    context.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    try {
      // Check if message is a command
      const response = await this.handleMessage(message, context);

      // Add response to history
      context.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      });

      this.conversations.set(sessionId, context);

      return response;
    } catch (error) {
      logger.error('Failed to process message', { error: error.message, sessionId });
      const errorResponse = `Sorry, I encountered an error: ${error.message}`;

      context.messages.push({
        role: 'assistant',
        content: errorResponse,
        timestamp: new Date().toISOString(),
      });

      this.conversations.set(sessionId, context);
      return errorResponse;
    }
  }

  /**
   * Handle different message types
   * @param {string} message - User message
   * @param {Object} context - Conversation context
   * @returns {Promise<string>} Response
   */
  async handleMessage(message, context) {
    // Check for commands
    if (message.startsWith('/scan')) {
      return this.handleScanCommand(context);
    }

    if (message.startsWith('/status')) {
      return this.handleStatusCommand(context);
    }

    if (message.startsWith('/issues')) {
      return this.handleIssuesCommand(context);
    }

    if (message.startsWith('/help')) {
      return this.getHelpText();
    }

    // Regular conversation with AI
    const aiContext = this.buildAIContext(context);
    const response = await geminiService.chat(message);

    return response;
  }

  /**
   * Handle /scan command
   * @param {Object} context - Conversation context
   * @returns {Promise<string>} Response
   */
  async handleScanCommand(context) {
    try {
      const scanResults = await projectService.scanForIssues();

      if (scanResults.issues.length === 0) {
        return '✅ Scan complete! No issues detected in the project.';
      }

      const issuesList = scanResults.issues
        .map(
          (i) =>
            `• [${i.severity.toUpperCase()}] ${i.message} (${i.file})`
        )
        .join('\n');

      return `⚠️ Scan found ${scanResults.issues.length} issues:\n\n${issuesList}`;
    } catch (error) {
      return `❌ Scan failed: ${error.message}`;
    }
  }

  /**
   * Handle /status command
   * @param {Object} context - Conversation context
   * @returns {Promise<string>} Response
   */
  async handleStatusCommand(context) {
    try {
      const repoInfo = await githubService.getRepoInfo();
      const issues = await githubService.listIssues('open');

      return `📊 Project Status:
- Repository: ${repoInfo.name}
- Default Branch: ${repoInfo.default_branch}
- Stars: ${repoInfo.stargazers_count}
- Open Issues: ${issues.length}
- Last Updated: ${new Date(repoInfo.updated_at).toLocaleDateString()}`;
    } catch (error) {
      return `❌ Failed to get status: ${error.message}`;
    }
  }

  /**
   * Handle /issues command
   * @param {Object} context - Conversation context
   * @returns {Promise<string>} Response
   */
  async handleIssuesCommand(context) {
    try {
      const issues = await githubService.listIssues('open');

      if (issues.length === 0) {
        return '✅ No open issues!';
      }

      const issuesList = issues
        .slice(0, 5)
        .map((i) => `• #${i.number}: ${i.title}`)
        .join('\n');

      return `📋 Open Issues (showing ${Math.min(5, issues.length)} of ${issues.length}):\n\n${issuesList}`;
    } catch (error) {
      return `❌ Failed to get issues: ${error.message}`;
    }
  }

  /**
   * Build AI context from conversation
   * @param {Object} context - Conversation context
   * @returns {string} Context string
   */
  buildAIContext(context) {
    let aiContext = 'You are an AI assistant helping with software development.';

    if (context.projectContext) {
      const projectInfo = context.projectContext;
      aiContext += `\n\nProject Information:
- Files: ${projectInfo.files?.length || 0}
- Directories: ${projectInfo.directories?.length || 0}`;
    }

    if (context.messages.length > 0) {
      const recentMessages = context.messages.slice(-6); // Last 3 exchanges
      aiContext += '\n\nRecent Context:\n';
      recentMessages.forEach((msg) => {
        aiContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    return aiContext;
  }

  /**
   * Get help text
   * @returns {string} Help text
   */
  getHelpText() {
    return `🤖 AI Agent Help

Available Commands:
• /scan - Scan project for issues
• /status - Get project status
• /issues - List open GitHub issues
• /help - Show this help message

Or just chat normally for project assistance!

Examples:
- "What are the main components of this project?"
- "How do I deploy this?"
- "Analyze the Dockerfile for me"`;
  }

  /**
   * Get conversation history
   * @param {string} sessionId - Session ID
   * @returns {Array} Messages
   */
  getHistory(sessionId) {
    const context = this.conversations.get(sessionId);
    return context?.messages || [];
  }

  /**
   * Clear conversation
   * @param {string} sessionId - Session ID
   */
  clearConversation(sessionId) {
    this.conversations.delete(sessionId);
    logger.debug('Conversation cleared', { sessionId });
  }

  /**
   * Get all active conversations count
   * @returns {number} Count
   */
  getActiveConversationCount() {
    return this.conversations.size;
  }
}

export const chatAgent = new ChatAgent();
