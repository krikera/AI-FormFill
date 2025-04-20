// Error types
class ExtensionError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ExtensionError';
    this.code = code;
    this.details = details;
  }
}

class ValidationError extends ExtensionError {
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

class StorageError extends ExtensionError {
  constructor(message, details = {}) {
    super(message, 'STORAGE_ERROR', details);
    this.name = 'StorageError';
  }
}

class SecurityError extends ExtensionError {
  constructor(message, details = {}) {
    super(message, 'SECURITY_ERROR', details);
    this.name = 'SecurityError';
  }
}

// Error handler
const ErrorHandler = {
  handle(error, context = '') {
    console.error(`[${context}] Error:`, error);

    // Log to storage for debugging
    this.logError(error, context);

    // Show user-friendly message
    this.showErrorMessage(error);

    // Report to analytics if needed
    this.reportError(error, context);
  },

  logError(error, context) {
    chrome.storage.local.get(['errorLogs'], (result) => {
      const logs = result.errorLogs || [];
      logs.push({
        timestamp: new Date().toISOString(),
        context,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
          details: error.details
        }
      });

      // Keep only last 100 errors
      if (logs.length > 100) {
        logs.shift();
      }

      chrome.storage.local.set({ errorLogs: logs });
    });
  },

  showErrorMessage(error) {
    const message = this.getUserFriendlyMessage(error);
    chrome.runtime.sendMessage({
      type: 'SHOW_ERROR',
      message
    });
  },

  getUserFriendlyMessage(error) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'STORAGE_ERROR':
        return 'Unable to save your data. Please try again.';
      case 'SECURITY_ERROR':
        return 'A security check failed. Please refresh the page.';
      default:
        return 'Something went wrong. Please try again.';
    }
  },

  reportError(error, context) {
    // Implement error reporting service integration here
    // For now, just log to console
    console.log(`Error reported: ${context} - ${error.message}`);
  }
};

export { ErrorHandler, ExtensionError, ValidationError, StorageError, SecurityError }; 