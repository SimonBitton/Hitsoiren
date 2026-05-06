/**
 * Performance Optimizer pour le scrolling
 * 
 * Optimisations appliquées :
 * - Virtual scrolling : ne render que les éléments visibles
 * - Desactivation des animations pendant le scroll
 * - Debouncing des requêtes de rendu
 * - Lazy loading des images
 */

export class PerformanceOptimizer {
  constructor(options = {}) {
    this.scrollContainer = options.container || window;
    this.itemSelector = options.itemSelector || '.event';
    this.bufferPixels = options.bufferPixels || 500; // Pixels supplémentaires à rendre
    this.debounceDelay = options.debounceDelay || 150;
    
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.renderedElements = new Set();
    this.observedElements = [];
    
    this.init();
  }

  init() {
    // Écouter les événements de scroll
    this.scrollContainer.addEventListener('scroll', () => this.onScroll(), { passive: true });
    
    // Appliquer les optimisations CSS
    this.applyPerformanceCSS();
    
    // Initialiser la première vue
    this.updateVisibility();
  }

  applyPerformanceCSS() {
    // Créer une feuille de style pour les optimisations de performance
    const style = document.createElement('style');
    style.textContent = `
      /* Désactiver les animations pendant le scroll */
      body.scrolling * {
        animation: none !important;
        transition: none !important;
      }

      /* GPU acceleration pour le container principal */
      #timelineContent,
      #countriesGrid {
        will-change: contents;
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }

      /* Optimiser les événements */
      .event {
        will-change: auto;
        contain: layout style paint;
      }

      /* Réduire les coûts de backdrop-filter pendant le scroll */
      body.scrolling .main-nav {
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }

      /* Désactiver les ombres coûteuses pendant le scroll */
      body.scrolling .event {
        box-shadow: none;
      }

      /* Optimiser les era-sections */
      .era-section {
        contain: layout style;
      }

      /* Font loading optimization */
      @font-display: swap;
    `;
    document.head.appendChild(style);
  }

  onScroll() {
    // Ajouter la classe scrolling
    document.body.classList.add('scrolling');
    
    // Mettre à jour la visibilité avec debouncing
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.updateVisibility();
      document.body.classList.remove('scrolling');
    }, this.debounceDelay);
  }

  updateVisibility() {
    const items = document.querySelectorAll(this.itemSelector);
    if (items.length === 0) return;

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemTop = scrollY + rect.top;
      const itemBottom = itemTop + rect.height;

      const viewportTop = scrollY - this.bufferPixels;
      const viewportBottom = scrollY + viewportHeight + this.bufferPixels;

      const isVisible = itemBottom > viewportTop && itemTop < viewportBottom;

      if (isVisible && !this.renderedElements.has(item)) {
        item.style.visibility = 'visible';
        item.style.opacity = '1';
        this.renderedElements.add(item);
      } else if (!isVisible && this.renderedElements.has(item)) {
        // Optionnel : réduire le DOM pour économiser de la mémoire
        // item.style.visibility = 'hidden';
        // item.style.opacity = '0';
        // this.renderedElements.delete(item);
      }
    });
  }

  /**
   * Optimiser les images avec lazy loading
   */
  enableLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    } else {
      // Fallback pour les vieux navigateurs
      images.forEach((img) => {
        img.src = img.dataset.src;
      });
    }
  }

  /**
   * Désactiver les animations coûteuses
   */
  reduceAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.head.appendChild(style);
    }
  }

  /**
   * Nettoyer les ressources
   */
  destroy() {
    clearTimeout(this.scrollTimeout);
    document.body.classList.remove('scrolling');
  }
}

/**
 * Initialiser automatiquement l'optimiseur au chargement de la page
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer({
      container: window,
      itemSelector: '.event',
      bufferPixels: 500,
      debounceDelay: 150
    });
  });
} else {
  window.performanceOptimizer = new PerformanceOptimizer({
    container: window,
    itemSelector: '.event',
    bufferPixels: 500,
    debounceDelay: 150
  });
}
