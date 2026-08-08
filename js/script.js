

(function () {
  'use strict';

 
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* 
     1. VIEW / TAB NAVIGATION
   */
  const navLinks = $$('.nav__link');
  const views    = $$('.view');
  const nav       = $('.nav');
  const navList   = $('#navList');
  const navToggle = $('#navToggle');

  /**
   * Show a single view by name and sync nav highlight + hash.
   * @param {string} name  
   * @param {boolean} push 
   */
  function showView(name, push = true) {
    const target = views.find(v => v.dataset.view === name);
    if (!target) return;

    views.forEach(v => v.classList.toggle('is-active', v === target));
    navLinks.forEach(l => {
      const active = l.dataset.view === name;
      l.classList.toggle('is-active', active);
      if (active) l.setAttribute('aria-current', 'page');
      else        l.removeAttribute('aria-current');
    });

    // Re-run reveal detection for the freshly shown view
    if (window.PortfolioAnim && typeof window.PortfolioAnim.refresh === 'function') {
      window.PortfolioAnim.refresh(target);
    }

  
    window.scrollTo(0, 0);

    if (push && ('#' + name) !== window.location.hash) {
      history.pushState({ view: name }, '', '#' + name);
    }

    closeMenu();
  }

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showView(link.dataset.view);
    });
  });

  /* Back / forward buttons */
  window.addEventListener('popstate', () => {
    const name = (window.location.hash || '#resume').slice(1);
    showView(name, false);
  });

  /* Deep-link on first load */
  function initialView() {
    const name = (window.location.hash || '#resume').slice(1);
    const exists = views.some(v => v.dataset.view === name);
    showView(exists ? name : 'resume', false);
  }

  /* 
     2. MOBILE MENU
   */
  function openMenu()  { nav.classList.add('is-open');  navToggle.setAttribute('aria-expanded', 'true'); }
  function closeMenu() { nav.classList.remove('is-open'); navToggle.setAttribute('aria-expanded', 'false'); }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      nav.classList.contains('is-open') ? closeMenu() : openMenu();
    });
  }
  /* Click outside closes the mobile menu */
  document.addEventListener('click', e => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target)) closeMenu();
  });
  /* Escape closes it too */
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* 
     3. PROJECT FILTERING
   */
  const filters = $$('.filter');
  const projects = $$('.proj');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const cat = btn.dataset.filter;
      projects.forEach(card => {
        const match = cat === 'all' || card.dataset.cat === cat;
        card.classList.toggle('is-hidden', !match);
        if (match) {
          // retrigger entrance animation
          card.classList.remove('is-enter');
          // force reflow so the animation restarts
          void card.offsetWidth;
          card.classList.add('is-enter');
        }
      });
    });
  });

  /* 
     4. BACK TO TOP
   */
  const toTop = $('#toTop');
  if (toTop) {
    const onScroll = () => toTop.classList.toggle('is-visible', window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

 
  /* Current year in footer */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Name pronunciation via Web Speech API  */
  const pronounceBtn = $('.pronounce');
  if (pronounceBtn && 'speechSynthesis' in window) {
    pronounceBtn.addEventListener('click', () => {
      const name = ($('.hero__name') && $('.hero__name').textContent.trim()) || '';
      if (!name) return;
      const u = new SpeechSynthesisUtterance(name);
      u.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    });
  }

 
  initialView();
})();
