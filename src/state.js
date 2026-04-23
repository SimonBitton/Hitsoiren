export const state = {
  era: 'all',
  type: 'all',
  search: '',
  currentView: 'timeline',
  timelineData: null,
  countriesData: [],
  sidebarOpen: false
};

export const eraConfigs = {
  prehist: { label: 'Préhistoire', icon: '🦴' },
  antiquite: { label: 'Antiquité', icon: '🏛' },
  'moyen-age': { label: 'Moyen Âge', icon: '⚔️' },
  modernes: { label: 'Temps modernes', icon: '🔭' },
  contemporain: { label: 'Époque contemporaine', icon: '⚡' }
};
