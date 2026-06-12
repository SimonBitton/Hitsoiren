import { state } from './state.js';
import { escapeHtml, getCategoryClass } from './utils.js';

/* ══════════════════════════════════════════════════
   FRISE INTERACTIVE — bande chronologique zoomable
   Échelle signée-logarithmique pour faire cohabiter
   la préhistoire (millions d'années) et l'ère moderne.
══════════════════════════════════════════════════ */

const friseState = {
  zoom: 1,
  events: []
};

const ERA_COLORS = {
  prehist: 'var(--era-prehist)',
  antiquite: 'var(--era-antiquite)',
  'moyen-age': 'var(--era-moyen-age)',
  modernes: 'var(--era-modernes)',
  contemporain: 'var(--era-contemporain)'
};

function signedLog(year) {
  return Math.sign(year) * Math.log10(1 + Math.abs(year));
}

function formatYear(year) {
  if (year === null || year === undefined) return '';
  const pretty = Math.abs(year).toLocaleString('fr-FR');
  return year < 0 ? `${pretty} av. J.-C.` : pretty;
}

export function renderFriseBand(slot, events) {
  if (!slot) return;
  const dated = (events || []).filter((event) => Number.isFinite(event._year));
  friseState.events = dated;

  if (dated.length < 2) {
    slot.innerHTML = '';
    return;
  }

  slot.innerHTML = `
    <section class="frise" aria-label="Frise chronologique interactive">
      <div class="frise-header">
        <div class="frise-title">🕰️ Frise interactive <span class="frise-hint">— glissez pour parcourir, boutons (ou Ctrl+molette) pour zoomer</span></div>
        <div class="frise-controls">
          <button class="frise-btn" data-frise="out" type="button" aria-label="Dézoomer">−</button>
          <button class="frise-btn" data-frise="reset" type="button" aria-label="Réinitialiser le zoom">⟲</button>
          <button class="frise-btn" data-frise="in" type="button" aria-label="Zoomer">+</button>
        </div>
      </div>
      <div class="frise-viewport" id="friseViewport">
        <div class="frise-track" id="friseTrack"></div>
      </div>
    </section>
  `;

  drawTrack();
  bindFrise(slot);
}

function drawTrack() {
  const track = document.getElementById('friseTrack');
  const viewport = document.getElementById('friseViewport');
  if (!track || !viewport) return;

  const years = friseState.events.map((event) => event._year);
  const slMin = signedLog(Math.min(...years));
  const slMax = signedLog(Math.max(...years));
  const span = slMax - slMin || 1;

  const baseWidth = Math.max(viewport.clientWidth || 800, 720);
  const trackWidth = Math.round(baseWidth * friseState.zoom);
  track.style.width = `${trackWidth}px`;

  const posOf = (year) => ((signedLog(year) - slMin) / span) * (trackWidth - 40) + 20;

  // Repères d'années (axe)
  const eras = state.timelineData?.eras || [];
  const eraBands = eras.map((era) => {
    const eraYears = friseState.events.filter((e) => e.era === era.id).map((e) => e._year);
    if (eraYears.length === 0) return '';
    const start = posOf(Math.min(...eraYears));
    const end = posOf(Math.max(...eraYears));
    return `<div class="frise-era-band" style="left:${start}px;width:${Math.max(end - start, 2)}px;background:${ERA_COLORS[era.id] || 'var(--color-primary)'}"></div>`;
  }).join('');

  const ticks = [];
  const tickValues = [-3000000, -100000, -3000, -500, 1, 500, 1000, 1500, 1800, 1900, 2000];
  tickValues.forEach((value) => {
    if (value < Math.min(...years) || value > Math.max(...years)) return;
    const left = posOf(value);
    ticks.push(`<div class="frise-tick" style="left:${left}px"><span>${formatYear(value)}</span></div>`);
  });

  const dots = friseState.events.map((event) => {
    const left = posOf(event._year);
    return `<button class="frise-dot ${event.major ? 'major' : ''} ${getCategoryClass(event.category)}" type="button"
      style="left:${left}px" data-id="${event.id}"
      title="${escapeHtml(event.date)} — ${escapeHtml(event.name)}"
      aria-label="${escapeHtml(event.date)} — ${escapeHtml(event.name)}"></button>`;
  }).join('');

  track.innerHTML = `
    <div class="frise-axis"></div>
    ${eraBands}
    ${ticks.join('')}
    ${dots}
  `;
}

function setZoom(next) {
  friseState.zoom = Math.min(12, Math.max(1, next));
  drawTrack();
}

function bindFrise(slot) {
  const viewport = slot.querySelector('#friseViewport');
  const track = slot.querySelector('#friseTrack');

  slot.querySelector('[data-frise="in"]')?.addEventListener('click', () => zoomAroundCenter(viewport, 1.5));
  slot.querySelector('[data-frise="out"]')?.addEventListener('click', () => zoomAroundCenter(viewport, 1 / 1.5));
  slot.querySelector('[data-frise="reset"]')?.addEventListener('click', () => {
    setZoom(1);
    if (viewport) viewport.scrollLeft = 0;
  });

  // Clic sur un point → fiche détail
  track?.addEventListener('click', (event) => {
    const dot = event.target.closest('.frise-dot');
    if (dot && window.showDetail) window.showDetail(dot.dataset.id);
  });

  // Zoom à la molette avec Ctrl/Cmd (sinon on laisse défiler la page).
  viewport?.addEventListener('wheel', (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const anchor = (viewport.scrollLeft + (event.clientX - rect.left)) / (track.offsetWidth || 1);
    setZoom(friseState.zoom * (event.deltaY < 0 ? 1.15 : 1 / 1.15));
    viewport.scrollLeft = anchor * track.offsetWidth - (event.clientX - rect.left);
  }, { passive: false });

  // Glisser pour déplacer
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  viewport?.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.frise-dot')) return;
    dragging = true;
    startX = event.clientX;
    startScroll = viewport.scrollLeft;
    viewport.classList.add('grabbing');
    viewport.setPointerCapture(event.pointerId);
  });
  viewport?.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    viewport.scrollLeft = startScroll - (event.clientX - startX);
  });
  const endDrag = () => { dragging = false; viewport?.classList.remove('grabbing'); };
  viewport?.addEventListener('pointerup', endDrag);
  viewport?.addEventListener('pointercancel', endDrag);
}

function zoomAroundCenter(viewport, factor) {
  if (!viewport) { setZoom(friseState.zoom * factor); return; }
  const track = viewport.querySelector('#friseTrack') || document.getElementById('friseTrack');
  const center = (viewport.scrollLeft + viewport.clientWidth / 2) / (track?.offsetWidth || 1);
  setZoom(friseState.zoom * factor);
  if (track) viewport.scrollLeft = center * track.offsetWidth - viewport.clientWidth / 2;
}
