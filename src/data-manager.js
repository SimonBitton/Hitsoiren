import { state } from './state.js';
import { mergeTimelineEvents } from './utils.js';

export async function loadData() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);
  try {
    const [timelineRes, countriesRes] = await Promise.all([
      fetch('data/timeline.json', { signal: controller.signal }),
      fetch('data/countries.json', { signal: controller.signal })
    ]);

    if (!timelineRes.ok || !countriesRes.ok) {
      throw new Error(`Erreur HTTP (${timelineRes.status}/${countriesRes.status}) lors du chargement des données.`);
    }

    const timelineData = await timelineRes.json();
    const countriesData = await countriesRes.json();
    if (!timelineData || !Array.isArray(timelineData.events) || !Array.isArray(timelineData.eras)) {
      throw new Error('Structure invalide pour timeline.json');
    }
    if (!Array.isArray(countriesData)) {
      throw new Error('Structure invalide pour countries.json');
    }

    state.timelineData = {
      ...timelineData,
      events: mergeTimelineEvents(timelineData.events)
    };
    state.countriesData = countriesData;

    if (state.timelineData && Array.isArray(state.timelineData.events)) {
      state.eventById = new Map();
      state.timelineData.events.forEach((event, idx) => {
        if (!event.id) event.id = `evt-${idx}`;
        state.eventById.set(event.id, event);
      });
    }

    return {
      timeline: state.timelineData,
      countries: state.countriesData
    };
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Le chargement des données a expiré. Vérifiez votre connexion puis rechargez la page.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function getEventById(id) {
  if (!id || !state.eventById) return null;
  return state.eventById.get(id) || null;
}
