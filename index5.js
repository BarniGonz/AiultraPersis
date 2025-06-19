UltraPersistentKeySystem.prototype.updateUI = function() {
  const keyPanel = document.getElementById('key-panel');
  const keyStatus = document.getElementById('key-status');
  const keyToggleBtn = document.getElementById('key-toggle-btn');
  const keyDetails = document.getElementById('key-details');
  const keyInfo = document.getElementById('key-info');
  const keyInput = document.getElementById('key-input');
  const keySubmitBtn = document.getElementById('key-submit-btn');

  if (this.isActivated && this.keyData) {
    keyPanel.classList.remove('expired', 'deleted');
    keyPanel.classList.add('activated');

    let statusText = '✅ Permanently Activated (Ultra-Persistent)';
    let statusClass = 'activated';

    if (this.keyData.expiresAt) {
      const expiryDate = this.parseKeyDate(this.keyData.expiresAt);
      const now = new Date();
            
      if (expiryDate && now > expiryDate) {
        statusText = '❌ Expired';
        statusClass = 'expired';
        this.isActivated = false;
        // FIXED: Immediately disable components when expired
        this.disableAllComponents();
      } else if (expiryDate) {
        const timeLeft = expiryDate - now;
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                
        if (days > 0) {
          statusText = `✅ Active (${days} days left)`;
        } else if (hours > 0) {
          statusText = `⚠️ Active (${hours} hours left)`;
        } else {
          statusText = `⏰ Expiring Soon`;
        }
      }
    }

    keyStatus.innerHTML = `🔐 Key Status: ${statusText} <span class="countdown" id="key-countdown" style="display: none;"></span>`;
    keyPanel.className = `key-panel ${statusClass}`;
    keyToggleBtn.textContent = 'User Info';

    if (keyInput) {
      keyInput.disabled = true;
      keyInput.placeholder = 'Permanently Activated (Ultra-Persistent UID)';
    }
    if (keySubmitBtn) {
      keySubmitBtn.disabled = true;
      keySubmitBtn.textContent = 'Activated';
    }

    if (keyDetails.classList.contains('show')) {
      const expiryDate = this.parseKeyDate(this.keyData.expiresAt);
      const createdDate = this.parseKeyDate(this.keyData.createdAt);
      const activationTime = this.getUltraPersistentStorage(this.storageKeys.activationTime);
      const activatedDate = activationTime ? new Date(activationTime) : null;
            
      keyInfo.innerHTML = `
        <div class="key-info-item">
          <span class="key-info-label">Key ID:</span>
          <span class="key-info-value">${this.keyData.id}</span>
        </div>
        <div class="key-info-item">
          <span class="key-info-label">User UID:</span>
          <span class="key-info-value">${this.userUID?.slice(0, 8)}...</span>
        </div>
        <div class="key-info-item">
          <span class="key-info-label">Type:</span>
          <span class="key-info-value">${this.keyData.isOneTime ? 'One-time use' : (this.keyData.expiresAt ? 'Expiring' : 'Permanent')}</span>
        </div>
        <div class="key-info-item">
          <span class="key-info-label">Persistence:</span>
          <span class="key-info-value">ULTRA-PERSISTENT (PERMANENT)</span>
        </div>
        <div class="key-info-item">
          <span class="key-info-label">UID System:</span>
          <span class="key-info-value">NEVER RESETS (Enhanced IndexedDB)</span>
        </div>
        <div class="key-info-item">
          <span class="key-info-label">Monitoring:</span>
          <span class="key-info-value">Real-time (Zero-latency blocking)</span>
        </div>
        <div class="key-info-item">
          <span class="key-info-label">Storage Layers:</span>
          <span class="key-info-value">10+ Redundant (IndexedDB + localStorage)</span>
        </div>
        ${this.keyData.description ? `
        <div class="key-info-item">
          <span class="key-info-label">Description:</span>
          <span class="key-info-value">${this.keyData.description}</span>
        </div>` : ''}
        ${createdDate ? `
        <div class="key-info-item">
          <span class="key-info-label">Created:</span>
          <span class="key-info-value">${createdDate.toLocaleDateString()} ${createdDate.toLocaleTimeString()}</span>
        </div>` : ''}
        ${activatedDate ? `
        <div class="key-info-item">
          <span class="key-info-label">Activated:</span>
          <span class="key-info-value">${activatedDate.toLocaleDateString()} ${activatedDate.toLocaleTimeString()}</span>
        </div>` : ''}
        ${expiryDate ? `
        <div class="key-info-item">
          <span class="key-info-label">Expires:</span>
          <span class="key-info-value">${expiryDate.toLocaleDateString()} ${expiryDate.toLocaleTimeString()}</span>
        </div>` : ''}
        <div class="key-info-item">
          <span class="key-info-label">Access Count:</span>
          <span class="key-info-value">${this.keyData.accessCount || 0}</span>
        </div>
      `;
    }
  } else {
    keyPanel.classList.remove('activated');
    
    // FIXED: Always disable components when not activated
    this.disableAllComponents();

    if (keyInput) {
      keyInput.disabled = false;
      keyInput.placeholder = 'Enter your activation key...';
    }
    if (keySubmitBtn) {
      keySubmitBtn.disabled = false;
      keySubmitBtn.textContent = 'Activate';
    }

    const storedKeyData = this.getUltraPersistentStorage(this.storageKeys.keyData);
    if (storedKeyData) {
      try {
        const parsed = JSON.parse(storedKeyData);
        if (parsed.expiresAt && new Date() > new Date(parsed.expiresAt)) {
          keyPanel.classList.add('expired');
          keyStatus.textContent = '🔐 Key Status: Expired (Ultra-Persistent UID Maintained)';
        } else {
          keyPanel.classList.add('deleted');
          keyStatus.textContent = '🔐 Key Status: Deleted (Ultra-Persistent UID Maintained)';
        }
      } catch (e) {
        keyPanel.classList.remove('expired', 'deleted');
        keyStatus.textContent = '🔐 Key Status: Not Activated';
      }
    } else {
      keyPanel.classList.remove('expired', 'deleted');
      keyStatus.textContent = '🔐 Key Status: Not Activated';
    }

    keyToggleBtn.textContent = 'Activate';
    keyInfo.innerHTML = '<div class="key-info-item"><span class="key-info-value">Enter your activation key to authorize this ultra-persistent Firebase user for AI capabilities. Your UID will NEVER reset and activation persists permanently across browser restarts, phone shutdowns, and app exits.</span></div>';
  }
};

UltraPersistentKeySystem.prototype.queueToast = function(type, title, message) {
  if (this.systemReady && this.initializationComplete) {
    showToast(type, title, message);
  }
};

UltraPersistentKeySystem.prototype.activateKey = async function(key) {
  try {
    document.getElementById('key-submit-btn').disabled = true;
    document.getElementById('key-submit-btn').textContent = 'Activating...';

    await this.validateStoredKey(key.toUpperCase());
    this.updateUI();

    document.getElementById('key-input').value = '';
  } catch (error) {
    showToast('error', 'Activation Failed', error.message);
    console.error('FIXED: Key activation failed:', error);
  } finally {
    if (!this.isActivated) {
      document.getElementById('key-submit-btn').disabled = false;
      document.getElementById('key-submit-btn').textContent = 'Activate';
    }
  }
};

UltraPersistentKeySystem.prototype.deactivateKey = function() {
  this.isActivated = false;
  this.keyData = null;
  this.clearPerpetuallySavedActivation();
  
  // FIXED: Immediately disable components
  this.disableAllComponents();

  if (this.realtimeListener) {
    this.realtimeListener();
    this.realtimeListener = null;
  }

  if (this.countdownInterval) {
    clearInterval(this.countdownInterval);
    this.countdownInterval = null;
  }

  this.hideCountdown();
  this.updateUI();
  showToast('info', 'Key Deactivated', 'Ultra-persistent authorization removed. Your UID is maintained for quick re-activation.');
};

UltraPersistentKeySystem.prototype.destroy = function() {
  if (this.realtimeListener) {
    this.realtimeListener();
  }

  if (this.countdownInterval) {
    clearInterval(this.countdownInterval);
  }

  // FIXED: Log performance stats
  console.log('FIXED: Key System Performance Stats:', Object.fromEntries(this.performanceMonitor));
};

// FIXED: Global functions for enhanced UI interaction
window.handleUnderstandAction = function() {
  if (window.keySystem) {
    // Reset to "Not Activated" state without clearing UID
    window.keySystem.isActivated = false;
    window.keySystem.keyData = null;
    
    // FIXED: Immediately disable components
    window.keySystem.disableAllComponents();

    // Update UI to show "Not Activated"
    window.keySystem.updateUI();

    // Show success toast
    showToast('success', 'Ready for New Activation', 'Your UID remains persistent');
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
    showToast('error', 'Contact Error', 'Failed to open WhatsApp. Please try again.');
  }
  closeContactModal();
};

window.openGmail = function() {
  try {
    window.open('mailto:barnigonzales43329@gmail.com', '_blank');
  } catch (error) {
    console.error('Failed to open Gmail:', error);
    showToast('error', 'Contact Error', 'Failed to open Gmail. Please try again.');
  }
  closeContactModal();
};

window.closeContactModal = function() {
  const modal = document.querySelector('.contact-modal');
  if (modal) {
    modal.remove();
  }
};