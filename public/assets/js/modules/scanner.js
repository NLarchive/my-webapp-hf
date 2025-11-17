/**
 * Scanner Manager Module
 * Handles project scanning
 */

import { ApiClient } from './api-client.js';
import { UIManager } from './ui.js';

export class ScannerManager {
  constructor() {
    this.api = new ApiClient();
    this.isAutoScanning = false;
  }

  async performManualScan() {
    const btn = document.getElementById('manual-scan-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Scanning...';

    try {
      const response = await this.api.post('/scanner/scan', {});
      this.displayScanResults(response.report);
    } catch (error) {
      console.error('Scan failed:', error);
      UIManager.showError(`Scan failed: ${error.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = '🔍 Run Manual Scan';
    }
  }

  async toggleAutoScan() {
    const btn = document.getElementById('auto-scan-toggle');

    try {
      if (this.isAutoScanning) {
        await this.api.post('/scanner/stop-continuous', {});
        this.isAutoScanning = false;
        btn.classList.remove('active');
        btn.textContent = 'Start Auto-Scan (1 hour)';
        UIManager.showSuccess('Auto-scan stopped');
      } else {
        await this.api.post('/scanner/start-continuous', {});
        this.isAutoScanning = true;
        btn.classList.add('active');
        btn.textContent = 'Stop Auto-Scan';
        UIManager.showSuccess('Auto-scan started (1 hour interval)');
      }
    } catch (error) {
      console.error('Failed to toggle auto-scan:', error);
      UIManager.showError(`Failed to toggle auto-scan: ${error.message}`);
    }
  }

  displayScanResults(report) {
    const resultsContainer = document.getElementById('scanner-results');
    
    let html = `
      <div class="scan-report">
        <div class="scan-header">
          <h3>Scan Report</h3>
          <p class="scan-time">${new Date(report.timestamp).toLocaleString()}</p>
          <p class="scan-duration">Duration: ${report.duration}ms</p>
        </div>
    `;

    // Issues
    if (report.issues && report.issues.length > 0) {
      html += `
        <div class="issues-section">
          <h4>⚠️ Issues Found (${report.issues.length})</h4>
          <ul class="issues-list">
      `;
      report.issues.forEach((issue) => {
        const severityClass = `severity-${issue.severity}`;
        html += `
          <li class="issue-item ${severityClass}">
            <span class="severity-badge">${this.escapeHtml(issue.severity)}</span>
            <span class="issue-message">${this.escapeHtml(issue.message)}</span>
            <span class="issue-file"><code>${this.escapeHtml(issue.file)}</code></span>
          </li>
        `;
      });
      html += '</ul></div>';
    } else {
      html += '<div class="success-message">✅ No issues detected!</div>';
    }

    // Recommendations
    if (report.recommendations && report.recommendations.length > 0) {
      html += `
        <div class="recommendations-section">
          <h4>💡 Recommendations</h4>
          <ul class="recommendations-list">
      `;
      report.recommendations.forEach((rec) => {
        html += `
          <li class="recommendation-item">
            <span class="priority-badge">${this.escapeHtml(rec.priority)}</span>
            <div class="recommendation-text">${this.escapeHtml(rec.suggestion)}</div>
          </li>
        `;
      });
      html += '</ul></div>';
    }

    html += '</div>';
    resultsContainer.innerHTML = html;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
