import { state } from './state.js';

const eventGroups = [
  { id: 'guerre-cent-ans', emoji: '⚔️', label: 'Guerre de Cent Ans', dates: '1337-1453', events: [{ date: '24 mai 1337', label: 'Debut officiel' }, { date: '26 aout 1346', label: 'Bataille de Crecy' }, { date: '19 septembre 1356', label: 'Bataille de Poitiers' }, { date: '8 mai 1360', label: 'Traite de Bretigny' }, { date: '25 octobre 1415', label: "Bataille d'Azincourt" }, { date: '8 mai 1429', label: "Liberation d'Orleans" }, { date: '30 mai 1431', label: "Mort de Jeanne d'Arc" }, { date: '17 juillet 1453', label: 'Fin de la guerre' }] },
  { id: 'peste-noire', emoji: '🦠', label: 'Peste noire', dates: '1347-1351', events: [{ date: 'Octobre 1347', label: 'Arrivee en Messine' }, { date: 'Janvier 1348', label: 'Propagation majeure' }, { date: 'Milieu 1349', label: 'Pic de mortalite' }, { date: 'Fin 1351', label: "Fin principale de l'epidemie" }] },
  { id: 'magellan', emoji: '🌍', label: 'Voyage de Magellan', dates: '1519-1522', events: [{ date: '20 septembre 1519', label: 'Depart' }, { date: '21 octobre 1520', label: 'Detroit de Magellan' }, { date: '27 avril 1521', label: 'Mort aux Philippines' }, { date: '6 septembre 1522', label: 'Retour en Espagne' }] },
  { id: 'premiere-guerre-mondiale', emoji: '💂', label: 'Premiere Guerre mondiale', dates: '1914-1918', events: [{ date: '28 juin 1914', label: 'Assassinat de Francois-Ferdinand' }, { date: '28 juillet 1914', label: 'Debut officiel' }, { date: '21 fevrier 1916', label: 'Debut de Verdun' }, { date: '6 avril 1917', label: 'Entree des Etats-Unis' }, { date: '11 novembre 1918', label: 'Armistice' }] },
  { id: 'seconde-guerre-mondiale', emoji: '⚡', label: 'Seconde Guerre mondiale', dates: '1939-1945', events: [{ date: '1er septembre 1939', label: 'Invasion de la Pologne' }, { date: '7 decembre 1941', label: 'Attaque de Pearl Harbor' }, { date: '6 juin 1944', label: 'Debarquement' }, { date: '8 mai 1945', label: 'Fin en Europe' }, { date: '2 septembre 1945', label: 'Capitulation du Japon' }] },
  { id: 'guerre-froide', emoji: '❄️', label: 'Guerre froide', dates: '1947-1991', events: [{ date: '12 mars 1947', label: 'Doctrine Truman' }, { date: '4 avril 1949', label: "Creation de l'OTAN" }, { date: '16 octobre 1962', label: 'Crise de Cuba' }, { date: '9 novembre 1989', label: 'Chute du Mur de Berlin' }, { date: '26 decembre 1991', label: "Fin de l'URSS" }] },
  { id: 'covid-19', emoji: '🦠', label: 'COVID-19', dates: '2019-2023', events: [{ date: 'Decembre 2019', label: 'Premiers cas' }, { date: '11 mars 2020', label: 'Pandemie declaree' }, { date: 'Decembre 2020', label: 'Premiers vaccins' }, { date: '5 mai 2023', label: "Fin de l'urgence mondiale" }] }
];

function setActiveLink(targetId) {
  const sidebarLinks = document.getElementById('quickNavLinks');
  if (!sidebarLinks) return;
  sidebarLinks.querySelectorAll('a').forEach((link) => {
    const isActive = link.dataset.target === targetId;
    link.classList.toggle('active', isActive);
  });
}

export function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  const sidebar = document.getElementById('quickNav');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const main = document.querySelector('main');

  sidebar.classList.toggle('active', state.sidebarOpen);
  sidebarToggle.classList.toggle('active', state.sidebarOpen);
  main.classList.toggle('sidebar-open', state.sidebarOpen);
}

function buildTimelineSidebar() {
  const eras = [
    { label: 'Prehistoire', id: 'era-prehist', icon: '🦴' },
    { label: 'Antiquite', id: 'era-antiquite', icon: '🏛' },
    { label: 'Moyen Age', id: 'era-moyen-age', icon: '⚔️' },
    { label: 'Temps modernes', id: 'era-modernes', icon: '🔭' },
    { label: 'Contemporain', id: 'era-contemporain', icon: '⚡' }
  ];

  return `
    <div class="sidebar-section-label">Epoques</div>
    ${eras.map((era) => `<a href="#${era.id}" data-target="${era.id}" data-type="era">${era.icon} ${era.label}</a>`).join('')}
    <div class="sidebar-divider"></div>
    <div class="sidebar-section-label">Repères historiques</div>
    ${eventGroups.map((group) => `
      <div class="event-group" data-group-id="${group.id}">
        <button class="event-group-header" data-action="toggle-group" data-group="${group.id}">
          <span><span class="event-group-emoji">${group.emoji}</span>${group.label}<span class="event-group-dates">${group.dates}</span></span>
          <svg class="event-group-toggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="event-group-content" id="group-content-${group.id}">
          ${group.events.map((event) => `<a href="#" data-target="${group.id}" data-type="historical-note">${event.date} : ${event.label}</a>`).join('')}
        </div>
      </div>
    `).join('')}
    <a href="#top50-section" data-target="top50-section" data-type="top50">🏆 Top 50</a>
  `;
}

function buildCountriesSidebar() {
  return state.countriesData.map((country) => `
    <a href="#" data-type="country" data-country-id="${country.id}">${country.flag} ${country.name}</a>
  `).join('');
}

function bindSidebarInteractions(sidebarLinks) {
  sidebarLinks.onclick = (event) => {
    const link = event.target.closest('a,button');
    if (!link) return;

    const action = link.dataset.action;
    if (action === 'toggle-group') {
      const groupId = link.dataset.group;
      const content = document.getElementById(`group-content-${groupId}`);
      const isOpen = content.classList.contains('open');
      content.classList.toggle('open', !isOpen);
      link.classList.toggle('active', !isOpen);
      return;
    }

    const type = link.dataset.type;
    if (!type) return;
    event.preventDefault();

    if (type === 'era' || type === 'top50') {
      const targetId = link.dataset.target;
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveLink(targetId);
      }
    }

    if (type === 'country' && window.showCountryDetail) {
      window.showCountryDetail(link.dataset.countryId);
      setActiveLink('');
      link.classList.add('active');
    }

    if (window.innerWidth < 1024 && state.sidebarOpen) toggleSidebar();
  };
}

function watchTimelineSections() {
  if (state.currentView !== 'timeline') return;
  const sections = document.querySelectorAll('.era-section');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setActiveLink(entry.target.id);
    });
  }, { rootMargin: '-25% 0px -60% 0px', threshold: 0.05 });

  sections.forEach((section) => observer.observe(section));
}

export function buildSidebarContent() {
  const sidebarLinks = document.getElementById('quickNavLinks');
  if (!sidebarLinks) return;

  if (state.currentView === 'timeline') {
    sidebarLinks.innerHTML = buildTimelineSidebar();
  } else if (state.currentView === 'countries') {
    sidebarLinks.innerHTML = buildCountriesSidebar();
  } else {
    sidebarLinks.innerHTML = '';
  }

  bindSidebarInteractions(sidebarLinks);
  watchTimelineSections();
}
