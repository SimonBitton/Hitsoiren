import { state, eraConfigs } from './state.js';
import { compareHistoricalDates, escapeHtml, getCategoryClass, getCategoryLabel, normalizeText } from './utils.js';

function groupEventsByEra(events, search) {
  const grouped = new Map();
  for (const event of events) {
    if (search && !normalizeText(`${event.name} ${event.context}`).includes(search)) {
      continue;
    }
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
  const groupedByEra = groupEventsByEra(state.timelineData.events, search);

  let html = state.timelineData.eras.map((era) => {
    const eraEvents = groupedByEra.get(era.id) || [];
    if (eraEvents.length === 0 && search !== '') return '';

    return `
      <section class="era-section" id="era-${era.id}">
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

  if (search === '' && state.timelineData.events.length > 0) {
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
}

export function renderCountries() {
  const container = document.getElementById('countriesGrid');
  if (!container || !state.countriesData) return;

  const search = normalizeText(state.countrySearch);
  const filtered = state.countriesData.filter((country) => normalizeText(country.name).includes(search));

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
