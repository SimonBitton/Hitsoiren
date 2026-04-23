import { state } from './state.js';
import { renderTimeline, renderCountries, renderStats } from './ui-renderer.js';
import { buildSidebarContent } from './sidebar.js';

export function setView(viewName) {
  const previousView = state.currentView;
  state.currentView = viewName;
  
  // Update Tabs UI
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewName);
  });
  
  // Update Containers UI
  document.querySelectorAll('.view-container').forEach(container => {
    container.classList.toggle('active', container.id === `view-${viewName}`);
  });
  
  // Reset scroll to top when switching BACK to timeline
  if (viewName === 'timeline' && previousView !== 'timeline') {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Build Sidebar based on view
  buildSidebarContent();
  
  // Specific view logic
  if (viewName === 'countries') {
    renderCountries();
  } else if (viewName === 'stats') {
    renderStats();
  } else if (viewName === 'timeline') {
    renderTimeline();
  }
}

export function initRouter() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => setView(tab.dataset.view));
  });

  // Handle initial view from URL
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view') || 'timeline';
  if (view !== 'detail') {
    setView(view);
  }
}
