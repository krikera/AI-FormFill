// Performance optimization utilities
const Performance = {
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Cache with expiration
  createCache(expirationTime = 5 * 60 * 1000) {
    const cache = new Map();

    return {
      set(key, value) {
        cache.set(key, {
          value,
          timestamp: Date.now()
        });
      },

      get(key) {
        const item = cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > expirationTime) {
          cache.delete(key);
          return null;
        }

        return item.value;
      },

      clear() {
        cache.clear();
      }
    };
  },

  // Batch DOM updates
  batchDOMUpdates(callback) {
    const fragment = document.createDocumentFragment();
    callback(fragment);
    document.body.appendChild(fragment);
  },

  // Lazy load images
  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  },

  // Optimize animations
  optimizeAnimations() {
    const elements = document.querySelectorAll('.animate');

    elements.forEach(element => {
      element.style.willChange = 'transform';
      element.style.transform = 'translateZ(0)';
    });
  },

  // Memory management
  cleanupResources() {
    // Clear unused event listeners
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      const clone = element.cloneNode(true);
      element.parentNode.replaceChild(clone, element);
    });

    // Clear unused caches
    if (window.caches) {
      caches.keys().then(keys => {
        keys.forEach(key => {
          if (key.startsWith('ai-formfill-')) {
            caches.delete(key);
          }
        });
      });
    }
  },

  // Performance monitoring
  startPerformanceMonitoring() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 100) { // Log slow operations
          console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
  }
};

export { Performance }; 