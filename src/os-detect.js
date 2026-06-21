/**
 * Détection plateforme & adaptations cross-platform
 * (iOS, Android, macOS, Windows, Linux)
 */

const TWEMOJI_OS = new Set(['windows', 'linux']);

export function detectOS() {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const maxTouch = navigator.maxTouchPoints || 0;

  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (platform === 'MacIntel' && maxTouch > 1) return 'ios';

  const p = platform.toLowerCase();
  const u = ua.toLowerCase();
  if (/(mac|iphone|ipad|ipod)/.test(p) || /macintosh/.test(u)) return 'mac';
  if (/win/.test(p) || /windows/.test(u)) return 'windows';
  if (/linux/.test(p) || /linux/.test(u)) return 'linux';
  return 'unknown';
}

export function isTouchDevice() {
  return document.documentElement.dataset.touch === 'true'
    || 'ontouchstart' in window
    || (navigator.maxTouchPoints || 0) > 0;
}

function applyPlatformAttributes(os) {
  document.documentElement.dataset.os = os;
  if (isTouchDevice()) {
    document.documentElement.dataset.touch = 'true';
  }
  document.body.classList.add(`os-${os}`);
  window.currentOS = os;
  document.documentElement.dataset.osApplied = '1';
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function parseTwemoji(root = document.body) {
  if (!window.twemoji) return;
  window.twemoji.parse(root, {
    folder: 'svg',
    ext: '.svg',
    className: 'emoji'
  });
}

function loadTwemoji() {
  if (window.__twemojiLoaded) return;
  window.__twemojiLoaded = true;

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/twemoji@14/dist/twemoji.min.js';
  script.async = true;
  script.onload = () => {
    parseTwemoji();
    const scheduleParse = debounce(() => parseTwemoji(), 200);
    const observer = new MutationObserver((mutations) => {
      const hasNewNodes = mutations.some((m) => m.addedNodes.length > 0);
      if (hasNewNodes) scheduleParse();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.__twemojiObserver = observer;
  };
  document.head.appendChild(script);
}

function adaptKeyboardShortcuts(os) {
  if (os !== 'mac' && os !== 'ios') return;
  document.querySelectorAll('[data-shortcut]').forEach((el) => {
    const shortcut = el.dataset.shortcut;
    if (shortcut?.includes('Ctrl')) {
      el.dataset.shortcut = shortcut.replace('Ctrl', 'Cmd');
      if (el.textContent.includes('Ctrl')) {
        el.textContent = el.textContent.replace('Ctrl', 'Cmd');
      }
    }
  });
}

export function applyOSAdaptations() {
  if (document.documentElement.dataset.osApplied === '1') return;
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', applyOSAdaptations, { once: true });
    return;
  }

  const detectedOS = detectOS();
  applyPlatformAttributes(detectedOS);
  adaptKeyboardShortcuts(detectedOS);

  if (TWEMOJI_OS.has(detectedOS)) {
    loadTwemoji();
  }
}

export function getKeyModifier() {
  const os = window.currentOS || detectOS();
  return (os === 'mac' || os === 'ios') ? 'Cmd' : 'Ctrl';
}

export function isMac() {
  const os = window.currentOS || detectOS();
  return os === 'mac';
}

export function isWindows() {
  return (window.currentOS || detectOS()) === 'windows';
}

export function isLinux() {
  return (window.currentOS || detectOS()) === 'linux';
}

export function isIOS() {
  return (window.currentOS || detectOS()) === 'ios';
}

export function isAndroid() {
  return (window.currentOS || detectOS()) === 'android';
}

export function isMobileOS() {
  const os = window.currentOS || detectOS();
  return os === 'ios' || os === 'android';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyOSAdaptations);
} else {
  applyOSAdaptations();
}
