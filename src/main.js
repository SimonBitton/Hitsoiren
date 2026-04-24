import { state } from './state.js';
import { loadData, getEventById } from './data-manager.js';
import { initRouter, setView } from './router.js';
import { toggleSidebar, buildSidebarContent } from './sidebar.js';
import { renderTimeline, renderCountries, renderStats } from './ui-renderer.js';
import { normalizeText } from './utils.js';

async function init() {
  // Load data
  const data = await loadData();
  if (!data) return;

  // Initialize UI components
  initRouter();
  
  // Search logic
  const searchInput = document.getElementById('searchInput');
  const countrySearchInput = document.getElementById('countrySearchInput');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.search = e.target.value;
      renderTimeline();
    });
  }

  if (countrySearchInput) {
    countrySearchInput.addEventListener('input', (e) => {
      state.search = e.target.value;
      renderCountries();
    });
  }

  // Sidebar toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }

  // Initial render
  renderTimeline();
  buildSidebarContent();
  
  // Set initial view to presentation
  setView('presentation');
}

// Global functions for inline event handlers (if any)
window.showDetail = function(id) {
  const entry = getEventById(id);
  if (!entry) return;
  // Handle detail view logic or navigation
  const url = new URL(window.location.href);
  url.searchParams.set('view', 'detail');
  url.searchParams.set('id', id);
  window.location.href = url.toString();
};

window.showCountryDetail = function(countryId) {
  const country = state.countriesData.find(c => c.id === countryId);
  if (!country) return;
  
  const modalHtml = `
    <div id="countryModal" class="country-modal">
      <div class="country-modal-content">
        <div class="modal-header">
          <span class="close-modal" onclick="closeCountryModal()">&times;</span>
          <h2>${country.flag} ${country.name}</h2>
          <p>Chronologie nationale</p>
        </div>
        <div class="modal-body">
          ${country.events.map(event => `
            <div class="country-event">
              <div class="event-date">${event.date}</div>
              <div class="event-info">
                <strong>${event.name}</strong>
                <p>${event.context}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  setTimeout(() => document.getElementById('countryModal').classList.add('active'), 10);
};

window.closeCountryModal = function() {
  const modal = document.getElementById('countryModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
};

// Start the app
init();
