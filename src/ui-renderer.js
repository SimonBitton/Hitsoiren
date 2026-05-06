import { state, eraConfigs } from './state.js';
import { escapeHtml, estimateYearFromText, normalizeText } from './utils.js';

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
      const leftYear = estimateYearFromText(left.date);
      const rightYear = estimateYearFromText(right.date);
      if (leftYear == null && rightYear == null) return 0;
      if (leftYear == null) return 1;
      if (rightYear == null) return -1;
      return leftYear - rightYear;
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

  const search = normalizeText(state.search);
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
            <p>Les evenements qui ont le plus marque l'histoire de l'humanite</p>
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
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  // Utiliser requestAnimationFrame pour éviter les forces-repaints
  if (window.requestAnimationFrame) {
    requestAnimationFrame(() => {
      container.innerHTML = html;
      bindTimelineClicks(container);
    });
  } else {
    // Fallback pour les vieux navigateurs
    container.innerHTML = html;
    bindTimelineClicks(container);
  }
}

export function renderCountries() {
  const container = document.getElementById('countriesGrid');
  if (!container || !state.countriesData) return;

  const search = normalizeText(state.search);
  const filtered = state.countriesData.filter((country) => normalizeText(country.name).includes(search));

  container.innerHTML = filtered.map((country) => `
    <div class="country-card" data-country-id="${country.id}">
      <div class="country-flag">${country.flag}</div>
      <div class="country-info">
        <h3>${country.name}</h3>
        <p>${country.events.length} Evenements</p>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.country-card').forEach((card) => {
    card.addEventListener('click', () => {
      const countryId = card.dataset.countryId;
      if (countryId && window.showCountryDetail) window.showCountryDetail(countryId);
    });
  });
}

export function renderStats() {
  const container = document.getElementById('presentationStats');
  if (!container) return;

  const totalEvents = state.timelineData?.events.length || 0;
  const totalCountries = state.countriesData?.length || 0;

  const eraStats = {};
  state.timelineData?.events.forEach((event) => {
    eraStats[event.era] = (eraStats[event.era] || 0) + 1;
  });

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><strong>${totalEvents}</strong><span>Evenements chronologiques</span></div>
      <div class="stat-card"><strong>${totalCountries}</strong><span>Pays documentes</span></div>
      <div class="stat-card"><strong>${state.timelineData?.eras.length || 0}</strong><span>Grandes Epoques</span></div>
    </div>
    <div class="stats-extra" style="margin-top: 2rem;">
      <h3>Evenements par epoque</h3>
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
