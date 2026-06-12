import { state, eraConfigs } from './state.js';
import { compareHistoricalDates, escapeHtml, getCategoryClass, getCategoryLabel, normalizeText, eventMatchesSearch, THEME_DEFINITIONS } from './utils.js';
import { renderFriseBand } from './frise.js';
import { renderWorldMap } from './worldmap.js';
import { getContinentOf, getContinentMeta } from './continents.js';

function passesFilters(event, search) {
  if (state.timelineEra !== 'all' && event.era !== state.timelineEra) return false;
  if (state.timelineTheme !== 'all' && !(event._themes || []).includes(state.timelineTheme)) return false;
  return eventMatchesSearch(event, search);
}

function groupEventsByEra(events, search) {
  const grouped = new Map();
  for (const event of events) {
    if (!passesFilters(event, search)) continue;
    if (!grouped.has(event.era)) grouped.set(event.era, []);
    grouped.get(event.era).push(event);
  }
  for (const [, eraEvents] of grouped) {
    eraEvents.sort((left, right) => {
      return compareHistoricalDates(left.date, right.date);
    });
  }
  return grouped;
}

function hasActiveFilters(search) {
  return Boolean(search) || state.timelineEra !== 'all' || state.timelineTheme !== 'all';
}

function renderFilterBar() {
  const eras = [{ id: 'all', name: 'Toutes', icon: '✨' }, ...(state.timelineData?.eras || [])];
  const themes = [{ key: 'all', label: 'Tous', icon: '✨' }, ...THEME_DEFINITIONS];

  const eraChips = eras.map((era) => `
    <button class="filter-chip ${state.timelineEra === era.id ? 'active' : ''}" data-filter="era" data-value="${era.id}" type="button">
      <span aria-hidden="true">${era.icon || ''}</span> ${escapeHtml(era.name)}
    </button>
  `).join('');

  const themeChips = themes.map((theme) => `
    <button class="filter-chip ${state.timelineTheme === theme.key ? 'active' : ''}" data-filter="theme" data-value="${theme.key}" type="button">
      <span aria-hidden="true">${theme.icon || ''}</span> ${escapeHtml(theme.label)}
    </button>
  `).join('');

  return `
    <div class="filter-bar" id="timelineFilterBar">
      <div class="filter-row">
        <span class="filter-label">Époque</span>
        <div class="filter-chips">${eraChips}</div>
      </div>
      <div class="filter-row">
        <span class="filter-label">Thème</span>
        <div class="filter-chips">${themeChips}</div>
      </div>
    </div>
  `;
}

function bindFilterBar(container) {
  const bar = container.querySelector('#timelineFilterBar');
  if (!bar) return;
  bar.addEventListener('click', (event) => {
    const chip = event.target.closest('.filter-chip');
    if (!chip) return;
    const { filter, value } = chip.dataset;
    if (filter === 'era') state.timelineEra = value;
    if (filter === 'theme') state.timelineTheme = value;
    renderTimeline();
  });
}

function bindTimelineClicks(container) {
  container.onclick = (event) => {
    const eventCard = event.target.closest('.event');
    if (!eventCard) return;
    const eventId = eventCard.dataset.id;
    if (eventId && window.showDetail) window.showDetail(eventId);
  };
}

export function renderTimeline() {
  const container = document.getElementById('timelineContent');
  if (!container || !state.timelineData) return;

  const search = normalizeText(state.timelineSearch);
  const filtersActive = hasActiveFilters(search);
  const groupedByEra = groupEventsByEra(state.timelineData.events, search);
  const filteredFlat = [...groupedByEra.values()].flat();
  const totalMatches = filteredFlat.length;

  let html = renderFilterBar();
  html += '<div id="friseBandSlot"></div>';

  if (filtersActive) {
    html += `<p class="filter-result-count" role="status">${totalMatches} événement${totalMatches > 1 ? 's' : ''} trouvé${totalMatches > 1 ? 's' : ''}</p>`;
  }

  html += state.timelineData.eras.map((era) => {
    const eraEvents = groupedByEra.get(era.id) || [];
    if (eraEvents.length === 0 && filtersActive) return '';

    return `
      <section class="era-section reveal" id="era-${era.id}">
        <div class="era-header">
          <div class="era-badge">${era.icon}</div>
          <div class="era-title-block">
            <h2>${era.name}</h2>
            <p>${era.subtitle}</p>
          </div>
        </div>
        <div class="events-list">
          ${eraEvents.map((event) => `
            <div class="event ${event.major ? 'major' : ''}" data-id="${event.id}">
              <div class="event-dot"></div>
              <div class="event-content">
                <span class="event-date">${escapeHtml(event.date)}</span>
                <div class="event-text">
                  <span class="event-name">${escapeHtml(event.name)}</span>
                  <span class="event-context">${escapeHtml(event.context)}</span>
                  ${event.people ? `<span class="event-people">${escapeHtml(event.people)}</span>` : ''}
                </div>
                <span class="event-cat ${getCategoryClass(event.category)}">${escapeHtml(getCategoryLabel(event.category))}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }).join('');

  if (filtersActive && totalMatches === 0) {
    html += '<p class="empty-state">Aucun événement ne correspond à ces critères. Essayez d\'élargir vos filtres.</p>';
  }

  if (!filtersActive && state.timelineData.events.length > 0) {
    const majorEvents = state.timelineData.events.filter((event) => event.major);
    const nonMajorEvents = state.timelineData.events.filter((event) => !event.major);

    const sortedEvents = [...majorEvents, ...nonMajorEvents]
      .sort((left, right) => {
        const eraOrder = ['prehist', 'antiquite', 'moyen-age', 'modernes', 'contemporain'];
        const leftMajor = left.major ? 1 : 0;
        const rightMajor = right.major ? 1 : 0;
        if (leftMajor !== rightMajor) return rightMajor - leftMajor;
        return eraOrder.indexOf(left.era) - eraOrder.indexOf(right.era);
      })
      .slice(0, 50);

    html += `
      <section class="era-section top50-section" id="top50-section">
        <div class="era-header">
          <div class="era-badge">🏆</div>
          <div class="era-title-block">
            <h2>Top 50 des Dates les Plus Importantes</h2>
            <p>Les événements qui ont le plus marqué l'histoire de l'humanité</p>
          </div>
        </div>
        <div class="events-list top50-list">
          ${sortedEvents.map((event, index) => `
            <div class="event top50-event ${event.major ? 'major' : ''}" data-id="${event.id}">
              <div class="event-dot"></div>
              <div class="event-content">
                <span class="top50-rank">#${index + 1}</span>
                <span class="event-date">${escapeHtml(event.date)}</span>
                <div class="event-text">
                  <span class="event-name">${escapeHtml(event.name)}</span>
                  <span class="event-context">${escapeHtml(event.context)}</span>
                  ${event.people ? `<span class="event-people">${escapeHtml(event.people)}</span>` : ''}
                </div>
                <span class="event-cat ${getCategoryClass(event.category)}">${escapeHtml(getCategoryLabel(event.category))}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  container.innerHTML = html;
  bindTimelineClicks(container);
  bindFilterBar(container);
  renderFriseBand(document.getElementById('friseBandSlot'), filteredFlat);
  observeReveals(container);
}

let revealObserver = null;
function observeReveals(container) {
  if (revealObserver) revealObserver.disconnect();
  if (!('IntersectionObserver' in window)) {
    container.querySelectorAll('.reveal').forEach((el) => el.classList.add('revealed'));
    return;
  }
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
  container.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
}

export function renderCountries() {
  const container = document.getElementById('countriesGrid');
  if (!container || !state.countriesData) return;

  renderWorldMap(document.getElementById('worldMapContainer'));
  renderContinentBanner();

  const search = normalizeText(state.countrySearch);
  const filtered = state.countriesData.filter((country) => {
    if (state.countryContinent !== 'all' && getContinentOf(country.name) !== state.countryContinent) return false;
    return normalizeText(country.name).includes(search);
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucun pays ne correspond à votre recherche.</p>';
    container.onclick = null;
    return;
  }

  container.innerHTML = filtered.map((country) => `
    <button class="country-card" type="button" data-country-id="${country.id}" aria-label="Ouvrir la chronologie de ${escapeHtml(country.name)}">
      <div class="country-flag">${country.flag}</div>
      <div class="country-info">
        <h3>${escapeHtml(country.name)}</h3>
        <p>${country.events.length} Événements</p>
      </div>
    </button>
  `).join('');

  container.onclick = (event) => {
    const card = event.target.closest('.country-card');
    if (!card) return;
    const countryId = card.dataset.countryId;
    if (countryId && window.showCountryDetail) window.showCountryDetail(countryId);
  };
}

function renderContinentBanner() {
  const banner = document.getElementById('continentBanner');
  if (!banner) return;
  if (state.countryContinent === 'all') {
    banner.hidden = true;
    banner.innerHTML = '';
    return;
  }
  const meta = getContinentMeta(state.countryContinent);
  const count = state.countriesData.filter((c) => getContinentOf(c.name) === state.countryContinent).length;
  banner.hidden = false;
  banner.innerHTML = `
    <span class="continent-banner-label">${meta?.emoji || '🌍'} ${escapeHtml(meta?.label || '')} · ${count} pays</span>
    <button class="continent-banner-reset" type="button" data-continent-reset>✕ Voir tous les pays</button>
  `;
  banner.querySelector('[data-continent-reset]')?.addEventListener('click', () => {
    state.countryContinent = 'all';
    renderCountries();
  });
}

export function renderStats() {
  const container = document.getElementById('presentationStats');
  if (!container) return;

  const totalEvents = state.timelineData?.events.length || 0;
  const totalCountries = state.countriesData?.length || 0;

  const categories = {};
  state.timelineData?.events.forEach((event) => {
    const mapped = getCategoryLabel(event.category);
    categories[mapped] = (categories[mapped] || 0) + 1;
  });

  const eraStats = {};
  state.timelineData?.events.forEach((event) => {
    eraStats[event.era] = (eraStats[event.era] || 0) + 1;
  });

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><strong>${totalEvents}</strong><span>Événements chronologiques</span></div>
      <div class="stat-card"><strong>${totalCountries}</strong><span>Pays documentés</span></div>
      <div class="stat-card"><strong>${Object.keys(categories).length}</strong><span>Catégories thématiques</span></div>
      <div class="stat-card"><strong>${state.timelineData?.eras.length || 0}</strong><span>Grandes époques</span></div>
    </div>
    <div class="stats-extra">
      <h3>Répartition par catégorie</h3>
      <div class="stats-grid" style="margin-top: 1rem;">
        ${Object.entries(categories).map(([category, count]) => `
          <div class="stat-card" style="padding: 1rem;">
            <strong style="font-size: 1.5rem;">${count}</strong>
            <span style="font-size: 0.7rem;">${category}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="stats-extra" style="margin-top: 2rem;">
      <h3>Événements par époque</h3>
      <div class="stats-grid" style="margin-top: 1rem;">
        ${Object.entries(eraStats).map(([era, count]) => `
          <div class="stat-card" style="padding: 1rem;">
            <strong style="font-size: 1.5rem;">${count}</strong>
            <span style="font-size: 0.7rem;">${eraConfigs[era]?.label || era}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
