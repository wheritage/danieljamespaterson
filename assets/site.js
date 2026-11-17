/* ==========================================================================
   DANIEL JAMES PATERSON — comportements partagés
   Ordre de chargement : lenis.min.js, gsap.min.js, ScrollTrigger.min.js, puis ce fichier.
   Maison : expo.out pour 80 % des entrées, power2.in pour les sorties (~35 % plus courtes),
   aucun rebond, rien en boucle sans état derrière. Mouvement réduit : images finales, fondus seulement.
   ========================================================================== */
(function () {
  'use strict';

  /* Tout ce qui reste à brancher se règle ici */
  var CONFIG = {
    web3formsKey: '',   // clé Web3Forms (courriel instantané à chaque demande) : https://web3forms.com
    bookingUrl: '',     // lien Cal.com / Calendly de Daniel
    email: ''           // courriel public de Daniel (repli si le formulaire n'est pas branché)
  };

  var DJP = window.DJP = window.DJP || {};
  DJP.config = CONFIG;

  var html = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  html.classList.add('js');  // déjà posé dans <head> pour éviter un flash ; ici en filet
  if (reduce) html.classList.add('reduce');

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* Verrou de défilement : bloque aussi Lenis, qui défilerait malgré overflow: hidden */
  function lockScroll(on) {
    html.style.overflow = on ? 'hidden' : '';
    if (DJP.lenis) { if (on) DJP.lenis.stop(); else DJP.lenis.start(); }
  }
  DJP.lockScroll = lockScroll;

  /* ── Langue ── */
  DJP.lang = function () { return html.getAttribute('data-lang') === 'en' ? 'en' : 'fr'; };
  DJP.t = function (fr, en) { return DJP.lang() === 'en' ? en : fr; };
  function setLang(l) {
    l = l === 'en' ? 'en' : 'fr';
    html.setAttribute('data-lang', l);
    html.lang = l;
    store('djp-lang', l);
    document.querySelectorAll('[data-ph-fr]').forEach(function (el) { el.placeholder = el.getAttribute('data-ph-' + l); });
    document.querySelectorAll('[data-aria-fr]').forEach(function (el) { el.setAttribute('aria-label', el.getAttribute('data-aria-' + l)); });
    document.querySelectorAll('[data-txt-fr]').forEach(function (el) { el.textContent = el.getAttribute('data-txt-' + l); });
    var t = html.getAttribute('data-title-' + l);
    if (t) document.title = t;
    document.querySelectorAll('.lang-toggle button').forEach(function (b) {
      var on = b.getAttribute('data-l') === l;
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    });
    if (hasGsap) ScrollTrigger.refresh();
  }
  DJP.setLang = setLang;

  function initLang() {
    var q = new URLSearchParams(location.search).get('lang');
    setLang(q || store('djp-lang') || (navigator.language || '').slice(0, 2) === 'en' && 'en' || 'fr');
    document.querySelectorAll('.lang-toggle button').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.getAttribute('data-l')); });
    });
  }

  /* ── Menu mobile ── */
  function initMenu() {
    var burger = document.querySelector('.burger'), menu = document.getElementById('mobile-menu');
    if (!burger || !menu) return;
    function set(open) {
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      lockScroll(open);
    }
    burger.addEventListener('click', function () { set(!menu.classList.contains('open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { set(false); burger.focus(); } });
  }

  /* ── Défilement fluide : le ticker GSAP fait avancer Lenis, Lenis met ScrollTrigger à jour ── */
  function initSmoothScroll() {
    if (hasGsap) gsap.registerPlugin(ScrollTrigger);
    if (reduce || !window.Lenis || !hasGsap) return;
    var lenis = DJP.lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, stopInertiaOnNavigate: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.detail === 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || a.target === '_blank') return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      var norm = function (p) { return p.replace(/index(\.html)?$/, '').replace(/\.html$/, ''); };
      if (url.origin !== location.origin || norm(url.pathname) !== norm(location.pathname) || url.hash.length < 2) return;
      var target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.2, offset: 0 });
      if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    });
  }

  /* ── En-tête : fond après le héros, se range en descendant, revient en remontant ── */
  function initHeader() {
    var h = document.querySelector('.site-header');
    if (!h) return;
    if (!hasGsap) { h.classList.add('scrolled'); return; }
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var y = self.scroll();
        h.classList.toggle('scrolled', y > 40);
        var menuOpen = document.querySelector('.mobile-menu.open');
        h.classList.toggle('tucked', !menuOpen && y > 400 && self.direction === 1);
      }
    });
  }

  /* ── Parallaxe légère : data-parallax="0.12" (positions mesurées par ScrollTrigger) ── */
  function initParallax() {
    var els = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (!els.length || reduce || !hasGsap) return;
    ScrollTrigger.addEventListener('refreshInit', function () { els.forEach(function (el) { el.style.translate = ''; }); });
    els.forEach(function (el) {
      var sp = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      function upd(self) { el.style.translate = '0 ' + (((self.start + self.end) / 2 - self.scroll()) * -sp).toFixed(1) + 'px'; }
      ScrollTrigger.create({ trigger: el, start: 'top bottom+=200', end: 'bottom top-=200', onUpdate: upd, onRefresh: upd });
    });
  }

  /* ── Titres : chaque ligne (séparée par <br>) monte hors d'un masque ── */
  function splitLines(el) {
    if (el.__split) return el.__split;
    // Titre bilingue : chaque <span lang> est découpé séparément
    var hosts = [].slice.call(el.children).filter(function (c) { return c.hasAttribute('lang'); });
    if (!hosts.length) hosts = [el];
    hosts.forEach(function (host) {
      var parts = host.innerHTML.split(/<br\s*\/?>/i);
      host.innerHTML = parts.map(function (p) { return '<span class="line-mask"><span>' + p.trim() + '</span></span>'; }).join('');
    });
    el.__split = [].slice.call(el.querySelectorAll('.line-mask > span'));
    return el.__split;
  }

  function lineIn(el) {
    var lines = splitLines(el);
    return gsap.from(lines, { yPercent: 110, duration: 1.15, ease: 'expo.out', stagger: 0.08 });
  }

  function initReveals() {
    if (!hasGsap || reduce) {
      document.querySelectorAll('[data-reveal]').forEach(function (el) { el.style.opacity = 1; });
      document.querySelectorAll('.wipe').forEach(function (el) { el.style.clipPath = 'none'; });
      return;
    }
    // Titres de section
    document.querySelectorAll('[data-split]:not(.hero [data-split])').forEach(function (el) {
      var lines = splitLines(el);
      gsap.set(lines, { yPercent: 110 });
      ScrollTrigger.create({ trigger: el, start: 'top 86%', once: true,
        onEnter: function () { gsap.to(lines, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.08 }); } });
    });
    // Blocs : montée courte + fondu, en lot
    ScrollTrigger.batch('[data-reveal]:not(.hero [data-reveal])', {
      start: 'top 88%', once: true,
      onEnter: function (batch) { gsap.fromTo(batch, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, overwrite: true }); }
    });
    // Images : volet de gauche à droite
    document.querySelectorAll('.wipe:not(.hero .wipe)').forEach(function (el) {
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true,
        onEnter: function () { gsap.to(el, { clipPath: 'inset(0 0% 0 0)', duration: 1.3, ease: 'expo.out' }); } });
    });
    // Filets : tracés par un volet clip-path (jamais DrawSVG sur un trait étiré)
    document.querySelectorAll('[data-rule]').forEach(function (el) {
      gsap.set(el, { clipPath: 'inset(0 100% 0 0)' });
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true,
        onEnter: function () { gsap.to(el, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'expo.out' }); } });
    });
  }

  /* ── Ouverture du héros : un seul timeline maître ── */
  function initHero() {
    var hero = document.querySelector('.hero, .page-hero');
    if (!hero) return;
    var reveals = hero.querySelectorAll('[data-reveal]');
    var wipes = hero.querySelectorAll('.wipe');
    if (!hasGsap || reduce) {
      reveals.forEach(function (el) { el.style.opacity = 1; });
      return;
    }
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 });
    var eyebrow = hero.querySelector('.eyebrow');
    if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 12, duration: 0.6 }, 0);
    hero.querySelectorAll('[data-split]').forEach(function (h, i) { tl.add(lineIn(h), 0.1 + i * 0.1); });
    tl.fromTo(reveals, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.45);
    if (wipes.length) tl.to(wipes, { clipPath: 'inset(0 0% 0 0)', duration: 1.4 }, 0.3);
    var horizon = hero.querySelector('.horizon');
    if (horizon) tl.from(horizon, { scaleX: 0, transformOrigin: 'left center', duration: 1.4 }, 0.5);
    DJP.heroTimeline = tl;
  }

  /* ── Ciel ambiant : lignes de vent très lentes (couche d'ambiance, ~1/3 de la vitesse du premier plan)
     Piloté par le temps du ticker GSAP, en pause hors écran. Mouvement réduit : une image fixe. ── */
  function initSky() {
    var cv = document.querySelector('.hero-sky canvas');
    if (!cv) return;
    var ctx = cv.getContext('2d'), w = 0, h = 0, dpr = Math.min(2, window.devicePixelRatio || 1), visible = true;
    var LINES = 9;
    function size() {
      var r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < LINES; i++) {
        var base = h * (0.18 + i * 0.075);
        var amp = 10 + i * 2.4, freq = 0.0016 + i * 0.00012, phase = t * (0.045 + i * 0.006) + i * 1.7;
        ctx.beginPath();
        for (var x = -10; x <= w + 10; x += 12) {
          var y = base + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 - phase * 0.7) * amp * 0.35;
          if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.55 - i * 0.04).toFixed(2) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    size();
    window.addEventListener('resize', function () { size(); draw(hasGsap ? gsap.ticker.time : 0); });
    draw(0);
    if (reduce || !hasGsap) return;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(cv);
    gsap.ticker.add(function (time) { if (visible) draw(time); });
    if (DJP.heroTimeline) gsap.from(cv, { opacity: 0, duration: 2, ease: 'power1.out' });
  }

  /* ── Formulaire de contact ── */
  function initForm() {
    var form = document.querySelector('form[data-contact]');
    if (!form) return;
    var status = form.querySelector('.form-status');
    var t0 = Date.now();
    var sujet = new URLSearchParams(location.search).get('sujet'), sel = form.querySelector('[name="sujet"]');
    if (sujet && sel && sel.querySelector('option[value="' + sujet + '"]')) sel.value = sujet;
    function say(fr, en, cls) { status.className = 'form-status ' + (cls || ''); status.textContent = DJP.t(fr, en); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      if (fd.get('website') || Date.now() - t0 < 2500) { say('Merci, votre demande est envoyée.', 'Thank you, your request has been sent.', 'ok'); form.reset(); return; }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (!CONFIG.web3formsKey) {
        if (CONFIG.email) {
          var body = ['nom', 'courriel', 'telephone', 'sujet', 'message'].map(function (k) { return k + ' : ' + (fd.get(k) || ''); }).join('\n');
          location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Demande via le site') + '&body=' + encodeURIComponent(body);
          return;
        }
        say('Le formulaire sera actif sous peu. Merci de votre patience.', 'The form will be live shortly. Thank you for your patience.', 'err');
        return;
      }
      var payload = {
        access_key: CONFIG.web3formsKey,
        subject: 'Nouvelle demande : ' + (fd.get('nom') || ''),
        from_name: 'Site Daniel James Paterson',
        replyto: fd.get('courriel'),
        nom: fd.get('nom'), courriel: fd.get('courriel'), telephone: fd.get('telephone'),
        sujet: fd.get('sujet'), message: fd.get('message'), langue: DJP.lang()
      };
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      say('Envoi en cours...', 'Sending...');
      fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d.success) throw new Error(d.message);
          say('Merci. Daniel vous répond sous un jour ouvrable.', 'Thank you. Daniel will reply within one business day.', 'ok');
          form.reset();
        })
        .catch(function () { say("L'envoi n'a pas fonctionné. Réessayez dans un instant.", 'Sending failed. Please try again in a moment.', 'err'); })
        .then(function () { btn.disabled = false; });
    });
  }

  function initBooking() {
    if (!CONFIG.bookingUrl) return;
    document.querySelectorAll('[data-booking]').forEach(function (a) { a.href = CONFIG.bookingUrl; a.target = '_blank'; a.rel = 'noopener'; });
  }

  function initYear() { document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); }); }

  function boot() {
    initLang();
    initSmoothScroll();
    initMenu();
    initHeader();
    initHero();
    initReveals();
    initParallax();
    initSky();
    initForm();
    initBooking();
    initYear();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
