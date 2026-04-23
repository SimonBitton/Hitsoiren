import { state } from './state.js';

export async function loadData() {
  try {
    const [timelineRes, countriesRes] = await Promise.all([
      fetch('data/timeline.json'),
      fetch('data/countries.json')
    ]);
    
    state.timelineData = await timelineRes.json();
    state.countriesData = await countriesRes.json();
    
    return { 
      timeline: state.timelineData, 
      countries: state.countriesData 
    };
  } catch (error) {
    console.error('Failed to load application data:', error);
    return null;
  }
}

export function getEventById(id) {
  if (!state.timelineData) return null;
  return state.timelineData.events.find(e => e.id === id) || null;
}
