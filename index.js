// Enhanced Firebase readiness detection with performance optimization
function waitForFirebase() {
  return new Promise((resolve) => {
    if (window.firebaseReady && window.uidManager) {
      resolve();
    } else {
      const handler = () => {
        if (window.firebaseReady && window.uidManager) {
          window.removeEventListener('firebaseReady', handler);
          resolve();
        }
      };
      window.addEventListener('firebaseReady', handler);
      
      // Fail-safe timeout
      setTimeout(() => {
        window.removeEventListener('firebaseReady', handler);
        resolve();
      }, 5000);
    }
  });
}

async function initializeApp() {
  // Wait for Firebase with enhanced stability
  await waitForFirebase();
  
  // Additional stabilization period for auth
  await new Promise(resolve => setTimeout(resolve, 300));

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

  // Initialize ultra-optimized cloud storage
  const cloudStorage = new UltraOptimizedGoFileStorage();

  // OpenRouter model list with vision capabilities
  const openRouterModels = [
    { id: "openrouter:01-ai/yi-large", hasVision: false },
    { id: "openrouter:anthropic/claude-3-haiku", hasVision: true },
    { id: "openrouter:anthropic/claude-3-opus", hasVision: true },
    { id: "openrouter:anthropic/claude-3-sonnet", hasVision: true },
    { id: "openrouter:anthropic/claude-3.5-haiku", hasVision: true },
    { id: "openrouter:anthropic/claude-3.5-sonnet", hasVision: true },
    { id: "openrouter:anthropic/claude-sonnet-4", hasVision: true },
    { id: "openrouter:anthropic/claude-opus-4", hasVision: true },
    { id: "openrouter:google/gemini-2.0-flash-001", hasVision: true },
    { id: "openrouter:google/gemini-flash-1.5", hasVision: true },
    { id: "openrouter:google/gemini-pro-1.5", hasVision: true },
    { id: "openrouter:google/gemma-2-27b-it", hasVision: false },
    { id: "openrouter:meta-llama/llama-3.2-11b-vision-instruct", hasVision: true },
    { id: "openrouter:meta-llama/llama-3.2-90b-vision-instruct", hasVision: true },
    { id: "openrouter:mistralai/pixtral-12b", hasVision: true },
    { id: "openrouter:mistralai/pixtral-large-2411", hasVision: true },
    { id: "openrouter:openai/gpt-4-turbo", hasVision: true },
    { id: "openrouter:openai/gpt-4o", hasVision: true },
    { id: "openrouter:openai/gpt-4o-mini", hasVision: true },
    { id: "openrouter:qwen/qwen-2.5-vl-7b-instruct", hasVision: true },
    { id: "openrouter:qwen/qwen-vl-max", hasVision: true },
    { id: "openrouter:deepseek/deepseek-chat", hasVision: false },
    { id: "openrouter:openai/chatgpt-4o-latest", hasVision: true },
    { id: "openrouter:microsoft/phi-4-multimodal-instruct", hasVision: true }
  ];

  // Image handling variables
  let attachedImages = [];
  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

  // Theme management
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

  // Chat functionality with performance optimizations
  const chatContainer = document.getElementById('chat-container');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const modelSelect = document.getElementById('model-select');
  const conversationSelect = document.getElementById('conversation-select');
  const newConversationBtn = document.getElementById('new-conversation-btn');
  const deleteConversationBtn = document.getElementById('delete-conversation-btn');
  const clearMemoryBtn = document.getElementById('clear-memory-btn');
  const memoryPanel = document.getElementById('memory-panel');
  const memoryContent = document.getElementById('memory-content');
  const fileInput = document.getElementById('file-input');
  const photoBtn = document.getElementById('photo-btn');
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const imagePreviews = document.getElementById('image-previews');

  // Optimized image handling
  function handleImageSelect(e) {
    const files = Array.from(e.target.files);

    if (attachedImages.length + files.length > MAX_IMAGES) {
      showToast('warning', 'Too Many Images', `You can only attach up to ${MAX_IMAGES} images at once.`);
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast('error', 'Invalid File', `${file.name} is not an image file.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        showToast('error', 'File Too Large', `${file.name} exceeds the 10MB size limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        attachedImages.push({
          file: file,
          dataUrl: e.target.result,
          name: file.name
        });
        updateImagePreviews();
      };
      reader.readAsDataURL(file);
    });

    fileInput.value = '';
  }

  function updateImagePreviews() {
    if (attachedImages.length === 0) {
      imagePreviewContainer.style.display = 'none';
      imagePreviews.innerHTML = '';
      return;
    }

    imagePreviewContainer.style.display = 'block';
    imagePreviews.innerHTML = attachedImages.map((img, index) => `
      <div class="image-preview-wrapper">
        <img src="${img.dataUrl}" alt="${img.name}" class="image-preview" onclick="openImageModal('${img.dataUrl}')">
        <button class="remove-image" onclick="removeImage(${index})" aria-label="Remove image">✕</button>
      </div>
    `).join('');
  }

  window.removeImage = function(index) {
    attachedImages.splice(index, 1);
    updateImagePreviews();
    showToast('info', 'Image Removed', 'Image has been removed from attachments.');
  };

  window.openImageModal = function(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = src;
  };

  window.closeImageModal = function() {
    document.getElementById('imageModal').style.display = 'none';
  };

  // Close modal when clicking outside
  window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
      closeImageModal();
    }
  };

  // Ultra-optimized advanced memory system
  let advancedMemory = {
    conversations: new Map(),
    globalTopics: new Map(),
    conversationTopics: new Map()
  };

  // Populate model selector
  function populateModelSelector() {
    modelSelect.innerHTML = '<option value="" disabled selected>Select a model</option>';
    openRouterModels.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      const modelName = model.id.replace(/^openrouter:/, '');
      option.textContent = modelName + (model.hasVision ? ' 👁️' : '');
      option.dataset.hasVision = model.hasVision;
      modelSelect.appendChild(option);
    });
  }

  // Conversation management with performance optimization
  let conversations = new Map();
  let currentConversationId = null;

  // Optimized topic extraction
  function extractTopicsFromText(text) {
    if (!text || typeof text !== 'string') return [];

    const topics = new Set();
    const lowerText = text.toLowerCase();

    const techKeywords = [
      'javascript', 'python', 'java', 'react', 'vue', 'angular', 'node', 'typescript',
      'html', 'css', 'sql', 'database', 'api', 'rest', 'graphql', 'git', 'docker',
      'kubernetes', 'aws', 'azure', 'programming', 'coding', 'development', 'software',
      'frontend', 'backend', 'fullstack', 'web', 'mobile', 'app', 'ai', 'machine learning',
      'image', 'photo', 'picture', 'vision', 'visual', 'analyze', 'detect', 'recognition'
    ];

    techKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        topics.add(keyword);
      }
    });

    const questionPatterns = ['how to', 'what is', 'why does', 'when should', 'where can', 'analyze this', 'look at'];
    questionPatterns.forEach(pattern => {
      if (lowerText.includes(pattern)) {
        const match = lowerText.match(new RegExp(pattern + ' ([a-z]+(?:\\s+[a-z]+){0,2})'));
        if (match && match[1]) {
          topics.add(match[1].trim());
        }
      }
    });

    return Array.from(topics).slice(0, 10);
  }

  function generateConversationTitle(firstMessage, hasImages = false) {
    if (!firstMessage || typeof firstMessage !== 'string') return hasImages ? 'Image Analysis' : 'New Conversation';

    const topics = extractTopicsFromText(firstMessage);
    if (topics.length > 0) {
      const prefix = hasImages ? '🖼️ ' : '';
      return prefix + topics.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
    }

    const prefix = hasImages ? '🖼️ ' : '';
    return prefix + (firstMessage.substring(0, 50).trim() + (firstMessage.length > 50 ? '...' : '') || 'New Conversation');
  }

  function updateAdvancedMemory(userMessage, aiResponse, convId, images = []) {
    if (!userMessage || !aiResponse || !convId) return;

    const userTopics = extractTopicsFromText(userMessage);
    const aiTopics = extractTopicsFromText(aiResponse);
    if (images.length > 0) {
      userTopics.push('image', 'visual');
    }
    const allTopics = [...new Set([...userTopics, ...aiTopics])];

    if (!advancedMemory.conversations.has(convId)) {
      advancedMemory.conversations.set(convId, {
        id: convId,
        title: generateConversationTitle(userMessage, images.length > 0),
        messages: [],
        topics: new Set(),
        createdAt: new Date().toISOString(),
        lastUpdated: Date.now(),
        hasImages: images.length > 0
      });
    }

    const conv = advancedMemory.conversations.get(convId);

    allTopics.forEach(topic => {
      conv.topics.add(topic);

      if (!advancedMemory.globalTopics.has(topic)) {
        advancedMemory.globalTopics.set(topic, new Set());
      }
      advancedMemory.globalTopics.get(topic).add(convId);
    });

    conv.messages.push({
      user: userMessage,
      ai: aiResponse,
      timestamp: Date.now(),
      topics: allTopics,
      images: images
    });

    conv.lastUpdated = Date.now();
    if (images.length > 0) conv.hasImages = true;

    advancedMemory.conversationTopics.set(convId, Array.from(conv.topics));

    cloudStorage.saveToCloud({
      conversations,
      advancedMemory,
      currentConversationId
    });
    updateMemoryDisplay();
  }

  function getFullConversationHistory(convId) {
    const conv = advancedMemory.conversations.get(convId);
    if (!conv) return [];

    return conv.messages.map(msg => [
      { role: 'user', content: msg.user },
      { role: 'assistant', content: msg.ai }
    ]).flat();
  }

  function buildContextualPrompt(userInput, convId, images = []) {
    const conv = advancedMemory.conversations.get(convId);
    const recentHistory = conv ? conv.messages.slice(-5) : [];

    let contextPrompt = '';

    if (images.length > 0 && (!userInput || userInput.trim() === '')) {
      contextPrompt = `[IMAGE ANALYSIS REQUEST] The user has attached ${images.length} image(s) for analysis.\n\n`;
      contextPrompt += 'Please analyze the attached image(s) and provide detailed insights.';
    } else if (images.length > 0) {
      contextPrompt = `[USER MESSAGE WITH ${images.length} IMAGE(S)]\n\n`;

      if (recentHistory.length > 0) {
        contextPrompt += `[CONVERSATION CONTEXT] This conversation has ${conv.messages.length} previous exchanges. Topics discussed: ${Array.from(conv.topics).join(', ')}.

Recent conversation history:
${recentHistory.map(msg => `User: ${msg.user}\nAssistant: ${msg.ai.substring(0, 200)}...`).join('\n\n')}

[CURRENT MESSAGE]: ${userInput}

Please respond to the user's message while considering the attached image(s) and the conversation history.`;
      } else {
        contextPrompt += userInput;
      }
    } else {
      if (recentHistory.length > 0) {
        contextPrompt += `[CONVERSATION MEMORY] This conversation has ${conv.messages.length} previous exchanges. Topics discussed: ${Array.from(conv.topics).join(', ')}.

Recent conversation history:
${recentHistory.map(msg => `User: ${msg.user}\nAssistant: ${msg.ai.substring(0, 200)}...`).join('\n\n')}

[CURRENT QUESTION]: ${userInput}

Please provide a detailed response that takes into account the entire conversation history.`;
      } else {
        contextPrompt = userInput;
      }
    }

    return contextPrompt;
  }

  async function loadAdvancedMemory() {
    try {
      const cloudData = await cloudStorage.loadFromCloud();

      if (cloudData && cloudData.advancedMemory) {
        const parsed = cloudData.advancedMemory;

        advancedMemory.conversations = new Map();
        if (parsed.conversations) {
          Object.entries(parsed.conversations).forEach(([id, conv]) => {
            advancedMemory.conversations.set(id, {
              ...conv,
              topics: new Set(conv.topics || []),
              messages: conv.messages || []
            });
          });
        }

        advancedMemory.globalTopics = new Map();
        if (parsed.globalTopics) {
          Object.entries(parsed.globalTopics).forEach(([topic, convIds]) => {
            advancedMemory.globalTopics.set(topic, new Set(convIds));
          });
        }

        advancedMemory.conversationTopics = new Map(parsed.conversationTopics || []);
      }
    } catch (e) {
      console.error('Error loading advanced memory:', e);
    }

    updateMemoryDisplay();
  }

  function updateMemoryDisplay() {
    const hasMemory = advancedMemory.conversations.size > 0;

    if (!hasMemory) {
      memoryPanel.style.display = 'none';
      return;
    }

    memoryPanel.style.display = 'block';
    memoryContent.innerHTML = '';

    const topicCounts = new Map();
    advancedMemory.globalTopics.forEach((convIds, topic) => {
      topicCounts.set(topic, convIds.size);
    });

    const sortedTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    if (sortedTopics.length > 0) {
      const topicsContainer = document.createElement('div');
      topicsContainer.innerHTML = '<div style="font-weight: 600; margin-bottom: 0.5rem;">Popular Topics:</div>';

      sortedTopics.forEach(([topic, count]) => {
        const tag = document.createElement('span');
        tag.className = 'topic-tag';
        tag.textContent = `${topic} (${count})`;
        tag.onclick = () => {
          userInput.value = `Tell me more about ${topic}`;
          userInput.focus();
        };
        topicsContainer.appendChild(tag);
      });

      memoryContent.appendChild(topicsContainer);
    }

    const recentConvs = Array.from(advancedMemory.conversations.values())
      .sort((a, b) => b.lastUpdated - a.lastUpdated)
      .slice(0, 3);

    if (recentConvs.length > 0) {
      recentConvs.forEach(conv => {
        const convDiv = document.createElement('div');
        convDiv.className = 'conversation-topic';
        convDiv.innerHTML = `
          <div class="conversation-title">${conv.title}</div>
          <div class="conversation-summary">${conv.messages.length} messages • ${Array.from(conv.topics).slice(0, 3).join(', ')}</div>
          <div class="conversation-date">${new Date(conv.createdAt).toLocaleDateString()}</div>
        `;
        convDiv.onclick = () => {
          currentConversationId = conv.id;
          conversationSelect.value = conv.id;
          renderMessages();
        };
        memoryContent.appendChild(convDiv);
      });
    }
  }

  async function clearAdvancedMemory() {
    showToast('warning', 'Clear Memory', 'This will permanently delete all conversation memory. Are you sure?', 5000);

    const confirmToast = document.createElement('div');
    confirmToast.className = 'toast warning show';
    confirmToast.innerHTML = `
      <div class="toast-icon">⚠</div>
      <div class="toast-content">
        <div class="toast-title">Confirm Clear Memory</div>
        <div class="toast-message">
          <div style="margin-bottom: 0.5rem;">This cannot be undone!</div>
          <button onclick="confirmClearMemory(this)" style="background: #dc2626; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-right: 0.5rem; cursor: pointer;">Clear All</button>
          <button onclick="this.closest('.toast').remove()" style="background: #6b7280; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: pointer;">Cancel</button>
        </div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    document.getElementById('toast-container').appendChild(confirmToast);
  }

  window.confirmClearMemory = async function(button) {
    advancedMemory = {
      conversations: new Map(),
      globalTopics: new Map(),
      conversationTopics: new Map()
    };

    await cloudStorage.clearAllData();
    await cloudStorage.saveToCloud({
      conversations,
      advancedMemory,
      currentConversationId
    });
    updateMemoryDisplay();

    button.closest('.toast').remove();
    showToast('success', 'Memory Cleared', 'All conversation memory has been successfully cleared.');
    appendMessage('🧠 Advanced memory has been cleared.', 'ai', false, false);
  };

  // Optimized conversation management
  async function loadConversations() {
    try {
      const cloudData = await cloudStorage.loadFromCloud();

      if (cloudData) {
        if (cloudData.conversations) {
          conversations = new Map(Object.entries(cloudData.conversations));
        }

        if (cloudData.currentConversationId) {
          currentConversationId = cloudData.currentConversationId;
        }
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
    }

    if (conversations.size === 0) {
      createNewConversation();
    } else {
      if (!currentConversationId) {
        currentConversationId = Array.from(conversations.keys())[0];
      }
      updateConversationSelect();
      renderMessages();
    }

    await loadAdvancedMemory();
  }

  async function createNewConversation() {
    const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    conversations.set(id, []);
    currentConversationId = id;
    updateConversationSelect();
    renderMessages();
    appendMessage('👋 Welcome to a new conversation! I can analyze images and remember all our previous chats. What would you like to discuss?', 'ai', false, false);
    await cloudStorage.saveToCloud({
      conversations,
      advancedMemory,
      currentConversationId
    });
    showToast('success', 'New Conversation', 'Started a new conversation with full memory context.');
  }

  async function deleteConversation() {
    if (!currentConversationId || conversations.size <= 1) {
      showToast('warning', 'Cannot Delete', 'Cannot delete the last conversation.');
      return;
    }

    const conv = advancedMemory.conversations.get(currentConversationId);
    const title = conv ? conv.title : 'this conversation';

    const confirmToast = document.createElement('div');
    confirmToast.className = 'toast error show';
    confirmToast.innerHTML = `
      <div class="toast-icon">🗑️</div>
      <div class="toast-content">
        <div class="toast-title">Delete Conversation</div>
        <div class="toast-message">
          <div style="margin-bottom: 0.5rem;">Delete "${title}"?</div>
          <button onclick="confirmDeleteConversation(this)" style="background: #dc2626; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-right: 0.5rem; cursor: pointer;">Delete</button>
          <button onclick="this.closest('.toast').remove()" style="background: #6b7280; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: pointer;">Cancel</button>
        </div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    document.getElementById('toast-container').appendChild(confirmToast);
  }

  window.confirmDeleteConversation = async function(button) {
    const conv = advancedMemory.conversations.get(currentConversationId);
    const title = conv ? conv.title : 'Conversation';

    advancedMemory.conversations.delete(currentConversationId);
    conversations.delete(currentConversationId);
    currentConversationId = Array.from(conversations.keys())[0];
    updateConversationSelect();
    renderMessages();
    await cloudStorage.saveToCloud({
      conversations,
      advancedMemory,
      currentConversationId
    });
    updateMemoryDisplay();
    button.closest('.toast').remove();
    showToast('success', 'Conversation Deleted', `"${title}" has been successfully deleted.`);
  };

  function updateConversationSelect() {
    conversationSelect.innerHTML = '';
    Array.from(conversations.keys()).forEach(id => {
      const option = document.createElement('option');
      option.value = id;
      const conv = advancedMemory.conversations.get(id);
      const title = conv
          ? conv.title.substring(0, 30) + (conv.title.length > 30 ? '...' : '')
        : `Conversation ${id.slice(-4)}`;
      option.textContent = title;
      conversationSelect.appendChild(option);
    });
    conversationSelect.value = currentConversationId;
    deleteConversationBtn.disabled = conversations.size <= 1;
  }

  function renderMessages() {
    chatContainer.innerHTML = '';
    const messages = conversations.get(currentConversationId) || [];
           
    let messageIndex = 0;
           
    function renderNextMessage() {
      if (messageIndex < messages.length) {
        const msg = messages[messageIndex];
        if (msg.images && msg.images.length > 0 && msg.role === 'user') {
          appendMessage(msg.content, msg.role, false, msg.role === 'user', msg.images);
        } else {
          appendMessage(msg.content, msg.role, false, msg.role === 'user');
        }
        messageIndex++;
        requestAnimationFrame(renderNextMessage);
      } else {
        requestAnimationFrame(() => scrollToBottom());
      }
    }
           
    renderNextMessage();
  }

  function formatTimestamp() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function detectLanguage(code) {
    const langPatterns = [
      { pattern: /(?:import|export|function|const|let|var|=>|\{|\})/g, lang: 'javascript' },
      { pattern: /(?:def\s|import\s|from\s|class\s|if\s.*:|for\s.*:|while\s.*:)/g, lang: 'python' },
      { pattern: /(?:public\s|private\s|protected\s|class\s|interface\s|import\s|package\s)/g, lang: 'java' },
      { pattern: /(?:#include|int\s|char\s|float\s|double\s|void\s|struct\s)/g, lang: 'cpp' },
      { pattern: /(?:SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP)/gi, lang: 'sql' },
      { pattern: /(?:<html|<head|<body|<div|<span|<p>)/gi, lang: 'html' },
      { pattern: /(?:\.|\#)[a-zA-Z][a-zA-Z0-9-]*\s*\{|@media|@import/g, lang: 'css' },
      { pattern: /(?:\$[a-zA-Z_][a-zA-Z0-9_]*|<\?php|\?>|echo\s|print\s)/g, lang: 'php' }
    ];

    for (const { pattern, lang } of langPatterns) {
      if (pattern.test(code)) return lang;
    }

    return 'text';
  }

  function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.classList.add('copied');
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
      }, 2000);
      showToast('success', 'Copied', 'Text copied to clipboard successfully.');
    }).catch(err => {
      console.error('Failed to copy:', err);
      button.textContent = 'Failed!';
      setTimeout(() => button.textContent = 'Copy', 2000);
      showToast('error', 'Copy Failed', 'Failed to copy text to clipboard.');
    });
  }

  function parseMessageContent(text) {
    const container = document.createElement('div');
    container.className = 'message-content';
    const parts = text.split(/(```[\s\S]*?```)/g);

    parts.forEach(part => {
      if (part.match(/^```[\s\S]*```$/)) {
        const codeMatch = part.match(/^```(\w*)\n?([\s\S]*?)\n?```$/);
        const language = codeMatch?.[1] || 'text';
        const code = codeMatch?.[2] || part.replace(/^```|```$/g, '');

        const codeBlock = document.createElement('div');
        codeBlock.className = 'code-block';

        const header = document.createElement('div');
        header.className = 'code-block-header';
        header.innerHTML = `<span>${language || 'Code'}</span>`;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy Code';
        copyBtn.onclick = (e) => {
          e.stopPropagation();
          copyToClipboard(code, copyBtn);
        };
        header.appendChild(copyBtn);

        const pre = document.createElement('pre');
        const codeElement = document.createElement('code');
        codeElement.textContent = code;

        if (language && hljs.getLanguage(language)) {
          codeElement.className = `language-${language}`;
          hljs.highlightElement(codeElement);
        } else {
          const detectedLang = detectLanguage(code);
          if (detectedLang !== 'text' && hljs.getLanguage(detectedLang)) {
            codeElement.className = `language-${detectedLang}`;
            hljs.highlightElement(codeElement);
          }
        }

        pre.appendChild(codeElement);
        codeBlock.appendChild(header);
        codeBlock.appendChild(pre);
        container.appendChild(codeBlock);
      } else {
        const inlineParts = part.split(/(`[^`]+`)/g);
        inlineParts.forEach(inlinePart => {
          if (inlinePart.match(/^`[^`]+`$/)) {
            const code = inlinePart.slice(1, -1);
            const inlineCode = document.createElement('span');
            inlineCode.className = 'inline-code';
            inlineCode.textContent = code;
                         
            const smallCopyBtn = document.createElement('button');
            smallCopyBtn.className = 'copy-btn-small';
            smallCopyBtn.innerHTML = '📋';
            smallCopyBtn.title = 'Copy inline code';
            smallCopyBtn.onclick = (e) => {
              e.stopPropagation();
              copyToClipboard(code, smallCopyBtn);
            };
                         
            inlineCode.appendChild(smallCopyBtn);
            container.appendChild(inlineCode);
          } else if (inlinePart) {
            container.appendChild(document.createTextNode(inlinePart));
          }
        });
      }
    });

    return container;
  }

  function appendMessage(text, className, isTyping = false, showTimestamp = true, images = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}${isTyping ? ' typing-indicator' : ''}`;
    msgDiv.style.transform = 'translateY(20px)';
    msgDiv.style.opacity = '0';

    if (!isTyping) {
      if (images && images.length > 0 && className === 'user') {
        const imageContainer = document.createElement('div');
        imageContainer.style.marginBottom = '0.5rem';

        images.forEach(img => {
          const imgElement = document.createElement('img');
          imgElement.src = img.dataUrl;
          imgElement.alt = img.name || 'Attached image';
          imgElement.className = 'message-image';
          imgElement.onclick = () => openImageModal(img.dataUrl);
          imageContainer.appendChild(imgElement);
        });

        msgDiv.appendChild(imageContainer);
      }

      const contentDiv = parseMessageContent(text);
      if (className === 'ai') {
        const fullCopyBtn = document.createElement('button');
        fullCopyBtn.className = 'copy-btn-inline';
        fullCopyBtn.textContent = 'Copy All';
        fullCopyBtn.onclick = (e) => {
          e.stopPropagation();
          copyToClipboard(text, fullCopyBtn);
        };
        contentDiv.appendChild(fullCopyBtn);
      }
      msgDiv.appendChild(contentDiv);

      if (showTimestamp && className === 'user') {
        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = formatTimestamp();
        msgDiv.appendChild(timestamp);
      }
    }

    chatContainer.appendChild(msgDiv);
           
    requestAnimationFrame(() => {
      msgDiv.style.transform = 'translateY(0)';
      msgDiv.style.opacity = '1';
      msgDiv.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      scrollToBottom();
    });
           
    return msgDiv;
  }

  function updateMessageContent(msgDiv, text) {
    const contentDiv = msgDiv.querySelector('.message-content') || document.createElement('div');
    contentDiv.className = 'message-content';
    msgDiv.innerHTML = '';
    const newContent = parseMessageContent(text);

    const fullCopyBtn = document.createElement('button');
    fullCopyBtn.className = 'copy-btn-inline';
    fullCopyBtn.textContent = 'Copy All';
    fullCopyBtn.onclick = (e) => {
      e.stopPropagation();
      copyToClipboard(text, fullCopyBtn);
    };

    newContent.appendChild(fullCopyBtn);
    msgDiv.appendChild(newContent);
           
    requestAnimationFrame(() => scrollToBottom());
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
      });
    });
  }

  // Ultra-optimized AI response streaming
  window.streamAIResponse = async function(prompt, images = []) {
    try {
      if (!prompt && images.length === 0) throw new Error('Please provide a message or attach images');
      if (!currentConversationId) throw new Error('No conversation selected');
      if (!modelSelect.value) throw new Error('No model selected');

      const selectedOption = modelSelect.options[modelSelect.selectedIndex];
      const hasVision = selectedOption.dataset.hasVision === 'true';

      if (images.length > 0 && !hasVision) {
        throw new Error('Selected model does not support image analysis. Please choose a model with 👁️ icon.');
      }

      userInput.disabled = true;
      sendBtn.disabled = true;
      photoBtn.disabled = true;

      const contextualPrompt = buildContextualPrompt(prompt, currentConversationId, images);
      const displayMessage = prompt || (images.length > 0 ? 'Analyze these images' : '');

      const userMessage = {
        role: 'user',
        content: displayMessage,
        timestamp: formatTimestamp(),
        images: images.map(img => ({ dataUrl: img.dataUrl, name: img.name }))
      };
      const currentMessages = conversations.get(currentConversationId) || [];
      currentMessages.push(userMessage);
      conversations.set(currentConversationId, currentMessages);
      appendMessage(displayMessage, 'user', false, true, images);
      await cloudStorage.saveToCloud({
        conversations,
        advancedMemory,
        currentConversationId
      });

      attachedImages = [];
      updateImagePreviews();

      const typingDiv = appendMessage('', 'ai', true, false);
      const selectedModel = modelSelect.value;

      const messages = [];

      const fullHistory = getFullConversationHistory(currentConversationId);
      fullHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      });

      if (images.length > 0) {
        const imageContents = images.map(img => ({
          type: 'image_url',
          image_url: {
            url: img.dataUrl
          }
        }));

        messages.push({
          role: 'user',
          content: [
            {
              type: 'text',
              text: contextualPrompt
            },
            ...imageContents
          ]
        });
      } else {
        messages.push({
          role: 'user',
          content: contextualPrompt
        });
      }

      const response = await puter.ai.chat(messages, {
        model: selectedModel,
        stream: true
      });

      typingDiv.remove();

      const aiMsgDiv = document.createElement('div');
      aiMsgDiv.className = 'message ai';
      aiMsgDiv.style.transform = 'translateY(20px)';
      aiMsgDiv.style.opacity = '0';
      chatContainer.appendChild(aiMsgDiv);
            
      requestAnimationFrame(() => {
        aiMsgDiv.style.transform = 'translateY(0)';
        aiMsgDiv.style.opacity = '1';
        aiMsgDiv.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      });
            
      let fullResponse = '';

      for await (const part of response) {
        if (part?.text) {
          fullResponse += part.text;
          updateMessageContent(aiMsgDiv, fullResponse);
        }
      }

      const aiMessage = { role: 'ai', content: fullResponse, timestamp: formatTimestamp() };
      currentMessages.push(aiMessage);
      conversations.set(currentConversationId, currentMessages);

      updateAdvancedMemory(displayMessage, fullResponse, currentConversationId, images);

      await cloudStorage.saveToCloud({
        conversations,
        advancedMemory,
        currentConversationId
      });
      updateConversationSelect();
    } catch (error) {
      console.error('Error:', error);

      const typingIndicators = document.querySelectorAll('.typing-indicator');
      typingIndicators.forEach(indicator => indicator.remove());

      const errorMsg = error.message || 'Something went wrong. Please try again.';
      appendMessage(`Error: ${errorMsg}`, 'ai', false, false);
      showToast('error', 'AI Error', errorMsg);
    } finally {
      userInput.disabled = false;
      sendBtn.disabled = false;
      photoBtn.disabled = false;
      userInput.focus();
    }
  };

  function handleSend() {
    const text = userInput.value.trim();
    if (text || attachedImages.length > 0) {
      const imagesToSend = [...attachedImages];
      streamAIResponse(text, imagesToSend);
      userInput.value = '';
    }
  }

  // Event listeners with performance optimization
  sendBtn.onclick = handleSend;
  userInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !sendBtn.disabled) handleSend();
  });

  photoBtn.onclick = () => fileInput.click();
  fileInput.addEventListener('change', handleImageSelect);

  newConversationBtn.onclick = createNewConversation;
  deleteConversationBtn.onclick = deleteConversation;
  clearMemoryBtn.onclick = clearAdvancedMemory;
  conversationSelect.onchange = () => {
    currentConversationId = conversationSelect.value;
    renderMessages();
  };

  // Enhanced cleanup with performance monitoring
  window.addEventListener('beforeunload', () => {
    if (cloudStorage) {
      cloudStorage.destroy();
    }
  });

  // Expose to global window for key system access
  window.conversations = conversations;
  window.advancedMemory = advancedMemory;
  window.currentConversationId = currentConversationId;
  window.showToast = showToast;
  window.cloudStorage = cloudStorage;
  window.appendMessage = appendMessage;

  // FIXED: Initialize all systems with performance tracking
  const initStartTime = performance.now();
  
  populateModelSelector();
  loadConversations().then(() => {
    userInput.focus();
    const initEndTime = performance.now();
    console.log(`FIXED: Complete initialization time: ${(initEndTime - initStartTime).toFixed(2)}ms`);
    console.log('FIXED: Ultra-persistent UID system active - authentication will NEVER reset unless browser data explicitly cleared');
    console.log('FIXED: Enhanced IndexedDB + localStorage redundancy ensures maximum persistence');
    console.log('FIXED: Real-time monitoring provides instant blocking with zero latency');
  });
}

// FIXED: Start ultra-optimized initialization
initializeApp();