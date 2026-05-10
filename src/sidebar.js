import { state } from './state.js';

let timelineObserver = null;

function setActiveLink(targetId) {
  const sidebarLinks = document.getElementById('quickNavLinks');
  if (!sidebarLinks) return;

  sidebarLinks.querySelectorAll('a').forEach((link) => {
    link.classList.toggle('active', link.dataset.target === targetId);
  });
}

export function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  const sidebar = document.getElementById('quickNav');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const main = document.querySelector('main');

  sidebar.classList.toggle('active', state.sidebarOpen);
  sidebarToggle.classList.toggle('active', state.sidebarOpen);
  sidebarToggle.setAttribute('aria-expanded', String(state.sidebarOpen));
  main.classList.toggle('sidebar-open', state.sidebarOpen);
}

function buildTimelineSidebar() {
  const eras = [
    { label: 'Préhistoire', id: 'era-prehist', icon: '🦴' },
    { label: 'Antiquité', id: 'era-antiquite', icon: '🏛' },
    { label: 'Moyen Âge', id: 'era-moyen-age', icon: '⚔️' },
    { label: 'Temps modernes', id: 'era-modernes', icon: '🔭' },
    { label: 'Contemporain', id: 'era-contemporain', icon: '⚡' }
  ];

  return `
    <div class="sidebar-section-label">Époques</div>
    ${eras.map((era) => `<a href="#${era.id}" data-target="${era.id}" data-type="era">${era.icon} ${era.label}</a>`).join('')}
    <a href="#top50-section" data-target="top50-section" data-type="top50">🏆 Top 50</a>
  `;
}

function buildCountriesSidebar() {
  const sorted = [...state.countriesData].sort((left, right) => left.name.localeCompare(right.name, 'fr'));

  let currentLetter = '';
  let html = '<div class="sidebar-section-label">Pays</div>';

  sorted.forEach((country) => {
    const firstLetter = country.name.charAt(0).toUpperCase();
    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      html += `<div class="sidebar-letter">${currentLetter}</div>`;
    }

    html += `
      <a href="#" data-type="country" data-country-id="${country.id}">
        ${country.flag} ${country.name}
        <span class="sidebar-pill">${country.events.length}</span>
      </a>
    `;
  });

  return html;
}

function bindSidebarInteractions(sidebarLinks) {
  sidebarLinks.onclick = (event) => {
    const link = event.target.closest('a');
    if (!link) return;

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
  if (timelineObserver) {
    timelineObserver.disconnect();
    timelineObserver = null;
  }

  if (state.currentView !== 'timeline') return;

  const sections = document.querySelectorAll('.era-section');
  if (!sections.length) return;

  timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActiveLink(entry.target.id);
    });
  }, { rootMargin: '-25% 0px -60% 0px', threshold: 0.05 });

  sections.forEach((section) => timelineObserver.observe(section));
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
