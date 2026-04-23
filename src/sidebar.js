import { state } from './state.js';
import { showCountryDetail } from './main.js';

export function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const main = document.querySelector('main');
  
  sidebar.classList.toggle('active', state.sidebarOpen);
  sidebarToggle.classList.toggle('active', state.sidebarOpen);
  main.classList.toggle('sidebar-open', state.sidebarOpen);
}

export function buildSidebarContent() {
  const sidebarContent = document.getElementById('sidebarContent');
  if (!sidebarContent) return;

  let sections = [];
  
  if (state.currentView === 'timeline') {
    sections = [
      {
        title: '📜 Époques',
        items: [
          { label: 'Préhistoire', id: 'era-prehist' },
          { label: 'Antiquité', id: 'era-antiquite' },
          { label: 'Moyen Âge', id: 'era-moyen-age' },
          { label: 'Temps modernes', id: 'era-modernes' },
          { label: 'Époque contemporaine', id: 'era-contemporain' }
        ]
      }
    ];
  } else if (state.currentView === 'countries') {
    sections = [
      {
        title: '🌍 Liste des Pays',
        items: state.countriesData.map(c => ({ label: `${c.flag} ${c.name}`, id: c.id, type: 'country' }))
      }
    ];
  }

  sidebarContent.innerHTML = sections.map(section => `
    <div class="sidebar-section">
      <div class="sidebar-section-title">${section.title}</div>
      <div class="sidebar-items">
        ${section.items.map(item => `
          <div class="sidebar-item" data-target="${item.id}" data-type="${item.type || ''}">${item.label}</div>
        `).join('')}
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.target;
      const type = item.dataset.type;
      
      if (type === 'country') {
        showCountryDetail(targetId);
        if (window.innerWidth < 900) toggleSidebar();
        return;
      }
      
      const target = document.getElementById(targetId);
      if (target) {
        if (window.innerWidth < 900) toggleSidebar();
        
        // "Teleportation" effect: Use 'instant' or 'auto' behavior for scrolling
        // especially for dates further down the list.
        const isRecent = targetId === 'era-contemporain';
        target.scrollIntoView({ 
          behavior: isRecent ? 'instant' : 'smooth', 
          block: 'start' 
        });
      }
    });
  });
}
