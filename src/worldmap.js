import { state } from './state.js';
import { CONTINENTS, getContinentOf } from './continents.js';

/* ══════════════════════════════════════════════════
   CARTE DU MONDE PAR CONTINENTS (SVG cliquable)
   Cliquer un continent filtre la liste des pays.
══════════════════════════════════════════════════ */

// Silhouettes simplifiées (viewBox 0 0 1000 500)
const SHAPES = {
  'amerique-nord': {
    paths: ['M92,98 L152,72 L232,66 L302,90 L280,122 L250,118 L264,148 L232,166 L246,198 L214,208 L224,242 L200,258 L186,224 L204,196 L172,190 L160,156 L126,150 L102,126 Z'],
    label: [188, 150]
  },
  'amerique-sud': {
    paths: ['M238,262 L288,256 L306,290 L300,324 L278,362 L264,404 L248,454 L232,420 L244,372 L226,338 L232,298 L228,276 Z'],
    label: [262, 352]
  },
  europe: {
    paths: ['M470,92 L508,74 L550,82 L584,96 L570,118 L586,134 L556,150 L560,174 L528,170 L518,148 L492,158 L474,132 L486,110 Z'],
    label: [524, 120]
  },
  afrique: {
    paths: ['M476,182 L542,176 L598,190 L630,214 L622,252 L602,290 L580,332 L556,374 L534,402 L514,372 L516,324 L498,288 L484,250 L470,214 Z'],
    label: [552, 292]
  },
  asie: {
    paths: ['M590,80 L662,58 L742,56 L822,64 L902,82 L938,118 L916,150 L878,150 L844,172 L810,162 L788,186 L730,222 L724,250 L710,228 L716,202 L688,196 L676,166 L640,166 L616,138 L600,110 Z'],
    label: [792, 120]
  },
  oceanie: {
    paths: [
      'M812,332 L884,322 L930,348 L924,394 L882,416 L830,408 L810,378 L814,350 Z',
      'M902,432 L922,426 L928,448 L908,456 Z'
    ],
    label: [868, 370]
  }
};

function countByContinent() {
  const counts = {};
  CONTINENTS.forEach((c) => { counts[c.key] = 0; });
  (state.countriesData || []).forEach((country) => {
    const k = getContinentOf(country.name);
    if (k) counts[k] += 1;
  });
  return counts;
}

export function renderWorldMap(container) {
  if (!container) return;
  const counts = countByContinent();

  if (!container.querySelector('svg')) {
    const groups = CONTINENTS.map((c) => {
      const shape = SHAPES[c.key];
      const paths = shape.paths.map((d) => `<path d="${d}" />`).join('');
      const [lx, ly] = shape.label;
      return `
        <g class="wm-continent" data-continent="${c.key}" style="--c:${c.color}"
           role="button" tabindex="0" aria-label="${c.label} — ${counts[c.key]} pays">
          ${paths}
          <text class="wm-label" x="${lx}" y="${ly}" text-anchor="middle">${c.label}</text>
          <text class="wm-count" x="${lx}" y="${ly + 16}" text-anchor="middle">${counts[c.key]} pays</text>
        </g>`;
    }).join('');

    container.innerHTML = `
      <div class="worldmap">
        <svg viewBox="0 0 1000 500" role="img" aria-label="Carte du monde par continents" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="wmOcean" cx="50%" cy="35%" r="80%">
              <stop class="wm-ocean-a" offset="0%"/>
              <stop class="wm-ocean-b" offset="100%"/>
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="1000" height="500" rx="20" fill="url(#wmOcean)"/>
          ${groups}
        </svg>
        <p class="worldmap-hint">Cliquez sur un continent pour explorer son histoire</p>
      </div>
    `;

    const select = (key) => {
      state.countryContinent = state.countryContinent === key ? 'all' : key;
      window.dispatchEvent(new Event('histoiren:countries-refresh'));
    };
    container.querySelectorAll('.wm-continent').forEach((g) => {
      g.addEventListener('click', () => select(g.dataset.continent));
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(g.dataset.continent); }
      });
    });
  }

  // Met à jour l'état actif
  container.querySelectorAll('.wm-continent').forEach((g) => {
    g.classList.toggle('active', g.dataset.continent === state.countryContinent);
    g.classList.toggle('dimmed', state.countryContinent !== 'all' && g.dataset.continent !== state.countryContinent);
  });
}
