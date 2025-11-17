/**
 * UI Manager Module
 * Centralized UI utilities
 */

export class UIManager {
  static showSuccess(message) {
    this.showNotification(message, 'success');
  }

  static showError(message) {
    this.showNotification(message, 'error');
  }

  static showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${this.escapeHtml(message)}</span>
      <button class="close-btn">&times;</button>
    `;

    // Insert into page
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    const timeout = setTimeout(() => {
      notification.remove();
    }, 5000);

    // Close button handler
    notification.querySelector('.close-btn').addEventListener('click', () => {
      clearTimeout(timeout);
      notification.remove();
    });
  }

  static updateAppInfo(info) {
    const infoBox = document.getElementById('app-info');
    if (infoBox) {
      let html = '<dl>';
      for (const [key, value] of Object.entries(info)) {
        html += `<dt>${this.escapeHtml(key)}</dt><dd>${this.escapeHtml(value)}</dd>`;
      }
      html += '</dl>';
      infoBox.innerHTML = html;
    }
  }

  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
