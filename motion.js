'use strict';
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const header = document.querySelector('.nav');
  const selectors = [
    '.editorial-head > *', '.service-preview',
    '.stage-kicker', '.split > div > :is(.eyebrow,h2,.lead,.flow-steps-mini,.text-link)',
    '.workflow-demo', '.teaser-header > *', '.work-teaser > div > *', '.work-teaser > .case-art',
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
      const delay = Math.min(siblings.indexOf(element), 2) * 70;
      element.style.setProperty('--scroll-delay', `${delay}ms`);
      element.classList.add('scroll-reveal');
      if (element.matches('.service-preview,.workflow-demo,.case-art,.service-visual,.booking-demo')) element.classList.add('scroll-visual');
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
})();
