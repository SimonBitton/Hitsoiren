import { state } from './state.js';
import { loadData, getEventById } from './data-manager.js';
import { initRouter, setView } from './router.js';
import { toggleSidebar, buildSidebarContent } from './sidebar.js';
import { renderTimeline, renderCountries } from './ui-renderer.js';
import { showDetailPage } from './detail-view.js';
import { showCountryDetail, closeCountryModal } from './country-modal.js';
import { getKeyModifier, isMac } from './os-detect.js';
import { maybeStartOnboarding } from './onboarding.js';

function cleanupDebugBadges() {
  const ids = ['js-loaded', 'jsLoaded', 'js-status', 'debug-status'];
  ids.forEach((id) => document.getElementById(id)?.remove());

  // Defensive cleanup for extension/dev leftover text badge.
  const exactBadge = Array.from(document.querySelectorAll('body *')).find((el) => {
    return el.children.length === 0 && el.textContent?.trim() === 'JS Loaded';
  });
  exactBadge?.remove();

  // Defensive cleanup for accidental text badges.
  const strayBadge = Array.from(document.querySelectorAll('body *')).find((el) => {
    return el.children.length === 0 && el.textContent?.trim() === '$c';
  });
  strayBadge?.remove();
}

function bindSearch() {
  const searchInput = document.getElementById('searchInput');
  const countrySearchInput = document.getElementById('countrySearchInput');

  const syncSearchInputs = (value) => {
    if (searchInput && searchInput.value !== value) searchInput.value = value;
    if (countrySearchInput && countrySearchInput.value !== value) countrySearchInput.value = value;
  };

  syncSearchInputs(state.search || '');

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      state.search = event.target.value;
      syncSearchInputs(state.search);
      renderTimeline();
    });
  }

  if (countrySearchInput) {
    countrySearchInput.addEventListener('input', (event) => {
      state.search = event.target.value;
      syncSearchInputs(state.search);
      renderCountries();
    });
  }

  // Raccourcis clavier pour l'accès rapide
  document.addEventListener('keydown', (event) => {
    // Ctrl+K ou Cmd+K pour focus sur la recherche
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const activeView = document.querySelector('.view-container.active');
      if (activeView.id === 'view-timeline' && searchInput) {
        searchInput.focus();
        searchInput.select();
      } else if (activeView.id === 'view-countries' && countrySearchInput) {
        countrySearchInput.focus();
        countrySearchInput.select();
      }
    }

    // Échap pour effacer la recherche
    if (event.key === 'Escape') {
      if (document.activeElement === searchInput || document.activeElement === countrySearchInput) {
        document.activeElement.value = '';
        document.activeElement.dispatchEvent(new Event('input'));
        document.activeElement.blur();
        syncSearchInputs('');
      }
    }
  });

  // Afficher le modificateur de clavier correct dans les placeholders si nécessaire
  const modifier = getKeyModifier();
  if (searchInput) {
    const placeholder = searchInput.placeholder;
    if (!placeholder.includes('Ctrl') && !placeholder.includes('Cmd')) {
      searchInput.title = `Appuyez sur ${modifier}+K pour rechercher rapidement`;
    }
  }
}

function bindTouchNavigation() {
  const root = document.getElementById('main-content');
  if (!root) return;

  let startX = 0;
  let startY = 0;
  let isTracking = false;
  const order = ['presentation', 'timeline', 'countries'];

  root.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1) return;
    if (event.target.closest('input, textarea, button, a, .country-modal, .detail-page')) return;
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    isTracking = true;
  }, { passive: true });

  root.addEventListener('touchend', (event) => {
    if (!isTracking || event.changedTouches.length !== 1) return;
    isTracking = false;

    const deltaX = event.changedTouches[0].clientX - startX;
    const deltaY = event.changedTouches[0].clientY - startY;
    if (Math.abs(deltaY) > 40 || Math.abs(deltaX) < 70) return;

    const currentIndex = order.indexOf(state.currentView);
    if (currentIndex === -1) return;

    if (deltaX < 0 && currentIndex < order.length - 1) {
      setView(order[currentIndex + 1]);
    } else if (deltaX > 0 && currentIndex > 0) {
      setView(order[currentIndex - 1]);
    }
  }, { passive: true });
}

async function init() {
  const statusEl = document.createElement('div');
  statusEl.id = 'loading-status';
  statusEl.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.8);color:white;padding:10px 20px;border-radius:30px;font-size:12px;z-index:9999;pointer-events:none;';
  statusEl.textContent = 'Chargement des données...';
  document.body.appendChild(statusEl);

  try {
    const data = await loadData();
    if (!data || !data.timeline || !data.countries) {
      throw new Error('Données corrompues ou manquantes');
    }
    statusEl.style.display = 'none';
  } catch (error) {
    console.error('Initialization error:', error);
    statusEl.style.background = '#ef4444';
    statusEl.textContent = `Erreur de chargement: ${error.message}`;
    statusEl.style.pointerEvents = 'auto';
    statusEl.style.cursor = 'pointer';
    statusEl.onclick = () => window.location.reload();
    return;
  }

  cleanupDebugBadges();
  window.addEventListener('histoiren:start-tutorial', () => {
    maybeStartOnboarding(true);
  });
  initRouter();
  bindSearch();
  bindTouchNavigation();

  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);

  renderTimeline();
  buildSidebarContent();
  maybeStartOnboarding();
}

window.showDetail = function showDetail(id, source = 'timeline') {
  const entry = getEventById(id);
  if (!entry) return;
  state.detailSource = source;
  showDetailPage(entry);
};

window.showCountryDetail = showCountryDetail;
window.closeCountryModal = closeCountryModal;

init();
