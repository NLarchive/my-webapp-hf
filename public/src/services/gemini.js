/**
 * Gemini AI Service
 * Handles all interactions with Google's Generative AI API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

class GeminiService {
  constructor() {
    this.enabled = !!config.GEMINI_API_KEY;
    if (this.enabled) {
      this.client = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      this.model = this.client.getGenerativeModel({ model: 'gemini-pro' });
      logger.info('Gemini client initialized');
    } else {
      this.client = null;
      this.model = null;
      logger.warn('Gemini API key not configured; running in fallback/mock mode');
    }
    this.conversationHistory = [];
  }

  /**
   * Generate a response from Gemini
   * @param {string} prompt - User prompt or system message
   * @param {Object} options - Configuration options
   * @returns {Promise<string>} AI response
   */
  async generate(prompt, options = {}) {
    try {
      if (!this.enabled) {
        logger.debug('Gemini disabled; returning mock content');
        return `Mock response for prompt: ${prompt.substring(0, 120)}...`;
      }
      const context = options.context || '';
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      logger.debug('Gemini response generated', { length: text.length });
      return text;
    } catch (error) {
      logger.error('Gemini generation failed', { error: error.message });
      // Return fallback/mock content to avoid bubbling errors to clients
      return `Gemini unavailable: ${error.message}`;
    }
  }

  /**
   * Multi-turn conversation
   * @param {string} userMessage - User message
   * @returns {Promise<string>} AI response
   */
  async chat(userMessage) {
    try {
      if (!this.enabled) {
        // Keep a very simple mock chat reply
        const reply = `Mock chat reply: Received message '${userMessage}'`;
        this.conversationHistory.push({ role: 'assistant', content: reply });
        return reply;
      }
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      const chat = this.model.startChat({
        history: this.conversationHistory,
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      this.conversationHistory.push({
        role: 'assistant',
        content: text,
      });

      return text;
    } catch (error) {
      logger.error('Chat failed', { error: error.message });
      // Fallback reply
      const fallback = `Gemini chat unavailable: ${error.message}`;
      this.conversationHistory.push({ role: 'assistant', content: fallback });
      return fallback;
    }
  }

  /**
   * Analyze code for issues
   * @param {string} code - Code to analyze
   * @param {string} language - Programming language
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeCode(code, language = 'javascript') {
    const prompt = `Analyze this ${language} code for issues, security problems, and improvements:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Issues found (if any)
2. Security concerns (if any)
3. Performance improvements
4. Suggested fixes (with code snippets)

Format as JSON with keys: "issues", "security", "performance", "fixes"`;

    const response = await this.generate(prompt);
    
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: response };
    } catch (e) {
      return { raw: response };
    }
  }

  /**
   * Generate commit message from changes
   * @param {Array} changes - List of file changes
   * @returns {Promise<string>} Suggested commit message
   */
  async generateCommitMessage(changes) {
    const changesSummary = changes
      .map((c) => `- ${c.type}: ${c.file} - ${c.description}`)
      .join('\n');

    const prompt = `Based on these changes, generate a concise conventional commit message:

${changesSummary}

Follow the pattern: type(scope): description`;

    return this.generate(prompt);
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    logger.debug('Conversation history cleared');
  }

  /**
   * Get conversation history
   * @returns {Array} Conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }
}

export const geminiService = new GeminiService();
