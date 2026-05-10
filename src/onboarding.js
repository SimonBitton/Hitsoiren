import { setView } from './router.js';

const INTRO_SEEN_KEY = 'histoiren_intro_seen_v1';

const STEPS = [
  {
    view: 'timeline',
    selector: '#view-timeline .search-container',
    title: 'Recherche instantanée',
    description: 'Tapez une date, un événement ou un personnage pour filtrer la chronologie en direct.'
  },
  {
    view: 'timeline',
    selector: '#timelineContent .era-section',
    title: 'Chronologie structurée',
    description: 'Parcourez les époques et ouvrez chaque événement pour obtenir du contexte détaillé.'
  },
  {
    view: 'countries',
    selector: '#view-countries #countriesGrid',
    title: 'Exploration par pays',
    description: 'Naviguez pays par pays pour visualiser les événements historiques nationaux.'
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
      <p class="intro-subtitle">Explorez l'histoire mondiale de façon interactive.</p>
      <p class="intro-credit" aria-label="Créé par Simon Bitton"></p>
    </section>

    <div class="onboarding-highlight" aria-hidden="true"></div>

    <section class="onboarding-card" aria-live="polite">
      <div class="onboarding-progress" role="progressbar" aria-valuemin="1" aria-valuemax="${STEPS.length}" aria-valuenow="1">
        <span class="onboarding-progress-fill"></span>
      </div>
      <p class="onboarding-step-label">Étape <span data-step-current>1</span> / ${STEPS.length}</p>
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

export function resetOnboardingIntro() {
  localStorage.removeItem(INTRO_SEEN_KEY);
}

export async function maybeStartOnboarding(force = false) {
  if (!force && localStorage.getItem(INTRO_SEEN_KEY) === '1') return;
  if (document.querySelector('.onboarding-overlay')) return;
  if (force) resetOnboardingIntro();

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
  const credit = overlay.querySelector('.intro-credit');
  const allowedMouseTargets = '.onboarding-next, .onboarding-skip';
  let mouseLockMode = null;

  const blockMouseDuringOnboarding = (event) => {
    if (closed) return;
    const target = event.target;
    if (target instanceof Element && target.closest(allowedMouseTargets)) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const blockedMouseEvents = [
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    'contextmenu',
    'wheel'
  ];

  const frozenMouseEvents = [...blockedMouseEvents, 'mousemove'];

  const detachMouseLockListeners = () => {
    blockedMouseEvents.forEach((eventName) => {
      window.removeEventListener(eventName, blockMouseDuringOnboarding, { capture: true });
    });
    frozenMouseEvents.forEach((eventName) => {
      window.removeEventListener(eventName, blockMouseDuringOnboarding, { capture: true });
    });
  };

  const setMouseLockMode = (mode) => {
    if (mouseLockMode === mode) return;
    mouseLockMode = mode;
    detachMouseLockListeners();

    document.body.classList.remove('onboarding-mouse-locked', 'onboarding-mouse-frozen');
    if (mode === 'none') return;

    const events = mode === 'frozen' ? frozenMouseEvents : blockedMouseEvents;
    events.forEach((eventName) => {
      window.addEventListener(eventName, blockMouseDuringOnboarding, { capture: true, passive: false });
    });

    if (mode === 'frozen') {
      document.body.classList.add('onboarding-mouse-frozen');
      return;
    }
    document.body.classList.add('onboarding-mouse-locked');
  };

  // Intro "Bienvenue" : souris figée quelques secondes.
  setMouseLockMode('frozen');

  const releaseMouseLock = () => {
    setMouseLockMode('none');
  };

  const typeCredit = async (content) => {
    if (!credit) return;
    credit.textContent = '';
    credit.classList.add('is-visible');
    for (let i = 0; i < content.length; i += 1) {
      credit.textContent += content[i];
      // Slightly irregular cadence for a more natural feel.
      await wait(content[i] === ' ' ? 30 : 45);
    }
  };

  const finish = async () => {
    if (closed) return;
    closed = true;
    window.removeEventListener('resize', handleResize);
    releaseMouseLock();
    localStorage.setItem(INTRO_SEEN_KEY, '1');
    setView('presentation');
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

  const handleResize = () => {
    if (closed) return;
    runStep();
  };
  window.addEventListener('resize', handleResize);

  tryPlayWhoosh();
  await typeCredit('Créé par Simon Bitton');
  await wait(1700);
  splash.classList.add('is-hidden');
  overlay.classList.add('is-guided');
  // Étapes guidées : souris non utilisable, mais sans figer son mouvement.
  setMouseLockMode('locked');
  await wait(220);
  card.classList.add('is-visible');

  await runStep();
}
