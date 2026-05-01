import { state } from './state.js';
import { loadData, getEventById } from './data-manager.js';
import { initRouter, setView } from './router.js';
import { toggleSidebar, buildSidebarContent } from './sidebar.js';
import { renderTimeline, renderCountries } from './ui-renderer.js';
import { showDetailPage } from './detail-view.js';
import { showCountryDetail, closeCountryModal } from './country-modal.js';

function cleanupDebugBadges() {
  const ids = ['js-loaded', 'jsLoaded', 'js-status', 'debug-status'];
  ids.forEach((id) => document.getElementById(id)?.remove());

  // Defensive cleanup for extension/dev leftover text badge.
  const exactBadge = Array.from(document.querySelectorAll('body *')).find((el) => {
    return el.children.length === 0 && el.textContent?.trim() === 'JS Loaded';
  });
  exactBadge?.remove();
}

function bindSearch() {
  const searchInput = document.getElementById('searchInput');
  const countrySearchInput = document.getElementById('countrySearchInput');

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      state.search = event.target.value;
      renderTimeline();
    });
  }

  if (countrySearchInput) {
    countrySearchInput.addEventListener('input', (event) => {
      state.search = event.target.value;
      renderCountries();
    });
  }
}

async function init() {
  const statusEl = document.createElement('div');
  statusEl.id = 'loading-status';
  statusEl.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.8);color:white;padding:10px 20px;border-radius:30px;font-size:12px;z-index:9999;pointer-events:none;';
  statusEl.textContent = 'Chargement des donnees...';
  document.body.appendChild(statusEl);

  try {
    const data = await loadData();
    if (!data || !data.timeline || !data.countries) {
      throw new Error('Donnees corrompues ou manquantes');
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
  initRouter();
  bindSearch();

  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);

  renderTimeline();
  buildSidebarContent();
  setView('presentation');
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
