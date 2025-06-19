// FIXED: Global functions for enhanced blocking system
window.handleUnderstandAction = function() {
  if (window.keySystem) {
    // Clear the blocked overlay
    window.keySystem.hideBlockedOverlay();
    
    // Reset to "Not Activated" state without clearing UID
    window.keySystem.isActivated = false;
    window.keySystem.isBlocked = false;
    window.keySystem.keyData = null;
    
    // Update UI to show "Not Activated"
    window.keySystem.updateUI();
    
    // Show success toast
    window.showToast('success', 'Ready for New Activation', 'Your UID remains persistent');
  }
};

window.showContactModal = function() {
  // Remove any existing contact modal
  const existingModal = document.querySelector('.contact-modal');
  if (existingModal) {
    existingModal.remove();
  }
         
  const modal = document.createElement('div');
  modal.className = 'contact-modal';
  modal.innerHTML = `
    <div class="contact-modal-content">
      <h3>Choose contact method:</h3>
      <div>
        <button class="contact-option whatsapp" onclick="openWhatsApp()">
          📱 WhatsApp
        </button>
        <button class="contact-option gmail" onclick="openGmail()">
          📧 Gmail
        </button>
        <button class="contact-option cancel" onclick="closeContactModal()">
          ❌ Cancel
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.openWhatsApp = function() {
  try {
    window.open('https://wa.me/639454488235', '_blank');
  } catch (error) {
    console.error('Failed to open WhatsApp:', error);
    window.showToast('error', 'Contact Error', 'Failed to open WhatsApp. Please try again.');
  }
  closeContactModal();
};

window.openGmail = function() {
  try {
    window.open('mailto:barnigonzales43329@gmail.com', '_blank');
  } catch (error) {
    console.error('Failed to open Gmail:', error);
    window.showToast('error', 'Contact Error', 'Failed to open Gmail. Please try again.');
  }
  closeContactModal();
};

window.closeContactModal = function() {
  const modal = document.querySelector('.contact-modal');
  if (modal) {
    modal.remove();
  }
};

// FIXED: Global functions for UI interaction
window.toggleKeyPanel = function() {
  const keyDetails = document.getElementById('key-details');
  keyDetails.classList.toggle('show');

  if (window.keySystem && window.keySystem.isActivated) {
    window.keySystem.updateUI();
  }
};

window.activateKey = function() {
  const keyInput = document.getElementById('key-input');
  const key = keyInput.value.trim();

  if (!key) {
    window.showToast('warning', 'Empty Key', 'Please enter an activation key.');
    return;
  }

  if (window.keySystem) {
    window.keySystem.activateKey(key);
  }
};

// FIXED: Enhanced key input handling
document.addEventListener('DOMContentLoaded', function() {
  const keyInput = document.getElementById('key-input');
  if (keyInput) {
    keyInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        activateKey();
      }
    });
  }
});

// Enhanced cleanup with performance monitoring
window.addEventListener('beforeunload', () => {
  if (window.keySystem) {
    window.keySystem.destroy();
  }
});

// Additional utility functions for global access
window.utils = {
  formatDate: (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  },
  
  generateId: () => {
    return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  },
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Performance monitoring utility
window.performanceMonitor = {
  marks: new Map(),
  measures: new Map(),
  
  mark: (name) => {
    const time = performance.now();
    window.performanceMonitor.marks.set(name, time);
    return time;
  },
  
  measure: (name, startMark, endMark) => {
    const startTime = window.performanceMonitor.marks.get(startMark);
    const endTime = endMark ? window.performanceMonitor.marks.get(endMark) : performance.now();
    
    if (startTime && endTime) {
      const duration = endTime - startTime;
      window.performanceMonitor.measures.set(name, duration);
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
      return duration;
    }
    return null;
  },
  
  getReport: () => {
    return {
      marks: Object.fromEntries(window.performanceMonitor.marks),
      measures: Object.fromEntries(window.performanceMonitor.measures)
    };
  }
};

// Enhanced error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  if (window.showToast) {
    window.showToast('error', 'System Error', 'An unexpected error occurred. Please refresh if issues persist.');
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  if (window.showToast) {
    window.showToast('warning', 'Promise Rejection', 'A background operation failed. Functionality may be affected.');
  }
});

console.log('FIXED: All systems initialized successfully');
console.log('FIXED: Ultra-persistent UID system provides TRUE permanent authentication');
console.log('FIXED: Zero-latency real-time monitoring ensures instant blocking');
console.log('FIXED: Enhanced redundancy with 10+ storage layers for maximum persistence');