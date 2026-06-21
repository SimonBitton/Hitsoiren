import { state } from './state.js';
import { setLastView } from './app-state.js';
import { renderFriseView, renderTimelineList, renderCountries, renderStats } from './ui-renderer.js';
import { buildSidebarContent } from './sidebar.js';
import { renderLearn } from './quiz.js';

const VALID_VIEWS = new Set(['presentation', 'frise', 'timeline', 'countries', 'apprendre']);

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
    const isActive = tab.dataset.view === viewName;
    tab.classList.toggle('active', isActive);
    tab.classList.toggle('nav-tab--home', tab.dataset.view === 'presentation');
    tab.setAttribute('aria-selected', String(isActive));
    tab.setAttribute('tabindex', isActive ? '0' : '-1');
  });
  
  document.querySelectorAll('.view-container').forEach(container => {
    container.classList.toggle('active', container.id === `view-${viewName}`);
  });
  
  if (viewName !== previousView) {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  buildSidebarContent();

  if (viewName === 'countries') {
    renderCountries();
  } else if (viewName === 'frise') {
    renderFriseView();
  } else if (viewName === 'timeline') {
    renderTimelineList();
  } else if (viewName === 'presentation') {
    renderStats();
  } else if (viewName === 'apprendre') {
    renderLearn();
  }

  if (updateRoute && VALID_VIEWS.has(viewName)) {
    updatePath(viewName);
  }

  if (VALID_VIEWS.has(viewName)) {
    setLastView(viewName);
  }

  window.dispatchEvent(new Event('histoiren:sync-search-inputs'));
}

function handleRoute() {
  const route = getRouteFromLocation();
  if (route === 'tuto') {
    if (window.location.pathname !== '/presentation') {
      window.history.replaceState({}, '', '/presentation');
    }
    setView('presentation', { updateRoute: false });
    window.dispatchEvent(new CustomEvent('histoiren:start-tutorial'));
    return;
  }
  if (VALID_VIEWS.has(route)) {
    setView(route, { updateRoute: false });
    return;
  }
  const fallback = VALID_VIEWS.has(state.currentView) ? state.currentView : 'presentation';
  setView(fallback, { updateRoute: false });
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
