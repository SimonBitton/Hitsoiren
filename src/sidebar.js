import { state } from './state.js';

export function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  const sidebar = document.getElementById('quickNav');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const main = document.querySelector('main');
  
  sidebar.classList.toggle('active', state.sidebarOpen);
  sidebarToggle.classList.toggle('active', state.sidebarOpen);
  main.classList.toggle('sidebar-open', state.sidebarOpen);
}

export function buildSidebarContent() {
  const sidebarLinks = document.getElementById('quickNavLinks');
  if (!sidebarLinks) return;

  let links = [];
  
  if (state.currentView === 'timeline') {
    links = [
      { label: 'Préhistoire', id: 'era-prehist' },
      { label: 'Antiquité', id: 'era-antiquite' },
      { label: 'Moyen Âge', id: 'era-moyen-age' },
      { label: 'Temps modernes', id: 'era-modernes' },
      { label: 'Contemporain', id: 'era-contemporain' },
      { label: '🏆 Top 50', id: 'top50-section', type: 'top50' }
    ];
  } else if (state.currentView === 'countries') {
    links = state.countriesData.map(c => ({ 
      label: `${c.flag} ${c.name}`, 
      id: c.id, 
      type: 'country' 
    }));
  }

  sidebarLinks.innerHTML = links.map(link => `
    <a href="#${link.id}" data-target="${link.id}" data-type="${link.type || ''}">${link.label}</a>
  `).join('');

  // Add click handlers
  sidebarLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.dataset.target;
      const type = link.dataset.type;
      
      // Remove active class from all links
      sidebarLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      // Add active class to clicked link
      link.classList.add('active');
      
      if (type === 'country') {
        // Scroll to country card instead of showing modal
        const countryCard = document.querySelector(`.country-card[data-country-id="${targetId}"]`);
        if (countryCard) {
          if (window.innerWidth < 1024) toggleSidebar();
          countryCard.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Highlight the card temporarily
          countryCard.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
          countryCard.style.boxShadow = '0 0 0 3px var(--accent), 0 0 20px rgba(0, 113, 227, 0.3)';
          countryCard.style.transform = 'scale(1.02)';
          setTimeout(() => {
            countryCard.style.boxShadow = '';
            countryCard.style.transform = '';
          }, 1500);
        }
        return;
      }
      
      if (type === 'top50') {
        // Scroll to Top 50 section
        const top50Section = document.getElementById('top50-section');
        if (top50Section) {
          if (window.innerWidth < 1024) toggleSidebar();
          top50Section.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
        return;
      }
      
      const target = document.getElementById(targetId);
      if (target) {
        if (window.innerWidth < 1024) toggleSidebar();
        
        target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    });
  });
}
