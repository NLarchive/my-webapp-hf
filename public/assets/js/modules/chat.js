/**
 * Chat Manager Module
 * Handles chat functionality
 */

import { ApiClient } from './api-client.js';
import { UIManager } from './ui.js';

export class ChatManager {
  constructor() {
    this.api = new ApiClient();
    this.ui = new UIManager();
    this.sessionId = null;
    this.messageHistory = [];
  }

  async initialize() {
    try {
      const response = await this.api.post('/chat/start', {});
      this.sessionId = response.sessionId;
      console.log('Chat session started:', this.sessionId);
      
      this.addSystemMessage(
        'Chat initialized. You can use /help for available commands.'
      );
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      throw error;
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    const input = document.getElementById('message-input');
    const message = input.value.trim();

    if (!message) return;

    // Clear input
    input.value = '';
    input.focus();

    // Add user message to UI
    this.addMessage('user', message);

    try {
      // Send to API
      const response = await this.api.post('/chat/message', {
        sessionId: this.sessionId,
        message,
      });

      // Add AI response to UI
      this.addMessage('assistant', response.response);
      this.messageHistory.push({ role: 'user', content: message });
      this.messageHistory.push({ role: 'assistant', content: response.response });
    } catch (error) {
      console.error('Chat error:', error);
      this.addMessage('system', `Error: ${error.message}`);
    }
  }

  async executeCommand(event) {
    const command = event.target.dataset.command;
    const input = document.getElementById('message-input');
    input.value = command;
    input.focus();
  }

  addMessage(role, content) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${role}`;

    if (role === 'system') {
      messageEl.innerHTML = `<p class="system-message">${this.escapeHtml(content)}</p>`;
    } else {
      messageEl.innerHTML = `
        <div class="message-content">
          <div class="message-text">${this.formatMessageText(content)}</div>
          <div class="message-time">${new Date().toLocaleTimeString()}</div>
        </div>
      `;
    }

    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  addSystemMessage(content) {
    this.addMessage('system', content);
  }

  formatMessageText(text) {
    // Simple markdown-like formatting
    return this.escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
