import { state } from './state.js';
import { loadData, getEventById } from './data-manager.js';
import { initRouter, setView } from './router.js';
import { toggleSidebar, buildSidebarContent } from './sidebar.js';
import { renderTimeline, renderCountries, renderStats } from './ui-renderer.js';
import { normalizeText } from './utils.js';

async function init() {
  const statusEl = document.createElement('div');
  statusEl.id = 'loading-status';
  statusEl.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.8);color:white;padding:10px 20px;border-radius:30px;font-size:12px;z-index:9999;pointer-events:none;';
  statusEl.textContent = 'Chargement des données...';
  document.body.appendChild(statusEl);

  // Load data
  try {
    const data = await loadData();
    if (!data || !data.timeline || !data.countries) {
      throw new Error('Données corrompues ou manquantes');
    }
    statusEl.style.display = 'none';
  } catch (error) {
    console.error('Initialization error:', error);
    statusEl.style.background = '#ef4444';
    statusEl.textContent = 'Erreur de chargement: ' + error.message;
    statusEl.style.pointerEvents = 'auto';
    statusEl.style.cursor = 'pointer';
    statusEl.onclick = () => window.location.reload();
    return;
  }


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
  
  // Generate detailed summary (at least 5 lines)
  const detailedSummary = generateDetailedSummary(event);
  document.getElementById('detailSummary').textContent = detailedSummary;
  
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

/**
 * Generates a detailed summary of at least 5 lines for an event
 * @param {Object} event - The event object
 * @returns {string} - A detailed summary text
 */
function generateDetailedSummary(event) {
  const parts = [];
  
  // Line 1: Introduction with date and era
  const era = state.timelineData?.eras.find(e => e.id === event.era);
  const eraName = era ? era.name.toLowerCase() : 'l\'histoire';
  parts.push(`Cet événement s'inscrit dans ${eraName}, plus précisément ${event.date}.`);
  
  // Line 2: Main event description
  parts.push(`${event.name}.`);
  
  // Line 3: Context elaboration
  if (event.context) {
    parts.push(`Contexte : ${event.context}`);
  }
  
  // Line 4: Key figures involvement
  if (event.people && event.people.trim()) {
    parts.push(`Personnages clés impliqués : ${event.people}.`);
  }
  
  // Line 5: Historical significance and impact
  const significance = getHistoricalSignificance(event);
  parts.push(significance);
  
  // Line 6: Additional context about category
  const categoryContext = getCategoryContext(event);
  parts.push(categoryContext);
  
  // Line 7: Legacy and long-term impact
  const legacy = getLegacyStatement(event);
  parts.push(legacy);
  
  return parts.join(' ');
}

/**
 * Gets historical significance statement based on event properties
 */
function getHistoricalSignificance(event) {
  const category = normalizeText(event.category || '');
  const name = normalizeText(event.name || '');
  
  if (event.major) {
    return 'Cet événement majeur a profondément transformé le cours de l\'histoire et ses conséquences se font encore ressentir aujourd\'hui.';
  }
  
  if (category.includes('science')) {
    return 'Cette avancée scientifique a contribué à élargir les connaissances humaines et a ouvert la voie à de nouvelles découvertes.';
  }
  
  if (category.includes('politique')) {
    return 'Cet événement politique a redéfini les équilibres de pouvoir et influencé l\'organisation des sociétés de l\'époque.';
  }
  
  if (category.includes('culture')) {
    return 'Cet accomplissement culturel a enrichi le patrimoine artistique et intellectuel de l\'humanité.';
  }
  
  if (category.includes('exploration')) {
    return 'Cette exploration a repoussé les frontières du monde connu et permis de nouvelles connexions entre civilisations.';
  }
  
  return 'Cet événement a marqué son époque et constitue un jalon important dans la compréhension de cette période historique.';
}

/**
 * Gets category-specific context
 */
function getCategoryContext(event) {
  const category = normalizeText(event.category || '');
  const era = event.era || '';
  
  if (era === 'prehist') {
    return 'À cette époque reculée, les humains développaient progressivement des techniques et des organisations sociales qui allaient poser les fondations des civilisations futures.';
  }
  
  if (era === 'antiquite') {
    return 'Durant l\'Antiquité, les grandes civilisations établissaient les bases de la philosophie, des sciences, du droit et de l\'organisation politique qui influencent encore notre monde.';
  }
  
  if (era === 'moyen-age') {
    return 'Au Moyen Âge, entre transformations politiques, avancées techniques et échanges culturels, se construisaient les nations et les identités européennes.';
  }
  
  if (era === 'modernes') {
    return 'Les Temps Modernes voient l\'émergence de nouvelles conceptions du monde, des révolutions scientifiques et politiques qui façonnent la modernité.';
  }
  
  if (era === 'contemporain') {
    return 'L\'époque contemporaine est marquée par des transformations accélérées, des conflits mondiaux, des révolutions technologiques et une mondialisation sans précédent.';
  }
  
  return 'Cet événement s\'inscrit dans un contexte historique plus large de transformations sociales, politiques et culturelles.';
}

/**
 * Gets legacy statement
 */
function getLegacyStatement(event) {
  const name = event.name || '';
  
  if (name.toLowerCase().includes('invention') || name.toLowerCase().includes('découverte')) {
    return 'Cette innovation a eu des répercussions durables et continue d\'influencer notre vie quotidienne.';
  }
  
  if (name.toLowerCase().includes('bataille') || name.toLowerCase().includes('guerre')) {
    return 'Les conséquences de ce conflit ont redessiné la carte politique et laissé une empreinte indélébile dans la mémoire collective.';
  }
  
  if (name.toLowerCase().includes('naissance') || name.toLowerCase().includes('mort')) {
    return 'La vie et l\'œuvre de cette personne ont eu un impact profond sur l\'histoire des idées et des civilisations.';
  }
  
  return 'Son héritage perdure à travers les siècles et continue d\'inspirer les générations futures.';
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
