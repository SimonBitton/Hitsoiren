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
  
  // Reset scroll to top when switching views
  if (viewName !== previousView) {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Show/hide sidebar toggle button based on view
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('quickNav');
  if (sidebarToggle && sidebar) {
    // Hide sidebar on presentation and stats views
    const shouldHideSidebar = viewName === 'presentation' || viewName === 'stats';
    sidebarToggle.style.display = shouldHideSidebar ? 'none' : 'flex';
    
    if (shouldHideSidebar) {
      sidebar.classList.remove('active');
      sidebarToggle.classList.remove('active');
      document.querySelector('main')?.classList.remove('sidebar-open');
      state.sidebarOpen = false;
    }
  }

  // Build Sidebar based on view (only for timeline and countries)
  if (viewName === 'timeline' || viewName === 'countries') {
    buildSidebarContent();
  }
  
  // Specific view logic
  if (viewName === 'countries') {
    renderCountries();
  } else if (viewName === 'stats') {
    renderStats();
  } else if (viewName === 'timeline') {
    renderTimeline();
  }
  // presentation view is static HTML, no rendering needed
}

export function initRouter() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => setView(tab.dataset.view));
  });

  // Handle initial view from URL
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view') || 'presentation';
  if (view !== 'detail') {
    setView(view);
  }
}
