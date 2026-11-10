'use strict';
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const header = document.querySelector('.nav');
  const selectors = [
    '.editorial-head > *', '.service-preview',
    '.stage-kicker', '.split > div > :is(.eyebrow,h2,.lead,.flow-steps-mini,.text-link)',
    '.workflow-demo', '.journey-step', '.teaser-header > *', '.work-teaser > div > *',
    '.work-teaser > .case-art', '.live-project-card',
    '.service-detail > .service-visual', '.service-detail > div:not(.service-visual) > *',
    '.section-heading > *', '.scope-grid article', '.profile > *',
    '.case-feature > *', '.booking-study > *', '.roadmap li',
    '.closing > *', '.section > .eyebrow', '.section > h2', '.section > details'
  ];
  const targets = [...document.querySelectorAll(selectors.join(','))];
  const revealed = new WeakSet();
  let observer;
  function show(element) {
    element.classList.remove('scroll-pending');
    revealed.add(element);
    observer?.unobserve(element);
  }
  function prepare() {
    observer?.disconnect();
    targets.forEach(element => element.classList.remove('scroll-pending'));
    if (preference.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) show(entry.target); });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    targets.forEach(element => {
      if (revealed.has(element)) return;
      // Keep the initial reading area visible, including restored scroll positions.
      if (element.getBoundingClientRect().top < innerHeight * .82) { show(element); return; }
      const siblings = [...element.parentElement.children].filter(child => targets.includes(child));
      const delay = Math.min(siblings.indexOf(element), 3) * 70;
      element.style.setProperty('--scroll-delay', `${delay}ms`);
      element.classList.add('scroll-reveal');
      if (element.matches('.service-preview,.workflow-demo,.case-art,.live-project-card,.service-visual,.booking-demo')) element.classList.add('scroll-visual');
      element.classList.add('scroll-pending');
      observer.observe(element);
    });
  }
  prepare();
  preference.addEventListener('change', prepare);
  document.addEventListener('wingscraft:language', prepare);
  document.addEventListener('focusin', event => {
    // Pointer focus must not jump a moving link between press and release.
    if (!event.target.matches(':focus-visible')) return;
    targets.filter(element => element.contains(event.target)).forEach(element => {
      element.classList.add('scroll-immediate');
      show(element);
    });
  });
  // Native anchor jumps and restored pages must also remain readable.
  addEventListener('pageshow', prepare);
  let scheduled = false;
  const updateHeader = () => { header?.classList.toggle('is-scrolled', scrollY > 24); scheduled = false; };
  updateHeader();
  addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateHeader); }
  }, { passive: true });

  // Subtle magnetic button response on fine pointers
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      if (preference.matches || !finePointer.matches) return;
      const r = btn.getBoundingClientRect();
      const x = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 4;
      const y = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 3;
      btn.style.setProperty('--mag-x', `${x.toFixed(1)}px`);
      btn.style.setProperty('--mag-y', `${y.toFixed(1)}px`);
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--mag-x', '0px');
      btn.style.setProperty('--mag-y', '0px');
    });
  });

  // Symbolic Hero Blueprint pointer-responsive depth
  const sculpture = document.getElementById('hero-sculpture');
  if (sculpture) {
    sculpture.addEventListener('pointermove', e => {
      if (preference.matches || !finePointer.matches) return;
      const r = sculpture.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      sculpture.style.setProperty('--ptr-x', nx.toFixed(2));
      sculpture.style.setProperty('--ptr-y', ny.toFixed(2));
    });
    sculpture.addEventListener('pointerleave', () => {
      sculpture.style.setProperty('--ptr-x', '0');
      sculpture.style.setProperty('--ptr-y', '0');
    });
  }

  // "From Idea to Launch" interactive journey progression
  document.querySelectorAll('[data-journey]').forEach(track => {
    const steps = [...track.querySelectorAll('.journey-step')];
    if (!steps.length) return;
    const activate = idx => {
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      track.style.setProperty('--journey-progress', `${((idx + 1) / steps.length) * 100}%`);
    };
    steps.forEach((step, idx) => {
      step.addEventListener('pointerenter', () => activate(idx));
      step.addEventListener('focus', () => activate(idx));
      step.addEventListener('click', () => activate(idx));
    });
    if ('IntersectionObserver' in window && !preference.matches) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            track.style.setProperty('--journey-progress', '100%');
            io.unobserve(track);
          }
        });
      }, { threshold: 0.35 });
      io.observe(track);
    }
  });
})();
