// ═══════════════════════════════════════════════════════════════
// DONNÉES PAYS + SIDEBAR — tous les pays avec drapeau
// ═══════════════════════════════════════════════════════════════

const ALL_COUNTRIES = [
  // EUROPE
  { flag:'🇫🇷', name:'France', id:'country-france', region:'Europe' },
  { flag:'🇬🇧', name:'Royaume-Uni', id:'country-uk', region:'Europe' },
  { flag:'🇩🇪', name:'Allemagne', id:'country-germany', region:'Europe' },
  { flag:'🇮🇹', name:'Italie', id:'country-italy', region:'Europe' },
  { flag:'🇪🇸', name:'Espagne', id:'country-spain', region:'Europe' },
  { flag:'🇷🇺', name:'Russie', id:'country-russia', region:'Europe' },
  { flag:'🇵🇱', name:'Pologne', id:'country-poland', region:'Europe' },
  { flag:'🇸🇪', name:'Suède', id:'country-sweden', region:'Europe' },
  { flag:'🇳🇱', name:'Pays-Bas', id:'country-netherlands', region:'Europe' },
  { flag:'🇧🇪', name:'Belgique', id:'country-belgium', region:'Europe' },
  { flag:'🇨🇭', name:'Suisse', id:'country-switzerland', region:'Europe' },
  { flag:'🇦🇹', name:'Autriche', id:'country-austria', region:'Europe' },
  { flag:'🇵🇹', name:'Portugal', id:'country-portugal', region:'Europe' },
  { flag:'🇬🇷', name:'Grèce', id:'country-greece', region:'Europe' },
  { flag:'🇨🇿', name:'Tchéquie', id:'country-czechia', region:'Europe' },
  { flag:'🇭🇺', name:'Hongrie', id:'country-hungary', region:'Europe' },
  { flag:'🇷🇴', name:'Roumanie', id:'country-romania', region:'Europe' },
  { flag:'🇩🇰', name:'Danemark', id:'country-denmark', region:'Europe' },
  { flag:'🇫🇮', name:'Finlande', id:'country-finland', region:'Europe' },
  { flag:'🇳🇴', name:'Norvège', id:'country-norway', region:'Europe' },
  { flag:'🇺🇦', name:'Ukraine', id:'country-ukraine', region:'Europe' },
  { flag:'🇸🇰', name:'Slovaquie', id:'country-slovakia', region:'Europe' },
  { flag:'🇭🇷', name:'Croatie', id:'country-croatia', region:'Europe' },
  { flag:'🇷🇸', name:'Serbie', id:'country-serbia', region:'Europe' },
  { flag:'🇧🇬', name:'Bulgarie', id:'country-bulgaria', region:'Europe' },
  { flag:'🇱🇹', name:'Lituanie', id:'country-lithuania', region:'Europe' },
  { flag:'🇱🇻', name:'Lettonie', id:'country-latvia', region:'Europe' },
  { flag:'🇪🇪', name:'Estonie', id:'country-estonia', region:'Europe' },
  { flag:'🇸🇮', name:'Slovénie', id:'country-slovenia', region:'Europe' },
  { flag:'🇲🇰', name:'Macédoine du Nord', id:'country-northmacedonia', region:'Europe' },
  { flag:'🇦🇱', name:'Albanie', id:'country-albania', region:'Europe' },
  { flag:'🇧🇦', name:'Bosnie-Herzégovine', id:'country-bosnia', region:'Europe' },
  { flag:'🇲🇩', name:'Moldavie', id:'country-moldova', region:'Europe' },
  { flag:'🇧🇾', name:'Biélorussie', id:'country-belarus', region:'Europe' },
  { flag:'🇮🇪', name:'Irlande', id:'country-ireland', region:'Europe' },
  { flag:'🇮🇸', name:'Islande', id:'country-iceland', region:'Europe' },
  { flag:'🇱🇺', name:'Luxembourg', id:'country-luxembourg', region:'Europe' },
  { flag:'🇲🇹', name:'Malte', id:'country-malta', region:'Europe' },
  { flag:'🇨🇾', name:'Chypre', id:'country-cyprus', region:'Europe' },
  // ASIE
  { flag:'🇨🇳', name:'Chine', id:'country-china', region:'Asie' },
  { flag:'🇯🇵', name:'Japon', id:'country-japan', region:'Asie' },
  { flag:'🇮🇳', name:'Inde', id:'country-india', region:'Asie' },
  { flag:'🇮🇩', name:'Indonésie', id:'country-indonesia', region:'Asie' },
  { flag:'🇰🇷', name:'Corée du Sud', id:'country-korea', region:'Asie' },
  { flag:'🇻🇳', name:'Vietnam', id:'country-vietnam', region:'Asie' },
  { flag:'🇹🇭', name:'Thaïlande', id:'country-thailand', region:'Asie' },
  { flag:'🇮🇷', name:'Iran', id:'country-iran', region:'Asie' },
  { flag:'🇹🇷', name:'Turquie', id:'country-turkey', region:'Asie' },
  { flag:'🇮🇱', name:'Israël', id:'country-israel', region:'Asie' },
  { flag:'🇸🇦', name:'Arabie Saoudite', id:'country-saudiarabia', region:'Asie' },
  { flag:'🇵🇰', name:'Pakistan', id:'country-pakistan', region:'Asie' },
  { flag:'🇧🇩', name:'Bangladesh', id:'country-bangladesh', region:'Asie' },
  { flag:'🇵🇭', name:'Philippines', id:'country-philippines', region:'Asie' },
  { flag:'🇲🇾', name:'Malaisie', id:'country-malaysia', region:'Asie' },
  { flag:'🇸🇬', name:'Singapour', id:'country-singapore', region:'Asie' },
  { flag:'🇲🇲', name:'Myanmar', id:'country-myanmar', region:'Asie' },
  { flag:'🇰🇭', name:'Cambodge', id:'country-cambodia', region:'Asie' },
  { flag:'🇱🇰', name:'Sri Lanka', id:'country-srilanka', region:'Asie' },
  { flag:'🇳🇵', name:'Népal', id:'country-nepal', region:'Asie' },
  { flag:'🇦🇫', name:'Afghanistan', id:'country-afghanistan', region:'Asie' },
  { flag:'🇮🇶', name:'Irak', id:'country-iraq', region:'Asie' },
  { flag:'🇸🇾', name:'Syrie', id:'country-syria', region:'Asie' },
  { flag:'🇯🇴', name:'Jordanie', id:'country-jordan', region:'Asie' },
  { flag:'🇱🇧', name:'Liban', id:'country-lebanon', region:'Asie' },
  { flag:'🇦🇿', name:'Azerbaïdjan', id:'country-azerbaijan', region:'Asie' },
  { flag:'🇬🇪', name:'Géorgie', id:'country-georgia', region:'Asie' },
  { flag:'🇦🇲', name:'Arménie', id:'country-armenia', region:'Asie' },
  { flag:'🇰🇿', name:'Kazakhstan', id:'country-kazakhstan', region:'Asie' },
  { flag:'🇺🇿', name:'Ouzbékistan', id:'country-uzbekistan', region:'Asie' },
  { flag:'🇲🇳', name:'Mongolie', id:'country-mongolia', region:'Asie' },
  { flag:'🇰🇵', name:'Corée du Nord', id:'country-northkorea', region:'Asie' },
  { flag:'🇹🇼', name:'Taïwan', id:'country-taiwan', region:'Asie' },
  { flag:'🇶🇦', name:'Qatar', id:'country-qatar', region:'Asie' },
  { flag:'🇦🇪', name:'Émirats arabes unis', id:'country-uae', region:'Asie' },
  { flag:'🇰🇼', name:'Koweït', id:'country-kuwait', region:'Asie' },
  { flag:'🇴🇲', name:'Oman', id:'country-oman', region:'Asie' },
  { flag:'🇾🇪', name:'Yémen', id:'country-yemen', region:'Asie' },
  // AFRIQUE
  { flag:'🇪🇬', name:'Égypte', id:'country-egypt', region:'Afrique' },
  { flag:'🇳🇬', name:'Nigeria', id:'country-nigeria', region:'Afrique' },
  { flag:'🇪🇹', name:'Éthiopie', id:'country-ethiopia', region:'Afrique' },
  { flag:'🇿🇦', name:'Afrique du Sud', id:'country-sa', region:'Afrique' },
  { flag:'🇰🇪', name:'Kenya', id:'country-kenya', region:'Afrique' },
  { flag:'🇬🇭', name:'Ghana', id:'country-ghana', region:'Afrique' },
  { flag:'🇹🇿', name:'Tanzanie', id:'country-tanzania', region:'Afrique' },
  { flag:'🇩🇿', name:'Algérie', id:'country-algeria', region:'Afrique' },
  { flag:'🇲🇦', name:'Maroc', id:'country-morocco', region:'Afrique' },
  { flag:'🇹🇳', name:'Tunisie', id:'country-tunisia', region:'Afrique' },
  { flag:'🇱🇾', name:'Libye', id:'country-libya', region:'Afrique' },
  { flag:'🇸🇩', name:'Soudan', id:'country-sudan', region:'Afrique' },
  { flag:'🇨🇩', name:'RD Congo', id:'country-drc', region:'Afrique' },
  { flag:'🇨🇲', name:'Cameroun', id:'country-cameroon', region:'Afrique' },
  { flag:'🇸🇳', name:'Sénégal', id:'country-senegal', region:'Afrique' },
  { flag:'🇨🇮', name:"Côte d'Ivoire", id:'country-ivorycoast', region:'Afrique' },
  { flag:'🇺🇬', name:'Ouganda', id:'country-uganda', region:'Afrique' },
  { flag:'🇲🇿', name:'Mozambique', id:'country-mozambique', region:'Afrique' },
  { flag:'🇲🇬', name:'Madagascar', id:'country-madagascar', region:'Afrique' },
  { flag:'🇦🇴', name:'Angola', id:'country-angola', region:'Afrique' },
  { flag:'🇿🇲', name:'Zambie', id:'country-zambia', region:'Afrique' },
  { flag:'🇿🇼', name:'Zimbabwe', id:'country-zimbabwe', region:'Afrique' },
  { flag:'🇷🇼', name:'Rwanda', id:'country-rwanda', region:'Afrique' },
  { flag:'🇸🇴', name:'Somalie', id:'country-somalia', region:'Afrique' },
  { flag:'🇲🇱', name:'Mali', id:'country-mali', region:'Afrique' },
  // AMÉRIQUES
  { flag:'🇺🇸', name:'États-Unis', id:'country-usa', region:'Amériques' },
  { flag:'🇧🇷', name:'Brésil', id:'country-brazil', region:'Amériques' },
  { flag:'🇲🇽', name:'Mexique', id:'country-mexico', region:'Amériques' },
  { flag:'🇨🇦', name:'Canada', id:'country-canada', region:'Amériques' },
  { flag:'🇦🇷', name:'Argentine', id:'country-argentina', region:'Amériques' },
  { flag:'🇨🇴', name:'Colombie', id:'country-colombia', region:'Amériques' },
  { flag:'🇨🇱', name:'Chili', id:'country-chile', region:'Amériques' },
  { flag:'🇵🇪', name:'Pérou', id:'country-peru', region:'Amériques' },
  { flag:'🇻🇪', name:'Venezuela', id:'country-venezuela', region:'Amériques' },
  { flag:'🇨🇺', name:'Cuba', id:'country-cuba', region:'Amériques' },
  { flag:'🇧🇴', name:'Bolivie', id:'country-bolivia', region:'Amériques' },
  { flag:'🇪🇨', name:'Équateur', id:'country-ecuador', region:'Amériques' },
  { flag:'🇵🇾', name:'Paraguay', id:'country-paraguay', region:'Amériques' },
  { flag:'🇺🇾', name:'Uruguay', id:'country-uruguay', region:'Amériques' },
  { flag:'🇬🇹', name:'Guatemala', id:'country-guatemala', region:'Amériques' },
  { flag:'🇭🇹', name:'Haïti', id:'country-haiti', region:'Amériques' },
  { flag:'🇩🇴', name:'Rép. Dominicaine', id:'country-dominicanrep', region:'Amériques' },
  { flag:'🇯🇲', name:'Jamaïque', id:'country-jamaica', region:'Amériques' },
  // OCÉANIE
  { flag:'🇦🇺', name:'Australie', id:'country-australia', region:'Océanie' },
  { flag:'🇳🇿', name:'Nouvelle-Zélande', id:'country-newzealand', region:'Océanie' },
  { flag:'🇵🇬', name:'Papouasie-Nvl-Guinée', id:'country-png', region:'Océanie' },
  { flag:'🇫🇯', name:'Fidji', id:'country-fiji', region:'Océanie' },
];

// SIDEBAR LOGIC
const sidebarEl = document.getElementById('sidebar');
const sidebarToggleEl = document.getElementById('sidebarToggle');
const sidebarCloseEl = document.getElementById('sidebarClose');
const sidebarOverlayEl = document.getElementById('sidebarOverlay');
const sidebarContentEl = document.getElementById('sidebarContent');
const sidebarSearchEl = document.getElementById('sidebarSearchInput');
const mainEl = document.querySelector('main');
let sidebarOpen = false;
let activeTab = 'eras';
let sidebarQuery = '';

function toggleSidebar(force) {
  sidebarOpen = force !== undefined ? force : !sidebarOpen;
  sidebarEl.classList.toggle('active', sidebarOpen);
  sidebarToggleEl.classList.toggle('active', sidebarOpen);
  sidebarOverlayEl.classList.toggle('active', sidebarOpen);
  mainEl.classList.toggle('sidebar-open', sidebarOpen);
}

sidebarToggleEl.addEventListener('click', () => toggleSidebar());
sidebarCloseEl.addEventListener('click', () => toggleSidebar(false));
sidebarOverlayEl.addEventListener('click', () => toggleSidebar(false));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && sidebarOpen) toggleSidebar(false);
});

// Tabs
document.querySelectorAll('.sidebar-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    activeTab = tab.dataset.tab;
    document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.toggle('active', t === tab));
    renderSidebar();
  });
});

// Search
sidebarSearchEl.addEventListener('input', () => {
  sidebarQuery = sidebarSearchEl.value.trim().toLowerCase();
  renderSidebar();
});

const ERA_ITEMS = [
  { flag:'📜', name:'Préhistoire', id:'era-prehist' },
  { flag:'🏛', name:'Antiquité', id:'era-antiquite' },
  { flag:'⚔️', name:'Moyen Âge', id:'era-moyen-age' },
  { flag:'🔭', name:'Temps modernes', id:'era-modernes' },
  { flag:'⚡', name:'Époque contemporaine', id:'era-contemporain' },
  { flag:'⭐', name:'Top 150 dates', id:'era-top50' },
];

const REGION_ICONS = {
  'Europe': '🌍',
  'Asie': '🌏',
  'Afrique': '🌍',
  'Amériques': '🌎',
  'Océanie': '🌏',
};

function countryHasSection(id) {
  return !!document.getElementById(id);
}

function renderSidebar() {
  const q = sidebarQuery;
  let html = '';

  if (activeTab === 'eras' || activeTab === 'all') {
    const filtered = ERA_ITEMS.filter(i => !q || i.name.toLowerCase().includes(q));
    if (filtered.length) {
      html += `<div class="sidebar-section">
        <div class="sidebar-section-header">
          <span class="sidebar-section-label">Périodes historiques</span>
          <span class="sidebar-section-arrow">▾</span>
        </div>
        <div class="sidebar-items">`;
      filtered.forEach(item => {
        html += `<div class="sidebar-item" data-target="${item.id}">
          <span class="sidebar-item-flag">${item.flag}</span>
          <span class="sidebar-item-label">${item.name}</span>
        </div>`;
      });
      html += `</div></div>`;
    }
  }

  if (activeTab === 'countries' || activeTab === 'all') {
    const regions = [...new Set(ALL_COUNTRIES.map(c => c.region))];
    regions.forEach(region => {
      const items = ALL_COUNTRIES.filter(c =>
        c.region === region && (!q || c.name.toLowerCase().includes(q))
      );
      if (!items.length) return;
      html += `<div class="sidebar-section">
        <div class="sidebar-section-header">
          <span class="sidebar-section-label">${REGION_ICONS[region] || '🌐'} ${region}</span>
          <span class="sidebar-section-arrow">▾</span>
        </div>
        <div class="sidebar-items">`;
      items.forEach(c => {
        const exists = countryHasSection(c.id);
        html += `<div class="sidebar-item${exists ? '' : ' sidebar-item-missing'}" data-target="${c.id}" title="${c.name}">
          <span class="sidebar-item-flag">${c.flag}</span>
          <span class="sidebar-item-label">${c.name}</span>
          ${exists ? '' : '<span class="sidebar-item-count">bientôt</span>'}
        </div>`;
      });
      html += `</div></div>`;
    });
  }

  if (!html) {
    html = `<div class="sidebar-no-results">Aucun résultat pour "<strong>${q}</strong>"</div>`;
  }

  sidebarContentEl.innerHTML = html;

  // Collapsible sections
  sidebarContentEl.querySelectorAll('.sidebar-section-header').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.sidebar-section').classList.toggle('collapsed');
    });
  });

  // Click to scroll
  sidebarContentEl.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = document.getElementById(item.dataset.target);
      if (!target) return;
      if (window.innerWidth < 768) toggleSidebar(false);
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.style.outline = '2px solid rgba(0,113,227,0.4)';
        setTimeout(() => { target.style.outline = ''; }, 1800);
      }, window.innerWidth < 768 ? 320 : 80);
    });
  });
}

renderSidebar();

// ═══════════════════════════════════════════════════════════════
// INJECT MISSING COUNTRY SECTIONS INTO THE DOM
// ═══════════════════════════════════════════════════════════════

const COUNTRY_DATA = {
  'country-canada': {
    flag:'CA', name:'Canada', color:'rgba(255,0,0,0.05)', border:'rgba(255,0,0,0.1)',
    events:[
      ['1534','Jacques Cartier explore le Saint-Laurent','Premiers contacts avec les Iroquois ; fondations du Canada francais.','Jacques Cartier','Exploration'],
      ['1608','Fondation de Quebec par Samuel de Champlain','Premiere ville permanente francaise en Amerique du Nord.','Samuel de Champlain','Politique'],
      ['1759','Bataille des Plaines d Abraham','Victoire britannique ; fin de la Nouvelle-France ; Quebec passe sous domination anglaise.','Wolfe, Montcalm','Politique'],
      ['1867','Confederation canadienne : naissance du Dominion','Acte de l Amerique du Nord britannique ; quatre provinces unies.','John A. Macdonald','Politique'],
      ['1885','Chemin de fer transcontinental acheve','Relie l Atlantique au Pacifique ; integration nationale du Canada.','','Science'],
      ['1914-1918','Canada dans la Premiere Guerre mondiale','600 000 soldats ; Vimy 1917 ; affirmation de l identite nationale.','','Politique'],
      ['1931','Statut de Westminster : independance legislative','Le Canada devient pleinement souverain dans ses affaires etrangeres.','','Politique'],
      ['1982','Rapatriement de la Constitution et Charte des droits','Pierre Trudeau donne au Canada sa propre constitution.','Pierre Trudeau','Politique'],
      ['1995','Referendum sur la souverainete du Quebec','50,6% pour le Non ; question nationale toujours ouverte.','','Politique'],
      ['2015','Justin Trudeau Premier ministre : politique progressiste','Accueil de refugies syriens ; legalisation du cannabis 2018.','Justin Trudeau','Politique'],
    ]
  },
  'country-argentina': {
    flag:'AR', name:'Argentine', color:'rgba(117,170,219,0.05)', border:'rgba(117,170,219,0.1)',
    events:[
      ['1516','Juan Diaz de Solis decouvre le Rio de la Plata','Premier Europeen a explorer la region ; tue par les Guaranis.','','Exploration'],
      ['1776','Creation du Vice-royaume du Rio de la Plata','Buenos Aires devient capitale administrative de l Amerique du Sud espagnole.','','Politique'],
      ['25 mai 1810','Revolution de Mai : debut de l independance','Junte creole renverse le vice-roi ; debut du processus d independance.','','Politique'],
      ['9 juillet 1816','Declaration d independance de l Argentine','Congres de Tucuman ; naissance officielle de la nation.','','Politique'],
      ['1853','Constitution federale argentine','Modele liberal inspire des Etats-Unis ; base de l Etat moderne.','','Politique'],
      ['1946-1955','Peronisme : Juan Peron au pouvoir','Nationalisme populaire ; droits des travailleurs ; Eva Peron icone.','Juan Peron, Eva Peron','Politique'],
      ['1976-1983','Dictature militaire : 30 000 disparus','Junte militaire ; terrorisme d Etat ; Meres de la Place de Mai.','Jorge Videla','Politique'],
      ['1982','Guerre des Malouines contre le Royaume-Uni','Defaite argentine ; chute de la junte ; retour a la democratie.','','Politique'],
      ['2001','Crise economique majeure : defaut de paiement','Corralito ; 5 presidents en 2 semaines ; traumatisme national.','','Politique'],
      ['2022','Argentine championne du monde de football','Troisieme titre mondial ; Lionel Messi sacre.','Lionel Messi','Culture'],
    ]
  },
  'country-australia': {
    flag:'AU', name:'Australie', color:'rgba(0,0,139,0.05)', border:'rgba(0,0,139,0.1)',
    events:[
      ['50000 av. J.-C.','Peuplement de l Australie par les Aborigenes','Traversee maritime depuis l Asie du Sud-Est ; plus ancienne culture continue.','','Exploration'],
      ['1770','James Cook cartographie la cote est','Revendication au nom de la Grande-Bretagne ; Botany Bay.','James Cook','Exploration'],
      ['1788','Fondation de la colonie de Sydney','Premier convoi de bagnards ; debut de la colonisation britannique.','Arthur Phillip','Politique'],
      ['1851','Ruee vers l or en Nouvelle-Galles du Sud','Afflux massif d immigrants ; transformation economique et demographique.','','Politique'],
      ['1901','Federation australienne : naissance du Commonwealth','Six colonies unies ; constitution federale ; nation independante.','','Politique'],
      ['1915','Gallipoli : bapteme du feu de l ANZAC','Echec des Allies ; 8 000 Australiens tues ; identite nationale forgee.','','Politique'],
      ['1967','Referendum : droits civiques des Aborigenes','91% pour ; les Aborigenes deviennent citoyens a part entiere.','','Politique'],
      ['2000','Jeux Olympiques de Sydney','Cathy Freeman allume la flamme ; reconciliation symbolique.','Cathy Freeman','Culture'],
      ['2008','Excuses officielles aux Aborigenes','Kevin Rudd presente les excuses du gouvernement pour les Generations Volees.','Kevin Rudd','Politique'],
      ['2019-2020','Megafeux devastateurs : crise climatique','18 millions d hectares brules ; 3 milliards d animaux tues.','','Science'],
    ]
  },
  'country-netherlands': {
    flag:'NL', name:'Pays-Bas', color:'rgba(255,174,0,0.05)', border:'rgba(255,174,0,0.1)',
    events:[
      ['1568-1648','Guerre de Quatre-Vingts Ans : independance des Pays-Bas','Revolte contre l Espagne ; naissance de la Republique des Provinces-Unies.','Guillaume d Orange','Politique'],
      ['1602','Fondation de la VOC : premiere multinationale','Compagnie des Indes orientales ; monopole commercial en Asie.','','Politique'],
      ['1648','Traite de Westphalie : independance reconnue','Les Pays-Bas deviennent une puissance europeenne majeure.','','Politique'],
      ['1672','Annee du desastre : invasion francaise','Louis XIV envahit ; Johan de Witt assassine ; Guillaume III au pouvoir.','Louis XIV, Guillaume III','Politique'],
      ['1795','Republique batave sous influence francaise','Revolution et occupation napoleonienne transforment les Pays-Bas.','','Politique'],
      ['1830','Independance de la Belgique','Separation des Pays-Bas du Sud ; perte territoriale majeure.','','Politique'],
      ['1940-1945','Occupation nazie et Shoah neerlandaise','75% des Juifs neerlandais extermines ; Anne Frank symbole mondial.','Anne Frank','Politique'],
      ['1949','Independance de l Indonesie reconnue','Fin de l empire colonial neerlandais en Asie du Sud-Est.','','Politique'],
      ['1975','Legalisation progressive et politique liberale','Pays-Bas pionniers sur le cannabis, l euthanasie, le mariage gay (2001).','','Culture'],
      ['2002','Assassinat de Pim Fortuyn','Tournant politique ; montee du populisme ; debat sur l immigration.','Pim Fortuyn','Politique'],
    ]
  },
  'country-portugal': {
    flag:'PT', name:'Portugal', color:'rgba(0,102,0,0.05)', border:'rgba(0,102,0,0.1)',
    events:[
      ['1143','Fondation du Royaume du Portugal','Afonso Henriques premier roi ; independance vis-a-vis de Leon.','Afonso Henriques','Politique'],
      ['1415','Prise de Ceuta : debut de l expansion portugaise','Premiere conquete africaine ; lancement des grandes decouvertes.','Henri le Navigateur','Exploration'],
      ['1488','Bartolomeu Dias double le cap de Bonne-Esperance','Ouvre la route maritime vers l Asie ; exploit de navigation.','Bartolomeu Dias','Exploration'],
      ['1498','Vasco de Gama atteint les Indes','Route des epices ; Portugal domine le commerce asiatique.','Vasco de Gama','Exploration'],
      ['1500','Cabral decouvre le Bresil','Empire portugais s etend en Amerique du Sud.','Pedro Alvares Cabral','Exploration'],
      ['1580-1640','Union iberique : Portugal sous couronne espagnole','Perte d independance ; affaiblissement de l empire colonial.','Philippe II d Espagne','Politique'],
      ['1755','Seisme de Lisbonne : 60 000 morts','Catastrophe qui detruit la capitale ; reconstruction par Pombal.','Marquis de Pombal','Science'],
      ['1910','Revolution republicaine : fin de la monarchie','Roi Manuel II renverse ; Republique proclamee.','','Politique'],
      ['1974','Revolution des Oeillets : fin de la dictature','Coup militaire pacifique ; fin du regime Salazar-Caetano ; democratie.','','Politique'],
      ['1986','Portugal rejoint la CEE','Integration europeenne ; modernisation economique acceleree.','','Politique'],
    ]
  },
  'country-greece': {
    flag:'GR', name:'Grece', color:'rgba(13,94,175,0.05)', border:'rgba(13,94,175,0.1)',
    events:[
      ['776 av. J.-C.','Premiers Jeux Olympiques a Olympie','Treve sacree ; unite symbolique des cites grecques.','','Culture'],
      ['508 av. J.-C.','Reformes de Clisthene : naissance de la democratie','Assemblee du peuple ; ostracisme ; modele politique fondateur.','Clisthene','Politique'],
      ['490 av. J.-C.','Bataille de Marathon','Victoire athenienne sur les Perses ; symbole de resistance.','Miltiade','Politique'],
      ['461-429 av. J.-C.','Siecle de Pericles : age d or d Athenes','Parthenon ; tragedie grecque ; philosophie ; democratie directe.','Pericles, Phidias','Culture'],
      ['146 av. J.-C.','Grece province romaine','Fin de l independance ; mais culture grecque domine Rome.','','Politique'],
      ['1453','Chute de Constantinople : fin de Byzance','Fin de l Empire romain d Orient ; diaspora grecque en Occident.','Constantin XI','Politique'],
      ['1821-1829','Guerre d independance grecque','Revolte contre l Empire ottoman ; naissance de la Grece moderne.','Kolokotronis','Politique'],
      ['1940-1944','Resistance grecque a l occupation nazie','Oxi Day 28 oct 1940 ; resistance heroique ; famine de 1941-42.','','Politique'],
      ['1967-1974','Dictature des colonels','Junte militaire ; repression ; chute apres la crise chypriote.','','Politique'],
      ['2010-2018','Crise de la dette grecque','Austerite ; memorandums ; debat sur l avenir de la zone euro.','','Politique'],
    ]
  },
  'country-colombia': {
    flag:'CO', name:'Colombie', color:'rgba(255,220,0,0.05)', border:'rgba(255,220,0,0.1)',
    events:[
      ['1499','Alonso de Ojeda explore la cote colombienne','Premier contact europeen avec le territoire actuel.','Alonso de Ojeda','Exploration'],
      ['1538','Fondation de Bogota par Gonzalo Jimenez de Quesada','Capitale de la Nouvelle-Grenade ; centre colonial espagnol.','','Politique'],
      ['1810','Cri d independance de Bogota','20 juillet ; debut du processus d independance.','','Politique'],
      ['1819','Bataille de Boyaca : independance','Simon Bolivar libere la Nouvelle-Grenade ; Grande Colombie fondee.','Simon Bolivar','Politique'],
      ['1830','Dissolution de la Grande Colombie','Venezuela et Equateur se separent ; Colombie actuelle emerge.','','Politique'],
      ['1948','Bogotazo : assassinat de Gaitan','Violences massives ; debut de La Violencia ; 200 000 morts.','Jorge Eliecer Gaitan','Politique'],
      ['1964','Fondation des FARC','Guerilla marxiste ; 50 ans de conflit arme ; 220 000 morts.','','Politique'],
      ['1993','Mort de Pablo Escobar','Fin du cartel de Medellin ; mais trafic de drogue continue.','Pablo Escobar','Politique'],
      ['2016','Accord de paix avec les FARC','Prix Nobel de la Paix pour Santos ; fin officielle du conflit.','Juan Manuel Santos','Politique'],
      ['2022','Gustavo Petro : premier president de gauche','Ancien guerillero ; reformes sociales ; tournant historique.','Gustavo Petro','Politique'],
    ]
  },
  'country-chile': {
    flag:'CL', name:'Chili', color:'rgba(213,43,30,0.05)', border:'rgba(213,43,30,0.1)',
    events:[
      ['1520','Magellan traverse le detroit qui porte son nom','Passage entre Atlantique et Pacifique ; exploration du Chili.','Magellan','Exploration'],
      ['1541','Fondation de Santiago par Pedro de Valdivia','Capitale coloniale ; resistance mapuche pendant 300 ans.','Pedro de Valdivia','Politique'],
      ['1818','Independance du Chili','O Higgins et San Martin liberent le pays de l Espagne.','Bernardo O Higgins','Politique'],
      ['1879-1884','Guerre du Pacifique contre Bolivie et Perou','Chili annexe le nord ; Bolivie perd son acces a la mer.','','Politique'],
      ['1970','Salvador Allende : premier president marxiste elu','Nationalisation du cuivre ; reformes sociales ; experience unique.','Salvador Allende','Politique'],
      ['11 septembre 1973','Coup d Etat de Pinochet','Bombardement de La Moneda ; Allende mort ; dictature militaire.','Augusto Pinochet','Politique'],
      ['1973-1990','Dictature de Pinochet : 3 000 disparus','Repression ; neoliberalisme ; Chicago Boys ; croissance economique.','Augusto Pinochet','Politique'],
      ['1988','Plebiscite : Non a Pinochet','55% contre la dictature ; transition democratique.','','Politique'],
      ['2010','Seisme 8,8 et sauvetage des 33 mineurs','Catastrophe naturelle ; sauvetage televise mondial.','','Science'],
      ['2019-2020','Estallido social : revolte populaire','Manifestations massives ; nouvelle constitution en cours.','','Politique'],
    ]
  },
  'country-ukraine': {
    flag:'UA', name:'Ukraine', color:'rgba(0,87,183,0.05)', border:'rgba(0,87,183,0.1)',
    events:[
      ['882','Fondation de la Rus de Kiev','Vladimir le Grand ; premier Etat slave oriental ; christianisation 988.','Vladimir le Grand','Politique'],
      ['1240','Destruction de Kiev par les Mongols','Batu Khan rase la ville ; domination mongole pendant 2 siecles.','Batu Khan','Politique'],
      ['1648','Revolte cosaque de Bohdan Khmelnytsky','Hetmanat cosaque ; lutte pour l autonomie ukrainienne.','Bohdan Khmelnytsky','Politique'],
      ['1709','Bataille de Poltava : defaite suedoise','Pierre le Grand ecrase Charles XII et Mazepa ; Ukraine sous Russie.','Pierre le Grand, Mazepa','Politique'],
      ['1932-1933','Holodomor : famine artificielle','3 a 7 millions de morts ; genocide reconnu par de nombreux pays.','Staline','Politique'],
      ['1941-1944','Occupation nazie : 7 millions de morts','Shoah en Ukraine ; Babi Yar ; devastation totale.','','Politique'],
      ['1986','Catastrophe de Tchernobyl','Reacteur 4 explose ; 350 000 evacues ; impact mondial.','','Science'],
      ['1991','Independance de l Ukraine','Dissolution de l URSS ; referendum a 90% pour l independance.','Leonid Kravtchouk','Politique'],
      ['2014','Revolution du Maidan et annexion de la Crimee','Ianoukovitch renverse ; Russie annexe la Crimee ; guerre du Donbass.','','Politique'],
      ['24 fevrier 2022','Invasion russe a grande echelle','Plus grande guerre en Europe depuis 1945 ; resistance ukrainienne.','Zelensky, Poutine','Politique'],
    ]
  },
  'country-morocco': {
    flag:'MA', name:'Maroc', color:'rgba(196,30,58,0.05)', border:'rgba(196,30,58,0.1)',
    events:[
      ['788','Fondation de la dynastie Idrisside','Premier Etat islamique independant au Maroc ; Fes fondee en 789.','Idris Ier','Politique'],
      ['1062','Empire almoravide : expansion vers l Espagne','Youssef ibn Tachfin unifie le Maghreb et al-Andalus.','Youssef ibn Tachfin','Politique'],
      ['1147','Empire almohade : apogee culturel','Averroes, Maimonide ; Marrakech capitale ; art et philosophie.','','Culture'],
      ['1415','Prise de Ceuta par le Portugal','Debut de la presence europeenne au Maroc.','','Politique'],
      ['1578','Bataille des Trois Rois','Victoire marocaine sur le Portugal ; independance preservee.','','Politique'],
      ['1912','Traite de Fes : protectorat franco-espagnol','Maroc divise entre France et Espagne ; resistance continue.','','Politique'],
      ['1944','Manifeste de l Independance','Parti de l Istiqlal reclame l independance ; mouvement national.','Allal al-Fassi','Politique'],
      ['1956','Independance du Maroc','Mohammed V retourne d exil ; fin du protectorat.','Mohammed V','Politique'],
      ['1975','Marche Verte : recuperation du Sahara occidental','350 000 Marocains entrent au Sahara espagnol.','Hassan II','Politique'],
      ['1999','Accession de Mohammed VI','Reformes sociales ; Code de la famille 2004 ; modernisation.','Mohammed VI','Politique'],
    ]
  },
};

function injectCountrySections() {
  const container = document.querySelector('section[style*="margin-top: 3rem"]');
  if (!container) return;

  Object.entries(COUNTRY_DATA).forEach(([id, data]) => {
    if (document.getElementById(id)) return; // already exists

    const section = document.createElement('div');
    section.className = 'era-section';
    section.id = id;

    const eventsHTML = data.events.map(([date, name, ctx, people, cat]) => {
      const catClass = cat === 'Science' ? 'cat-science' : cat === 'Culture' ? 'cat-culture' : cat === 'Exploration' ? 'cat-exploration' : 'cat-politique';
      const peopleHTML = people ? '<span class="event-people">' + people + '</span>' : '';
      return '<div class="event"><div class="event-dot"></div><div class="event-content">' +
        '<span class="event-date">' + date + '</span>' +
        '<span class="event-text"><span class="event-name">' + name + '</span>' +
        '<span class="event-context">' + ctx + '</span>' + peopleHTML + '</span>' +
        '<span class="event-cat ' + catClass + '">' + cat + '</span>' +
        '</div></div>';
    }).join('');

    section.innerHTML =
      '<div class="era-header" style="background-color:' + data.color + ';border-color:' + data.border + '">' +
        '<div style="font-size:2rem">' + data.flag + '</div>' +
        '<div class="era-title-block"><h3 style="margin:0;font-size:1.8rem">' + data.name + '</h3>' +
        '<p>Dix reperes fondamentaux</p></div>' +
      '</div>' + eventsHTML;

    container.appendChild(section);
  });
}

document.addEventListener('DOMContentLoaded', injectCountrySections);
if (document.readyState !== 'loading') injectCountrySections();
