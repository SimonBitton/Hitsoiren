import { state } from './state.js';

export async function loadData() {
  try {
    const [timelineRes, countriesRes] = await Promise.all([
      fetch('data/timeline.json'),
      fetch('data/countries.json')
    ]);

    state.timelineData = await timelineRes.json();
    state.countriesData = await countriesRes.json();

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
    console.error('Failed to load application data:', error);
    throw error;
  }
}

export function getEventById(id) {
  if (!id || !state.eventById) return null;
  return state.eventById.get(id) || null;
}
