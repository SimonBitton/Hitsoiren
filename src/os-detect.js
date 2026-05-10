/**
 * OS Detection & Rendering Adaptation Module
 * 
 * Détecte le système d'exploitation et adapte le rendu pour assurer
 * une expérience cohérente entre macOS, Windows et Linux.
 * 
 * Fonctionnalités :
 * - Détection fiable de l'OS (navigator.userAgent + navigator.platform)
 * - Ajout d'une classe CSS au body pour adaptation stylescit
 * - Chargement optionnel de Twemoji pour Windows (cohérence emojis)
 * - Gestion des raccourcis clavier (Cmd sur macOS, Ctrl sur Windows)
 */

export function detectOS() {
  const ua = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();

  // Détection macOS (iOS inclus pour complétude)
  if (/(mac|iphone|ipad|ipod)/.test(platform) || /macintosh/.test(ua)) {
    return 'mac';
  }

  // Détection Windows
  if (/win/.test(platform) || /windows/.test(ua)) {
    return 'windows';
  }

  // Détection Linux
  if (/linux/.test(platform) || /linux/.test(ua)) {
    return 'linux';
  }

  // Fallback
  return 'unknown';
}

/**
 * Applique les adaptations du rendu selon l'OS détecté
 */
export function applyOSAdaptations() {
  const detectedOS = detectOS();
  
  // Ajouter la classe CSS au body
  document.documentElement.dataset.os = detectedOS;
  document.body.classList.add(`os-${detectedOS}`);
  
  // Storages locale pour accès ultérieur
  window.currentOS = detectedOS;
  
  // Logs pour debug
  console.log(`🖥️ OS Détecté: ${detectedOS} (UA: ${navigator.userAgent.substring(0, 50)}...)`);
  applyThemePreference();

  // Adaptations supplémentaires spécifiques à Windows
  if (detectedOS === 'windows') {
    loadTwemojiForWindows();
    adaptKeyboardShortcuts('windows');
  } else if (detectedOS === 'mac') {
    adaptKeyboardShortcuts('mac');
  }
}

function applyThemePreference() {
  const storedTheme = localStorage.getItem('histoiren_theme');
  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    return;
  }
  if (storedTheme === 'light') {
    document.documentElement.classList.remove('dark');
    return;
  }

  // Fallback: system preference
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', prefersDark);
}

/**
 * Charge la librairie Twemoji sur Windows pour cohérence des emojis
 * Twemoji : https://github.com/twitter/twemoji
 */
function loadTwemojiForWindows() {
  // Charger le script Twemoji depuis CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/twemoji@14/dist/twemoji.min.js';
  script.async = true;
  script.onload = () => {
    // Parser les emojis une fois le DOM complètement chargé
    if (window.twemoji) {
      // Parser initial
      twemoji.parse(document.body, {
        folder: 'svg',
        ext: '.svg'
      });
      
      // Observer pour parser les nouveaux emojis injectés dynamiquement
      const observer = new MutationObserver(() => {
        twemoji.parse(document.body, {
          folder: 'svg',
          ext: '.svg'
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  };
  
  document.head.appendChild(script);
}

/**
 * Adapte les labels de raccourcis clavier selon l'OS
 * 
 * Sur macOS, affiche "Cmd+K" au lieu de "Ctrl+K"
 * Sur Windows/Linux, garde "Ctrl+K"
 */
function adaptKeyboardShortcuts(os) {
  if (os === 'mac') {
    // Mettre à jour les labels visuels si présents dans le HTML
    document.querySelectorAll('[data-shortcut]').forEach((el) => {
      const shortcut = el.dataset.shortcut;
      if (shortcut && shortcut.includes('Ctrl')) {
        el.dataset.shortcut = shortcut.replace('Ctrl', 'Cmd');
        if (el.textContent.includes('Ctrl')) {
          el.textContent = el.textContent.replace('Ctrl', 'Cmd');
        }
      }
    });
  }
}

/**
 * Helper : Obtient le modificateur de clavier correct pour l'OS
 * Utile pour afficher les raccourcis clavier dans l'UI
 */
export function getKeyModifier() {
  return window.currentOS === 'mac' ? 'Cmd' : 'Ctrl';
}

/**
 * Helper : Vérifie si l'OS courant est macOS
 */
export function isMac() {
  return window.currentOS === 'mac';
}

/**
 * Helper : Vérifie si l'OS courant est Windows
 */
export function isWindows() {
  return window.currentOS === 'windows';
}

/**
 * Helper : Vérifie si l'OS courant est Linux
 */
export function isLinux() {
  return window.currentOS === 'linux';
}

/**
 * Exécute l'initialisation au chargement du DOM
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyOSAdaptations);
} else {
  // Si le script est chargé après le DOMContentLoaded
  applyOSAdaptations();
}
