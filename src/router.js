import { state } from './state.js';
import { renderTimeline, renderCountries, renderStats } from './ui-renderer.js';
import { buildSidebarContent } from './sidebar.js';

export function setView(viewName) {
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
}

export function initRouter() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => setView(tab.dataset.view));
  });

  const params = new URLSearchParams(window.location.search);
  const view = params.get('view') || 'presentation';
  if (view !== 'detail') {
    setView(view);
  }
}
