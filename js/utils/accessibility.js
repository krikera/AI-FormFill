// Accessibility utilities
const Accessibility = {
  // Add ARIA attributes to elements
  addAriaAttributes(element, attributes) {
    if (!element) return;

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(`aria-${key}`, value);
    });
  },

  // Make element focusable
  makeFocusable(element) {
    if (!element) return;

    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');
  },

  // Add keyboard navigation
  addKeyboardNavigation(element, handlers) {
    if (!element) return;

    element.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          handlers.onActivate?.(event);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          handlers.onPrevious?.(event);
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          handlers.onNext?.(event);
          break;
        case 'Escape':
          event.preventDefault();
          handlers.onClose?.(event);
          break;
      }
    });
  },

  // Announce message to screen readers
  announce(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('role', 'status');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      announcement.remove();
    }, 1000);
  },

  // Focus management
  focusTrap(element, options = {}) {
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    });
  },

  // High contrast mode support
  enableHighContrast() {
    document.documentElement.setAttribute('data-high-contrast', 'true');
  },

  disableHighContrast() {
    document.documentElement.removeAttribute('data-high-contrast');
  }
};

export { Accessibility }; 