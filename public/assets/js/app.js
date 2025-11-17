/**
 * Main Application JavaScript
 * Frontend logic for AI Agent UI
 */

import { ChatManager } from './modules/chat.js';
import { ScannerManager } from './modules/scanner.js';
import { ProjectManager } from './modules/project.js';
import { UIManager } from './modules/ui.js';

class AIAgentApp {
  constructor() {
    this.chatManager = new ChatManager();
    this.scannerManager = new ScannerManager();
    this.projectManager = new ProjectManager();
    this.uiManager = new UIManager();

    this.initializeEventListeners();
    this.loadInitialData();
  }

  initializeEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', (e) => this.handleTabChange(e));
    });

    // Chat
    document.getElementById('chat-form').addEventListener('submit', (e) =>
      this.chatManager.handleSubmit(e)
    );
    document.querySelectorAll('.command-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => this.chatManager.executeCommand(e));
    });

    // Scanner
    document.getElementById('manual-scan-btn').addEventListener('click', () =>
      this.scannerManager.performManualScan()
    );
    document.getElementById('auto-scan-toggle').addEventListener('click', () =>
      this.scannerManager.toggleAutoScan()
    );

    // Settings
    document.getElementById('auto-fix-toggle').addEventListener('change', (e) =>
      this.handleSettingsChange('autoFix', e.target.checked)
    );
    document.getElementById('auto-commit-toggle').addEventListener('change', (e) =>
      this.handleSettingsChange('autoCommit', e.target.checked)
    );
  }

  async loadInitialData() {
    try {
      // Initialize chat
      await this.chatManager.initialize();

      // Load project info
      await this.projectManager.loadProjectStructure();
      await this.projectManager.loadReadme();
      await this.projectManager.loadDockerfile();

      // Load app info
      this.uiManager.updateAppInfo({
        status: 'Ready',
        timestamp: new Date().toLocaleString(),
      });
    } catch (error) {
      console.error('Failed to load initial data:', error);
      this.uiManager.showError('Failed to initialize application');
    }
  }

  handleTabChange(event) {
    const tabName = event.target.dataset.tab;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn === event.target);
    });

    // Update active tab
    document.querySelectorAll('.tab-content').forEach((tab) => {
      tab.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }

  handleSettingsChange(setting, value) {
    const settings = this.loadSettings();
    settings[setting] = value;
    localStorage.setItem('aiAgentSettings', JSON.stringify(settings));
    console.log(`Setting ${setting} updated to ${value}`);
  }

  loadSettings() {
    const stored = localStorage.getItem('aiAgentSettings');
    return stored ? JSON.parse(stored) : {};
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AIAgentApp();
});
