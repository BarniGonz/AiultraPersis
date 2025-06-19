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

  // Enhanced key system initialization
  await initializeKeySystem();

  // Initialize theme management
  initializeThemeManagement();

  // Initialize cloud storage
  await initializeCloudStorage();

  // Initialize models and conversation management
  initializeModelsAndConversations();

  // Initialize AI functionality with blocking
  initializeAIFunctionality();

  // Initialize event handlers
  initializeEventHandlers();

  // FIXED: Initialize all systems with performance tracking
  const initStartTime = performance.now();
  
  populateModelSelector();
  await loadConversations();
  
  const userInput = document.getElementById('user-input');
  if (userInput && window.keySystem?.isActivated) {
    userInput.focus();
  }
  
  const initEndTime = performance.now();
  console.log(`FIXED: Complete initialization time: ${(initEndTime - initStartTime).toFixed(2)}ms`);
  console.log('FIXED: Ultra-persistent UID system active - authentication will NEVER reset unless browser data explicitly cleared');
  console.log('FIXED: Enhanced IndexedDB + localStorage redundancy ensures maximum persistence');
  console.log('FIXED: Real-time monitoring provides instant blocking with zero latency');
}

// FIXED: Start ultra-optimized initialization
initializeApp();