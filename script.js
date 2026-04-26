// Avocat Bogdan Constantin Tănase - script.js
// Vanilla ES2023 module: header state, mobile menu, parallax,
// reveal-on-scroll, smooth anchors, contact form fallback.

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(min-width: 768px)');
  const ac = new AbortController();
  const { signal } = ac;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year in footer
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header scroll state + scroll progress
  const header = $('.site-header');
  const progressBar = $('.scroll-progress span');
  let progressRaf = 0;
  const updateScrollState = () => {
    progressRaf = 0;
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (y / docHeight) * 100) : 0;
      progressBar.style.width = pct.toFixed(2) + '%';
    }
  };
  const onScrollState = () => {
    if (!progressRaf) progressRaf = requestAnimationFrame(updateScrollState);
  };
  updateScrollState();
  window.addEventListener('scroll', onScrollState, { passive: true, signal });
  window.addEventListener('resize', onScrollState, { passive: true, signal });

  // Mobile menu (dialog)
  const menu = $('#mobile-menu');
  const toggleBtn = $('.menu-toggle');
  const closeBtn = $('.menu-close');

  const openMenu = () => {
    if (!menu) return;
    if (typeof menu.showModal === 'function') {
      try { menu.showModal(); } catch { menu.setAttribute('open', ''); }
    } else {
      menu.setAttribute('open', '');
    }
    document.body.classList.add('menu-open');
    toggleBtn?.setAttribute('aria-expanded', 'true');
  };
  const closeMenu = () => {
    if (!menu) return;
    if (menu.open && typeof menu.close === 'function') menu.close();
    else menu.removeAttribute('open');
    document.body.classList.remove('menu-open');
    toggleBtn?.setAttribute('aria-expanded', 'false');
  };

  toggleBtn?.addEventListener('click', openMenu, { signal });
  closeBtn?.addEventListener('click', closeMenu, { signal });
  menu?.addEventListener('click', (e) => {
    const rect = menu.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inside) closeMenu();
  }, { signal });
  menu?.addEventListener('cancel', (e) => { e.preventDefault(); closeMenu(); }, { signal });

  $$('#mobile-menu [data-close]').forEach((a) => {
    a.addEventListener('click', closeMenu, { signal });
  });

  // Smooth anchors with header offset (graceful enhancement)
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }, { signal });
  });

  // Reveal on scroll
  const revealTargets = $$('.section, .card, .value, .hero-meta');
  revealTargets.forEach((el) => el.classList.add('reveal'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  // Parallax on hero, desktop only, rAF-driven
  const heroLayer = $('.hero-layer');
  let parallaxRaf = 0;
  let lastY = 0;
  const onParallax = () => {
    parallaxRaf = 0;
    if (!heroLayer) return;
    const y = lastY;
    const offset = Math.min(80, y * 0.18);
    heroLayer.style.transform = `translate3d(0, ${offset}px, 0)`;
  };
  const onWindowScroll = () => {
    lastY = window.scrollY;
    if (!parallaxRaf) parallaxRaf = requestAnimationFrame(onParallax);
  };
  const enableParallax = () => {
    if (reduceMotion || !isDesktop.matches || !heroLayer) return;
    window.addEventListener('scroll', onWindowScroll, { passive: true, signal });
    onWindowScroll();
  };
  enableParallax();
  isDesktop.addEventListener('change', enableParallax, { signal });

  // Contact form: mailto fallback (no backend)
  const form = $('#contact-form');
  if (form) {
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const data = new FormData(form);
      const nume = String(data.get('nume') || '').trim();
      const tel = String(data.get('telefon') || '').trim();
      const email = String(data.get('email') || '').trim();
      const mesaj = String(data.get('mesaj') || '').trim();
      const subject = `Solicitare consultație - ${nume}`;
      const body = [
        `Nume: ${nume}`,
        `Telefon: ${tel}`,
        email ? `Email: ${email}` : null,
        '',
        'Mesaj:',
        mesaj
      ].filter(Boolean).join('\n');
      const href = `mailto:bogdan@avocatbogdantanase.ro?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
      if (status) {
        status.textContent = 'Se deschide aplicația de email pentru trimiterea mesajului.';
        status.classList.remove('is-err');
        status.classList.add('is-ok');
      }
    }, { signal });
  }

  // Cookie banner (no actual cookies, just a notice stored in localStorage)
  const banner = $('#cookie-banner');
  if (banner) {
    let accepted = false;
    try { accepted = localStorage.getItem('cookieNoticeAck') === '1'; } catch {}
    if (!accepted) {
      banner.hidden = false;
      requestAnimationFrame(() => banner.classList.add('is-visible'));
    }
    banner.addEventListener('click', (e) => {
      const target = e.target instanceof Element ? e.target.closest('[data-cookie-accept]') : null;
      if (!target) return;
      try { localStorage.setItem('cookieNoticeAck', '1'); } catch {}
      banner.classList.remove('is-visible');
      window.setTimeout(() => { banner.hidden = true; }, 350);
    }, { signal });
  }

  // Cleanup safety on pagehide
  window.addEventListener('pagehide', () => ac.abort(), { once: true });
})();
