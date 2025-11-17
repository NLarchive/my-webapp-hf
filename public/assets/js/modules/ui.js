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
      <span>${message}</span>
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
        html += `<dt>${key}</dt><dd>${value}</dd>`;
      }
      html += '</dl>';
      infoBox.innerHTML = html;
    }
  }
}
