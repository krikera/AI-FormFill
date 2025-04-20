// Initialize options and theme functionality
document.addEventListener('DOMContentLoaded', function () {
  // Initialize settings
  loadSettings();

  // Theme toggle functionality
  initThemeToggle();

  // Save settings when changed
  document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('change', saveSettings);
  });

  // Save button functionality
  document.getElementById('saveButton').addEventListener('click', function () {
    saveSettings();
    showStatus('Settings saved!');
  });

  // Reset button functionality
  document.getElementById('resetButton').addEventListener('click', function () {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      resetSettings();
      showStatus('Settings reset to default!');
    }
  });

  // Get UI elements
  const autoFillEnabled = document.getElementById('autoFillEnabled');
  const askBeforeFill = document.getElementById('askBeforeFill');
  const showContextMenu = document.getElementById('showContextMenu');
  const defaultLocale = document.getElementById('defaultLocale');
  const enableAIDetection = document.getElementById('enableAIDetection');
  const securityLevel = document.getElementById('securityLevel');
  const exportDataButton = document.getElementById('exportData');
  const importDataButton = document.getElementById('importData');
  const clearDataButton = document.getElementById('clearData');
  const saveSettingsButton = document.getElementById('saveSettings');
  const statusElement = document.getElementById('status');

  // Data management buttons
  exportDataButton.addEventListener('click', exportData);
  importDataButton.addEventListener('click', importData);
  clearDataButton.addEventListener('click', clearData);

  // Save settings when save button is clicked
  saveSettingsButton.addEventListener('click', saveSettings);
});

// Initialize theme toggle
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');

  // Get theme preference
  chrome.storage.local.get(['theme'], function (data) {
    const currentTheme = data.theme || 'light';

    // Apply theme
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Set toggle state
    themeToggle.checked = (currentTheme === 'dark');

    // Listen for changes
    themeToggle.addEventListener('change', function () {
      const newTheme = this.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);

      // Save to chrome.storage
      chrome.storage.local.set({ theme: newTheme }, function () {
        // Notify all content scripts about theme change
        chrome.tabs.query({}, function (tabs) {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              action: 'themeChanged',
              theme: newTheme
            }).catch(() => {
              // Ignore errors for tabs where content script isn't loaded
            });
          });
        });
      });
    });
  });
}

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(null, function (data) {
    // Auto-fill settings
    document.getElementById('autoFillEnabled').checked = data.autoFill !== false;
    document.getElementById('askBeforeFill').checked = data.askBeforeFill !== false;
    document.getElementById('showContextMenu').checked = data.showContextMenu !== false;

    // AI settings
    document.getElementById('enableAIDetection').checked = data.enableAIDetection !== false;

    // Locale and security
    if (data.defaultLocale) {
      document.getElementById('defaultLocale').value = data.defaultLocale;
    }
    if (data.securityLevel) {
      document.getElementById('securityLevel').value = data.securityLevel;
    }

    // Password generator settings
    if (data.defaultPasswordLength) {
      document.getElementById('default-password-length').value = data.defaultPasswordLength;
    }

    if (data.defaultPasswordOptions) {
      document.getElementById('default-uppercase').checked = data.defaultPasswordOptions.uppercase !== false;
      document.getElementById('default-lowercase').checked = data.defaultPasswordOptions.lowercase !== false;
      document.getElementById('default-numbers').checked = data.defaultPasswordOptions.numbers !== false;
      document.getElementById('default-symbols').checked = data.defaultPasswordOptions.symbols !== false;
    }

    document.getElementById('password-context-menu').checked = data.passwordContextMenu !== false;
  });
}

// Save settings to storage
function saveSettings() {
  const settings = {
    autoFill: document.getElementById('autoFillEnabled').checked,
    askBeforeFill: document.getElementById('askBeforeFill').checked,
    showContextMenu: document.getElementById('showContextMenu').checked,
    enableAIDetection: document.getElementById('enableAIDetection').checked,
    defaultLocale: document.getElementById('defaultLocale').value,
    securityLevel: document.getElementById('securityLevel').value,

    // Password generator settings
    defaultPasswordLength: document.getElementById('default-password-length').value,
    defaultPasswordOptions: {
      uppercase: document.getElementById('default-uppercase').checked,
      lowercase: document.getElementById('default-lowercase').checked,
      numbers: document.getElementById('default-numbers').checked,
      symbols: document.getElementById('default-symbols').checked
    },
    passwordContextMenu: document.getElementById('password-context-menu').checked
  };

  chrome.storage.sync.set(settings);
}

// Reset settings to default
function resetSettings() {
  const defaultSettings = {
    autoFill: true,
    askBeforeFill: true,
    showContextMenu: true,
    enableAIDetection: true,
    defaultLocale: 'en',
    securityLevel: 'medium',

    // Password generator default settings
    defaultPasswordLength: '16',
    defaultPasswordOptions: {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true
    },
    passwordContextMenu: true
  };

  chrome.storage.sync.set(defaultSettings, function () {
    loadSettings();
  });
}

// Show status message
function showStatus(message) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.classList.add('show');

  setTimeout(function () {
    status.classList.remove('show');
  }, 2000);
}

// Export all data
function exportData() {
  chrome.storage.local.get(null, (data) => {
    // Create a download link for the JSON data
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-formfill-backup.json';
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 100);
  });
}

// Import data
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';

  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);

          // Validate the imported data
          if (!importedData.settings) {
            throw new Error('Invalid data format: missing settings');
          }

          // Import data to storage
          chrome.storage.local.set(importedData, () => {
            alert('Data imported successfully. Settings will be applied after reloading the page.');
            // Reload settings
            loadSettings();
          });
        } catch (error) {
          alert('Error importing data: ' + error.message);
        }
      };

      reader.readAsText(file);
    }
  };

  input.click();
}

// Clear all data
function clearData() {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    chrome.storage.local.clear(() => {
      alert('All data has been cleared. Default settings will be applied after reloading the page.');
      // Reload the page to restore default settings
      window.location.reload();
    });
  }
} 