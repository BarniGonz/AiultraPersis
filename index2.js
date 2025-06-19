// FIXED: Ultra-persistent storage with enhanced redundancy
UltraPersistentKeySystem.prototype.setUltraPersistentStorage = function(key, value) {
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
};

// FIXED: Enhanced retrieval with all storage layers
UltraPersistentKeySystem.prototype.getUltraPersistentStorage = function(key) {
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
};

// FIXED: Enhanced removal across all storage layers
UltraPersistentKeySystem.prototype.removeUltraPersistentStorage = function(key) {
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
};

// FIXED: Enhanced perpetual activation checker that preserves stored keys
UltraPersistentKeySystem.prototype.checkPerpetuallyStoredActivation = async function() {
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
                
        // Enable all UI components immediately
        this.enableAllComponents();
                
        // FIXED: Now validate it, but don't clear on failure
        await this.validateStoredKey(persistedKeyId, true);
        console.log('FIXED: Successfully restored perpetual activation');
        this.queueToast('success', 'Welcome Back!', 'Your ultra-persistent activation is active and will never reset.');
        return true;
      } catch (error) {
        console.log('FIXED: Perpetual key validation failed:', error.message);
                
        // FIXED: Handle deletion/expiration with immediate UI update
        if (error.message.includes('deleted')) {
          this.handleKeyDeletedInstantly();
          return false;
        } else if (error.message.includes('expired')) {
          this.handleKeyExpiredInstantly();
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
};

// FIXED: Enable all UI components
UltraPersistentKeySystem.prototype.enableAllComponents = function() {
  // Enable all controls immediately
  const controls = [
    'model-select',
    'conversation-select', 
    'new-conversation-btn',
    'delete-conversation-btn',
    'clear-memory-btn',
    'user-input',
    'send-btn',
    'photo-btn',
    'file-input'
  ];

  controls.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.disabled = false;
    }
  });

  // Update input placeholder
  const userInput = document.getElementById('user-input');
  if (userInput) {
    userInput.placeholder = 'Type your message...';
  }

  // Show memory panel
  const memoryPanel = document.getElementById('memory-panel');
  if (memoryPanel) {
    memoryPanel.style.display = 'block';
  }
};

// FIXED: Disable all UI components
UltraPersistentKeySystem.prototype.disableAllComponents = function() {
  // Disable all controls immediately
  const controls = [
    'model-select',
    'conversation-select', 
    'new-conversation-btn',
    'delete-conversation-btn',
    'clear-memory-btn',
    'user-input',
    'send-btn',
    'photo-btn',
    'file-input'
  ];

  controls.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.disabled = true;
    }
  });

  // Update input placeholder
  const userInput = document.getElementById('user-input');
  if (userInput) {
    userInput.placeholder = 'Please activate your key first...';
  }
};

// FIXED: Clear activation but maintain storage structure for re-activation
UltraPersistentKeySystem.prototype.clearPerpetuallySavedActivation = function() {
  console.log('FIXED: Clearing perpetual activation for re-activation');
  this.removeUltraPersistentStorage(this.storageKeys.activation);
  this.removeUltraPersistentStorage(this.storageKeys.keyData);
  this.removeUltraPersistentStorage(this.storageKeys.keyId);
  this.removeUltraPersistentStorage(this.storageKeys.activationTime);
  this.removeUltraPersistentStorage(this.storageKeys.lastValidation);
  this.isActivated = false;
  this.keyData = null;
};