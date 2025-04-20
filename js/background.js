// Initialize the extension when installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI FormFill extension installed');

  // Initialize storage with default settings
  chrome.storage.sync.get(['autoFill', 'profiles', 'passwordContextMenu'], function (data) {
    if (!data.autoFill) {
      chrome.storage.sync.set({
        autoFill: true,
        profiles: [],
        passwordContextMenu: true
      });
    }
  });

  // Set default theme to light
  chrome.storage.local.get(['theme'], function (data) {
    if (!data.theme) {
      chrome.storage.local.set({ theme: 'light' });
    }
  });
});

// Create context menu items
function createContextMenuItems() {
  chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: 'ai-formfill',
    title: 'AI FormFill',
    contexts: ['page', 'editable']
  });

  chrome.contextMenus.create({
    id: 'auto-fill',
    parentId: 'ai-formfill',
    title: 'Auto-fill form',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'generate-fake-data',
    parentId: 'ai-formfill',
    title: 'Generate fake data',
    contexts: ['editable']
  });

  chrome.contextMenus.create({
    id: 'generate-password',
    parentId: 'ai-formfill',
    title: 'Generate password',
    contexts: ['editable']
  });
}

// Initialize context menu
createContextMenuItems();

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'auto-fill') {
    chrome.tabs.sendMessage(tab.id, { action: 'fillForm' });
  } else if (info.menuItemId === 'generate-fake-data') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'fillWithFakeData',
      dataType: 'all',
      data: generateFakeData()
    });
  } else if (info.menuItemId === 'generate-password') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'fillPassword',
      password: generatePassword()
    });
  }
});

// Generate fake data
function generateFakeData() {
  return {
    name: faker.name.findName(),
    email: faker.internet.email(),
    phone: faker.phone.phoneNumber(),
    address: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.state(),
    postalCode: faker.address.zipCode(),
    country: faker.address.country(),
    company: faker.company.companyName(),
    url: faker.internet.url()
  };
}

// Generate password based on settings
function generatePassword() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['defaultPasswordLength', 'defaultPasswordOptions'], function (data) {
      const length = data.defaultPasswordLength || 12;
      const options = data.defaultPasswordOptions || {
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
      };

      let charset = '';
      if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (options.numbers) charset += '0123456789';
      if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (!charset) charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

      let password = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }

      resolve(password);
    });
  });
}

// Update context menu when settings change
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.passwordContextMenu) {
    createContextMenuItems();
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.local.get('settings', (result) => {
      sendResponse({ settings: result.settings });
    });
    return true; // Keep the message channel open for async response
  } else if (request.action === 'updateSettings') {
    chrome.storage.local.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  } else if (request.action === 'getTheme') {
    chrome.storage.local.get(['theme'], function (data) {
      sendResponse({ theme: data.theme || 'light' });
    });
    return true; // Required for async sendResponse
  }
});

// Clean up context menu items when extension is unloaded
chrome.runtime.onSuspend.addListener(() => {
  chrome.contextMenus.removeAll();
}); 