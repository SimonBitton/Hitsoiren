function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function initHeroPointerParallax(reducedMotion) {
  const hero = document.querySelector('.archive-hero');
  if (!hero) return () => {};

  let pointerX = 0;
  let pointerY = 0;
  let currentX = 0;
  let currentY = 0;
  let frame = 0;

  const render = () => {
    frame = 0;
    currentX += (pointerX - currentX) * 0.12;
    currentY += (pointerY - currentY) * 0.12;
    hero.style.setProperty('--hero-pointer-x', String(currentX));
    hero.style.setProperty('--hero-pointer-y', String(currentY));
    if (Math.abs(pointerX - currentX) > 0.001 || Math.abs(pointerY - currentY) > 0.001) {
      frame = requestAnimationFrame(render);
    }
  };

  const schedule = () => {
    if (reducedMotion.matches) return;
    if (!frame) frame = requestAnimationFrame(render);
  };

  const onPointerMove = (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    pointerX = clamp(x, -1, 1);
    pointerY = clamp(y, -1, 1);
    schedule();
  };

  const onPointerLeave = () => {
    pointerX = 0;
    pointerY = 0;
    schedule();
  };

  const onTouchMove = (event) => {
    if (!event.touches || event.touches.length !== 1) return;
    const touch = event.touches[0];
    onPointerMove({ clientX: touch.clientX, clientY: touch.clientY });
  };

  hero.addEventListener('pointermove', onPointerMove, { passive: true });
  hero.addEventListener('pointerleave', onPointerLeave, { passive: true });
  hero.addEventListener('touchmove', onTouchMove, { passive: true });
  hero.addEventListener('touchend', onPointerLeave, { passive: true });

  return () => {
    hero.removeEventListener('pointermove', onPointerMove);
    hero.removeEventListener('pointerleave', onPointerLeave);
    hero.removeEventListener('touchmove', onTouchMove);
    hero.removeEventListener('touchend', onPointerLeave);
    if (frame) cancelAnimationFrame(frame);
  };
}

function initScrollProgress(reducedMotion) {
  let frame = 0;
  let pending = false;

  const onScroll = () => {
    if (pending || reducedMotion.matches) return;
    pending = true;
    frame = requestAnimationFrame(() => {
      pending = false;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = clamp(window.scrollY / maxScroll, 0, 1);
      document.documentElement.style.setProperty('--page-scroll-progress', progress.toFixed(4));
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return () => {
    window.removeEventListener('scroll', onScroll);
    if (frame) cancelAnimationFrame(frame);
  };
}

function initStaggeredReveal(reducedMotion) {
  const selectors = [
    '.explore-index-rows button',
    '.coverage-row',
    '.country-card',
    '.event',
    '.quiz-start-btn'
  ];
  const observer = !reducedMotion.matches && 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('ambient-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    : null;

  const apply = () => {
    const targets = selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)))
      .filter((element) => !element.classList.contains('ambient-pending') && !element.classList.contains('ambient-visible'));
    if (!targets.length) return;

    if (!observer) {
      targets.forEach((element) => element.classList.add('ambient-visible'));
      return;
    }

    targets.forEach((element, index) => {
      element.classList.add('ambient-pending');
      element.style.setProperty('--ambient-stagger', String(index % 8));
      observer.observe(element);
    });
  };

  apply();

  const onRefresh = () => apply();
  window.addEventListener('histoiren:sync-search-inputs', onRefresh);
  window.addEventListener('histoiren:countries-refresh', onRefresh);

  return () => {
    window.removeEventListener('histoiren:sync-search-inputs', onRefresh);
    window.removeEventListener('histoiren:countries-refresh', onRefresh);
    observer?.disconnect();
  };
}

export function initAmbientMotion() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let revealCleanup = null;

  const cleanups = [
    initHeroPointerParallax(reducedMotion),
    initScrollProgress(reducedMotion)
  ];

  const initReveals = () => {
    revealCleanup?.();
    revealCleanup = initStaggeredReveal(reducedMotion);
  };

  initReveals();

  const onReducedMotionChange = () => {
    document.querySelectorAll('.ambient-pending, .ambient-visible').forEach((node) => {
      node.classList.remove('ambient-pending', 'ambient-visible');
    });
    initReveals();
  };

  const onRerender = () => {
    initReveals();
  };

  reducedMotion.addEventListener('change', onReducedMotionChange);
  window.addEventListener('histoiren:motion-refresh', onRerender);

  return () => {
    reducedMotion.removeEventListener('change', onReducedMotionChange);
    window.removeEventListener('histoiren:motion-refresh', onRerender);
    revealCleanup?.();
    cleanups.forEach((cleanup) => cleanup());
  };
}