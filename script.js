/**
 * Chronological Timeline - Main Application Script
 * 
 * This script powers the interactive historical timeline interface,
 * handling event filtering, search, detail views, and navigation.
 * 
 * Architecture:
 * - Event parsing and data extraction from DOM
 * - Filtering by era, type, and search query
 * - Detail page rendering with rich information
 * - Sidebar navigation with country and era links
 * - Top 150 featured events grid
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION & STATE
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  featuredDatesLimit: 150,
  selectors: {
    searchInput: '#searchInput',
    detailPage: '#detailPage',
    top50Grid: '#top50Grid',
    rightSidebarContent: '#rightSidebarContent'
  }
};

// Application state for filters
const state = {
  era: 'top50',
  type: 'all',
  search: ''
};

// Era configuration with labels and types
const eraConfigs = {
  prehist: { label: 'Préhistoire', kind: 'ère' },
  antiquite: { label: 'Antiquité', kind: 'ère' },
  'moyen-age': { label: 'Moyen Âge', kind: 'ère' },
  modernes: { label: 'Temps modernes', kind: 'ère' },
  contemporain: { label: 'Époque contemporaine', kind: 'ère' },
  country: { label: 'Par pays', kind: 'section' },
  top50: { label: 'Top 150', kind: 'sélection' }
};

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Normalizes text for case-insensitive, accent-insensitive search
 */
function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Parses a date string to extract a numeric year for sorting
 * Handles BC dates (negative), approximations, and ranges
 */
function estimateYearFromText(text) {
  if (!text) return null;
  const clean = text
    .toLowerCase()
    .replace(/≈|vers|ca\.?|env\.?/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  const firstYear = clean.match(/(\d[\d\s]*)/);
  if (!firstYear) return null;
  const numeric = parseInt(firstYear[1].replace(/\s/g, ''), 10);
  if (Number.isNaN(numeric)) return null;
  return clean.includes('av. j.-c') ? -numeric : numeric;
}

/**
 * Formats a numeric year with thousands separators
 */
function formatYear(year) {
  const abs = Math.abs(year);
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return year < 0 ? `${formatted} av. J.-C.` : `${formatted}`;
}

/**
 * Escapes HTML to prevent XSS attacks
 */
function escapeHtml(value) {
  return (value || '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#39;');
}

/**
 * Maps event category to CSS class for color coding
 */
function getCategoryClass(category) {
  const normalized = normalizeText(category);
  if (normalized.includes('science')) return 'cat-science';
  if (normalized.includes('culture')) return 'cat-culture';
  if (normalized.includes('exploration')) return 'cat-exploration';
  return 'cat-politique';
}

// ═══════════════════════════════════════════════════════════════
// SUPPLEMENTAL EVENTS (Additional historical data)
// ═══════════════════════════════════════════════════════════════

const supplementalEventsByEra = {
  prehist: [
    { date: '≈ 2 600 000 av. J.-C.', name: 'Premières industries lithiques oldowayennes d'Afrique de l'Est', context: 'Les galets aménagés montrent une production répétée d'outils et un apprentissage technique.', people: 'Homo habilis', category: 'Science' },
    { date: '≈ 1 400 000 av. J.-C.', name: 'Développement du biface acheuléen', context: 'L'outil standardisé témoigne d'une meilleure planification technique et d'une longue transmission culturelle.', people: 'Homo erectus', category: 'Science' },
    { date: '≈ 700 000 av. J.-C.', name: 'Occupation humaine durable de l'Europe occidentale', context: 'Les sites européens attestent une adaptation progressive aux climats tempérés puis froids.', category: 'Exploration' },
    { date: '≈ 120 000 av. J.-C.', name: 'Sépultures néandertaliennes attestées au Proche-Orient', context: 'Les inhumations suggèrent des comportements symboliques et des formes de rites funéraires.', people: 'Homo neanderthalensis', category: 'Culture' },
    { date: '≈ 45 000 av. J.-C.', name: 'Arrivée d'Homo sapiens en Europe', context: 'La diffusion de Sapiens transforme les cultures matérielles et l'occupation du continent.', category: 'Exploration' },
    { date: '≈ 23 000 av. J.-C.', name: 'Maximum glaciaire du Dernier Âge glaciaire', context: 'Le climat mondial très froid modifie les migrations humaines, la faune et les paysages.', category: 'Science' },
    { date: '≈ 9 600 av. J.-C.', name: 'Göbekli Tepe : sanctuaires monumentaux en Anatolie', context: 'Les piliers sculptés indiquent des rassemblements rituels antérieurs aux grandes villes agricoles.', category: 'Culture' },
    { date: '≈ 6 500 av. J.-C.', name: 'Diffusion du Néolithique en Europe du Sud-Est', context: 'Agriculture, élevage et céramique se propagent des Balkans vers le continent européen.', category: 'Exploration' },
    { date: '≈ 4 000 av. J.-C.', name: 'Premières grandes nécropoles mégalithiques atlantiques', context: 'Dolmens et tombes collectives manifestent des sociétés plus hiérarchisées et organisées.', category: 'Culture' },
    { date: '≈ 3 300 av. J.-C.', name: 'Ötzi, homme des glaces des Alpes', context: 'Son équipement offre une photographie exceptionnelle de la vie chalcolithique européenne.', category: 'Science' }
  ],
  antiquite: [
    { date: '≈ 2 700 av. J.-C.', name: 'Début de la civilisation minoenne en Crète', context: 'Palais, échanges maritimes et écriture linéaire A annoncent une Méditerranée déjà connectée.', category: 'Culture' },
    { date: '≈ 1 600 av. J.-C.', name: 'Apogée mycénienne en Grèce', context: 'Des royaumes guerriers dominent la mer Égée et inspireront plus tard la tradition homérique.', category: 'Politique' },
    { date: '≈ 1 050 av. J.-C.', name: 'Diffusion de l'alphabet phénicien', context: 'Ce système d'écriture simple facilite les échanges et inspire les alphabets grec puis latin.', category: 'Culture' },
    { date: '814 av. J.-C.', name: 'Fondation traditionnelle de Carthage', context: 'La cité phénicienne devient une grande puissance commerciale et maritime de Méditerranée.', people: 'Didon selon la tradition', category: 'Politique' },
    { date: '443 av. J.-C.', name: 'Périclès domine la vie politique d'Athènes', context: 'Le Parthénon, la démocratie athénienne et l'impérialisme maritime atteignent leur apogée.', people: 'Périclès', category: 'Culture' },
    { date: '31 av. J.-C.', name: 'Bataille d'Actium', context: 'La victoire d'Octave sur Antoine et Cléopâtre ouvre la voie à l'Empire romain.', people: 'Octave, Marc Antoine, Cléopâtre', category: 'Politique' }
  ],
  'moyen-age': [
    { date: '711', name: 'Conquête musulmane de la péninsule Ibérique', context: 'La chute rapide du royaume wisigoth ouvre l'histoire d'al-Andalus.', category: 'Politique' },
    { date: '793', name: 'Raid viking contre le monastère de Lindisfarne', context: 'L'événement marque symboliquement le début des grandes incursions vikings.', category: 'Politique' },
    { date: '987', name: 'Hugues Capet devient roi de France', context: 'La dynastie capétienne s'installe durablement au cœur de l'histoire française.', people: 'Hugues Capet', category: 'Politique' },
    { date: '962', name: 'Otton Ier fonde le Saint-Empire romain germanique', context: 'La renaissance impériale en Occident structure durablement la politique européenne.', people: 'Otton Ier', category: 'Politique' },
    { date: '1429', name: 'Jeanne d'Arc fait lever le siège d'Orléans', context: 'Le succès français marque un tournant psychologique majeur dans la guerre de Cent Ans.', people: 'Jeanne d'Arc', category: 'Politique' }
  ],
  modernes: [
    { date: '1513', name: 'Machiavel rédige Le Prince', context: 'Le texte renouvelle profondément la réflexion sur le pouvoir et l'État.', people: 'Nicolas Machiavel', category: 'Culture' },
    { date: '1588', name: 'Défaite de l'Invincible Armada', context: "L'échec espagnol renforce durablement la puissance maritime anglaise.", category: 'Politique' },
    { date: '1607', name: 'Fondation de Jamestown', context: 'La première implantation anglaise durable en Amérique du Nord s'enracine.', category: 'Exploration' },
    { date: '1682', name: 'La cour de Louis XIV s'installe à Versailles', context: 'Le palais devient l'outil politique central de la monarchie absolue.', category: 'Politique' },
    { date: '1773', name: 'Boston Tea Party', context: "Le geste radical accélère la rupture entre les colonies américaines et Londres.", category: 'Politique' }
  ],
  contemporain: [
    { date: '1830', name: 'Révolution de Juillet en France', context: 'La monarchie de Charles X s'effondre et laisse place à la monarchie de Juillet.', category: 'Politique' },
    { date: '1869', name: 'Ouverture du canal de Suez', context: 'La route maritime entre Europe et Asie est profondément raccourcie.', category: 'Exploration' },
    { date: '1928', name: 'Découverte de la pénicilline', context: 'Le hasard de laboratoire ouvre l'ère des antibiotiques.', people: 'Alexander Fleming', category: 'Science' },
    { date: '1947', name: 'Indépendance et partition de l'Inde', context: "La décolonisation s'accompagne de violences massives entre Inde et Pakistan.", category: 'Politique' },
    { date: '1989', name: 'World Wide Web proposé au CERN', context: 'Avant sa mise en ligne publique, le projet pose les bases du web moderne.', people: 'Tim Berners-Lee', category: 'Science' },
    { date: '2020', name: 'Premiers vaccins à ARN messager déployés à grande échelle', context: 'La biotechnologie entre dans une nouvelle phase d'application massive.', category: 'Science' }
  ]
};

/**
 * Creates HTML markup for a supplemental event
 */
function createEventMarkup(item, era, index) {
  const peopleMarkup = item.people ? `<span class="event-people">${escapeHtml(item.people)}</span>` : '';
  return `
    <div class="event${item.isMajor ? ' major' : ''}" data-era="${era}" data-supplemental="true" data-supplemental-index="${index}">
      <div class="event-dot"></div>
      <div class="event-content">
        <span class="event-date">${escapeHtml(item.date)}</span>
        <span class="event-text">
          <span class="event-name">${escapeHtml(item.name)}</span>
          <span class="event-context">${escapeHtml(item.context)}</span>
          ${peopleMarkup}
        </span>
        <span class="event-cat ${getCategoryClass(item.category)}">${escapeHtml(item.category)}</span>
      </div>
    </div>
  `;
}

/**
 * Injects supplemental events into their respective era sections
 */
function injectSupplementalEvents() {
  Object.entries(supplementalEventsByEra).forEach(([era, items]) => {
    const section = document.getElementById(`era-${era}`);
    const markerGroup = section?.querySelector('.marker-group');
    if (!section || !markerGroup || !items.length) return;
    const html = `
      <div class="geo-label">➕ Événements complémentaires</div>
      ${items.map((item, index) => createEventMarkup(item, era, index)).join('')}
    `;
    markerGroup.insertAdjacentHTML('afterend', html);
  });
}

// Initialize supplemental events
injectSupplementalEvents();

// ═══════════════════════════════════════════════════════════════
// EVENT DATA EXTRACTION & PROCESSING
// ═══════════════════════════════════════════════════════════════

/**
 * Extract all events from the DOM and create structured data objects
 */
const eventEntries = Array.from(document.querySelectorAll('.event')).map((event, index) => {
  const date = event.querySelector('.event-date')?.textContent.trim() || '';
  const name = event.querySelector('.event-name')?.textContent.trim() || '';
  const context = event.querySelector('.event-context')?.textContent.trim() || '';
  const people = event.querySelector('.event-people')?.textContent.trim() || '';
  const category = event.querySelector('.event-cat')?.textContent.trim() || '';
  const era = event.dataset.era || '';
  const year = estimateYearFromText(date);
  
  // Generate summary and article content
  const summary = context || `${name} marque un jalon important dans ${eraConfigs[era]?.label?.toLowerCase() || "l'histoire mondiale"}.`;
  const bullets = [
    `Ce qu'il se passe : ${name}.`,
    context ? `Pourquoi c'est important : ${context}.` : `Pourquoi c'est important : cet événement transforme durablement le cours de l'histoire.`,
    people ? `Acteurs ou peuples liés : ${people}.` : `Portée : l'événement s'inscrit dans la période ${eraConfigs[era]?.label || 'historique'} et aide à comprendre sa dynamique.`
  ];
  const articleParagraphs = [
    `${date} : ${name}. ${context || "L'événement s'impose comme un moment charnière dans la chronologie mondiale."}`,
    people ? `Les principaux acteurs associés sont ${people}. Leur rôle aide à comprendre comment cette rupture s'est produite et pourquoi elle a marqué son époque.` : `L'intérêt de cet événement tient à ses conséquences politiques, culturelles, scientifiques ou sociales, selon le contexte de la période.`,
    `Replacé dans ${eraConfigs[era]?.label || 'sa période'}, ce moment sert de repère pour lire les enchaînements historiques qui suivent.`
  ];

  const entry = {
    id: `event-${index}`,
    type: 'event',
    era,
    date,
    year,
    name,
    context,
    people,
    category,
    isMajor: event.classList.contains('major'),
    summary,
    bullets,
    articleTitle: `${name} : le fait à retenir`,
    articleParagraphs,
    sourceLabel: event.classList.contains('major') ? 'Événement majeur' : 'Événement'
  };

  // Store reference back to DOM element
  event.dataset.entryId = entry.id;
  event.id = entry.id;
  event.classList.add('interactive');
  event.tabIndex = 0;
  event.setAttribute('role', 'button');

  return entry;
});

// Create lookup map for O(1) access
const eventMap = new Map(eventEntries.map(entry => [entry.id, entry]));
const allEntries = [...eventEntries];

// ═══════════════════════════════════════════════════════════════
// TOP 150 FEATURED EVENTS
// ═══════════════════════════════════════════════════════════════

const seenFeaturedDates = new Set();
const featuredDates = [...eventEntries]
  .sort((a, b) => {
    if (a.isMajor !== b.isMajor) return a.isMajor ? -1 : 1;
    return (a.year ?? Number.MAX_SAFE_INTEGER) - (b.year ?? Number.MAX_SAFE_INTEGER);
  })
  .filter(item => {
    const key = `${item.date}__${item.name}`;
    if (!item.date || !item.name || seenFeaturedDates.has(key)) return false;
    seenFeaturedDates.add(key);
    return true;
  })
  .slice(0, CONFIG.featuredDatesLimit)
  .map((item, index) => ({ ...item, num: index + 1 }));

// Render Top 150 grid
const grid = document.getElementById('top50Grid');
if (grid) {
  grid.innerHTML = featuredDates.map(item => `
    <div class="top50-item interactive" id="top-${item.id}" data-entry-id="${item.id}" tabindex="0" role="button">
      <div class="top50-num">${item.num}</div>
      <div class="top50-content">
        <div class="top50-date">${item.date}</div>
        <div class="top50-name">${item.name}</div>
      </div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════

function updateStats() {
  const uniqueDates = new Set(eventEntries.map(entry => entry.date)).size;
  const datesEl = document.getElementById('statDates');
  const eventsEl = document.getElementById('statEvents');
  const peopleEl = document.getElementById('statPeople');
  const markersEl = document.getElementById('statMarkers');

  if (datesEl) datesEl.textContent = `${uniqueDates}+`;
  if (eventsEl) eventsEl.textContent = `${eventEntries.length}+`;
  
  const peopleCount = new Set(
    eventEntries
      .flatMap(entry => entry.people ? entry.people.split(',').map(item => item.trim()) : [])
      .filter(Boolean)
  ).size;
  if (peopleEl) peopleEl.textContent = `${peopleCount}+`;
  if (markersEl) markersEl.textContent = '0';
}

// ═══════════════════════════════════════════════════════════════
// DETAIL PAGE RENDERING
// ═══════════════════════════════════════════════════════════════

const detailElements = {
  page: document.getElementById('detailPage'),
  kicker: document.getElementById('detailKicker'),
  date: document.getElementById('detailDate'),
  title: document.getElementById('detailTitle'),
  summary: document.getElementById('detailSummary'),
  bullets: document.getElementById('detailBullets'),
  articleTitle: document.getElementById('detailArticleTitle'),
  articleBody: document.getElementById('detailArticleBody'),
  meta: document.getElementById('detailMeta'),
  backLink: document.getElementById('detailBackLink'),
  searchLink: document.getElementById('detailSearchLink')
};

function getEntryById(id) {
  return eventMap.get(id) || null;
}

function buildDetailUrl(entryId, backId) {
  const url = new URL(window.location.href);
  url.searchParams.set('view', 'detail');
  url.searchParams.set('id', entryId);
  url.searchParams.set('back', backId || entryId);
  url.hash = '';
  return url.toString();
}

function renderDetail(entry) {
  if (!entry || !detailElements.page) return;

  detailElements.kicker.textContent = `${entry.sourceLabel} · ${eraConfigs[entry.era]?.label || 'Chronologie'}`;
  detailElements.date.textContent = entry.date;
  detailElements.title.textContent = entry.name;
  detailElements.summary.textContent = entry.summary;
  detailElements.bullets.innerHTML = entry.bullets.map(item => `<li>${item}</li>`).join('');
  detailElements.articleTitle.textContent = entry.articleTitle;
  detailElements.articleBody.innerHTML = entry.articleParagraphs.map(item => `<p>${item}</p>`).join('');
  detailElements.meta.innerHTML = '';

  const chips = [
    eraConfigs[entry.era]?.label || '',
    entry.category || '',
    entry.isMajor ? 'Majeur' : '',
    'Fiche cliquable'
  ].filter(Boolean);

  chips.forEach(label => {
    const span = document.createElement('span');
    span.textContent = label;
    detailElements.meta.appendChild(span);
  });

  const query = `${entry.name} ${entry.date}`;
  if (detailElements.searchLink) {
    detailElements.searchLink.href = `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=fr&gl=FR&ceid=FR:fr`;
  }
}

function activateEntryFromElement(element) {
  const backId = element.classList.contains('top50-item') 
    ? element.dataset.entryId 
    : (element.id || element.dataset.entryId);
  window.location.href = buildDetailUrl(element.dataset.entryId, backId);
}

// ═══════════════════════════════════════════════════════════════
// FILTERING SYSTEM
// ═══════════════════════════════════════════════════════════════

function syncActiveButtons(selector, matcher) {
  document.querySelectorAll(selector).forEach(button => {
    button.classList.toggle('active', matcher(button));
  });
}

function applyFilters() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    state.search = normalizeText(searchInput.value.trim());
  }
  
  const showEvents = state.type === 'all' || state.type === 'events' || state.type === 'people';
  const peopleOnly = state.type === 'people';

  // Filter individual events
  document.querySelectorAll('.event').forEach(event => {
    const entry = getEntryById(event.dataset.entryId);
    if (!entry) return;
    
    const haystack = normalizeText([entry.date, entry.name, entry.context, entry.people, entry.category].join(' '));
    const matchesSearch = !state.search || haystack.includes(state.search);
    const matchesType = showEvents && (!peopleOnly || !!entry.people);
    const matchesEra = state.era === 'all' || state.era === entry.era;
    const visible = matchesSearch && matchesType && matchesEra;
    event.classList.toggle('hidden', !visible);
  });

  // Hide/show geo labels based on visible children
  document.querySelectorAll('.geo-label').forEach(label => {
    const nextItems = [];
    let node = label.nextElementSibling;
    while (node && !node.classList.contains('geo-label') && !node.classList.contains('era-header')) {
      nextItems.push(node);
      node = node.nextElementSibling;
    }
    label.classList.toggle('hidden', !nextItems.some(item => !item.classList.contains('hidden')));
  });

  // Show/hide era sections
  document.querySelectorAll('.era-section').forEach(section => {
    if (section.id === 'era-top50') {
      section.style.display = state.era === 'top50' ? 'block' : 'none';
      return;
    }
    if (state.era === 'top50') {
      section.style.display = 'none';
      return;
    }
    const matchesEra = state.era === 'all' || section.id === `era-${state.era}`;
    const hasVisibleContent = !!section.querySelector('.event:not(.hidden)');
    section.style.display = matchesEra && hasVisibleContent ? 'block' : 'none';
  });

  // Filter Top 50 items
  document.querySelectorAll('.top50-item').forEach(item => {
    const entry = getEntryById(item.dataset.entryId);
    if (!entry) return;
    
    const haystack = normalizeText([entry.date, entry.name, entry.context, entry.people].join(' '));
    const visible = (!state.search || haystack.includes(state.search)) && (state.era === 'all' || state.era === 'top50');
    item.style.display = visible ? 'flex' : 'none';
  });

  // Update button states
  syncActiveButtons('#periodMenu button', button => button.dataset.era === state.era);
  syncActiveButtons('#typeMenu button', button => button.dataset.type === state.type);
}

// Filter action handlers
function setEraFilter(era) {
  state.era = era;
  applyFilters();
}

function setTypeFilter(type) {
  state.type = type === 'markers' ? 'events' : type;
  applyFilters();
}

function filterSearch() {
  if (state.era === 'top50' && document.getElementById('searchInput')?.value.trim()) {
    state.era = 'all';
  }
  applyFilters();
}

// ═══════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════

document.addEventListener('click', event => {
  const target = event.target.closest('.event, .top50-item');
  if (target) {
    activateEntryFromElement(target);
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const target = event.target.closest('.event, .top50-item');
  if (!target) return;
  event.preventDefault();
  activateEntryFromElement(target);
});

// ═══════════════════════════════════════════════════════════════
// RIGHT SIDEBAR NAVIGATION
// ═══════════════════════════════════════════════════════════════

const rightSidebarContent = document.getElementById('rightSidebarContent');

let countriesDataPromise = null;
function loadCountriesData() {
  if (!countriesDataPromise) {
    countriesDataPromise = fetch('data/countries.json')
      .then(res => (res.ok ? res.json() : []))
      .catch(() => []);
  }
  return countriesDataPromise;
}

async function buildSidebarContent() {
  const countries = await loadCountriesData();
  const countryItems = (countries || [])
    .map(country => ({
      label: `${country.flag ? `${country.flag} ` : ''}${country.name}`,
      id: country.id
    }))
    .filter(item => !!item.id && !!item.label);

  if (!rightSidebarContent) return;

  const periodItems = [
    { label: '⭐ Top 150 (défaut)', id: 'era-top50', openEra: 'top50' },
    { label: 'Toutes les périodes', id: 'top', openEra: 'all' },
    { label: 'Préhistoire', id: 'era-prehist', openEra: 'prehist' },
    { label: 'Antiquité', id: 'era-antiquite', openEra: 'antiquite' },
    { label: 'Moyen Âge', id: 'era-moyen-age', openEra: 'moyen-age' },
    { label: 'Temps modernes', id: 'era-modernes', openEra: 'modernes' },
    { label: 'Contemporain', id: 'era-contemporain', openEra: 'contemporain' }
  ];

  rightSidebarContent.innerHTML = `
    <details class="right-nav-group" open>
      <summary>⏳ Périodes</summary>
      <div class="right-nav-items">
        ${periodItems.map(item => `
          <button class="right-nav-item" data-kind="era" data-era="${item.openEra}" data-target="${item.id}">
            ${escapeHtml(item.label)}
          </button>
        `).join('')}
      </div>
    </details>

    <details class="right-nav-group">
      <summary>🌍 Pays (dérouler)</summary>
      <div class="right-nav-items">
        ${countryItems.map(item => `
          <button class="right-nav-item" data-kind="anchor" data-target="${item.id}">
            ${escapeHtml(item.label)}
          </button>
        `).join('')}
      </div>
    </details>
  `;

  rightSidebarContent.querySelectorAll('.right-nav-item').forEach(button => {
    button.addEventListener('click', () => {
      const kind = button.dataset.kind;
      if (kind === 'era') {
        state.era = button.dataset.era || 'all';
        applyFilters();
      }

      const targetId = button.dataset.target;
      if (targetId === 'top') {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        return;
      }

      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
        target.style.backgroundColor = 'rgba(0, 113, 227, 0.05)';
        setTimeout(() => { target.style.backgroundColor = ''; }, 900);
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// COUNTRY SECTIONS RENDERING
// ═══════════════════════════════════════════════════════════════

async function renderCountriesFromJson() {
  const mount = document.getElementById('countriesMount');
  if (!mount) return;
  
  const countries = await loadCountriesData();
  const missing = (countries || []).filter(country => country?.id && !document.getElementById(country.id));
  if (!missing.length) return;

  mount.innerHTML = missing.map(country => {
    const events = (country.events || []).slice(0, 40);
    const header = `
      <div class="era-header" style="background-color: rgba(0, 113, 227, 0.05); border-color: rgba(0, 113, 227, 0.1);">
        <div style="font-size: 2rem;">${escapeHtml(country.flag || '🏳️')}</div>
        <div class="era-title-block">
          <h3 style="margin: 0; font-size: 1.8rem;">${escapeHtml(country.name)}</h3>
          <p>${events.length} repères (Wikidata)</p>
        </div>
      </div>
    `;

    const itemsMarkup = events.map((ev, index) => {
      const entryId = `${country.id}-event-${index}`;
      return `
        <div class="event" data-era="country" data-entry-id="${entryId}">
          <div class="event-dot"></div>
          <div class="event-content">
            <span class="event-date">${escapeHtml(ev.date || ev.isoDate || '')}</span>
            <span class="event-text">
              <span class="event-name">${escapeHtml(ev.name || '')}</span>
              ${ev.context ? `<span class="event-context">${escapeHtml(ev.context)}</span>` : ''}
            </span>
            <span class="event-cat ${getCategoryClass(ev.category || 'Politique')}">${escapeHtml(ev.category || 'Politique')}</span>
          </div>
        </div>
      `;
    }).join('');

    return `<div class="era-section" id="${escapeHtml(country.id)}">${header}${itemsMarkup}</div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

// Initialize application
function init() {
  updateStats();
  applyFilters();
  buildSidebarContent();
  renderCountriesFromJson();

  // Handle detail view from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const detailMode = urlParams.get('view') === 'detail';
  
  if (detailMode && detailElements.page) {
    document.body.classList.add('detail-mode');
    const entry = getEntryById(urlParams.get('id'));
    const backId = urlParams.get('back');
    
    if (detailElements.backLink) {
      detailElements.backLink.href = `${window.location.pathname}${backId ? `#${backId}` : ''}`;
    }
    
    if (entry) {
      renderDetail(entry);
    } else {
      detailElements.kicker.textContent = 'Fiche historique';
      detailElements.date.textContent = '';
      detailElements.title.textContent = 'Événement introuvable';
      detailElements.summary.textContent = 'Cette fiche n'a pas pu être chargée. Utilise le bouton de retour pour revenir à la frise.';
      detailElements.bullets.innerHTML = '<li>Le lien ne correspond peut-être plus à un événement existant.</li>';
      detailElements.articleTitle.textContent = 'Retour conseillé';
      detailElements.articleBody.innerHTML = '<p>Reviens à la frise et reclique sur une date pour ouvrir une fiche à jour.</p>';
    }
  }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}