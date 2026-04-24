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

// Global function to show event detail
window.showDetail = function(id, source = 'timeline') {
  const entry = getEventById(id);
  if (!entry) {
    console.error('Event not found:', id);
    return;
  }
  
  // Store the source for back navigation
  state.detailSource = source;
  
  // Show detail page
  showDetailPage(entry);
};

function showDetailPage(event) {
  const detailPage = document.getElementById('detailPage');
  if (!detailPage) return;
  
  // Get era info for badge
  const era = state.timelineData?.eras.find(e => e.id === event.era);
  const badge = era ? era.icon : '📜';
  
  // Update detail page content
  document.getElementById('detailBadge').textContent = badge;
  document.getElementById('detailCategory').textContent = event.category;
  document.getElementById('detailCategory').className = `detail-category ${getCategoryClass(event.category)}`;
  document.getElementById('detailDate').textContent = event.date;
  document.getElementById('detailTitle').textContent = event.name;
  
  // Summary (use context if available, otherwise generic)
  const summary = event.context || 'Événement historique majeur qui a marqué son époque.';
  document.getElementById('detailSummary').textContent = summary;
  
  // People section
  const peopleSection = document.getElementById('detailPeopleSection');
  const peopleEl = document.getElementById('detailPeople');
  if (event.people && event.people.trim()) {
    peopleEl.textContent = event.people;
    peopleSection.style.display = 'block';
  } else {
    peopleSection.style.display = 'none';
  }
  
  // Context section (additional info if available)
  const contextSection = document.getElementById('detailContextSection');
  const contextEl = document.getElementById('detailContext');
  if (event.context && event.context.length > 100) {
    contextEl.textContent = event.context;
    contextSection.style.display = 'block';
  } else {
    contextSection.style.display = 'none';
  }
  
  // Search links
  const searchQuery = encodeURIComponent(event.name);
  document.getElementById('detailSearchLink').href = `https://www.google.com/search?q=${searchQuery}`;
  
  // Wikipedia link (if we can construct one)
  const wikiLink = document.getElementById('detailWikipediaLink');
  if (event.source?.eventQid) {
    wikiLink.href = `https://fr.wikipedia.org/wiki/Special:EntityPage/${event.source.eventQid}`;
    wikiLink.style.display = 'inline-flex';
  } else {
    wikiLink.style.display = 'none';
  }

  // Press / news article link (if the event provides one)
  const pressLinkEl = document.getElementById('detailPressLink');
  const possiblePressUrl = event.source?.pressUrl || event.source?.articleUrl || event.source?.url || event.pressUrl || event.articleUrl;
  if (possiblePressUrl) {
    pressLinkEl.href = possiblePressUrl;
    pressLinkEl.style.display = 'inline-flex';
  } else {
    pressLinkEl.style.display = 'none';
  }
  
  // Back button handler
  const backBtn = document.getElementById('detailBackBtn');
  backBtn.onclick = () => {
    detailPage.classList.remove('active');
    // Optionally scroll back to the event
    if (state.detailSource === 'timeline') {
      const eventEl = document.querySelector(`[data-id="${event.id}"]`);
      if (eventEl) {
        eventEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (state.detailSource === 'country' && state.detailCountryId) {
      // Re-open country modal at previous country
      window.showCountryDetail(state.detailCountryId);
    }
  };
  
  // Show the detail page
  detailPage.classList.add('active');
  detailPage.scrollTop = 0;
}

function getCategoryClass(category) {
  const normalized = normalizeText(category);
  if (normalized.includes('politique')) return 'cat-politique';
  if (normalized.includes('science')) return 'cat-science';
  if (normalized.includes('culture')) return 'cat-culture';
  if (normalized.includes('exploration')) return 'cat-exploration';
  return 'cat-politique';
}

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
            <div class="country-event" data-event-id="${event.source?.eventQid || ''}" onclick="showCountryEventDetail('${country.id}', '${event.name}', '${event.date}')">
              <div class="event-date">${event.date}</div>
              <div class="event-info">
                <strong>${event.name}</strong>
                <p>${event.context || 'Cliquez pour plus de détails'}</p>
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

window.showCountryEventDetail = function(countryId, eventName, eventDate) {
  const country = state.countriesData.find(c => c.id === countryId);
  if (!country) return;
  
  const event = country.events.find(e => e.name === eventName && e.date === eventDate);
  if (!event) return;
  
  // Close the country modal
  closeCountryModal();
  
  // Create a pseudo-event object for the detail view
  const detailEvent = {
    id: `country-${countryId}-${event.isoDate}`,
    name: event.name,
    date: event.date,
    context: event.context || `Événement important dans l'histoire de ${country.name}.`,
    category: event.category,
    people: '',
    era: 'contemporain',
    source: event.source
  };
  
  // Remember originating country for back navigation
  state.detailCountryId = countryId;
  state.detailSource = 'country';
  showDetailPage(detailEvent);
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
