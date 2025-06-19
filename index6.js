// GoFile API Configuration - Performance Optimized
const GOFILE_API_TOKEN = 'j4yXffP0QupranFzYZUY6DoKMLan7fw8';
const GOFILE_BASE_URL = 'https://api.gofile.io';
const UPLOAD_URL = 'https://upload.gofile.io/uploadfile';

// Ultra-Optimized Cloud Storage Manager
class UltraOptimizedGoFileStorage {
  constructor() {
    this.token = GOFILE_API_TOKEN;
    this.folderId = null;
    this.accountId = null;
    this.storageKey = 'ai_chatbot_data';
    this.syncInProgress = false;
    this.lastSync = 0;
    this.syncInterval = 45000;
    this.retryAttempts = 3;
    this.retryDelay = 2000;
    this.dataFileId = null;
    this.initialized = false;
    this.isConnected = false;
    this.connectionCheckInterval = null;
    this.autoSyncInterval = null;
    this.performanceCache = new Map();
  }

  updateConnectionStatus(connected, message = '') {
    const indicator = document.getElementById('connection-indicator');
    const text = document.getElementById('connection-text');
    
    this.isConnected = connected;
    
    if (connected) {
      indicator.classList.add('connected');
      text.textContent = 'GoFile Connected';
    } else {
      indicator.classList.remove('connected');
      text.textContent = message || 'GoFile Disconnected';
    }
  }

  showSyncStatus(message, show = true) {
    const syncStatus = document.getElementById('sync-status');
    const syncMessage = document.getElementById('sync-message');
    
    if (syncMessage) {
      syncMessage.textContent = message;
    }
    
    if (show) {
      syncStatus.classList.add('show');
    } else {
      setTimeout(() => syncStatus.classList.remove('show'), 2000);
    }
  }

  async initialize() {
    if (this.initialized) return this.isConnected;
    
    try {
      this.showSyncStatus('Connecting to GoFile cloud...');
      this.updateConnectionStatus(false, 'Connecting...');
      
      const accountResponse = await fetch(`${GOFILE_BASE_URL}/accounts/getid`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!accountResponse.ok) {
        throw new Error(`GoFile authentication failed: ${accountResponse.status}`);
      }
      
      const accountData = await accountResponse.json();
      if (accountData.status !== 'ok') {
        throw new Error('GoFile authentication unsuccessful');
      }
      
      this.accountId = accountData.data.id;
      
      const storedFileId = this.getStoredFileId();
      if (storedFileId) {
        this.dataFileId = storedFileId;
      }
      
      this.initialized = true;
      this.updateConnectionStatus(true);
      this.showSyncStatus('Connected to GoFile cloud ✓', false);
      
      showToast('success', 'Cloud Connected', 'GoFile cloud storage is now active');
      
      this.startConnectionMonitoring();
      this.startAutoSync();
      
      return true;
    } catch (error) {
      console.error('GoFile initialization failed:', error);
      this.updateConnectionStatus(false, 'Connection Failed');
      this.showSyncStatus('GoFile connection failed', false);
      showToast('error', 'Cloud Error', 'Failed to connect to GoFile. Please check your connection.');
      return false;
    }
  }

  getStoredFileId() {
    try {
      return sessionStorage.getItem('gofile_data_file_id');
    } catch (e) {
      return null;
    }
  }

  setStoredFileId(fileId) {
    try {
      sessionStorage.setItem('gofile_data_file_id', fileId);
    } catch (e) {
      console.warn('Failed to store file ID');
    }
  }

  clearStoredData() {
    try {
      sessionStorage.removeItem('gofile_data_file_id');
      sessionStorage.removeItem('gofile_folder_id');
    } catch (e) {
      // Ignore errors
    }
    this.dataFileId = null;
    this.folderId = null;
  }

  async createDataFile(data) {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `chatbot_data_${timestamp}.json`;
      
      const formData = new FormData();
      formData.append('file', blob, fileName);
      
      if (this.folderId) {
        formData.append('folderId', this.folderId);
      }
      
      const uploadResponse = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }
      
      const uploadData = await uploadResponse.json();
      
      if (uploadData.status === 'ok') {
        this.dataFileId = uploadData.data.fileId;
        this.setStoredFileId(this.dataFileId);
        
        if (!this.folderId && uploadData.data.parentFolder) {
          this.folderId = uploadData.data.parentFolder;
          try {
            sessionStorage.setItem('gofile_folder_id', this.folderId);
          } catch (e) {
            // Ignore storage errors
          }
        }
        
        return true;
      }
      
      throw new Error('Upload response unsuccessful');
    } catch (error) {
      console.error('Failed to create data file:', error);
      throw error;
    }
  }

  async updateDataFile(data) {
    if (this.dataFileId) {
      try {
        await fetch(`${GOFILE_BASE_URL}/contents`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contentsId: this.dataFileId
          })
        });
      } catch (e) {
        console.warn('Failed to delete old file:', e);
      }
    }
    
    return await this.createDataFile(data);
  }

  async saveToCloud(data, isAutoSync = false) {
    if (this.syncInProgress) return false;
    
    this.syncInProgress = true;
    
    if (!isAutoSync) {
      this.showSyncStatus('Saving to GoFile cloud...');
    }
    
    if (!this.initialized) {
      const connected = await this.initialize();
      if (!connected) {
        this.syncInProgress = false;
        return false;
      }
    }
    
    let attempts = 0;
    while (attempts < this.retryAttempts) {
      try {
        const saveData = {
          conversations: this.serializeMap(conversations),
          advancedMemory: {
            conversations: this.serializeMap(advancedMemory.conversations, (conv) => ({
              ...conv,
              topics: Array.from(conv.topics),
              messages: conv.messages
            })),
            globalTopics: this.serializeMap(advancedMemory.globalTopics, (convIds) => Array.from(convIds)),
            conversationTopics: Array.from(advancedMemory.conversationTopics.entries())
          },
          currentConversationId,
          lastUpdated: Date.now(),
          version: '6.0',
          metadata: {
            totalConversations: conversations.size,
            totalMemoryEntries: advancedMemory.conversations.size,
            saveType: isAutoSync ? 'auto' : 'manual',
            uidSystem: 'ultra-persistent'
          }
        };
        
        const success = this.dataFileId ?
          await this.updateDataFile(saveData) :
          await this.createDataFile(saveData);
        
        if (success) {
          this.lastSync = Date.now();
          this.updateConnectionStatus(true);
          
          if (!isAutoSync) {
            this.showSyncStatus('Saved to GoFile cloud ✓', false);
          }
          
          this.syncInProgress = false;
          return true;
        }
      } catch (error) {
        attempts++;
        console.error(`Save attempt ${attempts} failed:`, error);
        
        if (attempts >= this.retryAttempts) {
          this.updateConnectionStatus(false, 'Save Failed');
          
          if (!isAutoSync) {
            this.showSyncStatus('GoFile save failed', false);
            showToast('error', 'Cloud Save Failed', 'Failed to save to GoFile cloud.');
          }
          
          this.syncInProgress = false;
          return false;
        } else {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempts));
        }
      }
    }
    
    this.syncInProgress = false;
    return false;
  }

  async loadFromCloud() {
    if (!this.initialized) {
      const connected = await this.initialize();
      if (!connected) {
        return this.getEmptyData();
      }
    }
    
    if (!this.dataFileId) {
      this.showSyncStatus('No cloud backup found', false);
      return this.getEmptyData();
    }
    
    this.showSyncStatus('Loading from GoFile cloud...');
    
    try {
      const detailsResponse = await fetch(`${GOFILE_BASE_URL}/contents/${this.dataFileId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!detailsResponse.ok) {
        throw new Error(`Failed to get file details: ${detailsResponse.status}`);
      }
      
      const detailsData = await detailsResponse.json();
      
      if (detailsData.status !== 'ok') {
        throw new Error('Failed to get file details from GoFile');
      }
      
      let fileInfo = null;
      if (detailsData.data.children) {
        fileInfo = Object.values(detailsData.data.children).find(child =>
            child.id === this.dataFileId && child.type === 'file'
        );
      }
      
      if (!fileInfo || !fileInfo.link) {
        throw new Error('Data file not found or no download link');
      }
      
      const fileResponse = await fetch(fileInfo.link);
      if (!fileResponse.ok) {
        throw new Error(`Failed to download file: ${fileResponse.status}`);
      }
      
      const fileData = await fileResponse.json();
      
      this.showSyncStatus('Loaded from GoFile cloud ✓', false);
      this.updateConnectionStatus(true);
      
      return fileData;
    } catch (error) {
      console.error('Failed to load from GoFile:', error);
      this.updateConnectionStatus(false, 'Load Failed');
      this.showSyncStatus('GoFile load failed', false);
      showToast('warning', 'Cloud Load Failed', 'Could not load from cloud storage.');
      return this.getEmptyData();
    }
  }

  serializeMap(map, valueTransformer = null) {
    const result = {};
    for (const [key, value] of map.entries()) {
      result[key] = valueTransformer ? valueTransformer(value) : value;
    }
    return result;
  }

  getEmptyData() {
    return {
      conversations: {},
      advancedMemory: {
        conversations: {},
        globalTopics: {},
        conversationTopics: []
      },
      currentConversationId: null,
      version: '6.0'
    };
  }

  startConnectionMonitoring() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    
    this.connectionCheckInterval = setInterval(async () => {
      if (!this.initialized) return;
      
      try {
        const response = await fetch(`${GOFILE_BASE_URL}/accounts/getid`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        const isConnected = response.ok;
        this.updateConnectionStatus(isConnected, isConnected ? null : 'Connection Lost');
      } catch (error) {
        this.updateConnectionStatus(false, 'Connection Error');
      }
    }, 60000);
  }

  startAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
    
    this.autoSyncInterval = setInterval(async () => {
      if (this.isConnected && !this.syncInProgress &&
          Date.now() - this.lastSync > this.syncInterval) {
        await this.saveToCloud({
          conversations,
          advancedMemory,
          currentConversationId
        }, true);
      }
    }, this.syncInterval);
  }

  async clearAllData() {
    this.clearStoredData();
    this.lastSync = 0;
    this.updateConnectionStatus(this.initialized);
  }

  destroy() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
  }
}

// Initialize cloud storage
async function initializeCloudStorage() {
  window.cloudStorage = new UltraOptimizedGoFileStorage();
}

// Theme management
function initializeThemeManagement() {
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  function loadTheme() {
    const savedTheme = sessionStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
  }

  function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', newTheme);
    sessionStorage.setItem('theme', newTheme);
  }

  loadTheme();
  themeToggle.addEventListener('change', toggleTheme);
}

// Ultra-optimized toast system
function showToast(type, title, message, duration = 4000) {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('show'));

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}