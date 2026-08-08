

(function () {
  'use strict';

  const prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealSelector = '.reveal';

  /* If IO is unavailable or motion is reduced, just show everything. */
  function showAllImmediately() {
    document.querySelectorAll(revealSelector).forEach(el => el.classList.add('in-view'));
    document.querySelectorAll('.tl-group').forEach(el => el.classList.add('in-view'));
  }

  if (prefersReduced || !('IntersectionObserver' in window)) {
    document.addEventListener('DOMContentLoaded', showAllImmediately);
    window.PortfolioAnim = { refresh: showAllImmediately };
    return;
  }

  
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // Apply optional stagger delay
      const delay = parseInt(el.dataset.delay || '0', 10);
      if (delay) el.style.transitionDelay = delay + 'ms';

      el.classList.add('in-view');

      // Mark timeline groups
      if (el.classList.contains('tl-group')) el.classList.add('in-view');

      obs.unobserve(el);
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  /* Observe every reveal element that hasn't fired yet. */
  function observeWithin(container) {
    const scope = container || document;
    scope.querySelectorAll(revealSelector).forEach(el => {
      if (!el.classList.contains('in-view')) observer.observe(el);
    });
    // Timeline groups may not carry .reveal but still want their badge pop
    scope.querySelectorAll('.tl-group').forEach(el => {
      if (!el.classList.contains('in-view')) observer.observe(el);
    });
  }

  
  function refresh(container) {
    requestAnimationFrame(() => {
      observeWithin(container);
      
      
      
      requestAnimationFrame(() => {
        (container || document).querySelectorAll(revealSelector).forEach(el => {
          if (el.classList.contains('in-view')) return;
          const r = el.getBoundingClientRect();
          const vh = window.innerHeight || document.documentElement.clientHeight;
          if (r.top < vh * 0.92 && r.bottom > 0) {
            const delay = parseInt(el.dataset.delay || '0', 10);
            if (delay) el.style.transitionDelay = delay + 'ms';
            el.classList.add('in-view');
            if (el.classList.contains('tl-group')) el.classList.add('in-view');
            observer.unobserve(el);
          }
        });
      });
    });
  }

  /* Expose API + boot */
  window.PortfolioAnim = { refresh, observeWithin };

  document.addEventListener('DOMContentLoaded', () => {
    // Observe the initially active view (and the whole document as a safety net)
    const active = document.querySelector('.view.is-active') || document;
    refresh(active);
  });
})();
