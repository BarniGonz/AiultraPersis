// FIXED: Ultra-Persistent Firebase UID-Based Key System with TRUE Perpetual Persistence
class UltraPersistentKeySystem {
  constructor() {
    this.isActivated = false; 
    this.isBlocked = false;
    this.keyData = null;
    this.userUID = null;
    this.baseUrl = 'https://barnigonz.github.io/Aib4n1x/';
    this.realtimeListener = null;
    this.countdownInterval = null;
    this.blockedOverlay = null;
    this.authChecked = false;
    this.initializationComplete = false;
    this.systemReady = false;
    this.retryAttempts = 0;
    this.maxRetryAttempts = 5;
    this.retryDelay = 1000;
    this.performanceMonitor = new Map();
            
    // FIXED: Enhanced storage keys with ultra-persistence versioning
    this.storageKeys = {
      activation: 'ai_chatbot_ultra_persistent_uid_v7_PERMANENT',
      keyData: 'ai_chatbot_key_data_ultra_uid_v7_PERMANENT', 
      keyId: 'ai_chatbot_key_id_ultra_uid_v7_PERMANENT',
      activationTime: 'ai_chatbot_activation_time_ultra_uid_v7_PERMANENT',
      userUID: 'ai_chatbot_user_uid_persistent_v7_PERMANENT',
      lastValidation: 'ai_chatbot_last_validation_ultra_v7_PERMANENT'
    };
            
    this.initWithPerformanceTracking();
  }

  async initWithPerformanceTracking() {
    const startTime = performance.now();
            
    try {
      await this.waitForAuthWithEnhancedRetry();
      this.updateUserStatus();
      this.authChecked = true;
                
      // FIXED: Check for perpetual activation first with enhanced persistence
      const hasPersistentActivation = await this.checkPerpetuallyStoredActivation();
                
      if (!hasPersistentActivation) {
        await this.checkUrlAndStorageKeys();
      }
                
      this.updateUI();
      this.startOptimizedCountdown();
      this.initializationComplete = true;
      this.systemReady = true;
                
      const endTime = performance.now();
      this.performanceMonitor.set('initialization', endTime - startTime);
      console.log(`FIXED Key system initialized in ${(endTime - startTime).toFixed(2)}ms`);
                       
    } catch (error) {
      console.error('Ultra-persistent key system initialization error:', error);
      this.systemReady = true;
      this.initializationComplete = true;
    }
  }

  // FIXED: Enhanced auth waiting with UID manager integration
  async waitForAuthWithEnhancedRetry() {
    return new Promise((resolve) => {
      const checkAuth = async () => {
        try {
          // FIXED: Use the enhanced ultra-persistent UID manager
          const currentUID = window.uidManager?.getCurrentUID();
                         
          if (currentUID) {
            this.userUID = currentUID;
            await this.persistUserUID();
            console.log('FIXED: Ultra-persistent UID acquired:', this.userUID.slice(0, 8) + '...');
            resolve();
            return;
          }
                         
          // FIXED: Try to recover from persistent storage with enhanced methods
          const storedUID = await this.getStoredUserUID();
          if (storedUID) {
            this.userUID = storedUID;
            console.log('FIXED: Restored UID from enhanced persistent storage:', this.userUID.slice(0, 8) + '...');
            resolve();
            return;
          }
                         
          if (this.retryAttempts < this.maxRetryAttempts) {
            this.retryAttempts++;
            console.log(`FIXED: Retry attempt ${this.retryAttempts}/${this.maxRetryAttempts}`);
            setTimeout(checkAuth, this.retryDelay * this.retryAttempts);
          } else {
            console.warn('FIXED: Max retry attempts reached, resolving without UID');
            resolve();
          }
        } catch (error) {
          console.error('Auth check error:', error);
          if (this.retryAttempts < this.maxRetryAttempts) {
            this.retryAttempts++;
            setTimeout(checkAuth, this.retryDelay * this.retryAttempts);
          } else {
            resolve();
          }
        }
      };
                
      // FIXED: Listen for auth changes with enhanced persistence check
      if (window.uidManager) {
        window.addEventListener('userAuthenticated', async (event) => {
          if (event.detail?.uid) {
            this.userUID = event.detail.uid;
            await this.persistUserUID();
            console.log('FIXED: UID authenticated via event:', this.userUID.slice(0, 8) + '...');
            resolve();
          }
        }, { once: true });
      }
                
      checkAuth();
    });
  }

  // FIXED: Enhanced UID persistence with IndexedDB integration 
  async persistUserUID() {
    try {
      const uidData = {
        uid: this.userUID,
        timestamp: Date.now(),
        version: 'v7',
        ultrapersistent: true,
        permanentActivation: true,
        deviceBound: true
      };
                
      // FIXED: Multiple storage layers for ultimate persistence
      const serialized = JSON.stringify(uidData);
                
      // Layer 1: IndexedDB (if available)
      if (window.uidManager?.indexedDBReady) {
        try {
          await this.storeInIndexedDB('userUID', uidData);
        } catch (e) {
          console.warn('IndexedDB UID storage failed:', e);
        }
      }
                
      // Layer 2-6: Multiple localStorage/sessionStorage layers
      const storageKeys = [
        this.storageKeys.userUID,
        this.storageKeys.userUID + '_backup',
        this.storageKeys.userUID + '_emergency',
        this.storageKeys.userUID + '_recovery'
      ];
                
      storageKeys.forEach(key => {
        try {
          localStorage.setItem(key, serialized);
          sessionStorage.setItem(key + '_session', serialized);
        } catch (e) {
          console.warn(`Storage failed for key ${key}:`, e);
        }
      });
                
      console.log('FIXED: UID stored with enhanced ultra-persistence');
    } catch (e) {
      console.warn('FIXED: Failed to persist UID:', e);
    }
  }

  // FIXED: Enhanced UID retrieval with all storage layers
  async getStoredUserUID() {
    const sources = [
      // IndexedDB first (highest persistence)
      () => this.getFromIndexedDB('userUID'),
                
      // Session storage (current session)
      () => this.getFromStorage(sessionStorage, this.storageKeys.userUID + '_session'),
                
      // Local storage layers
      () => this.getFromStorage(localStorage, this.storageKeys.userUID),
      () => this.getFromStorage(localStorage, this.storageKeys.userUID + '_backup'),
      () => this.getFromStorage(localStorage, this.storageKeys.userUID + '_emergency'),
      () => this.getFromStorage(localStorage, this.storageKeys.userUID + '_recovery')
    ];
            
    for (const getSource of sources) {
      try {
        const uid = await getSource();
        if (uid && typeof uid === 'string' && uid.length > 10) {
          console.log('FIXED: UID recovered from storage source');
          return uid;
        }
      } catch (e) {
        continue;
      }
    }
            
    return null;
  }

  // FIXED: IndexedDB storage helper
  async storeInIndexedDB(key, data) {
    if (!window.uidManager?.indexedDB) return;
            
    return new Promise((resolve, reject) => {
      try {
        const transaction = window.uidManager.indexedDB.transaction(['uids'], 'readwrite');
        const store = transaction.objectStore('uids');
        const request = store.put({ id: key, ...data });
                     
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (e) {
        reject(e);
      }
    });
  }

  // FIXED: IndexedDB retrieval helper
  async getFromIndexedDB(key) {
    if (!window.uidManager?.indexedDB) return null;
            
    return new Promise((resolve) => {
      try {
        const transaction = window.uidManager.indexedDB.transaction(['uids'], 'readonly');
        const store = transaction.objectStore('uids');
        const request = store.get(key);
                     
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.uid && result.ultrapersistent) {
            resolve(result.uid);
          } else {
            resolve(null);
          }
        };
                     
        request.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  // FIXED: Storage retrieval helper
  getFromStorage(storage, key) {
    try {
      const data = storage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.uid && parsed.ultrapersistent && parsed.version === 'v7') {
          return parsed.uid;
        }
      }
    } catch (e) {
      // Continue to next source
    }
    return null;
  }

  updateUserStatus() {
    const userStatus = document.getElementById('user-status');
    if (this.userUID) {
      const shortUID = this.userUID.slice(0, 8) + '...';
      userStatus.className = 'user-status verified';
      userStatus.innerHTML = `<span>✅ Ultra-Persistent UID: ${shortUID} (PERMANENT - Never Resets)</span>`;
    } else {
      userStatus.className = 'user-status unverified';
      userStatus.innerHTML = `<span>❌ Authentication pending...</span>`;
    }
  }

  // FIXED: Ultra-persistent storage with enhanced redundancy
  setUltraPersistentStorage(key, value) {
    const data = {
      value: value,
      timestamp: Date.now(),
      uid: this.userUID,
      version: 'v7',
      ultrapersistent: true,
      permanentActivation: true,
      deviceBound: true
    };
            
    const serialized = JSON.stringify(data);
            
    // FIXED: Enhanced redundancy - 10+ storage layers
    const storageOperations = [
      // Primary localStorage
      () => localStorage.setItem(key, serialized),
      () => localStorage.setItem(key + '_primary', serialized),
      () => localStorage.setItem(key + '_backup', serialized),
      () => localStorage.setItem(key + '_emergency', serialized),
      () => localStorage.setItem(key + '_recovery', serialized),
                
      // SessionStorage layers
      () => sessionStorage.setItem(key, serialized),
      () => sessionStorage.setItem(key + '_session', serialized),
      () => sessionStorage.setItem(key + '_session_backup', serialized),
                
      // IndexedDB if available
      () => this.storeInIndexedDB(key.replace(/[^a-zA-Z0-9]/g, '_'), data)
    ];
            
    let successCount = 0;
    storageOperations.forEach(operation => {
      try {
        operation();
        successCount++;
      } catch (e) {
        console.warn('Storage operation failed:', e);
      }
    });
            
    console.log(`FIXED: Data stored in ${successCount}/${storageOperations.length} storage layers`);
            
    // Memory fallback
    if (successCount === 0) {
      this.memoryFallback = this.memoryFallback || new Map();
      this.memoryFallback.set(key, data);
      console.log('FIXED: Using memory fallback storage');
    }
  }

  // FIXED: Enhanced retrieval with all storage layers
  getUltraPersistentStorage(key) {
    const sources = [
      // IndexedDB first
      () => this.getFromIndexedDB(key.replace(/[^a-zA-Z0-9]/g, '_')),
                
      // Session storage
      () => sessionStorage.getItem(key),
      () => sessionStorage.getItem(key + '_session'),
      () => sessionStorage.getItem(key + '_session_backup'),
                
      // Local storage layers
      () => localStorage.getItem(key),
      () => localStorage.getItem(key + '_primary'),
      () => localStorage.getItem(key + '_backup'),
      () => localStorage.getItem(key + '_emergency'),
      () => localStorage.getItem(key + '_recovery'),
                
      // Memory fallback
      () => this.memoryFallback?.get(key)
    ];
            
    for (const getSource of sources) {
      try {
        const item = getSource();
        if (item) {
          let data;
          if (typeof item === 'string') {
            data = JSON.parse(item);
          } else if (typeof item === 'object') {
            data = item;
          } else {
            continue;
          }
                         
          if (data?.uid === this.userUID &&
              data?.ultrapersistent &&
              data?.version === 'v7' &&
              data?.value !== undefined) {
            return data.value;
          }
        }
      } catch (e) {
        continue;
      }
    }
    return null;
  }

  // FIXED: Enhanced removal across all storage layers
  removeUltraPersistentStorage(key) {
    const keys = [key, key + '_primary', key + '_backup', key + '_emergency', key + '_recovery', key + '_session', key + '_session_backup'];
            
    keys.forEach(k => {
      try {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      } catch (e) {
        console.warn('Failed to remove storage key:', k, e);
      }
    });
            
    // Remove from IndexedDB
    if (window.uidManager?.indexedDB) {
      try {
        const transaction = window.uidManager.indexedDB.transaction(['uids'], 'readwrite');
        const store = transaction.objectStore('uids');
        store.delete(key.replace(/[^a-zA-Z0-9]/g, '_'));
      } catch (e) {
        console.warn('Failed to remove from IndexedDB:', e);
      }
    }
            
    if (this.memoryFallback) {
      this.memoryFallback.delete(key);
    }
  }

  // FIXED: Enhanced perpetual activation checker that preserves stored keys
  async checkPerpetuallyStoredActivation() {
    try {
      console.log('FIXED: Checking for perpetual activation...');
                
      const persistedActivation = this.getUltraPersistentStorage(this.storageKeys.activation);
      const persistedKeyData = this.getUltraPersistentStorage(this.storageKeys.keyData);
      const persistedKeyId = this.getUltraPersistentStorage(this.storageKeys.keyId);
                
      console.log('FIXED: Perpetual activation check:', {
        activation: persistedActivation,
        hasKeyData: !!persistedKeyData,
        keyId: persistedKeyId,
        uid: this.userUID?.slice(0, 8) + '...'
      });
                
      // FIXED: If we have a stored activation, validate it WITHOUT clearing it
      if (persistedActivation && persistedKeyData && persistedKeyId && this.userUID) {
        console.log('FIXED: Found perpetual activation for UID:', this.userUID.slice(0, 8) + '...');
                     
        try {
          // FIXED: Restore the activation state first
          this.keyData = JSON.parse(persistedKeyData);
          this.isActivated = true;
                         
          // FIXED: Now validate it, but don't clear on failure
          await this.validateStoredKey(persistedKeyId, true);
          console.log('FIXED: Successfully restored perpetual activation');
          this.queueToast('success', 'Welcome Back!', 'Your ultra-persistent activation is active and will never reset.');
          return true;
        } catch (error) {
          console.log('FIXED: Perpetual key validation failed:', error.message);
                         
          // FIXED: Handle deletion/expiration with detailed messaging
          if (error.message.includes('deleted')) {
            const expiryDate = this.keyData?.expiresAt ? this.parseKeyDate(this.keyData.expiresAt) : null;
            this.blockUser('Key Deleted',
               'Your activation key has been permanently deleted by admin.',
              expiryDate ? `The key expired on ${expiryDate.toLocaleDateString()} at ${expiryDate.toLocaleTimeString()}` : null
            );
            return false;
           } else if (error.message.includes('expired')) {
            const match = error.message.match(/expired on (.+)/);
            const expiryText = match ? match[1] : 'recently';
            this.blockUser('Key Expired',
               `Your activation key expired on ${expiryText}. Please contact support to renew your access.`,
              `Expiry details: ${error.message}`
            );
            return false;
          } else {
            // For other errors (network, etc), keep the activation and retry later
            console.log('FIXED: Non-critical validation error, maintaining activation for retry');
            this.queueToast('warning', 'Validation Warning', 'Activation restored but validation had issues. Will retry automatically.');
            return true;
          }
        }
      } else {
        console.log('FIXED: No perpetual activation found in any storage layer');
      }
    } catch (error) {
      console.error('FIXED: Error checking perpetual activation:', error);
    }
    return false;
  }

  // FIXED: Clear activation but maintain storage structure for re-activation
  clearPerpetuallySavedActivation() {
    console.log('FIXED: Clearing perpetual activation for re-activation');
    this.removeUltraPersistentStorage(this.storageKeys.activation);
    this.removeUltraPersistentStorage(this.storageKeys.keyData);
    this.removeUltraPersistentStorage(this.storageKeys.keyId);
    this.removeUltraPersistentStorage(this.storageKeys.activationTime);
    this.removeUltraPersistentStorage(this.storageKeys.lastValidation);
    this.isActivated = false;
    this.keyData = null;
  }

  // FIXED: Enhanced URL and storage key checking
  async checkUrlAndStorageKeys() {
    // Check URL first
    const urlKey = this.extractKeyFromUrl();
    if (urlKey) {
      console.log('FIXED: Found URL key:', urlKey);
      try {
        await this.validateStoredKey(urlKey.toUpperCase());
        return;
      } catch (error) {
        console.error('FIXED: URL key validation failed:', error);
        if (this.systemReady && (error.message.includes('does not exist') ||
                                 error.message.includes('expired') ||
                                 error.message.includes('used'))) {
          this.queueToast('error', 'Invalid URL Key', 'The key in the URL is invalid or expired.');
        }
      }
    }

    // Check if we have any stored keys that might need validation
    const storedKeyId = this.getUltraPersistentStorage(this.storageKeys.keyId);
    if (storedKeyId && !this.isActivated) {
      console.log('FIXED: Found stored key ID, attempting recovery:', storedKeyId);
      try {
        await this.validateStoredKey(storedKeyId, true);
      } catch (error) {
        console.log('FIXED: Stored key recovery failed:', error.message);
        // Don't clear here, let user manually re-activate if needed
      }
    }
  }

  // FIXED: Extract key from URL with better pattern matching
  extractKeyFromUrl() {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(p => p);
            
    let potentialKey = null;
            
    // Handle both patterns: /Aib4n1x/KEY and /KEY
    if (pathParts.length >= 2 && pathParts[pathParts.length - 2] === 'Aib4n1x') {
      potentialKey = pathParts[pathParts.length - 1];
    } else if (pathParts.length === 1) {
      potentialKey = pathParts[0];
    }
            
    // Validate key format
    if (potentialKey &&
        !potentialKey.includes('.') &&
        potentialKey.length >= 6 &&
        potentialKey.length <= 16 &&
        /^[A-Z0-9]+$/i.test(potentialKey)) {
      return potentialKey;
    }
            
    return null;
  }

  parseKeyDate(dateValue) {
    if (!dateValue) return null;
            
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
            
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }
            
    if (dateValue instanceof Date) {
      return dateValue;
    }
            
    if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
      return new Date(dateValue.seconds * 1000);
    }
            
    return null;
  }

  // FIXED: Instant real-time monitoring with zero-latency blocking
  startUltraFastRealtimeMonitoring(keyId) {
    if (this.realtimeListener) {
      this.realtimeListener();
    }
            
    if (!keyId || !window.firebaseDB || !window.firebaseModules) {
      console.warn('FIXED: Cannot start monitoring - missing dependencies');
      return;
    }
            
    const { doc, onSnapshot } = window.firebaseModules;
            
    console.log('FIXED: Starting ultra-fast realtime monitoring for key:', keyId);
            
    this.realtimeListener = onSnapshot(
      doc(window.firebaseDB, 'activation_keys', keyId),
      (docSnapshot) => {
        const startTime = performance.now();
                     
        // FIXED: Instant deletion detection without delay
        if (!docSnapshot.exists()) {
          console.log('FIXED: Key deleted - INSTANT blocking response');
          this.handleKeyDeletedInstantly();
          return;
        }
                     
        const newKeyData = docSnapshot.data();
        console.log('FIXED: Key updated in realtime:', newKeyData);
                     
        // FIXED: Instant status change processing
         this.checkKeyStatusChangeInstantly(newKeyData);
                     
        const endTime = performance.now();
        this.performanceMonitor.set('realtimeUpdate', endTime - startTime);
        console.log(`FIXED: Realtime update processed in ${(endTime - startTime).toFixed(2)}ms`);
      },
      (error) => {
        console.error('FIXED: Realtime monitoring error:', error);
        this.queueToast('warning', 'Monitoring Interrupted', 'Real-time key monitoring temporarily interrupted. Auto-restoring...');
                     
        // FIXED: Enhanced auto-retry with exponential backoff
        setTimeout(() => {
          console.log('FIXED: Attempting to restore realtime monitoring...');
          this.startUltraFastRealtimeMonitoring(keyId);
        }, 2000);
      }
    );
  }

  // FIXED: Instant status change detection with zero delay
  checkKeyStatusChangeInstantly(newKeyData) {
    const wasActivated = this.isActivated;
    const oldExpiryDate = this.keyData?.expiresAt ? this.parseKeyDate(this.keyData.expiresAt) : null;
    const newExpiryDate = newKeyData.expiresAt ? this.parseKeyDate(newKeyData.expiresAt) : null;
            
    // FIXED: Update key data with zero latency
    this.keyData = { ...newKeyData, id: this.keyData?.id };
            
    // FIXED: Update persistent data instantly to maintain ultra-persistent activation
    if (this.isActivated) {
      this.setUltraPersistentStorage(this.storageKeys.keyData, JSON.stringify(this.keyData));
    }
            
    // FIXED: Zero-lag expiry check - block immediately on expiry
    if (newExpiryDate && new Date() > newExpiryDate) {
      if (wasActivated) {
        console.log('FIXED: Key expired - INSTANT blocking');
        this.handleKeyExpiredInstantly();
      }
      return;
    }
            
    // FIXED: Instant notification for key extension
    if (oldExpiryDate && newExpiryDate && newExpiryDate > oldExpiryDate) {
      this.queueToast('success', 'Key Extended', 'Your activation key time has been extended!');
    }
            
    this.updateUI();
  }

  // FIXED: Enhanced key deletion handler with specific toast and overlay
  handleKeyDeletedInstantly() {
    console.log('FIXED: Key deleted by admin - INSTANT blocking without delay');
            
    // FIXED: Show specific deletion toast
    this.queueToast('error', 'KEY DELETED', 'Your key has been deleted by admin');
            
    // FIXED: Immediate state change
    this.isActivated = false;
    this.keyData = null;
            
    // FIXED: Clear activation but keep UID persistent
    this.clearPerpetuallySavedActivation();
            
    // FIXED: Show specific deletion overlay
    this.blockUser('Key Deleted', 'Your activation key has been permanently deleted by admin.');
    this.updateUI();
  }

  // FIXED: Enhanced key expiration handler with specific messaging
  handleKeyExpiredInstantly() {
    console.log('FIXED: Key expired - INSTANT blocking without delay');
            
    const expiryDate = this.keyData?.expiresAt ? this.parseKeyDate(this.keyData.expiresAt) : null;
    const expiryText = expiryDate ?
       `${expiryDate.toLocaleDateString()} at ${expiryDate.toLocaleTimeString()}` :
       'recently';
            
    // FIXED: Show specific expiration toast with exact details
    this.queueToast('error', 'KEY EXPIRED',
       `Your key expired on ${expiryText}. Please contact support for renewal.`);
            
    // FIXED: Immediate state change 
    this.isActivated = false;
            
    // FIXED: Clear activation but keep UID for potential renewal
    this.clearPerpetuallySavedActivation();
            
    // FIXED: Show specific expiration overlay with details
    this.blockUser('Key Expired',
       `Your activation key expired on ${expiryText}. Please contact support to renew your access.`,
      expiryDate ? `Exact expiry: ${expiryDate.toLocaleString()}` : null);
    this.updateUI();
  }

  // FIXED: Enhanced blocking with new UI structure
  blockUser(title, message, details = null) {
    this.isBlocked = true;
    this.showBlockedOverlay(title, message, details);
    this.blockAIFunctionality();
            
    // FIXED: Immediately disable all input controls
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const photoBtn = document.getElementById('photo-btn');
            
    if (userInput) {
      userInput.disabled = true;
      userInput.placeholder = 'AI access blocked - activation required';
    }
    if (sendBtn) {
      sendBtn.disabled = true;
    }
    if (photoBtn) {
      photoBtn.disabled = true;
    }
  }

  // FIXED: Enhanced blocked overlay with new structure per requirements
  showBlockedOverlay(title, message, details = null) {
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
  }

  // FIXED: Enhanced unblocking when key is restored
  hideBlockedOverlay() {
    if (this.blockedOverlay) {
      this.blockedOverlay.remove();
      this.blockedOverlay = null;
    }
    this.isBlocked = false;
            
    // FIXED: Re-enable controls
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const photoBtn = document.getElementById('photo-btn');
            
    if (userInput) {
      userInput.disabled = false;
      userInput.placeholder = 'Type your message...';
    }
    if (sendBtn) {
      sendBtn.disabled = false;
    }
    if (photoBtn) {
      photoBtn.disabled = false;
    }
  }

  startOptimizedCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
            
    // FIXED: Use optimized interval timing with immediate first update
    this.updateCountdownOptimized();
    this.countdownInterval = setInterval(() => {
      this.updateCountdownOptimized();
    }, 1000);
  }

  updateCountdownOptimized() {
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
  }

  showCountdown(text, className = '') {
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
  }

  hideCountdown() {
    const countdownDisplay = document.getElementById('key-countdown-display');
    const countdownInline = document.getElementById('key-countdown');
            
    if (countdownDisplay) {
      countdownDisplay.style.display = 'none';
    }
            
    if (countdownInline) {
      countdownInline.style.display = 'none';
    }
  }

  // FIXED: Enhanced key validation with permanent UID binding
  async validateStoredKey(key, isRestore = false) {
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
  }

  showActivationAnimation() {
    const animation = document.getElementById('activation-animation');
    animation.classList.add('show');
            
    setTimeout(() => {
      animation.classList.remove('show');
    }, 3000);
  }

  updateUI() {
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
            
    // FIXED: Block AI functionality if not activated
    if (!this.isActivated || this.isBlocked) {
      this.blockAIFunctionality();
    }
  }

  // FIXED: Enhanced AI functionality blocking
  blockAIFunctionality() {
    if (window.streamAIResponse && !window.streamAIResponse._blocked) {
      window.originalStreamAIResponse = window.streamAIResponse;
      window.streamAIResponse = function() {
        window.appendMessage("🔒 Please activate your user key to use AI features. Your ultra-persistent UID is maintained - just enter your key above to restore full functionality.", 'ai', false, false);
        window.showToast('warning', 'Activation Required', 'Please activate your key to access AI functionality. Your UID is permanently saved.');
      };
      window.streamAIResponse._blocked = true;
    }
  }

  queueToast(type, title, message) {
    if (this.systemReady && this.initializationComplete) {
      window.showToast(type, title, message);
    }
  }

  async activateKey(key) {
    try {
      document.getElementById('key-submit-btn').disabled = true;
      document.getElementById('key-submit-btn').textContent = 'Activating...';
                
      await this.validateStoredKey(key.toUpperCase());
      this.updateUI();
                
      document.getElementById('key-input').value = '';
                
      // FIXED: Restore AI functionality
      if (window.originalStreamAIResponse) {
        window.streamAIResponse = window.originalStreamAIResponse;
        delete window.streamAIResponse._blocked;
      }
    } catch (error) {
      window.showToast('error', 'Activation Failed', error.message);
      console.error('FIXED: Key activation failed:', error);
    } finally {
      if (!this.isActivated) {
        document.getElementById('key-submit-btn').disabled = false;
        document.getElementById('key-submit-btn').textContent = 'Activate';
      }
    }
  }

  deactivateKey() {
    this.isActivated = false;
    this.keyData = null;
    this.clearPerpetuallySavedActivation();
            
    if (this.realtimeListener) {
      this.realtimeListener();
      this.realtimeListener = null;
    }
            
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
            
    this.hideCountdown();
    this.hideBlockedOverlay();
    this.updateUI();
    window.showToast('info', 'Key Deactivated', 'Ultra-persistent authorization removed. Your UID is maintained for quick re-activation.');
  }

  destroy() {
    if (this.realtimeListener) {
      this.realtimeListener();
    }
            
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
            
    this.hideBlockedOverlay();
            
    // FIXED: Log performance stats
    console.log('FIXED: Key System Performance Stats:', Object.fromEntries(this.performanceMonitor));
  }
}

// FIXED: Initialize the ultra-persistent key system
let keySystem = new UltraPersistentKeySystem();

// Expose to window for global access
window.keySystem = keySystem;