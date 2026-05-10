import { state } from './state.js';
import { renderTimeline, renderCountries, renderStats } from './ui-renderer.js';
import { buildSidebarContent } from './sidebar.js';

const VALID_VIEWS = new Set(['presentation', 'timeline', 'countries']);

function getRouteFromLocation() {
  const cleanPath = (window.location.pathname || '/').replace(/^\/+|\/+$/g, '');
  const pathRoute = cleanPath.split('/')[0];
  if (pathRoute) return pathRoute;

  const hash = (window.location.hash || '').replace(/^#\/?/, '').trim();
  return hash || 'presentation';
}

function updatePath(viewName) {
  const targetPath = `/${viewName}`;
  if (window.location.pathname !== targetPath) {
    window.history.pushState({}, '', targetPath);
  }
}

export function setView(viewName, options = {}) {
  const { updateRoute = true } = options;
  const previousView = state.currentView;
  state.currentView = viewName;
  
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewName);
    tab.setAttribute('aria-selected', String(tab.dataset.view === viewName));
    tab.setAttribute('tabindex', tab.dataset.view === viewName ? '0' : '-1');
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
    sidebarToggle.setAttribute('aria-expanded', 'false');
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
    updatePath(viewName);
  }

  window.dispatchEvent(new Event('histoiren:sync-search-inputs'));
}

function handleRoute() {
  const route = getRouteFromLocation();
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
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      setView(tab.dataset.view);
    });
  });

  window.addEventListener('popstate', handleRoute);
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
