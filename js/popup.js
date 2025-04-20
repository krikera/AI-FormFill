// Load saved settings
async function loadSettings() {
  try {
    const data = await chrome.storage.sync.get([
      'autoFill',
      'profiles',
      'defaultPasswordLength',
      'defaultPasswordOptions',
      'theme'
    ]);

    // Set auto-fill toggle
    const autoFillToggle = document.getElementById('auto-fill-toggle');
    if (autoFillToggle) {
      autoFillToggle.checked = data.autoFill !== false;
    }

    // Set theme
    if (data.theme) {
      document.documentElement.setAttribute('data-theme', data.theme);
    }

    // Set password generator settings
    if (data.defaultPasswordLength) {
      const lengthSlider = document.getElementById('password-length');
      if (lengthSlider) {
        lengthSlider.value = data.defaultPasswordLength;
        document.getElementById('length-value').textContent = data.defaultPasswordLength;
      }
    }

    if (data.defaultPasswordOptions) {
      const options = data.defaultPasswordOptions;
      const checkboxes = {
        'uppercase': document.getElementById('uppercase'),
        'lowercase': document.getElementById('lowercase'),
        'numbers': document.getElementById('numbers'),
        'symbols': document.getElementById('symbols')
      };

      Object.entries(checkboxes).forEach(([key, element]) => {
        if (element) {
          element.checked = options[key];
        }
      });
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    showError('Failed to load settings');
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async function () {
  try {
    // Load saved settings
    await loadSettings();

    // Check system theme preference if no theme is saved
    chrome.storage.local.get(['theme'], function (data) {
      if (!data.theme && window.matchMedia) {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = isDarkMode ? 'dark' : 'light';
        chrome.storage.local.set({ theme: theme }, function () {
          document.documentElement.setAttribute('data-theme', theme);
          themeToggle.checked = (theme === 'dark');
        });
      }
    });

    // Initialize password generator
    initPasswordGenerator();

    // Initialize fake data generator
    initFakeDataGenerator();

    // Initialize form detection
    initFormDetection();

    // Initialize theme
    initTheme();
  } catch (error) {
    console.error('Error initializing popup:', error);
    showError('Failed to initialize popup. Please try again.');
  }
});

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;

  const container = document.querySelector('.container');
  container.insertBefore(errorDiv, container.firstChild);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Tab navigation
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.getAttribute('data-tab');

    // Update active tab button
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update active tab content
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === tabName) {
        content.classList.add('active');
      }
    });
  });
});

// Auto Fill tab
const fillFormButton = document.getElementById('fill-form');
const detectFieldsButton = document.getElementById('detect-fields');
const detectedFieldsDiv = document.getElementById('detected-fields');

fillFormButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'fillForm' });
  });
});

detectFieldsButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'detectFields' }, (response) => {
      if (response && response.fields) {
        displayDetectedFields(response.fields);
      }
    });
  });
});

function displayDetectedFields(fields) {
  detectedFieldsDiv.innerHTML = '';

  if (fields.length === 0) {
    detectedFieldsDiv.textContent = 'No form fields detected on this page.';
    return;
  }

  const fieldList = document.createElement('ul');
  fields.forEach(field => {
    const item = document.createElement('li');
    item.textContent = `${field.type}: ${field.name || '(unnamed)'}`;
    fieldList.appendChild(item);
  });

  detectedFieldsDiv.appendChild(fieldList);
}

// Get faker library instance from the global variable
const fakerInstance = window.faker;

// Fake Data tab
const generateDataButton = document.getElementById('generate-data');
const dataTypeSelect = document.getElementById('data-type');
const dataLocaleSelect = document.getElementById('data-locale');
const generatedDataDiv = document.getElementById('generated-data');
const copyDataButton = document.getElementById('copy-data');
const fillWithFakeButton = document.getElementById('fill-with-fake');

generateDataButton.addEventListener('click', () => {
  const dataType = dataTypeSelect.value;
  const locale = dataLocaleSelect.value;

  try {
    // Check if faker is available
    if (!fakerInstance) {
      throw new Error('Faker library not available. Please check your internet connection.');
    }

    // Use Faker.js to generate fake data
    fakerInstance.setLocale(locale);
    let generatedValue = '';

    switch (dataType) {
      case 'name':
        generatedValue = fakerInstance.name.fullName();
        break;
      case 'email':
        generatedValue = fakerInstance.internet.email();
        break;
      case 'phone':
        generatedValue = fakerInstance.phone.number();
        break;
      case 'address':
        generatedValue = `${fakerInstance.location.streetAddress()}
${fakerInstance.location.city()}, ${fakerInstance.location.state()} ${fakerInstance.location.zipCode()}
${fakerInstance.location.country()}`;
        break;
      case 'creditcard':
        generatedValue = `${fakerInstance.finance.creditCardNumber()}
Exp: ${fakerInstance.date.future().getMonth() + 1}/${fakerInstance.date.future().getFullYear()}
CVV: ${fakerInstance.finance.creditCardCVV()}`;
        break;
    }

    generatedDataDiv.textContent = generatedValue;
  } catch (error) {
    generatedDataDiv.textContent = 'Error generating fake data: ' + error.message;
    console.error('Faker.js error:', error);
  }
});

copyDataButton.addEventListener('click', () => {
  const textToCopy = generatedDataDiv.textContent;
  navigator.clipboard.writeText(textToCopy).then(() => {
    // Show a brief "Copied!" message
    const originalText = copyDataButton.textContent;
    copyDataButton.textContent = 'Copied!';
    setTimeout(() => {
      copyDataButton.textContent = originalText;
    }, 1500);
  });
});

fillWithFakeButton.addEventListener('click', () => {
  const fakeData = generatedDataDiv.textContent;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'fillWithFakeData',
      dataType: dataTypeSelect.value,
      data: fakeData
    });
  });
});

// Saved Data tab
const profileSelect = document.getElementById('profile-select');
const newProfileButton = document.getElementById('new-profile');
const deleteProfileButton = document.getElementById('delete-profile');
const profileDataDiv = document.getElementById('profile-data');
const saveProfileButton = document.getElementById('save-profile');
const exportDataButton = document.getElementById('export-data');
const importDataButton = document.getElementById('import-data');

// Load profiles from storage
function loadProfiles() {
  chrome.storage.local.get('profiles', (result) => {
    const profiles = result.profiles || {};

    // Clear existing options
    while (profileSelect.options.length > 1) {
      profileSelect.remove(1);
    }

    // Add profile options
    for (const profileName in profiles) {
      const option = document.createElement('option');
      option.value = profileName;
      option.textContent = profileName;
      profileSelect.appendChild(option);
    }
  });
}

// Load profiles when popup opens
loadProfiles();

profileSelect.addEventListener('change', () => {
  const selectedProfile = profileSelect.value;
  if (!selectedProfile) {
    profileDataDiv.innerHTML = '';
    return;
  }

  chrome.storage.local.get('profiles', (result) => {
    const profiles = result.profiles || {};
    const profileData = profiles[selectedProfile];

    if (profileData) {
      // Decrypt the data
      try {
        const decrypted = decryptData(profileData.encryptedData, profileData.salt);
        displayProfileData(JSON.parse(decrypted));
      } catch (error) {
        profileDataDiv.textContent = 'Error decrypting profile data: ' + error.message;
      }
    }
  });
});

function displayProfileData(data) {
  profileDataDiv.innerHTML = '';

  const table = document.createElement('table');
  table.style.width = '100%';

  for (const field in data) {
    const row = document.createElement('tr');

    const keyCell = document.createElement('td');
    keyCell.textContent = field;
    keyCell.style.fontWeight = 'bold';

    const valueCell = document.createElement('td');
    valueCell.textContent = data[field];

    row.appendChild(keyCell);
    row.appendChild(valueCell);
    table.appendChild(row);
  }

  profileDataDiv.appendChild(table);
}

newProfileButton.addEventListener('click', () => {
  const profileName = prompt('Enter a name for the new profile:');
  if (profileName) {
    chrome.storage.local.get('profiles', (result) => {
      const profiles = result.profiles || {};

      // Create a new empty profile
      const newProfile = {
        name: profileName,
        salt: generateSalt(),
        encryptedData: encryptData('{}', profiles.salt)
      };

      profiles[profileName] = newProfile;

      chrome.storage.local.set({ profiles }, () => {
        loadProfiles();
        profileSelect.value = profileName;
        profileDataDiv.innerHTML = '<p>New profile created. Fill out form fields and save data to populate this profile.</p>';
      });
    });
  }
});

deleteProfileButton.addEventListener('click', () => {
  const selectedProfile = profileSelect.value;
  if (!selectedProfile) {
    return;
  }

  if (confirm(`Are you sure you want to delete the profile "${selectedProfile}"?`)) {
    chrome.storage.local.get('profiles', (result) => {
      const profiles = result.profiles || {};

      delete profiles[selectedProfile];

      chrome.storage.local.set({ profiles }, () => {
        loadProfiles();
        profileDataDiv.innerHTML = '';
      });
    });
  }
});

saveProfileButton.addEventListener('click', () => {
  const selectedProfile = profileSelect.value;
  if (!selectedProfile) {
    alert('Please select or create a profile first.');
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'captureFormData' }, (response) => {
      if (response && response.formData) {
        chrome.storage.local.get('profiles', (result) => {
          const profiles = result.profiles || {};
          const profile = profiles[selectedProfile];

          if (profile) {
            // Encrypt the form data
            const formDataStr = JSON.stringify(response.formData);
            profile.encryptedData = encryptData(formDataStr, profile.salt);

            chrome.storage.local.set({ profiles }, () => {
              alert('Form data saved to profile.');
              displayProfileData(response.formData);
            });
          }
        });
      } else {
        alert('No form data detected on the current page.');
      }
    });
  });
});

exportDataButton.addEventListener('click', () => {
  chrome.storage.local.get('profiles', (result) => {
    const profiles = result.profiles || {};

    // Create a download link for the JSON data
    const dataStr = JSON.stringify(profiles, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-formfill-profiles.json';
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 100);
  });
});

importDataButton.addEventListener('click', () => {
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

          chrome.storage.local.set({ profiles: importedData }, () => {
            alert('Profiles imported successfully.');
            loadProfiles();
          });
        } catch (error) {
          alert('Error importing profiles: ' + error.message);
        }
      };

      reader.readAsText(file);
    }
  };

  input.click();
});

// Options page
const openOptionsButton = document.getElementById('open-options');

openOptionsButton.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Encryption/Decryption utilities
function generateSalt() {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
}

function encryptData(data, salt) {
  try {
    // In a real implementation, get a secure password or key
    const password = 'user-provided-password'; // This should come from user input in a real app
    const key = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32 });
    const encrypted = CryptoJS.AES.encrypt(data, key.toString());
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

function decryptData(encrypted, salt) {
  try {
    // In a real implementation, get the same secure password or key used for encryption
    const password = 'user-provided-password'; // This should come from user input in a real app
    const key = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32 });
    const decrypted = CryptoJS.AES.decrypt(encrypted, key.toString());
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');

// Check for saved theme preference or use preferred color scheme
chrome.storage.local.get(['theme'], function (data) {
  const currentTheme = data.theme || 'light';

  // Apply theme
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Set toggle state
  themeToggle.checked = (currentTheme === 'dark');
});

// Listen for toggle changes
themeToggle.addEventListener('change', function () {
  const newTheme = this.checked ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);

  // Save to chrome.storage for background and content scripts
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

// Password Generator Functionality
initPasswordGenerator();

function initPasswordGenerator() {
  const generateBtn = document.getElementById('generate-password');
  const copyBtn = document.getElementById('copy-password');
  const passwordOutput = document.getElementById('generated-password');
  const lengthSlider = document.getElementById('password-length');
  const lengthValue = document.getElementById('length-value');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');

  // Load saved settings
  chrome.storage.sync.get(['defaultPasswordLength', 'defaultPasswordOptions'], function (data) {
    // Set password length
    if (data.defaultPasswordLength) {
      lengthSlider.value = data.defaultPasswordLength;
      lengthValue.textContent = data.defaultPasswordLength;
    }

    // Set character options
    if (data.defaultPasswordOptions) {
      document.getElementById('include-uppercase').checked = data.defaultPasswordOptions.uppercase !== false;
      document.getElementById('include-lowercase').checked = data.defaultPasswordOptions.lowercase !== false;
      document.getElementById('include-numbers').checked = data.defaultPasswordOptions.numbers !== false;
      document.getElementById('include-symbols').checked = data.defaultPasswordOptions.symbols !== false;
    }

    // Generate initial password with these settings
    generatePassword();
  });

  // Character sets
  const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'iIl1|oO0',
    ambiguous: '{}[]()/\\\'"`~,;:.<>'
  };

  // Update length value when slider changes
  lengthSlider.addEventListener('input', function () {
    lengthValue.textContent = this.value;

    // Generate a new password when length changes
    if (passwordOutput.value) {
      generatePassword();
    }
  });

  // Generate password when options change
  document.querySelectorAll('.password-options input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
      if (passwordOutput.value) {
        generatePassword();
      }
    });
  });

  // Generate initial password
  generateBtn.addEventListener('click', generatePassword);

  // Copy password to clipboard
  copyBtn.addEventListener('click', function () {
    if (passwordOutput.value) {
      passwordOutput.select();
      document.execCommand('copy');

      // Show feedback
      const originalText = this.innerHTML;
      this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      setTimeout(() => {
        this.innerHTML = originalText;
      }, 1000);
    }
  });

  // Password generation function
  function generatePassword() {
    // Get options
    const length = parseInt(lengthSlider.value);
    const includeUppercase = document.getElementById('include-uppercase').checked;
    const includeLowercase = document.getElementById('include-lowercase').checked;
    const includeNumbers = document.getElementById('include-numbers').checked;
    const includeSymbols = document.getElementById('include-symbols').checked;
    const excludeSimilar = document.getElementById('exclude-similar').checked;
    const excludeAmbiguous = document.getElementById('exclude-ambiguous').checked;

    // Create character pool
    let charPool = '';

    if (includeUppercase) charPool += charSets.uppercase;
    if (includeLowercase) charPool += charSets.lowercase;
    if (includeNumbers) charPool += charSets.numbers;
    if (includeSymbols) charPool += charSets.symbols;

    // Remove excluded characters
    if (excludeSimilar) {
      for (const char of charSets.similar) {
        charPool = charPool.replace(new RegExp(char, 'g'), '');
      }
    }

    if (excludeAmbiguous) {
      for (const char of charSets.ambiguous) {
        charPool = charPool.replace(new RegExp('\\' + char, 'g'), '');
      }
    }

    // Check if at least one character set is selected
    if (charPool.length === 0) {
      passwordOutput.value = 'Select at least one character type';
      return;
    }

    // Generate password
    let password = '';
    let hasUppercase = false;
    let hasLowercase = false;
    let hasNumber = false;
    let hasSymbol = false;

    for (let i = 0; i < length; i++) {
      const char = charPool.charAt(Math.floor(Math.random() * charPool.length));
      password += char;

      // Check character types
      if (/[A-Z]/.test(char)) hasUppercase = true;
      if (/[a-z]/.test(char)) hasLowercase = true;
      if (/[0-9]/.test(char)) hasNumber = true;
      if (/[^A-Za-z0-9]/.test(char)) hasSymbol = true;
    }

    // Ensure password has at least one character from each selected type
    if ((includeUppercase && !hasUppercase) ||
      (includeLowercase && !hasLowercase) ||
      (includeNumbers && !hasNumber) ||
      (includeSymbols && !hasSymbol)) {
      // Regenerate if requirements not met
      return generatePassword();
    }

    // Set the password
    passwordOutput.value = password;

    // Calculate and display password strength
    updatePasswordStrength(password);
  }

  // Calculate password strength
  function updatePasswordStrength(password) {
    // Get options for entropy calculation
    const includeUppercase = document.getElementById('include-uppercase').checked;
    const includeLowercase = document.getElementById('include-lowercase').checked;
    const includeNumbers = document.getElementById('include-numbers').checked;
    const includeSymbols = document.getElementById('include-symbols').checked;
    const excludeSimilar = document.getElementById('exclude-similar').checked;
    const excludeAmbiguous = document.getElementById('exclude-ambiguous').checked;

    // Calculate pool size
    let poolSize = 0;
    if (includeUppercase) poolSize += excludeSimilar ? 23 : 26; // 26 uppercase - 3 similar (I, O, L)
    if (includeLowercase) poolSize += excludeSimilar ? 23 : 26; // 26 lowercase - 3 similar (i, o, l)
    if (includeNumbers) poolSize += excludeSimilar ? 8 : 10; // 10 numbers - 2 similar (0, 1)
    if (includeSymbols) poolSize += excludeAmbiguous ? 19 : 32; // 32 symbols - 13 ambiguous

    // Calculate entropy bits
    const entropy = Math.log2(poolSize) * password.length;

    // Set strength based on entropy
    let strengthClass = '';
    let strengthDescription = '';

    if (entropy < 40) {
      strengthClass = 'very-weak';
      strengthDescription = 'Very Weak';
    } else if (entropy < 60) {
      strengthClass = 'weak';
      strengthDescription = 'Weak';
    } else if (entropy < 80) {
      strengthClass = 'medium';
      strengthDescription = 'Medium';
    } else if (entropy < 100) {
      strengthClass = 'strong';
      strengthDescription = 'Strong';
    } else {
      strengthClass = 'very-strong';
      strengthDescription = 'Very Strong';
    }

    // Update UI
    strengthBar.className = 'strength-bar ' + strengthClass;
    strengthText.textContent = strengthDescription;
  }
}

// Initialize fake data generator
function initFakeDataGenerator() {
  const dataTypeSelect = document.getElementById('data-type');
  const dataLocaleSelect = document.getElementById('data-locale');
  const generateDataButton = document.getElementById('generate-data');
  const generatedDataDiv = document.getElementById('generated-data');
  const copyDataButton = document.getElementById('copy-data');
  const fillWithFakeButton = document.getElementById('fill-with-fake');

  if (!generateDataButton || !generatedDataDiv) {
    console.warn('Fake data generator elements not found');
    return;
  }

  generateDataButton.addEventListener('click', () => {
    const dataType = dataTypeSelect.value;
    const locale = dataLocaleSelect.value;

    try {
      if (!fakerInstance) {
        throw new Error('Faker library not available');
      }

      fakerInstance.setLocale(locale);
      let generatedValue = '';

      switch (dataType) {
        case 'name':
          generatedValue = fakerInstance.name.fullName();
          break;
        case 'email':
          generatedValue = fakerInstance.internet.email();
          break;
        case 'phone':
          generatedValue = fakerInstance.phone.number();
          break;
        case 'address':
          generatedValue = `${fakerInstance.location.streetAddress()}
${fakerInstance.location.city()}, ${fakerInstance.location.state()} ${fakerInstance.location.zipCode()}
${fakerInstance.location.country()}`;
          break;
        case 'creditcard':
          generatedValue = `${fakerInstance.finance.creditCardNumber()}
Exp: ${fakerInstance.date.future().getMonth() + 1}/${fakerInstance.date.future().getFullYear()}
CVV: ${fakerInstance.finance.creditCardCVV()}`;
          break;
      }

      generatedDataDiv.textContent = generatedValue;
    } catch (error) {
      console.error('Error generating fake data:', error);
      generatedDataDiv.textContent = 'Error generating fake data: ' + error.message;
    }
  });

  if (copyDataButton) {
    copyDataButton.addEventListener('click', () => {
      const textToCopy = generatedDataDiv.textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyDataButton.textContent;
        copyDataButton.textContent = 'Copied!';
        setTimeout(() => {
          copyDataButton.textContent = originalText;
        }, 1500);
      });
    });
  }

  if (fillWithFakeButton) {
    fillWithFakeButton.addEventListener('click', () => {
      const fakeData = generatedDataDiv.textContent;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'fillWithFakeData',
          dataType: dataTypeSelect.value,
          data: fakeData
        });
      });
    });
  }
}

// Initialize form detection
function initFormDetection() {
  const detectFieldsButton = document.getElementById('detect-fields');
  const detectedFieldsDiv = document.getElementById('detected-fields');

  if (!detectFieldsButton || !detectedFieldsDiv) {
    console.warn('Form detection elements not found');
    return;
  }

  detectFieldsButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'detectFields' }, (response) => {
        if (response && response.fields) {
          displayDetectedFields(response.fields);
        } else {
          detectedFieldsDiv.textContent = 'No form fields detected on this page.';
        }
      });
    });
  });
}

// Initialize theme
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');

  if (!themeToggle) {
    console.warn('Theme toggle element not found');
    return;
  }

  // Check for saved theme preference
  chrome.storage.local.get(['theme'], function (data) {
    const currentTheme = data.theme || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.checked = (currentTheme === 'dark');
  });

  // Listen for toggle changes
  themeToggle.addEventListener('change', function () {
    const newTheme = this.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);

    // Save theme preference
    chrome.storage.local.set({ theme: newTheme }, function () {
      // Notify content scripts about theme change
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
} 