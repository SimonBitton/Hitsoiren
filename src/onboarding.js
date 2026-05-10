import { setView } from './router.js';

const INTRO_SEEN_KEY = 'histoiren_intro_seen_v1';

const STEPS = [
  {
    view: 'timeline',
    selector: '#view-timeline .search-container',
    title: 'Recherche instantanee',
    description: 'Tapez une date, un evenement ou un personnage pour filtrer la chronologie en direct.'
  },
  {
    view: 'timeline',
    selector: '#timelineContent .era-section',
    title: 'Chronologie structuree',
    description: 'Parcourez les epoques et ouvrez chaque evenement pour obtenir du contexte detaille.'
  },
  {
    view: 'countries',
    selector: '#view-countries #countriesGrid',
    title: 'Exploration par pays',
    description: 'Naviguez pays par pays pour visualiser les evenements historiques nationaux.'
  }
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tryPlayWhoosh() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    for (let i = 0; i < channel.length; i += 1) channel[i] = (Math.random() * 2 - 1) * 0.25;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1200, now);
    bandpass.frequency.exponentialRampToValueAtTime(280, now + 0.25);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.025, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.25);
  } catch {
    // Optional sound: ignore failures.
  }
}

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';
  overlay.innerHTML = `
    <button class="onboarding-skip" type="button" aria-label="Passer l'introduction">Passer</button>

    <section class="intro-splash" aria-label="Introduction Histoiren">
      <div class="intro-logo-wrap">
        <img src="favicon-histoiren.png" alt="Logo Histoiren" class="intro-logo" />
      </div>
      <h2 class="intro-title">Bienvenue sur Histoiren</h2>
      <p class="intro-subtitle">Explorez l'histoire mondiale de facon interactive.</p>
    </section>

    <div class="onboarding-highlight" aria-hidden="true"></div>

    <section class="onboarding-card" aria-live="polite">
      <div class="onboarding-progress" role="progressbar" aria-valuemin="1" aria-valuemax="${STEPS.length}" aria-valuenow="1">
        <span class="onboarding-progress-fill"></span>
      </div>
      <p class="onboarding-step-label">Etape <span data-step-current>1</span> / ${STEPS.length}</p>
      <h3 class="onboarding-card-title"></h3>
      <p class="onboarding-card-text"></p>
      <button class="onboarding-next" type="button">Suivant</button>
    </section>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function placeCardNearTarget(card, rect) {
  const margin = 16;
  const cardRect = card.getBoundingClientRect();

  let top = rect.bottom + 14;
  if (top + cardRect.height > window.innerHeight - margin) {
    top = Math.max(margin, rect.top - cardRect.height - 14);
  }

  let left = rect.left;
  if (left + cardRect.width > window.innerWidth - margin) {
    left = window.innerWidth - cardRect.width - margin;
  }
  if (left < margin) left = margin;

  card.style.top = `${Math.round(top)}px`;
  card.style.left = `${Math.round(left)}px`;
}

function setHighlightRect(highlight, rect) {
  highlight.style.opacity = '1';
  highlight.style.top = `${Math.round(rect.top - 8)}px`;
  highlight.style.left = `${Math.round(rect.left - 8)}px`;
  highlight.style.width = `${Math.round(rect.width + 16)}px`;
  highlight.style.height = `${Math.round(rect.height + 16)}px`;
}

export async function maybeStartOnboarding() {
  if (localStorage.getItem(INTRO_SEEN_KEY) === '1') return;

  const overlay = createOverlay();
  const splash = overlay.querySelector('.intro-splash');
  const skipBtn = overlay.querySelector('.onboarding-skip');
  const highlight = overlay.querySelector('.onboarding-highlight');
  const card = overlay.querySelector('.onboarding-card');
  const title = overlay.querySelector('.onboarding-card-title');
  const text = overlay.querySelector('.onboarding-card-text');
  const next = overlay.querySelector('.onboarding-next');
  const progressFill = overlay.querySelector('.onboarding-progress-fill');
  const progressBar = overlay.querySelector('.onboarding-progress');
  const stepCurrent = overlay.querySelector('[data-step-current]');

  let currentStep = 0;
  let closed = false;

  const finish = async () => {
    if (closed) return;
    closed = true;
    localStorage.setItem(INTRO_SEEN_KEY, '1');
    overlay.classList.add('is-exiting');
    await wait(450);
    overlay.remove();
  };

  const runStep = async () => {
    const step = STEPS[currentStep];
    setView(step.view);
    await wait(220);

    const target = document.querySelector(step.selector);
    const rect = target?.getBoundingClientRect();

    title.textContent = step.title;
    text.textContent = step.description;
    stepCurrent.textContent = String(currentStep + 1);
    progressBar.setAttribute('aria-valuenow', String(currentStep + 1));
    progressFill.style.width = `${((currentStep + 1) / STEPS.length) * 100}%`;

    if (rect && rect.width > 0 && rect.height > 0) {
      setHighlightRect(highlight, rect);
      placeCardNearTarget(card, rect);
      target.classList.add('onboarding-target-active');
      setTimeout(() => target.classList.remove('onboarding-target-active'), 700);
    } else {
      highlight.style.opacity = '0';
      card.style.top = 'auto';
      card.style.left = '50%';
      card.style.bottom = '20px';
      card.style.transform = 'translateX(-50%)';
    }

    next.textContent = currentStep === STEPS.length - 1 ? 'Terminer' : 'Suivant';
  };

  skipBtn.addEventListener('click', finish);
  next.addEventListener('click', async () => {
    if (currentStep >= STEPS.length - 1) {
      await finish();
      return;
    }
    currentStep += 1;
    await runStep();
  });

  window.addEventListener('resize', () => {
    if (closed) return;
    runStep();
  });

  tryPlayWhoosh();
  await wait(1700);
  splash.classList.add('is-hidden');
  await wait(220);
  card.classList.add('is-visible');

  await runStep();
}
