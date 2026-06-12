export const state = {
  era: 'all',
  type: 'all',
  timelineSearch: '',
  timelineEra: 'all',
  timelineTheme: 'all',
  countrySearch: '',
  currentView: 'timeline',
  timelineData: null,
  countriesData: [],
  eventById: null,
  sidebarOpen: false,
  detailSource: 'timeline',
  detailCountryId: null
};

export const eraConfigs = {
  prehist: { label: 'Préhistoire', icon: '🦴' },
  antiquite: { label: 'Antiquité', icon: '🏛' },
  'moyen-age': { label: 'Moyen Âge', icon: '⚔️' },
  modernes: { label: 'Temps modernes', icon: '🔭' },
  contemporain: { label: 'Epoque contemporaine', icon: '⚡' }
};
