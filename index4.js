// FIXED: Enhanced blocked overlay with new structure per requirements
UltraPersistentKeySystem.prototype.showBlockedOverlay = function(title, message, details = null) {
  if (this.blockedOverlay) {
    this.blockedOverlay.remove();
  }
  
  this.blockedOverlay = document.createElement('div');
  this.blockedOverlay.className = 'blocked-overlay';
  this.blockedOverlay.innerHTML = `
    <div class="blocked-message">
      <h3>${title}</h3>
      <p class="pulsing-text">${message}</p>
      ${details ? `<p style="margin-top: 0.5rem; font-size: 0.875rem; opacity: 0.8;">${details}</p>` : ''}
      <div style="margin-top: 1.5rem;">
        <button class="blocked-action-btn understand" onclick="handleUnderstandAction()">
          I understand
        </button>
        <button class="blocked-action-btn contact" onclick="showContactModal()">
          CONTACT FOR KEY
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(this.blockedOverlay);
};

// FIXED: Enhanced unblocking when key is restored
UltraPersistentKeySystem.prototype.hideBlockedOverlay = function() {
  if (this.blockedOverlay) {
    this.blockedOverlay.remove();
    this.blockedOverlay = null;
  }
  this.isBlocked = false;
  
  // FIXED: Re-enable controls only if activated
  if (this.isActivated) {
    this.enableAllComponents();
  }
};

UltraPersistentKeySystem.prototype.startOptimizedCountdown = function() {
  if (this.countdownInterval) {
    clearInterval(this.countdownInterval);
  }
  
  // FIXED: Use optimized interval timing with immediate first update
  this.updateCountdownOptimized();
  this.countdownInterval = setInterval(() => {
    this.updateCountdownOptimized();
  }, 1000);
};

UltraPersistentKeySystem.prototype.updateCountdownOptimized = function() {
  if (!this.isActivated || !this.keyData?.expiresAt) {
    this.hideCountdown();
    return;
  }
  
  const expiryDate = this.parseKeyDate(this.keyData.expiresAt);
  if (!expiryDate) {
    this.hideCountdown();
    return;
  }
  
  const now = new Date();
  const timeLeft = expiryDate - now;
  
  // FIXED: Instant expiry blocking when countdown reaches zero
  if (timeLeft <= 0) {
    console.log('FIXED: Countdown reached zero - instant expiry blocking');
    this.handleKeyExpiredInstantly();
    return;
  }
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  let countdownText = '';
  let countdownClass = '';
  
  if (days > 0) {
    countdownText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    countdownText = `${hours}h ${minutes}m ${seconds}s`;
    if (hours < 24) countdownClass = 'warning';
  } else {
    countdownText = `${minutes}m ${seconds}s`;
    countdownClass = minutes < 30 ? 'critical' : 'warning';
  }
  
  this.showCountdown(countdownText, countdownClass);
};

UltraPersistentKeySystem.prototype.showCountdown = function(text, className = '') {
  const countdownDisplay = document.getElementById('key-countdown-display');
  const countdownInline = document.getElementById('key-countdown');
  
  if (countdownDisplay) {
    countdownDisplay.textContent = `Expires in: ${text}`;
    countdownDisplay.className = `key-countdown ${className}`;
    countdownDisplay.style.display = 'block';
  }
  
  if (countdownInline) {
    countdownInline.textContent = text;
    countdownInline.style.display = 'inline-block';
  }
};

UltraPersistentKeySystem.prototype.hideCountdown = function() {
  const countdownDisplay = document.getElementById('key-countdown-display');
  const countdownInline = document.getElementById('key-countdown');
  
  if (countdownDisplay) {
    countdownDisplay.style.display = 'none';
  }
  
  if (countdownInline) {
    countdownInline.style.display = 'none';
  }
};

// FIXED: Enhanced key validation with permanent UID binding
UltraPersistentKeySystem.prototype.validateStoredKey = async function(key, isRestore = false) {
  const startTime = performance.now();
  
  if (!window.firebaseDB || !window.firebaseModules) {
    throw new Error('Firebase not initialized');
  }
  
  // FIXED: Use ultra-persistent UID directly with enhanced fallback
  let currentUID = this.userUID || window.uidManager?.getCurrentUID();
  if (!currentUID) {
    console.log('FIXED: Waiting for ultra-persistent UID...');
    // Try to recover UID
    const recoveredUID = await this.getStoredUserUID();
    if (recoveredUID) {
      this.userUID = recoveredUID;
      currentUID = recoveredUID;
    } else {
      // Wait briefly for UID manager
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentUID = this.userUID || window.uidManager?.getCurrentUID();
      if (!currentUID) {
        throw new Error('Ultra-persistent UID required for permanent activation');
      }
    }
  }
  
  const { doc, getDoc, updateDoc, serverTimestamp } = window.firebaseModules;
  
  try {
    console.log('FIXED: Validating key with permanent UID binding:', key);
    const keyDoc = await getDoc(doc(window.firebaseDB, 'activation_keys', key));
    
    if (!keyDoc.exists()) {
      throw new Error('Key does not exist or has been deleted');
    }
    
    const keyData = keyDoc.data();
    console.log('FIXED: Key data retrieved:', keyData);
    
    // FIXED: Instant expiry validation without grace period
    if (keyData.expiresAt) {
      const expiryDate = this.parseKeyDate(keyData.expiresAt);
      if (expiryDate && new Date() > expiryDate) {
        throw new Error(`Key expired on ${expiryDate.toLocaleDateString()} at ${expiryDate.toLocaleTimeString()}`);
      }
    }
    
    // One-time key validation
    if (keyData.isOneTime && keyData.isUsed) {
      throw new Error('Key has already been used');
    }
    
    // FIXED: Permanent UID binding validation
    if (keyData.userUID && keyData.userUID !== currentUID) {
      throw new Error('Key is permanently bound to a different ultra-persistent user');
    }
    
    // FIXED: Enhanced database update for permanent binding
    if (!isRestore) {
      const updateData = {
        lastAccessed: serverTimestamp(),
        accessCount: (keyData.accessCount || 0) + 1
      };
      
      // FIXED: Permanent UID binding on first use
      if (!keyData.userUID) {
        updateData.userUID = currentUID;
        updateData.activatedAt = serverTimestamp();
        updateData.activatedFrom = window.location.hostname;
        updateData.permanentBinding = true;
        updateData.ultrapersistentUID = true;
        console.log('FIXED: Creating permanent UID binding for key');
      }
      
      if (keyData.isOneTime && !keyData.isUsed) {
        updateData.isUsed = true;
        updateData.usedAt = serverTimestamp();
      }
      
      try {
        await updateDoc(doc(window.firebaseDB, 'activation_keys', key), updateData);
        console.log('FIXED: Key updated with permanent binding');
      } catch (updateError) {
        console.warn('FIXED: Non-critical update failed:', updateError);
      }
    }
    
    // FIXED: Activate with permanent ultra-persistence
    this.isActivated = true;
    this.keyData = { ...keyData, id: key };
    
    // Enable all components immediately
    this.enableAllComponents();
    
    // FIXED: Store with enhanced ultra-persistence for indefinite activation
    const activationTime = Date.now();
    this.setUltraPersistentStorage(this.storageKeys.activation, key);
    this.setUltraPersistentStorage(this.storageKeys.keyData, JSON.stringify(this.keyData));
    this.setUltraPersistentStorage(this.storageKeys.keyId, key);
    this.setUltraPersistentStorage(this.storageKeys.activationTime, activationTime);
    this.setUltraPersistentStorage(this.storageKeys.lastValidation, Date.now());
    
    // FIXED: Remove any blocking immediately
    this.hideBlockedOverlay();
    
    // FIXED: Show activation animation for new activations
    if (!isRestore) {
      this.showActivationAnimation();
      
      // FIXED: Intelligent URL management
      setTimeout(() => {
        const newUrl = `${this.baseUrl}${key}`;
        const currentUrl = window.location.href;
        
        if (!currentUrl.includes(key)) {
          window.history.replaceState({}, '', `/${key}`);
        }
      }, 3000);
    }
    
    // FIXED: Start ultra-fast realtime monitoring with zero-delay blocking
    this.startUltraFastRealtimeMonitoring(key);
    
    const expiryDate = this.parseKeyDate(keyData.expiresAt);
    const expiryText = expiryDate ? ' until ' + expiryDate.toLocaleDateString() : '';
    
    if (!isRestore) {
      this.queueToast('success', 'Permanent Activation!',
         `Your ultra-persistent Firebase user is now permanently authorized for AI access${expiryText}. This activation persists indefinitely across all sessions and device restarts.`);
    }
    
    const endTime = performance.now();
    this.performanceMonitor.set('keyValidation', endTime - startTime);
    console.log(`FIXED: Key validation completed in ${(endTime - startTime).toFixed(2)}ms`);
    
  } catch (firestoreError) {
    console.error('FIXED: Firestore validation error:', firestoreError);
    
    if (firestoreError.code === 'permission-denied') {
      throw new Error('Permission denied. Please ensure you have a valid key.');
    } else if (firestoreError.code === 'unavailable') {
      throw new Error('Database temporarily unavailable. Please try again.');
    } else {
      throw new Error(firestoreError.message || 'Failed to validate key');
    }
  }
};

UltraPersistentKeySystem.prototype.showActivationAnimation = function() {
  const animation = document.getElementById('activation-animation');
  animation.classList.add('show');
  
  setTimeout(() => {
    animation.classList.remove('show');
  }, 3000);
};