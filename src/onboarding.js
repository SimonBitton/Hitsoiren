import { setView } from './router.js';
import { markOnboardingSeen, readAppState } from './app-state.js';

const STEPS = [
  {
    view: 'frise',
    selector: '#view-frise .frise',
    title: 'Frise interactive',
    description: 'Zoomez et faites glisser la ligne du temps pour visualiser les grandes périodes historiques.'
  },
  {
    view: 'timeline',
    selector: '#view-timeline .search-container',
    title: 'Recherche instantanée',
    description: 'Tapez une date, un événement ou un personnage pour filtrer la liste chronologique en direct.'
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

function waitForFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
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
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'onboardingIntroTitle');
  overlay.innerHTML = `
    <button class="onboarding-skip" type="button" aria-label="Passer l'introduction">Passer</button>

    <section class="intro-splash" aria-label="Introduction Histoiren">
      <div class="intro-logo-wrap">
        <img src="favicon-histoiren.png" alt="Logo Histoiren" class="intro-logo" />
      </div>
      <h2 class="intro-title" id="onboardingIntroTitle">Bienvenue sur Histoiren</h2>
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
  card.style.bottom = 'auto';
  card.style.transform = 'none';
}

function centerCard(card) {
  card.style.top = 'auto';
  card.style.left = '50%';
  card.style.bottom = 'calc(5.5rem + env(safe-area-inset-bottom, 0px))';
  card.style.transform = 'translateX(-50%)';
}

function setHighlightRect(highlight, rect) {
  highlight.style.opacity = '1';
  highlight.style.top = `${Math.round(rect.top - 8)}px`;
  highlight.style.left = `${Math.round(rect.left - 8)}px`;
  highlight.style.width = `${Math.round(rect.width + 16)}px`;
  highlight.style.height = `${Math.round(rect.height + 16)}px`;
}

async function findStepTarget(step) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const target = document.querySelector(step.selector);
    const rect = target?.getBoundingClientRect();
    if (rect && rect.width > 0 && rect.height > 0) {
      return { target, rect };
    }
    await wait(120);
    await waitForFrame();
  }
  return { target: null, rect: null };
}

export async function maybeStartOnboarding(force = false) {
  const appState = readAppState();
  if (!force && appState.onboardingSeen) return;
  if (document.querySelector('.onboarding-overlay')) return;

  const overlay = createOverlay();
  const background = [
    document.querySelector('.main-nav'),
    document.getElementById('sidebarToggle'),
    document.getElementById('quickNav'),
    document.getElementById('main-content'),
    document.querySelector('footer')
  ].filter(Boolean);
  background.forEach((element) => {
    element.inert = true;
    element.setAttribute('aria-hidden', 'true');
  });
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

  const typeCredit = async (content) => {
    if (!credit) return;
    credit.textContent = '';
    credit.classList.add('is-visible');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      credit.textContent = content;
      return;
    }
    for (let i = 0; i < content.length; i += 1) {
      credit.textContent += content[i];
      await wait(content[i] === ' ' ? 30 : 45);
    }
  };

  const finish = async () => {
    if (closed) return;
    closed = true;
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('keydown', handleKeydown);
    markOnboardingSeen();
    setView('presentation');
    overlay.classList.add('is-exiting');
    await wait(450);
    overlay.remove();
    background.forEach((element) => {
      element.inert = false;
      element.removeAttribute('aria-hidden');
    });
    document.querySelector('[data-home-view="frise"]')?.focus({ preventScroll: true });
  };

  const runStep = async () => {
    const step = STEPS[currentStep];
    setView(step.view);
    await waitForFrame();
    await wait(180);

    const { target, rect } = await findStepTarget(step);

    title.textContent = step.title;
    text.textContent = step.description;
    stepCurrent.textContent = String(currentStep + 1);
    progressBar.setAttribute('aria-valuenow', String(currentStep + 1));
    progressFill.style.width = `${((currentStep + 1) / STEPS.length) * 100}%`;

    if (rect) {
      setHighlightRect(highlight, rect);
      placeCardNearTarget(card, rect);
      target.classList.add('onboarding-target-active');
      setTimeout(() => target.classList.remove('onboarding-target-active'), 700);
    } else {
      highlight.style.opacity = '0';
      centerCard(card);
    }

    next.textContent = currentStep === STEPS.length - 1 ? 'Terminer' : 'Suivant';
  };

  skipBtn.addEventListener('click', finish);
  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      finish();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...overlay.querySelectorAll('button:not([disabled])')]
      .filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', handleKeydown);
  overlay.addEventListener('click', (event) => {
    if (event.target.closest('.onboarding-card, .intro-splash, .onboarding-skip, .onboarding-next')) return;
    finish();
  });
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
  skipBtn.focus({ preventScroll: true });
  await typeCredit('Créé par Simon Bitton');
  await wait(900);
  splash.classList.add('is-hidden');
  overlay.classList.add('is-guided');
  await wait(180);
  card.classList.add('is-visible');

  await runStep();
}
