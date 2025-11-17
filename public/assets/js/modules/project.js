/**
 * Project Manager Module
 * Handles project information display
 */

import { ApiClient } from './api-client.js';

export class ProjectManager {
  constructor() {
    this.api = new ApiClient();
  }

  async loadProjectStructure() {
    try {
      const response = await this.api.get('/project/structure');
      this.displayProjectStructure(response.structure);
    } catch (error) {
      console.error('Failed to load project structure:', error);
      this.updateElement(
        'project-structure',
        `<p class="error">Failed to load project structure</p>`
      );
    }
  }

  async loadReadme() {
    try {
      const response = await this.api.get('/project/readme');
      if (response.success && response.content) {
        const html = this.markdownToHtml(response.content);
        this.updateElement('project-readme', html);
      }
    } catch (error) {
      console.warn('README not available:', error);
      this.updateElement('project-readme', '<p class="info">README not found</p>');
    }
  }

  async loadDockerfile() {
    try {
      const response = await this.api.get('/project/dockerfile');
      if (response.success && response.content) {
        const html = `<pre><code>${this.escapeHtml(response.content)}</code></pre>`;
        this.updateElement('project-dockerfile', html);
      }
    } catch (error) {
      console.warn('Dockerfile not available:', error);
      this.updateElement('project-dockerfile', '<p class="info">Dockerfile not found</p>');
    }
  }

  displayProjectStructure(structure) {
    let html = '<ul class="file-list">';

    if (structure.files && structure.files.length > 0) {
      html += '<li class="category">📄 Files</li>';
      structure.files.forEach((file) => {
        html += `
          <li class="file-item">
            <span class="file-icon">📄</span>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${this.formatBytes(file.size)}</span>
          </li>
        `;
      });
    }

    if (structure.directories && structure.directories.length > 0) {
      html += '<li class="category">📁 Directories</li>';
      structure.directories.forEach((dir) => {
        html += `
          <li class="dir-item">
            <span class="dir-icon">📁</span>
            <span class="dir-name">${dir.name}</span>
          </li>
        `;
      });
    }

    html += '</ul>';
    this.updateElement('project-structure', html);
  }

  markdownToHtml(markdown) {
    // Simple markdown to HTML conversion
    let html = markdown
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    return `<div class="markdown-content"><p>${html}</p></div>`;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  updateElement(elementId, html) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
