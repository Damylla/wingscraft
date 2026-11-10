'use strict';
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.nav');
  const selectors = [
    '.service-preview', '.split > div > :is(.eyebrow,h2,.lead,.text-link)',
    '.workflow-demo', '.work-teaser > div > *', '.work-teaser > .case-art',
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
})();
