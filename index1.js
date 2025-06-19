// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, deleteDoc, Timestamp, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmDLSB0S_0qnrcl5tsaSVyRQaopy8M12I",
  authDomain: "aib4n1x.firebaseapp.com",
  projectId: "aib4n1x",
  storageBucket: "aib4n1x.firebasestorage.app",
  messagingSenderId: "318019512167",
  appId: "1:318019512167:web:9dae7a6654bf7a9fbd31c2",
  measurementId: "G-4W0QEKN332"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// ULTRA-PERSISTENT UID MANAGEMENT SYSTEM WITH INDEXEDDB
class UltraPersistentUIDManager {
  constructor() {
    this.uidStorageKeys = {
      primary: 'firebase_ultra_persistent_uid_v7_primary',
      backup: 'firebase_ultra_persistent_uid_v7_backup', 
      emergency: 'firebase_ultra_persistent_uid_v7_emergency',
      session: 'firebase_ultra_persistent_uid_v7_session',
      metadata: 'firebase_uid_metadata_v7',
      indexedDB: 'uid_store_v7'
    };
    this.persistentUID = null;
    this.isAuthInitialized = false;
    this.authLocked = false;
    this.initializationPromise = null;
    this.deviceFingerprint = null;
    this.indexedDBReady = false;
    this.initializeIndexedDB();
    this.createStableDeviceFingerprint();
  }

  // Initialize IndexedDB for primary storage
  async initializeIndexedDB() {
    try {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('UltraPersistentUID', 1);
        
        request.onerror = () => {
          console.warn('IndexedDB not available, using localStorage fallback');
          this.indexedDBReady = false;
          resolve();
        };
        
        request.onsuccess = (event) => {
          this.indexedDB = event.target.result;
          this.indexedDBReady = true;
          console.log('IndexedDB initialized for ultra-persistent UID storage');
          resolve();
        };
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('uids')) {
            const store = db.createObjectStore('uids', { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('version', 'version', { unique: false });
          }
        };
      });
    } catch (error) {
      console.warn('IndexedDB initialization failed:', error);
      this.indexedDBReady = false;
    }
  }

  // Create more stable device fingerprint
  createStableDeviceFingerprint() {
    try {
      // Use only stable properties that don't change with minor variations
      const stableProps = {
        screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        // Use only the first part of userAgent for stability
        userAgentCore: navigator.userAgent.split(' ')[0] || 'unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        cookieEnabled: navigator.cookieEnabled,
        version: 'v7'
      };

      // Create canvas fingerprint but truncate for stability
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Ultra-persistent fingerprint', 2, 2);
      ctx.fillStyle = 'rgba(255, 0, 102, 0.7)';
      ctx.fillText('Device identification', 4, 20);

      stableProps.canvasHash = btoa(canvas.toDataURL()).slice(0, 32);

      this.deviceFingerprint = btoa(JSON.stringify(stableProps));
      console.log('Created stable device fingerprint');
    } catch (e) {
      console.warn('Fingerprint creation failed, using fallback');
      this.deviceFingerprint = btoa(`fallback_${Date.now()}_v7`);
    }
  }

  // Get UID from IndexedDB first, then fallback to other storage
  async getUltraPersistentUID() {
    const sources = [
      () => this.getFromIndexedDB(),
      () => this.getFromStorage(sessionStorage, this.uidStorageKeys.session),
      () => this.getFromStorage(localStorage, this.uidStorageKeys.primary),
      () => this.getFromStorage(localStorage, this.uidStorageKeys.backup),
      () => this.getFromStorage(localStorage, this.uidStorageKeys.emergency)
    ];

    for (const getSource of sources) {
      try {
        const uid = await getSource();
        if (uid && typeof uid === 'string' && uid.length > 10) {
          console.log('Ultra-persistent UID recovered:', uid.slice(0, 8) + '...');
          return uid;
        }
      } catch (e) {
        continue;
      }
    }

    return null;
  }

  // Get UID from IndexedDB
  async getFromIndexedDB() {
    if (!this.indexedDBReady || !this.indexedDB) {
      return null;
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.indexedDB.transaction(['uids'], 'readonly');
        const store = transaction.objectStore('uids');
        const request = store.get('primary');

        request.onsuccess = () => {
          const result = request.result;
          if (result && this.validateUIDData(result)) {
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

  // Get UID from localStorage/sessionStorage
  getFromStorage(storage, key) {
    try {
      const data = storage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (this.validateUIDData(parsed)) {
          return parsed.uid;
        }
      }
    } catch (e) {
      // Continue to next source
    }
    return null;
  }

  // Enhanced UID validation with more flexible fingerprint matching
  validateUIDData(data) {
    if (!data || !data.uid || !data.version) {
      return false;
    }

    // Version compatibility check
    if (data.version !== 'v7' && !data.version.startsWith('v6')) {
      return false;
    }

    // UID format validation
    if (typeof data.uid !== 'string' || data.uid.length < 10) {
      return false;
    }

    // Flexible fingerprint validation - allow for minor changes
    if (data.deviceFingerprint && this.deviceFingerprint) {
      try {
        const storedFP = JSON.parse(atob(data.deviceFingerprint));
        const currentFP = JSON.parse(atob(this.deviceFingerprint));
        
        // Check core stable properties
        const coreMatch = storedFP.platform === currentFP.platform &&
                         storedFP.timezone === currentFP.timezone &&
                         storedFP.language === currentFP.language;
        
        if (!coreMatch) {
          console.log('Core device properties changed, but allowing for minor variations');
          // Still allow but with warning
        }
      } catch (e) {
        console.log('Fingerprint validation failed, but allowing UID recovery');
      }
    }

    return true;
  }

  // Store UID in IndexedDB first, then redundant storage
  async setUltraPersistentUID(uid) {
    if (!uid) return;

    const uidData = {
      id: 'primary',
      uid: uid,
      timestamp: Date.now(),
      version: 'v7',
      deviceFingerprint: this.deviceFingerprint,
      authMethod: 'anonymous',
      permanent: true,
      ultrapersistent: true
    };

    const serialized = JSON.stringify(uidData);

    // Primary storage: IndexedDB
    if (this.indexedDBReady && this.indexedDB) {
      try {
        const transaction = this.indexedDB.transaction(['uids'], 'readwrite');
        const store = transaction.objectStore('uids');
        await store.put(uidData);
        console.log('UID stored in IndexedDB with ultra-persistence');
      } catch (e) {
        console.warn('IndexedDB storage failed:', e);
      }
    }

    // Redundant storage layers
    try {
      localStorage.setItem(this.uidStorageKeys.primary, serialized);
      localStorage.setItem(this.uidStorageKeys.backup, serialized);
      localStorage.setItem(this.uidStorageKeys.emergency, serialized);
      sessionStorage.setItem(this.uidStorageKeys.session, serialized);

      // Enhanced metadata
      localStorage.setItem(this.uidStorageKeys.metadata, JSON.stringify({
        lastStored: Date.now(),
        version: 'v7',
        fingerprint: this.deviceFingerprint,
        storageMethod: 'ultra-persistent-multi-layer'
      }));

      console.log('UID stored with ultra-persistent redundancy:', uid.slice(0, 8) + '...');
    } catch (e) {
      console.warn('Storage failed for UID persistence:', e);
    }

    this.persistentUID = uid;
  }

  async initializeAuthentication() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._doInitializeAuthentication();
    return this.initializationPromise;
  }

  async _doInitializeAuthentication() {
    if (this.isAuthInitialized || this.authLocked) {
      return;
    }

    this.authLocked = true;
    console.log('Initializing ultra-persistent authentication...');

    try {
      // Wait for IndexedDB to be ready
      if (!this.indexedDBReady) {
        await this.initializeIndexedDB();
      }

      // Check for existing persistent UID with enhanced recovery
      const existingUID = await this.getUltraPersistentUID();

      if (existingUID) {
        console.log('Found existing persistent UID - maintaining session:', existingUID.slice(0, 8) + '...');
        this.persistentUID = existingUID;
        window.firebaseUser = { uid: existingUID };
        this.isAuthInitialized = true;
        this.authLocked = false;
        window.dispatchEvent(new CustomEvent('userAuthenticated', {
          detail: { uid: existingUID }
        }));
        return;
      }

      // Only authenticate if no persistent UID exists
      console.log('No persistent UID found - performing initial authentication');

      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      console.log('Initial anonymous sign-in successful:', uid.slice(0, 8) + '...');

      // Store UID with enhanced persistence
      await this.setUltraPersistentUID(uid);
      this.isAuthInitialized = true;

      window.firebaseUser = userCredential.user;
      window.dispatchEvent(new CustomEvent('userAuthenticated', {
        detail: userCredential.user
      }));

    } catch (error) {
      console.error('Authentication initialization failed:', error);

      // Enhanced fallback recovery
      const fallbackUID = await this.getUltraPersistentUID();
      if (fallbackUID) {
        console.log('Using enhanced fallback persistent UID');
        this.persistentUID = fallbackUID;
        window.firebaseUser = { uid: fallbackUID };
        window.dispatchEvent(new CustomEvent('userAuthenticated', {
          detail: { uid: fallbackUID }
        }));
      }
    } finally {
      this.authLocked = false;
      this.isAuthInitialized = true;
    }
  }

  getCurrentUID() {
    return this.persistentUID ||
           auth.currentUser?.uid ||
           null;
  }

  // Enhanced recovery mechanism
  async recoverUID() {
    console.log('Attempting UID recovery from all available sources...');
           
    const recoveredUID = await this.getUltraPersistentUID();
    if (recoveredUID) {
      this.persistentUID = recoveredUID;
      window.firebaseUser = { uid: recoveredUID };
      console.log('UID successfully recovered:', recoveredUID.slice(0, 8) + '...');
      return recoveredUID;
    }
           
    console.log('No UID could be recovered from any storage source');
    return null;
  }
}

// Initialize the ultra-persistent UID manager
const uidManager = new UltraPersistentUIDManager();

// FIXED: Enhanced auth state listener that prevents UID changes
onAuthStateChanged(auth, (user) => {
  const existingUID = uidManager.persistentUID;

  if (user && user.uid) {
    console.log('Firebase auth state changed:', user.uid.slice(0, 8) + '...');

    // CRITICAL FIX: Always prioritize existing persistent UID
    if (existingUID) {
      console.log('Maintaining existing persistent UID over Firebase auth change');
      window.firebaseUser = { uid: existingUID };
      uidManager.persistentUID = existingUID;
    } else {
      // Only store new UID if no persistent UID exists
      console.log('Storing new Firebase UID as persistent');
      uidManager.setUltraPersistentUID(user.uid);
      window.firebaseUser = user;
    }

    window.dispatchEvent(new CustomEvent('userAuthenticated', {
      detail: window.firebaseUser
    }));
  } else if (existingUID && !uidManager.authLocked) {
    // Always maintain persistent UID even when Firebase auth is lost
    console.log('Firebase auth lost but maintaining persistent UID:', existingUID.slice(0, 8) + '...');
    window.firebaseUser = { uid: existingUID };
    window.dispatchEvent(new CustomEvent('userAuthenticated', {
      detail: window.firebaseUser
    }));
  } else if (!existingUID && !uidManager.authLocked) {
    console.log('No authentication found - initializing');
    uidManager.initializeAuthentication();
  }
});

// FIXED: Immediate initialization with enhanced persistence check
(async function immediateInit() {
  try {
    // Wait for IndexedDB initialization
    await uidManager.initializeIndexedDB();
           
    const persistentUID = await uidManager.getUltraPersistentUID();

    if (persistentUID) {
      console.log('Immediate persistent UID restoration:', persistentUID.slice(0, 8) + '...');
      uidManager.persistentUID = persistentUID;
      window.firebaseUser = { uid: persistentUID };
      uidManager.isAuthInitialized = true;
      window.dispatchEvent(new CustomEvent('userAuthenticated', {
        detail: { uid: persistentUID }
      }));
    } else {
      // Only initialize Firebase auth if no persistent UID exists
      await uidManager.initializeAuthentication();
    }
  } catch (error) {
    console.error('Immediate initialization failed:', error);
    // Attempt recovery
    const recovered = await uidManager.recoverUID();
    if (!recovered) {
      await uidManager.initializeAuthentication();
    }
  }
})();

// Expose globals
window.firebaseDB = db;
window.firebaseAuth = auth;
window.uidManager = uidManager;
window.firebaseModules = {
  collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, deleteDoc, Timestamp, serverTimestamp, onSnapshot
};

// Signal that Firebase is ready
window.firebaseReady = true;
window.dispatchEvent(new Event('firebaseReady'));