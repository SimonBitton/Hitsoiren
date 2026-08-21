import { state } from './state.js';
import { escapeHtml, getCategoryClass, getCategoryLabel } from './utils.js';

/* ══════════════════════════════════════════════════
   FRISE INTERACTIVE — bande chronologique zoomable
   Échelle signée-logarithmique pour faire cohabiter
   la préhistoire (millions d'années) et l'ère moderne.
   Les événements marquants portent une étiquette ;
   le zoom en révèle de plus en plus.
══════════════════════════════════════════════════ */

const friseState = {
  zoom: 1,
  events: [],
  geometry: null
};

function signedLog(year) {
  return Math.sign(year) * Math.log10(1 + Math.abs(year));
}

function inverseSignedLog(value) {
  if (!Number.isFinite(value)) return 0;
  const abs = Math.pow(10, Math.abs(value)) - 1;
  return Math.sign(value) * abs;
}

function formatYear(year) {
  if (year === null || year === undefined) return '';
  const pretty = Math.abs(year).toLocaleString('fr-FR');
  return year < 0 ? `${pretty} av. J.-C.` : pretty;
}

function shorten(text, max = 26) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

function buildTickValues(minYear, maxYear, zoom) {
  const candidates = [
    -3200000, -2000000, -1000000, -500000, -100000, -50000, -10000,
    -5000, -3000, -2000, -1000, -500, -100,
    0,
    100, 300, 500, 800, 1000, 1200, 1400, 1500, 1600, 1700,
    1800, 1850, 1900, 1914, 1945, 1960, 1989, 2000, 2010, 2020, 2026
  ];
  const inRange = candidates.filter((value) => value >= minYear && value <= maxYear);
  const maxTickCount = zoom >= 8 ? 18 : zoom >= 4 ? 14 : 10;
  if (inRange.length <= maxTickCount) return inRange;
  const step = Math.ceil(inRange.length / maxTickCount);
  return inRange.filter((_, index) => index % step === 0);
}

export function renderFriseBand(slot, events) {
  if (!slot) return;
  const dated = (events || []).filter((event) => Number.isFinite(event._year));
  friseState.events = dated.slice().sort((a, b) => a._year - b._year);

  if (friseState.events.length < 2) {
    slot.innerHTML = '';
    return;
  }

  slot.innerHTML = `
    <section class="frise" aria-label="Frise chronologique interactive">
      <div class="frise-header">
        <div class="frise-title">🕰️ Frise interactive
          <span class="frise-hint">glissez pour parcourir · zoomez pour révéler plus d'événements</span>
        </div>
        <div class="frise-controls">
          <button class="frise-btn" data-frise="out" type="button" aria-label="Dézoomer">−</button>
          <span class="frise-zoom-label" id="friseZoomLabel">×1</span>
          <button class="frise-btn" data-frise="in" type="button" aria-label="Zoomer">+</button>
          <button class="frise-btn frise-btn-reset" data-frise="reset" type="button" aria-label="Réinitialiser">⟲</button>
        </div>
      </div>
      <div class="frise-viewport" id="friseViewport">
        <div class="frise-track" id="friseTrack"></div>
      </div>
      <div class="frise-meta" aria-live="polite">
        <p class="frise-range" id="friseRangeLabel"></p>
        <div class="frise-focus-shell">
          <span class="frise-focus-label">focus</span>
          <strong id="friseFocusYear">-</strong>
        </div>
        <label class="frise-scrubber-wrap" for="friseScrubber">
          <span>navigation rapide</span>
          <input id="friseScrubber" class="frise-scrubber" type="range" min="0" max="1000" value="0" step="1" aria-label="Navigation rapide dans la frise">
        </label>
      </div>
      <div class="frise-tooltip" id="friseTooltip" hidden></div>
      <p class="frise-a11y-hint" id="friseA11yHint">Utilisez fleches gauche/droite pour defiler, + et - pour le zoom, 0 pour reinitialiser.</p>
    </section>
  `;

  drawTrack();
  bindFrise(slot);
}

function drawTrack() {
  const track = document.getElementById('friseTrack');
  const viewport = document.getElementById('friseViewport');
  if (!track || !viewport) return;

  const events = friseState.events;
  const years = events.map((event) => event._year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const slMin = signedLog(minYear);
  const slMax = signedLog(maxYear);
  const span = slMax - slMin || 1;

  const baseWidth = Math.max(viewport.clientWidth || 800, 720);
  const trackWidth = Math.round(baseWidth * friseState.zoom);
  track.style.width = `${trackWidth}px`;

  const pad = 36;
  const posOf = (year) => ((signedLog(year) - slMin) / span) * (trackWidth - pad * 2) + pad;

  const label = document.getElementById('friseZoomLabel');
  if (label) label.textContent = `×${friseState.zoom.toFixed(1).replace('.0', '')}`;

  // ── Rubans d'époques (fond) ──
  const eras = state.timelineData?.eras || [];
  const eraRibbons = eras.map((era) => {
    const eraEvents = events.filter((e) => e.era === era.id);
    if (eraEvents.length === 0) return '';
    const eraYears = eraEvents.map((e) => e._year);
    const start = posOf(Math.min(...eraYears));
    const end = posOf(Math.max(...eraYears));
    const width = Math.max(end - start, 6);
    const showLabel = width > 70;
    return `
      <div class="frise-ribbon era-${era.id}" style="left:${start}px;width:${width}px">
        ${showLabel ? `<span class="frise-ribbon-label">${escapeHtml(era.icon || '')} ${escapeHtml(era.name)}</span>` : ''}
      </div>`;
  }).join('');

  // ── Graduations ──
  const ticks = buildTickValues(minYear, maxYear, friseState.zoom)
    .filter((value) => value >= minYear && value <= maxYear)
    .map((value) => `<div class="frise-tick" style="left:${posOf(value)}px"><span>${formatYear(value)}</span></div>`)
    .join('');

  // ── Événements : étiquettes pour les majeurs (anti-collision), points pour les autres ──
  let lastAbove = -Infinity;
  let lastBelow = -Infinity;
  const minGap = 132;

  const markers = events.map((event, index) => {
    const left = posOf(event._year);
    const catClass = getCategoryClass(event.category);

    let labeled = false;
    let side = '';
    if (event.major) {
      if (left - lastAbove >= minGap) { labeled = true; side = 'above'; lastAbove = left; }
      else if (left - lastBelow >= minGap) { labeled = true; side = 'below'; lastBelow = left; }
    }

    const labelHtml = labeled
      ? `<span class="frise-flag frise-flag-${side}">
           <span class="frise-flag-year">${escapeHtml(formatYear(event._year))}</span>
           <span class="frise-flag-name">${escapeHtml(shorten(event.name))}</span>
         </span>`
      : '';

    return `
      <button class="frise-event ${event.major ? 'major' : ''} ${labeled ? `labeled ${side}` : ''} ${catClass}"
        type="button" style="left:${left}px" data-id="${escapeHtml(event.id)}" data-index="${index}"
        aria-label="${escapeHtml(formatYear(event._year))} — ${escapeHtml(event.name)}">
        <span class="frise-event-dot"></span>
        ${labelHtml}
      </button>`;
  }).join('');

  track.innerHTML = `
    <div class="frise-ribbons">${eraRibbons}</div>
    <div class="frise-axis"></div>
    <div class="frise-ticks">${ticks}</div>
    ${markers}
  `;

  friseState.geometry = {
    minYear,
    maxYear,
    slMin,
    slMax,
    span,
    trackWidth,
    pad
  };

  const rangeLabel = document.getElementById('friseRangeLabel');
  if (rangeLabel) {
    rangeLabel.textContent = `${formatYear(minYear)} -> ${formatYear(maxYear)} · ${events.length.toLocaleString('fr-FR')} evenements`;
  }
}

function setZoom(next) {
  friseState.zoom = Math.min(16, Math.max(1, next));
  drawTrack();
}

function bindFrise(slot) {
  const viewport = slot.querySelector('#friseViewport');
  const track = slot.querySelector('#friseTrack');
  const tooltip = slot.querySelector('#friseTooltip');
  const scrubber = slot.querySelector('#friseScrubber');
  const focusYear = slot.querySelector('#friseFocusYear');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (viewport) {
    viewport.tabIndex = 0;
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-label', 'Zone interactive de la frise');
    viewport.setAttribute('aria-describedby', 'friseA11yHint');
  }

  slot.querySelector('[data-frise="in"]')?.addEventListener('click', () => zoomAroundCenter(viewport, 1.6));
  slot.querySelector('[data-frise="out"]')?.addEventListener('click', () => zoomAroundCenter(viewport, 1 / 1.6));
  slot.querySelector('[data-frise="reset"]')?.addEventListener('click', () => {
    setZoom(1);
    if (viewport) viewport.scrollLeft = 0;
    syncViewportMeta();
  });

  const syncViewportMeta = () => {
    if (!viewport || !scrubber || !focusYear || !friseState.geometry) return;
    const maxScroll = Math.max(1, viewport.scrollWidth - viewport.clientWidth);
    const progress = Math.max(0, Math.min(1, viewport.scrollLeft / maxScroll));
    scrubber.value = String(Math.round(progress * 1000));

    const centerPx = viewport.scrollLeft + viewport.clientWidth * 0.5;
    const normalized = (centerPx - friseState.geometry.pad) / Math.max(1, friseState.geometry.trackWidth - friseState.geometry.pad * 2);
    const centerSigned = friseState.geometry.slMin + friseState.geometry.span * Math.max(0, Math.min(1, normalized));
    focusYear.textContent = formatYear(Math.round(inverseSignedLog(centerSigned)));
  };

  let scrollTicking = false;
  viewport?.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      scrollTicking = false;
      syncViewportMeta();
    });
  }, { passive: true });

  scrubber?.addEventListener('input', () => {
    if (!viewport) return;
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    viewport.scrollLeft = (Number(scrubber.value) / 1000) * maxScroll;
    syncViewportMeta();
  });

  // Clic sur un événement → fiche détail
  track?.addEventListener('click', (event) => {
    const marker = event.target.closest('.frise-event');
    if (marker && !justDragged && window.showDetail) window.showDetail(marker.dataset.id);
  });

  // Tooltip au survol
  const showTooltip = (marker) => {
    if (!tooltip) return;
    const evt = friseState.events[Number(marker.dataset.index)];
    if (!evt) return;
    tooltip.innerHTML = `
      <span class="frise-tooltip-date">${escapeHtml(formatYear(evt._year))}</span>
      <span class="frise-tooltip-name">${escapeHtml(evt.name)}</span>
      <span class="frise-tooltip-cat ${getCategoryClass(evt.category)}">${escapeHtml(getCategoryLabel(evt.category))}</span>`;
    tooltip.hidden = false;
    const friseRect = tooltip.parentElement.getBoundingClientRect();
    const mRect = marker.getBoundingClientRect();
    let x = mRect.left - friseRect.left - tooltip.offsetWidth / 2;
    x = Math.max(8, Math.min(x, friseRect.width - tooltip.offsetWidth - 8));
    tooltip.style.left = `${x}px`;
  };
  track?.addEventListener('pointerover', (event) => {
    const marker = event.target.closest('.frise-event');
    if (marker) showTooltip(marker);
  });
  track?.addEventListener('pointerout', (event) => {
    if (event.target.closest('.frise-event') && tooltip) tooltip.hidden = true;
  });

  // Zoom à la molette avec Ctrl/Cmd (sinon on laisse défiler la page)
  viewport?.addEventListener('wheel', (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const anchor = (viewport.scrollLeft + (event.clientX - rect.left)) / (track.offsetWidth || 1);
    setZoom(friseState.zoom * (event.deltaY < 0 ? 1.18 : 1 / 1.18));
    viewport.scrollLeft = anchor * track.offsetWidth - (event.clientX - rect.left);
    syncViewportMeta();
  }, { passive: false });

  // Glisser pour déplacer
  let dragging = false;
  let moved = false;
  let startX = 0;
  let startScroll = 0;
  let lastX = 0;
  let lastMoveAt = 0;
  let velocity = 0;
  let inertiaFrame = 0;

  const stopInertia = () => {
    if (!inertiaFrame) return;
    cancelAnimationFrame(inertiaFrame);
    inertiaFrame = 0;
  };

  const runInertia = () => {
    if (!viewport || prefersReducedMotion.matches) return;
    stopInertia();

    const tick = () => {
      velocity *= 0.93;
      if (Math.abs(velocity) < 0.08) {
        inertiaFrame = 0;
        return;
      }
      viewport.scrollLeft -= velocity;
      const atStart = viewport.scrollLeft <= 0;
      const atEnd = viewport.scrollLeft >= (viewport.scrollWidth - viewport.clientWidth);
      if (atStart || atEnd) {
        inertiaFrame = 0;
        return;
      }
      inertiaFrame = requestAnimationFrame(tick);
    };

    inertiaFrame = requestAnimationFrame(tick);
  };

  viewport?.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.frise-event')) return;
    stopInertia();
    dragging = true;
    moved = false;
    startX = event.clientX;
    lastX = event.clientX;
    lastMoveAt = performance.now();
    velocity = 0;
    startScroll = viewport.scrollLeft;
    viewport.classList.add('grabbing');
    viewport.setPointerCapture(event.pointerId);
  });
  viewport?.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastMoveAt);
    velocity = (event.clientX - lastX) / dt * 16;
    lastX = event.clientX;
    lastMoveAt = now;
    if (Math.abs(event.clientX - startX) > 4) moved = true;
    viewport.scrollLeft = startScroll - (event.clientX - startX);
  });
  const endDrag = () => {
    dragging = false;
    justDragged = moved;
    setTimeout(() => { justDragged = false; }, 0);
    viewport?.classList.remove('grabbing');
    if (moved) runInertia();
    syncViewportMeta();
  };
  viewport?.addEventListener('pointerup', endDrag);
  viewport?.addEventListener('pointercancel', endDrag);

  viewport?.addEventListener('keydown', (event) => {
    if (!viewport) return;
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      zoomAroundCenter(viewport, 1.6);
      return;
    }
    if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      zoomAroundCenter(viewport, 1 / 1.6);
      return;
    }
    if (event.key === '0') {
      event.preventDefault();
      setZoom(1);
      viewport.scrollLeft = 0;
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      viewport.scrollLeft += Math.max(120, viewport.clientWidth * 0.18);
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      viewport.scrollLeft -= Math.max(120, viewport.clientWidth * 0.18);
    }
    syncViewportMeta();
  });

  syncViewportMeta();
}

let justDragged = false;

function zoomAroundCenter(viewport, factor) {
  if (!viewport) { setZoom(friseState.zoom * factor); return; }
  const track = document.getElementById('friseTrack');
  const center = (viewport.scrollLeft + viewport.clientWidth / 2) / (track?.offsetWidth || 1);
  setZoom(friseState.zoom * factor);
  if (track) viewport.scrollLeft = center * track.offsetWidth - viewport.clientWidth / 2;
}
