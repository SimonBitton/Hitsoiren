import { state } from './state.js';
import { renderTimeline, renderCountries, renderStats } from './ui-renderer.js';
import { buildSidebarContent } from './sidebar.js';

const VALID_VIEWS = new Set(['presentation', 'timeline', 'countries']);

function getRouteFromHash() {
  const hash = (window.location.hash || '').replace(/^#\/?/, '');
  return (hash.split('/')[0] || 'presentation').trim();
}

function updateHash(viewName) {
  const targetHash = `#/${viewName}`;
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }
}

export function setView(viewName, options = {}) {
  const { updateRoute = true } = options;
  const previousView = state.currentView;
  state.currentView = viewName;
  
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewName);
  });
  
  document.querySelectorAll('.view-container').forEach(container => {
    container.classList.toggle('active', container.id === `view-${viewName}`);
  });
  
  if (viewName !== previousView) {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Hide sidebar on presentation view
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('quickNav');
  if (sidebarToggle && sidebar) {
    const shouldHideSidebar = viewName === 'presentation';
    sidebarToggle.style.display = shouldHideSidebar ? 'none' : 'flex';
    if (shouldHideSidebar) {
      sidebar.classList.remove('active');
      sidebarToggle.classList.remove('active');
      document.querySelector('main')?.classList.remove('sidebar-open');
      state.sidebarOpen = false;
    }
  }

  if (viewName === 'timeline' || viewName === 'countries') {
    buildSidebarContent();
  }
  
  if (viewName === 'countries') {
    renderCountries();
  } else if (viewName === 'timeline') {
    renderTimeline();
  } else if (viewName === 'presentation') {
    // Render stats inside the presentation view
    renderStats();
  }

  if (updateRoute && VALID_VIEWS.has(viewName)) {
    updateHash(viewName);
  }
}

function handleRoute() {
  const route = getRouteFromHash();
  if (route === 'tuto') {
    window.dispatchEvent(new CustomEvent('histoiren:start-tutorial'));
    return;
  }
  if (VALID_VIEWS.has(route)) {
    setView(route, { updateRoute: false });
    return;
  }
  setView('presentation', { updateRoute: false });
}

export function initRouter() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => setView(tab.dataset.view));
  });

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
