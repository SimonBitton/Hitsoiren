import { readAppState } from './app-state.js';

const persistedAppState = readAppState();

export const state = {
  era: 'all',
  type: 'all',
  timelineSearch: '',
  timelineEra: 'all',
  timelineTheme: 'all',
  countrySearch: '',
  worldMapRegion: 'ameriques',
  countryContinent: 'all',
  currentView: persistedAppState.lastView || 'presentation',
  timelineData: null,
  countriesData: [],
  eventById: null,
  sidebarOpen: false,
  detailSource: 'timeline',
  detailCountryId: null,
  hasVisited: Boolean(persistedAppState.hasVisited),
  onboardingSeen: Boolean(persistedAppState.onboardingSeen)
};

export const eraConfigs = {
  prehist: { label: 'Préhistoire', icon: '🦴' },
  antiquite: { label: 'Antiquité', icon: '🏛' },
  'moyen-age': { label: 'Moyen Âge', icon: '⚔️' },
  modernes: { label: 'Temps modernes', icon: '🔭' },
  contemporain: { label: 'Epoque contemporaine', icon: '⚡' }
};
