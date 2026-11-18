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
    bookingUrl: 'https://bookings.cloud.microsoft/bookwithme/user/1d5a7ad95edf4c28bd1fdcfe008be4d1%40agc.ia.ca?anonymous&ismsaljsauthenabled',  // Microsoft Bookings de Daniel
    email: 'danieljames.paterson@agc.ia.ca'  // courriel public de Daniel
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
    document.dispatchEvent(new CustomEvent('djp:lang', { detail: l }));
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
    // DJP.scrollGate(data) : une section peut ignorer des événements de molette (retourner false),
    // p. ex. la démarche de l'accueil, qui avance d'une étape par geste.
    var lenis = DJP.lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, stopInertiaOnNavigate: true,
      virtualScroll: function (d) { return !(DJP.scrollGate && DJP.scrollGate(d) === false); } });
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
    document.querySelectorAll('[data-split]:not(.hero [data-split]):not(.page-hero [data-split])').forEach(function (el) {
      var lines = splitLines(el);
      gsap.set(lines, { yPercent: 110 });
      ScrollTrigger.create({ trigger: el, start: 'top 86%', once: true,
        onEnter: function () { gsap.to(lines, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.08 }); } });
    });
    // Blocs : montée courte + fondu, en lot
    // Paragraphes : ligne par ligne (revealLines)
    document.querySelectorAll('p[data-reveal]:not(.hero p):not(.page-hero p)').forEach(function (p) {
      ScrollTrigger.create({ trigger: p, start: 'top 88%', once: true, onEnter: function () { revealLines(p); } });
    });
    ScrollTrigger.batch('[data-reveal]:not(p):not(.hero [data-reveal]):not(.page-hero [data-reveal])', {
      start: 'top 88%', once: true,
      onEnter: function (batch) { gsap.fromTo(batch, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, overwrite: true }); }
    });
    // Images : volet de gauche à droite
    document.querySelectorAll('.wipe:not(.hero .wipe):not(.page-hero .wipe)').forEach(function (el) {
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
    var paras = [].filter.call(reveals, function (el) { return el.tagName === 'P'; });
    var blocks = [].filter.call(reveals, function (el) { return el.tagName !== 'P'; });
    paras.forEach(function (p, i) { gsap.set(p, { opacity: 0 }); tl.add(function () { revealLines(p); }, 0.45 + i * 0.1); });
    if (blocks.length) tl.fromTo(blocks, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.6);
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

  /* ── Voile : intro de la première visite, puis rideau entre les pages ──
     DJP.ready(fn) : fn s'exécute quand la page est découverte (les héros attendent ce signal). */
  var readyQ = [], isReady = false;
  DJP.ready = function (fn) { if (isReady) fn(); else readyQ.push(fn); };
  function fireReady() { if (isReady) return; isReady = true; html.classList.remove('veiled'); readyQ.splice(0).forEach(function (f) { f(); }); }

  function sstore(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  var veil;
  function initVeil() {
    veil = document.createElement('div');
    veil.id = 'veil';
    veil.setAttribute('aria-hidden', 'true');
    var first = !sstore('djp-seen') && document.body.getAttribute('data-page') === 'index';
    sstore('djp-seen', '1');
    if (first) veil.innerHTML = '<div><div class="veil-name"><span class="line-mask"><span>Daniel James</span></span><span class="line-mask"><span><em>Paterson</em></span></span></div><div class="veil-sun"></div></div>';
    document.body.appendChild(veil);
    html.classList.remove('veiled');
    if (!hasGsap || reduce || html.classList.contains('vt-in')) { veil.classList.add('gone'); fireReady(); return; }
    lockScroll(true);
    var tl = gsap.timeline({ onComplete: function () { veil.classList.add('gone'); } });
    if (first) {
      var lines = veil.querySelectorAll('.line-mask > span'), sun = veil.querySelector('.veil-sun');
      tl.from(lines, { yPercent: 110, duration: 1.15, ease: 'expo.out', stagger: 0.09 }, 0.15)
        .from(sun, { scale: 0.4, opacity: 0, duration: 0.6, ease: 'expo.out' }, 0.7)
        .to(lines, { yPercent: -110, duration: 0.55, ease: 'power2.in', stagger: 0.05 }, 1.75)
        .to(sun, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 1.75);
    }
    tl.to(veil, { clipPath: 'inset(0% 0% 100% 0%)', duration: first ? 0.85 : 0.6, ease: 'power3.inOut',
      onStart: function () { lockScroll(false); setTimeout(fireReady, first ? 250 : 150); } }, first ? 2.15 : 0.05);
  }

  function leaveTo(url) {
    if (!hasGsap || reduce || !veil) { location.href = url; return; }
    veil.innerHTML = '';
    veil.classList.remove('gone');
    gsap.fromTo(veil, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'expo.out',
      onComplete: function () { location.href = url; } });
  }

  // Transitions de vue entre documents (Chrome 126+, Safari 18.2+) ; sinon le rideau.
  var VT = !reduce && typeof window.CSSViewTransitionRule !== 'undefined';
  function initTransitions() {
    window.addEventListener('pageshow', function (e) { document.querySelectorAll('.h-card-art').forEach(function (a) { a.style.viewTransitionName = ''; }); if (e.persisted && veil) { gsap.set(veil, { clipPath: 'inset(0% 0% 100% 0%)' }); veil.classList.add('gone'); } });
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      var norm = function (p) { return p.replace(/index(\.html)?$/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/'; };
      if (norm(url.pathname) === norm(location.pathname) && url.search === location.search) return; // ancre : Lenis s'en charge
      if (VT) {
        // Transition de vue entre documents : le navigateur fige l'ancienne page et anime vers la nouvelle.
        // La carte cliquée prête son illustration à l'en-tête de la page de service (view-transition-name: vt-art).
        sstore('djp-vt', '1');
        var cur = document.querySelector('.cursor'); if (cur) cur.classList.add('is-hidden');
        var card = a.closest('.h-card, .s-next-in');
        var art = card && card.querySelector('.h-card-art');
        if (art) art.style.viewTransitionName = 'vt-art';
        return;
      }
      e.preventDefault();
      leaveTo(url.href);
    });
  }

  /* ── Curseur : anneau qui suit, s'agrandit sur les liens, porte une étiquette sur [data-cursor-fr] ── */
  function initCursor() {
    if (reduce || !hasGsap || !window.matchMedia('(pointer: fine)').matches) return;
    var c = document.createElement('div');
    c.className = 'cursor is-hidden';
    c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<div class="cursor-ring"><span class="cursor-label"></span></div>';
    document.body.appendChild(c);
    var label = c.querySelector('.cursor-label');
    var xTo = gsap.quickTo(c, 'x', { duration: 0.45, ease: 'power3' }), yTo = gsap.quickTo(c, 'y', { duration: 0.45, ease: 'power3' });
    var moved = false;
    window.addEventListener('pointermove', function (e) { if (!moved) { moved = true; gsap.set(c, { x: e.clientX, y: e.clientY }); } c.classList.remove('is-hidden'); xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    document.addEventListener('pointerleave', function () { c.classList.add('is-hidden'); });
    document.addEventListener('pointerover', function (e) {
      var t = e.target;
      var lab = t.closest && t.closest('[data-cursor-fr]');
      var link = t.closest && t.closest('a, button, select, label, input[type="checkbox"]');
      c.classList.toggle('is-label', !!lab);
      c.classList.toggle('is-link', !lab && !!link);
      c.classList.toggle('on-dark', !!(t.closest && t.closest('.footer, .h-process, .section--ink')));
      c.classList.toggle('is-hidden', !moved || !!(t.closest && t.closest('input:not([type="checkbox"]), textarea, iframe')));
      if (lab) label.textContent = lab.getAttribute('data-cursor-' + DJP.lang());
    });
  }

  /* ── Boutons magnétiques : attirés vers le pointeur, relâchés sans rebond ── */
  function initMagnetic() {
    if (reduce || !hasGsap || !window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (b) {
      var xTo = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'expo.out' }), yTo = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'expo.out' });
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.28); yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      b.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ── Grand nom du pied de page ── */
  function initFooterGiant() {
    var g = document.querySelector('.footer-giant');
    if (!g || !hasGsap || reduce) return;
    var lines = g.querySelectorAll('.line-mask > span');
    gsap.set(lines, { yPercent: 105 });
    ScrollTrigger.create({ trigger: g, start: 'top 92%', once: true,
      onEnter: function () { gsap.to(lines, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1 }); } });
  }

  /* ── Paragraphes : les lignes montent hors d'un masque (SplitText), puis le texte est rendu tel quel ──
     On ne découpe que la langue visible ; à la fin de l'animation, revert() remet le HTML d'origine, donc
     le changement de langue ou de largeur n'a jamais de lignes figées à gérer. */
  function revealLines(p, delay) {
    p.style.opacity = 1;
    if (!hasGsap || reduce || !window.SplitText) { if (hasGsap && !reduce) gsap.fromTo(p, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: delay || 0 }); return; }
    var host = p.querySelector(':scope > [lang="' + DJP.lang() + '"]') || p;
    var split = SplitText.create(host, { type: 'lines', mask: 'lines', linesClass: 'sl' });
    gsap.from(split.lines, { yPercent: 105, duration: 0.95, ease: 'expo.out', stagger: 0.07, delay: delay || 0,
      onComplete: function () { split.revert(); } });
  }
  DJP.revealLines = revealLines;

  /* ── Soulignement ambre tracé à la main sous l'expression clé de chaque page ──
     Trait étiré (preserveAspectRatio none) : on le dévoile par un volet clip-path, jamais par stroke-dasharray. */
  var SCRIBBLE = '<svg class="scribble-svg" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
    '<path d="M3 10.5 C 48 5, 104 3.5, 158 6 S 252 10.5, 297 5" /><path d="M42 14 C 110 10.5, 196 10, 262 12.5" /></svg>';
  function initScribble() {
    var els = document.querySelectorAll('.h-title em, .ab-hero h1 em, .s-hero h1 em, .qz-hero h1 em, [data-scribble]');
    if (!els.length) return;
    els.forEach(function (el) { el.classList.add('scribble'); el.insertAdjacentHTML('beforeend', SCRIBBLE); });
    if (!hasGsap || reduce) { html.classList.add('scribble-static'); return; }
    function draw(scope) {
      gsap.fromTo(scope.querySelectorAll('.scribble-svg'), { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.out', stagger: 0.12 });
    }
    DJP.ready(function () {
      var hero = document.querySelector('.h-hero, .page-hero');
      if (hero && hero.querySelector('.scribble')) gsap.delayedCall(1.15, function () { draw(hero); });
    });
    document.querySelectorAll('[data-scribble]').forEach(function (el) {
      if (el.closest('.h-hero, .page-hero')) return;
      ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: function () { draw(el.parentNode); } });
    });
  }

  /* ── Chiffres qui roulent : chaque chiffre est une colonne 0-9 qui glisse jusqu'à sa valeur ── */
  DJP.odometer = function (el, text) {
    el.setAttribute('aria-label', text);
    var chars = String(text).split('');
    var sig = chars.map(function (c) { return /\d/.test(c) ? 'd' : c; }).join('');
    if (el.__sig !== sig) {
      el.__sig = sig;
      el.innerHTML = '<span class="odo" aria-hidden="true">' + chars.map(function (c) {
        return /\d/.test(c) ? '<span class="odo-col"><span class="odo-strip">0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9</span></span>' : '<span class="odo-ch">' + (c === ' ' ? '&nbsp;' : c) + '</span>';
      }).join('') + '</span>';
    }
    var strips = el.querySelectorAll('.odo-strip'), k = 0;
    chars.forEach(function (c) {
      if (!/\d/.test(c)) return;
      var st = strips[k++], target = -parseInt(c, 10) * 10;
      if (!hasGsap || reduce) st.style.transform = 'translateY(' + target + '%)';
      else gsap.to(st, { yPercent: target, duration: 0.9, ease: 'expo.out', delay: (strips.length - k) * 0.025, overwrite: true });
    });
  };

  /* ── Profondeur des illustrations : chaque calque glisse selon sa profondeur sous le pointeur ── */
  function initDepth() {
    if (reduce || !hasGsap || !window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.h-card, .s-hero').forEach(function (zone) {
      var svg = zone.querySelector('.ill');
      if (!svg) return;
      var layers = [].slice.call(svg.querySelectorAll('[data-depth]')).map(function (g) {
        return { d: parseFloat(g.getAttribute('data-depth')), x: gsap.quickTo(g, 'x', { duration: 0.8, ease: 'expo.out' }), y: gsap.quickTo(g, 'y', { duration: 0.8, ease: 'expo.out' }) };
      });
      zone.addEventListener('pointermove', function (e) {
        var r = zone.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach(function (l) { l.x(-dx * 22 * l.d); l.y(-dy * 12 * l.d); });
      });
      zone.addEventListener('pointerleave', function () { layers.forEach(function (l) { l.x(0); l.y(0); }); });
    });
  }

  /* ── Barre de réservation : apparaît après un bon tiers de lecture, se range quand un autre appel
     à réserver est à l'écran, et peut être fermée pour la session. ── */
  function initPill() {
    if (document.body.getAttribute('data-page') === 'contact' || sstore('djp-pill-off')) return;
    var pill = document.createElement('div');
    pill.className = 'book-pill';
    pill.innerHTML = '<a href="/contact" data-booking><span class="bp-main"><span lang="fr">Réserver un moment</span><span lang="en">Book a time</span></span>' +
      '<span class="bp-sub"><span lang="fr">20 min, sans engagement</span><span lang="en">20 min, no commitment</span></span>' +
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg></a>' +
      '<button type="button" class="bp-close" data-aria-fr="Masquer" data-aria-en="Hide" aria-label="' + DJP.t('Masquer', 'Hide') + '"><span aria-hidden="true"></span></button>';
    document.body.appendChild(pill);
    if (hasGsap && !reduce) gsap.set(pill, { yPercent: 140 }); else pill.style.transform = 'translateY(140%)';
    if (CONFIG.bookingUrl) { var a = pill.querySelector('a'); a.href = CONFIG.bookingUrl; a.target = '_blank'; a.rel = 'noopener'; }
    var shown = false, progress = 0, blockers = 0, off = false;
    function update() {
      var want = !off && progress > 0.22 && blockers === 0;
      if (want === shown) return;
      shown = want;
      pill.classList.toggle('on', want);
      if (!hasGsap || reduce) { pill.style.transform = want ? 'none' : 'translateY(140%)'; return; }
      if (want) gsap.fromTo(pill, { yPercent: 140 }, { yPercent: 0, duration: 0.7, ease: 'expo.out', overwrite: true });
      else gsap.to(pill, { yPercent: 140, duration: 0.42, ease: 'power2.in', overwrite: true });
    }
    pill.querySelector('.bp-close').addEventListener('click', function () { off = true; sstore('djp-pill-off', '1'); update(); });
    if (hasGsap) ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) { progress = s.progress; update(); } });
    else window.addEventListener('scroll', function () { progress = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); update(); }, { passive: true });
    var seen = new Set();
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) seen.add(x.target); else seen.delete(x.target); });
      blockers = seen.size; update();
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.cta-band, .h-dusk, .footer, .h-hero, .page-hero, .h-process-cta, .quiz-band, .quiz').forEach(function (el) { io.observe(el); });
  }

  /* ── Portrait : un léger miroitement de chaleur qui se pose (une fois), comme l'air d'un soir d'été ──
     Filtre SVG (turbulence + déplacement) dont l'intensité descend à zéro, puis le filtre est retiré. */
  function initShimmer() {
    if (reduce || !hasGsap) return;
    var imgs = document.querySelectorAll('.h-portrait-img img, .ab-portrait img');
    if (!imgs.length) return;
    var NS = 'http://www.w3.org/2000/svg';
    var defs = document.createElementNS(NS, 'svg');
    defs.setAttribute('aria-hidden', 'true'); defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
    defs.style.position = 'absolute';
    document.body.appendChild(defs);
    imgs.forEach(function (img, i) {
      var id = 'djp-shimmer-' + i;
      defs.insertAdjacentHTML('beforeend', '<filter id="' + id + '" x="-5%" y="-5%" width="110%" height="110%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.006 0.035" numOctaves="2" seed="7" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>');
      var f = defs.querySelector('#' + id), turb = f.querySelector('feTurbulence'), disp = f.querySelector('feDisplacementMap');
      var st = { s: 38, fy: 0.035, o: 0.4 };
      function apply() { disp.setAttribute('scale', st.s.toFixed(2)); turb.setAttribute('baseFrequency', '0.006 ' + st.fy.toFixed(4)); img.style.opacity = st.o; }
      apply();
      img.style.filter = 'url(#' + id + ')';
      ScrollTrigger.create({ trigger: img, start: 'top 80%', once: true, onEnter: function () {
        gsap.to(st, { s: 0, fy: 0.012, o: 1, duration: 2.2, ease: 'expo.out', onUpdate: apply,
          onComplete: function () { img.style.filter = ''; } });
      } });
    });
  }

  function boot() {
    initLang();
    initSmoothScroll();
    initVeil();
    initTransitions();
    initCursor();
    initMagnetic();
    initFooterGiant();
    initScribble();
    initDepth();
    initPill();
    initShimmer();
    initMenu();
    initHeader();
    DJP.ready(initHero);
    initReveals();
    initParallax();
    initSky();
    initForm();
    initBooking();
    initYear();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
