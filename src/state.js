export const state = {
  era: 'all',
  type: 'all',
  search: '',
  currentView: 'timeline',
  timelineData: null,
  countriesData: [],
  eventById: null,
  sidebarOpen: false,
  detailSource: 'timeline',
  detailCountryId: null
};

export const eraConfigs = {
  prehist: { label: 'Prehistoire', icon: '🦴' },
  antiquite: { label: 'Antiquite', icon: '🏛' },
  'moyen-age': { label: 'Moyen Age', icon: '⚔️' },
  modernes: { label: 'Temps modernes', icon: '🔭' },
  contemporain: { label: 'Epoque contemporaine', icon: '⚡' }
};
