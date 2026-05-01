import { state } from './state.js';
import { escapeHtml } from './utils.js';
import { showDetailPage } from './detail-view.js';

export function closeCountryModal() {
  const modal = document.getElementById('countryModal');
  if (!modal) return;
  modal.classList.remove('active');
  setTimeout(() => modal.remove(), 300);
}

function toDetailEvent(country, event) {
  return {
    id: `country-${country.id}-${event.isoDate}`,
    name: event.name,
    date: event.date,
    context: event.context || `Evenement important dans l'histoire de ${country.name}.`,
    category: event.category,
    people: '',
    era: 'contemporain',
    source: event.source
  };
}

export function showCountryEventDetail(countryId, eventIndex) {
  const country = state.countriesData.find((entry) => entry.id === countryId);
  if (!country) return;

  const event = country.events[eventIndex];
  if (!event) return;

  closeCountryModal();
  state.detailCountryId = countryId;
  state.detailSource = 'country';
  showDetailPage(toDetailEvent(country, event));
}

export function showCountryDetail(countryId) {
  const country = state.countriesData.find((entry) => entry.id === countryId);
  if (!country) return;

  const modalHtml = `
    <div id="countryModal" class="country-modal">
      <div class="country-modal-content">
        <div class="modal-header">
          <button class="close-modal" data-action="close-country-modal" aria-label="Fermer">&times;</button>
          <h2>${escapeHtml(country.flag)} ${escapeHtml(country.name)}</h2>
          <p>Chronologie nationale</p>
        </div>
        <div class="modal-body">
          ${country.events.map((event, idx) => `
            <button class="country-event" data-action="country-event" data-country-id="${escapeHtml(country.id)}" data-event-index="${idx}">
              <div class="event-date">${escapeHtml(event.date)}</div>
              <div class="event-info">
                <strong>${escapeHtml(event.name)}</strong>
                <p>${escapeHtml(event.context || 'Cliquez pour plus de details')}</p>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modal = document.getElementById('countryModal');

  modal.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) {
      if (event.target.id === 'countryModal') closeCountryModal();
      return;
    }

    const action = actionTarget.dataset.action;
    if (action === 'close-country-modal') {
      closeCountryModal();
      return;
    }

    if (action === 'country-event') {
      const selectedCountryId = actionTarget.dataset.countryId;
      const eventIndex = Number.parseInt(actionTarget.dataset.eventIndex, 10);
      showCountryEventDetail(selectedCountryId, eventIndex);
    }
  });

  setTimeout(() => modal.classList.add('active'), 10);
}
