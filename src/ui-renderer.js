import { state, eraConfigs } from './state.js';
import { escapeHtml, getCategoryClass, normalizeText } from './utils.js';

export function renderTimeline() {
  const container = document.getElementById('view-timeline');
  if (!container || !state.timelineData) return;

  const search = normalizeText(state.search);
  
  const html = state.timelineData.eras.map(era => {
    const eraEvents = state.timelineData.events.filter(e => 
      e.era === era.id && 
      (search === '' || normalizeText(`${e.name} ${e.context}`).includes(search))
    );

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
          ${eraEvents.map(event => `
            <div class="event ${event.major ? 'major' : ''}" data-id="${event.id}" onclick="showDetail('${event.id}')">
              <div class="event-dot"></div>
              <div class="event-content">
                <span class="event-date">${escapeHtml(event.date)}</span>
                <div class="event-text">
                  <span class="event-name">${escapeHtml(event.name)}</span>
                  <span class="event-context">${escapeHtml(event.context)}</span>
                  ${event.people ? `<span class="event-people">${escapeHtml(event.people)}</span>` : ''}
                </div>
                <span class="event-cat ${getCategoryClass(event.category)}">${escapeHtml(event.category)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }).join('');

  container.innerHTML = html;
}

export function renderCountries() {
  const container = document.getElementById('countriesGrid');
  if (!container || !state.countriesData) return;

  const search = normalizeText(state.search);
  const filtered = state.countriesData.filter(c => 
    normalizeText(c.name).includes(search)
  );

  container.innerHTML = filtered.map(country => `
    <div class="country-card" onclick="showCountryDetail('${country.id}')">
      <div class="country-flag">${country.flag}</div>
      <div class="country-info">
        <h3>${country.name}</h3>
        <p>${country.events.length} Événements</p>
      </div>
    </div>
  `).join('');
}

export function renderStats() {
  const container = document.getElementById('statsContent');
  if (!container) return;

  const totalEvents = state.timelineData?.events.length || 0;
  const totalCountries = state.countriesData.length;
  
  // Calculate more stats as requested
  const categories = {};
  state.timelineData?.events.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + 1;
  });

  const eraStats = {};
  state.timelineData?.events.forEach(e => {
    eraStats[e.era] = (eraStats[e.era] || 0) + 1;
  });

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <strong>${totalEvents}</strong>
        <span>Événements chronologiques</span>
      </div>
      <div class="stat-card">
        <strong>${totalCountries}</strong>
        <span>Pays documentés</span>
      </div>
      <div class="stat-card">
        <strong>${Object.keys(categories).length}</strong>
        <span>Catégories thématiques</span>
      </div>
      <div class="stat-card">
        <strong>${state.timelineData?.eras.length || 0}</strong>
        <span>Grandes Époques</span>
      </div>
    </div>
    
    <div class="stats-extra">
      <h3>Répartition par catégorie</h3>
      <div class="stats-grid" style="margin-top: 1rem;">
        ${Object.entries(categories).map(([cat, count]) => `
          <div class="stat-card" style="padding: 1rem;">
            <strong style="font-size: 1.5rem;">${count}</strong>
            <span style="font-size: 0.7rem;">${cat}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="stats-extra" style="margin-top: 2rem;">
      <h3>Événements par Époque</h3>
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
