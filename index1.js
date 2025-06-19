// FIXED: Ultra-Optimized Firebase UID-Based Key System with TRUE Perpetual Persistence
class UltraPersistentKeySystem {
  constructor() {
    this.isActivated = false;
    this.keyData = null;
    this.userUID = null;
    this.baseUrl = 'https://barnigonz.github.io/Aib4n1x/';
    this.realtimeListener = null;
    this.countdownInterval = null;
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
}

// Initialize the key system
async function initializeKeySystem() {
  window.keySystem = new UltraPersistentKeySystem();
}