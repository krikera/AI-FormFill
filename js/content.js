// Field detection patterns
const FIELD_PATTERNS = {
  email: {
    patterns: [
      /email/i,
      /e-mail/i,
      /mail/i,
      /username/i,
      /login/i
    ],
    types: ['email', 'text'],
    validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    patterns: [
      /phone/i,
      /tel/i,
      /mobile/i,
      /cell/i,
      /contact/i
    ],
    types: ['tel', 'text'],
    validation: /^\+?[\d\s-()]{10,}$/
  },
  name: {
    patterns: [
      /name/i,
      /fullname/i,
      /full\s*name/i
    ],
    types: ['text'],
    validation: /^[a-zA-Z\s-']{2,}$/
  },
  first_name: {
    patterns: [
      /first\s*name/i,
      /given\s*name/i,
      /fname/i
    ],
    types: ['text'],
    validation: /^[a-zA-Z\s-']{2,}$/
  },
  last_name: {
    patterns: [
      /last\s*name/i,
      /surname/i,
      /lname/i
    ],
    types: ['text'],
    validation: /^[a-zA-Z\s-']{2,}$/
  },
  address: {
    patterns: [
      /address/i,
      /street/i,
      /location/i
    ],
    types: ['text'],
    validation: /^[a-zA-Z0-9\s,.-]{5,}$/
  },
  city: {
    patterns: [
      /city/i,
      /town/i,
      /municipality/i
    ],
    types: ['text'],
    validation: /^[a-zA-Z\s-']{2,}$/
  },
  state: {
    patterns: [
      /state/i,
      /province/i,
      /region/i
    ],
    types: ['text'],
    validation: /^[a-zA-Z\s-']{2,}$/
  },
  postal_code: {
    patterns: [
      /zip/i,
      /postal/i,
      /pincode/i
    ],
    types: ['text'],
    validation: /^[a-zA-Z0-9\s-]{3,10}$/
  },
  country: {
    patterns: [
      /country/i,
      /nation/i
    ],
    types: ['text', 'select'],
    validation: /^[a-zA-Z\s-']{2,}$/
  },
  password: {
    patterns: [
      /password/i,
      /pwd/i,
      /pass/i
    ],
    types: ['password'],
    validation: /^.{8,}$/
  },
  credit_card: {
    patterns: [
      /card\s*number/i,
      /credit\s*card/i,
      /cc\s*number/i
    ],
    types: ['text'],
    validation: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/
  },
  cvv: {
    patterns: [
      /cvv/i,
      /cvc/i,
      /security\s*code/i
    ],
    types: ['text', 'password'],
    validation: /^\d{3,4}$/
  },
  expiration_date: {
    patterns: [
      /exp/i,
      /expiry/i,
      /valid\s*until/i
    ],
    types: ['text'],
    validation: /^(0[1-9]|1[0-2])\/([0-9]{2}|[0-9]{4})$/
  }
};

// Analyze field context
function analyzeFieldContext(field) {
  const context = {
    label: findLabelText(field),
    placeholder: field.placeholder,
    name: field.name,
    id: field.id,
    type: field.type,
    className: field.className,
    parentElement: field.parentElement,
    surroundingText: getSurroundingText(field),
    attributes: getFieldAttributes(field)
  };

  return context;
}

// Get field attributes
function getFieldAttributes(field) {
  const attributes = {};
  for (const attr of field.attributes) {
    attributes[attr.name] = attr.value;
  }
  return attributes;
}

// Get surrounding text
function getSurroundingText(field) {
  const parent = field.parentElement;
  if (!parent) return '';

  const text = parent.textContent;
  const fieldIndex = text.indexOf(field.value);
  return text.slice(Math.max(0, fieldIndex - 50), Math.min(text.length, fieldIndex + 50));
}

// Find label text
function findLabelText(field) {
  // Check for label element
  const label = field.labels?.[0];
  if (label) return label.textContent.trim();

  // Check for aria-label
  if (field.getAttribute('aria-label')) {
    return field.getAttribute('aria-label').trim();
  }

  // Check for placeholder
  if (field.placeholder) {
    return field.placeholder.trim();
  }

  // Check parent text content
  const parent = field.parentElement;
  if (parent) {
    const parentText = parent.textContent.trim();
    if (parentText && parentText.length < 50) {
      return parentText;
    }
  }

  return '';
}

// Analyze field type
function analyzeFieldType(field, context) {
  let bestMatch = {
    type: 'unknown',
    confidence: 0
  };

  // Check field type first
  if (field.type === 'email') {
    return { type: 'email', confidence: 1 };
  }
  if (field.type === 'password') {
    return { type: 'password', confidence: 1 };
  }
  if (field.type === 'tel') {
    return { type: 'phone', confidence: 1 };
  }

  // Analyze field context
  const textToAnalyze = [
    context.label,
    context.placeholder,
    context.name,
    context.id,
    context.surroundingText
  ].join(' ').toLowerCase();

  // Check against patterns
  for (const [fieldType, pattern] of Object.entries(FIELD_PATTERNS)) {
    let confidence = 0;
    let matches = 0;

    // Check patterns
    for (const regex of pattern.patterns) {
      if (regex.test(textToAnalyze)) {
        matches++;
      }
    }

    // Calculate confidence
    if (matches > 0) {
      confidence = matches / pattern.patterns.length;

      // Additional confidence factors
      if (pattern.types.includes(field.type)) {
        confidence += 0.2;
      }
      if (field.name && pattern.patterns.some(p => p.test(field.name))) {
        confidence += 0.2;
      }
      if (field.id && pattern.patterns.some(p => p.test(field.id))) {
        confidence += 0.2;
      }
    }

    // Update best match if confidence is higher
    if (confidence > bestMatch.confidence) {
      bestMatch = { type: fieldType, confidence };
    }
  }

  return bestMatch;
}

// Validate field value
function validateField(field, value, fieldType) {
  if (!value) return { valid: true, message: '' };

  const pattern = FIELD_PATTERNS[fieldType];
  if (!pattern || !pattern.validation) return { valid: true, message: '' };

  const isValid = pattern.validation.test(value);
  return {
    valid: isValid,
    message: isValid ? '' : `Invalid ${fieldType.replace('_', ' ')} format`
  };
}

// Update the detectFormFields function
function detectFormFields() {
  const forms = document.querySelectorAll('form');
  const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"])');
  const textareas = document.querySelectorAll('textarea');
  const selects = document.querySelectorAll('select');

  const formFields = [];

  // Process input fields
  inputs.forEach(input => {
    const context = analyzeFieldContext(input);
    const analysis = analyzeFieldType(input, context);

    if (analysis.confidence > 0.3) { // Only include fields with reasonable confidence
      formFields.push({
        element: input,
        type: 'input',
        id: input.id,
        name: input.name,
        label: context.label,
        value: input.value,
        predictedContent: analysis.type,
        confidence: analysis.confidence,
        context: context
      });
    }
  });

  // Process textarea fields
  textareas.forEach(textarea => {
    const context = analyzeFieldContext(textarea);
    const analysis = analyzeFieldType(textarea, context);

    if (analysis.confidence > 0.3) {
      formFields.push({
        element: textarea,
        type: 'textarea',
        id: textarea.id,
        name: textarea.name,
        label: context.label,
        value: textarea.value,
        predictedContent: analysis.type,
        confidence: analysis.confidence,
        context: context
      });
    }
  });

  // Process select fields
  selects.forEach(select => {
    const context = analyzeFieldContext(select);
    const analysis = analyzeFieldType(select, context);

    if (analysis.confidence > 0.3) {
      formFields.push({
        element: select,
        type: 'select',
        id: select.id,
        name: select.name,
        label: context.label,
        value: select.value,
        options: Array.from(select.options).map(option => option.value),
        predictedContent: analysis.type,
        confidence: analysis.confidence,
        context: context
      });
    }
  });

  // Add highlighting to detected fields
  addFieldHighlighting(formFields);

  return formFields;
}

// Fill form with provided data or AI predictions
function fillForm(data) {
  const fields = detectFormFields();

  // If data is provided, fill with that
  if (data) {
    fillWithProvidedData(fields, data);
    return;
  }

  // Otherwise use AI predictions
  fillWithAIPredictions(fields);
}

// Fill form with user-provided data
function fillWithProvidedData(fields, data) {
  fields.forEach(field => {
    const fieldType = field.predictedContent;
    if (data[fieldType]) {
      setFieldValue(field.element, data[fieldType]);
    }
  });
}

// Fill with AI-generated predictions
function fillWithAIPredictions(fields) {
  // In a real implementation, this would use TensorFlow.js or similar
  // For this example, we'll use simple patterns

  fields.forEach(field => {
    let value = '';

    switch (field.predictedContent) {
      case 'email':
        value = 'user@example.com';
        break;
      case 'phone':
        value = '555-123-4567';
        break;
      case 'name':
        value = 'John Doe';
        break;
      case 'first_name':
        value = 'John';
        break;
      case 'last_name':
        value = 'Doe';
        break;
      case 'address':
        value = '123 Main St';
        break;
      case 'city':
        value = 'New York';
        break;
      case 'state':
        value = 'NY';
        break;
      case 'postal_code':
        value = '10001';
        break;
      case 'country':
        value = 'United States';
        break;
      case 'company':
        value = 'Example Corp';
        break;
      case 'url':
        value = 'https://example.com';
        break;
      case 'username':
        value = 'johndoe';
        break;
      // Sensitive fields are not auto-filled by default
      case 'password':
      case 'credit_card':
      case 'cvv':
        value = '';
        break;
      default:
        value = '';
    }

    if (value) {
      setFieldValue(field.element, value);
    }
  });
}

// Dynamically load Faker.js from local file
function loadFakerJs() {
  return new Promise((resolve, reject) => {
    if (window.faker) {
      resolve(window.faker);
      return;
    }

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('lib/faker.min.js');
    script.onload = () => resolve(window.faker);
    script.onerror = () => reject(new Error('Failed to load Faker.js'));
    document.head.appendChild(script);
  });
}

// Dynamically load CryptoJS from local file
function loadCryptoJs() {
  return new Promise((resolve, reject) => {
    if (window.CryptoJS) {
      resolve(window.CryptoJS);
      return;
    }

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('lib/crypto-js.min.js');
    script.onload = () => resolve(window.CryptoJS);
    script.onerror = () => reject(new Error('Failed to load CryptoJS'));
    document.head.appendChild(script);
  });
}

// Fill form with fake data
async function fillWithFakeData(dataType, fakeData) {
  const fields = detectFormFields();

  // For targeted filling (user selected a specific form field)
  if (dataType && fakeData) {
    fields.forEach(field => {
      if (field.predictedContent === dataType ||
        (dataType === 'name' && (field.predictedContent === 'first_name' || field.predictedContent === 'last_name'))) {
        setFieldValue(field.element, fakeData);
      }
    });
    return;
  }

  // Otherwise fill all fields with appropriate fake data
  try {
    // Dynamically load Faker.js if needed
    const faker = await loadFakerJs();
    console.log('Faker.js loaded successfully:', faker);

    // Generate fake data for all fields
    const fakeDataMap = generateFakeDataMap(faker);
    fillWithProvidedData(fields, fakeDataMap);
  } catch (error) {
    console.error('Error loading Faker.js:', error);
    // Fall back to hardcoded values
    const fallbackDataMap = generateFallbackDataMap();
    fillWithProvidedData(fields, fallbackDataMap);
  }
}

// Generate a map of field types to fake data using Faker.js
function generateFakeDataMap(faker) {
  faker.setLocale('en');
  return {
    email: faker.internet.email(),
    phone: faker.phone.number(),
    name: faker.name.fullName(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    postal_code: faker.location.zipCode(),
    country: faker.location.country(),
    company: faker.company.name(),
    url: faker.internet.url(),
    username: faker.internet.userName()
  };
}

// Fallback data map if Faker.js fails to load
function generateFallbackDataMap() {
  return {
    email: 'fake@example.com',
    phone: '555-987-6543',
    name: 'Jane Smith',
    first_name: 'Jane',
    last_name: 'Smith',
    address: '456 Oak Avenue',
    city: 'Chicago',
    state: 'IL',
    postal_code: '60601',
    country: 'United States',
    company: 'Fake Company Inc.',
    url: 'https://fakewebsite.com',
    username: 'janesmith'
  };
}

// Capture all form data from the page
function captureFormData() {
  const fields = detectFormFields();
  const formData = {};

  fields.forEach(field => {
    if (field.element.value && field.predictedContent !== 'unknown') {
      formData[field.predictedContent] = field.element.value;
    }
  });

  return formData;
}

// Set a value for a form field and trigger relevant events
function setFieldValue(element, value) {
  const previousValue = element.value;

  // Skip if the value is already set
  if (previousValue === value) {
    return;
  }

  // Set the value
  element.value = value;

  // Trigger events so the website knows the field was updated
  const events = ['input', 'change', 'blur'];

  events.forEach(eventType => {
    const event = new Event(eventType, { bubbles: true });
    element.dispatchEvent(event);
  });
}

// Add highlighting to form fields
function addFieldHighlighting(fields) {
  try {
    // Remove existing highlights
    removeFieldHighlighting();

    fields.forEach(field => {
      if (field.element && field.predictedContent !== 'unknown') {
        try {
          // Add highlight class and data attributes
          field.element.classList.add('ai-formfill-highlight');
          field.element.setAttribute('data-field-type', field.predictedContent);

          // Add validation status
          const validation = validateField(field.element, field.element.value, field.predictedContent);
          field.element.setAttribute('data-valid', validation.valid);

          // Create and add tooltip
          const tooltip = document.createElement('div');
          tooltip.className = 'ai-formfill-tooltip';
          tooltip.textContent = `${getFieldTypeLabel(field.predictedContent)}${validation.message ? ` - ${validation.message}` : ''}`;

          // Position tooltip
          const rect = field.element.getBoundingClientRect();
          tooltip.style.top = `${-rect.height - 30}px`;
          tooltip.style.left = `${rect.width / 2}px`;
          tooltip.style.transform = 'translateX(-50%)';

          field.element.appendChild(tooltip);

          // Add input event listener for real-time validation
          field.element.addEventListener('input', () => {
            const newValidation = validateField(field.element, field.element.value, field.predictedContent);
            field.element.setAttribute('data-valid', newValidation.valid);
            tooltip.textContent = `${getFieldTypeLabel(field.predictedContent)}${newValidation.message ? ` - ${newValidation.message}` : ''}`;
          });
        } catch (error) {
          console.error('Error adding highlight to field:', error);
          // Continue with other fields even if one fails
        }
      }
    });
  } catch (error) {
    console.error('Error in addFieldHighlighting:', error);
    removeFieldHighlighting(); // Clean up on error
  }
}

// Remove highlighting from form fields
function removeFieldHighlighting() {
  try {
    const highlightedFields = document.querySelectorAll('.ai-formfill-highlight');
    highlightedFields.forEach(field => {
      try {
        field.classList.remove('ai-formfill-highlight');
        field.removeAttribute('data-field-type');
        field.removeAttribute('data-valid');
        const tooltip = field.querySelector('.ai-formfill-tooltip');
        if (tooltip) {
          tooltip.remove();
        }
      } catch (error) {
        console.error('Error removing highlight from field:', error);
        // Continue with other fields even if one fails
      }
    });
  } catch (error) {
    console.error('Error in removeFieldHighlighting:', error);
  }
}

// Get human-readable label for field type
function getFieldTypeLabel(type) {
  const labels = {
    email: 'Email Field',
    phone: 'Phone Number',
    name: 'Full Name',
    first_name: 'First Name',
    last_name: 'Last Name',
    address: 'Address',
    city: 'City',
    state: 'State/Province',
    postal_code: 'Postal Code',
    country: 'Country',
    company: 'Company',
    url: 'URL',
    username: 'Username',
    password: 'Password',
    credit_card: 'Credit Card',
    cvv: 'CVV',
    expiration_date: 'Expiration Date'
  };
  return labels[type] || type;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'detectFields') {
    const fields = detectFormFields();
    // Return a simplified version without DOM elements
    const simplifiedFields = fields.map(field => ({
      type: field.type,
      name: field.name || field.id,
      predictedContent: field.predictedContent,
      label: field.label
    }));
    sendResponse({ fields: simplifiedFields });
  } else if (request.action === 'fillForm') {
    fillForm();
    sendResponse({ success: true });
  } else if (request.action === 'fillWithFakeData') {
    fillWithFakeData(request.dataType, request.data);
    sendResponse({ success: true });
  } else if (request.action === 'captureFormData') {
    const formData = captureFormData();
    sendResponse({ formData });
  } else if (request.action === 'toggleHighlighting') {
    if (request.enabled) {
      detectFormFields();
    } else {
      removeFieldHighlighting();
    }
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async response
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'fillPassword') {
    // Get the active element (input field)
    const activeElement = document.activeElement;

    // Check if it's an input element
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      // Fill the password
      activeElement.value = message.password;

      // Trigger change event so the site recognizes the input
      const changeEvent = new Event('change', { bubbles: true });
      activeElement.dispatchEvent(changeEvent);

      // Trigger input event as well
      const inputEvent = new Event('input', { bubbles: true });
      activeElement.dispatchEvent(inputEvent);

      // Visual feedback
      const originalBackground = activeElement.style.backgroundColor;
      activeElement.style.backgroundColor = '#e6f4ea'; // Light green

      setTimeout(function () {
        activeElement.style.backgroundColor = originalBackground;
      }, 500);

      // Send response
      sendResponse({ success: true });
    } else {
      // No active input element
      sendResponse({ success: false, error: 'No input field selected' });
    }

    return true;
  }

  // Handle other message types
  // ... existing code ...
});