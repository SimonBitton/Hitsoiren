const KEY = 'histoiren:theme';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const toggle = document.getElementById('themeToggle');
  toggle?.setAttribute('aria-pressed', String(theme === 'dark'));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#151816' : '#a84332');
}

export function initTheme() {
  // Le thème initial est déjà posé par bootstrap.js (anti-FOUC).
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

  const toggle = document.getElementById('themeToggle');
  toggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(KEY, next); } catch { /* stockage facultatif */ }
  });
}
