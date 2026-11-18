/* ==========================================================================
   ACCUEIL — chorégraphie « Une journée dans le ciel »
   Matin (héros) → montée dans les nuages (manifeste) → midi (services, piste horizontale)
   → après-midi (démarche épinglée) → papier (à propos) → crépuscule ambre (rendez-vous).
   Tout l'état du ciel passe par DJP.sky, tweené par ScrollTrigger (scrub), lu par sky.js.
   Maison : expo.out en entrée, power2.in en sortie (~35 % plus court), zéro rebond.
   ========================================================================== */
(function () {
  'use strict';
  var DJP = window.DJP = window.DJP || {};
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  var sky = DJP.sky = DJP.sky || { climb: 0, density: 0.42, dusk: 0, night: 0 };
  var skyBase = DJP.skyBase || { dusk: 0, night: 0 };

  /* Lignes d'un titre bilingue (une ligne = un segment entre <br>, par <span lang>) */
  function lines(el) {
    if (el.__lines) return el.__lines;
    var hosts = [].slice.call(el.children).filter(function (c) { return c.hasAttribute('lang'); });
    if (!hosts.length) hosts = [el];
    hosts.forEach(function (h) {
      h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i).map(function (p) {
        return '<span class="line-mask"><span>' + p.trim() + '</span></span>';
      }).join('');
    });
    return (el.__lines = [].slice.call(el.querySelectorAll('.line-mask > span')));
  }

  /* Mots d'un paragraphe, en gardant les balises (em) intactes */
  function words(host) {
    var out = [];
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span'); s.className = 'wd'; s.textContent = part;
            frag.appendChild(s); out.push(s);
          });
          ch.parentNode.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) walk(ch);
      });
    })(host);
    return out;
  }

  var title = document.querySelector('[data-hero-title]');
  var heroItems = document.querySelectorAll('[data-hero-item]');
  var titleLines = title ? lines(title) : [];

  if (reduce) {
    // Images résolues : rien ne bouge, le ciel prend seulement la couleur de la section visible
    ScrollTrigger.create({ trigger: '.h-dusk', start: 'top 60%', onToggle: function (s) { sky.dusk = s.isActive ? 1 : skyBase.dusk; sky.night = s.isActive ? 0 : skyBase.night; } });
    return;
  }

  /* ── Matin : ouverture du héros (attend la levée du voile) ── */
  gsap.set(titleLines, { yPercent: 112 });
  gsap.set(heroItems, { opacity: 0, y: 24 });
  gsap.set('.h-kicker-rule', { scaleX: 0, transformOrigin: 'left center' });
  DJP.ready(function () {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to(titleLines, { yPercent: 0, duration: 1.25, stagger: 0.09 }, 0)
      .to('.h-kicker-rule', { scaleX: 1, duration: 1.1 }, 0.2)
      .to(heroItems, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.45)
      .fromTo(sky, { climb: -0.18 }, { climb: 0, duration: 2.4, ease: 'expo.out' }, 0);
    DJP.heroTimeline = tl;
  });

  /* ── Montée : le héros recule, on traverse la couche de nuages ── */
  gsap.to('.h-hero-inner', {
    yPercent: -18, opacity: 0.1, scale: 0.97, ease: 'none', transformOrigin: 'center bottom',
    scrollTrigger: { trigger: '.h-hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.timeline({ scrollTrigger: { trigger: '.h-hero', start: 'top top', endTrigger: '.h-services', end: 'top top', scrub: 1.2 } })
    .to(sky, { climb: 0.7, density: 0.8, ease: 'none' })
    .to(sky, { climb: 1.35, density: 0.5, ease: 'none' });

  /* ── Manifeste : chaque mot passe du gris à l'encre au rythme du défilement ── */
  var manifest = document.querySelector('[data-fill]');
  if (manifest) {
    [].slice.call(manifest.querySelectorAll('[lang]')).forEach(function (host) {
      var w = words(host);
      gsap.to(w, { opacity: 1, ease: 'none', stagger: 0.08,
        scrollTrigger: { trigger: manifest, start: 'top 78%', end: 'bottom 42%', scrub: true } });
    });
  }

  var mm = gsap.matchMedia();

  /* ── Midi : services sur une piste horizontale épinglée (bureau) ── */
  mm.add('(min-width: 900px)', function () {
    var section = document.querySelector('.h-services'), track = section.querySelector('.h-track');
    var bar = section.querySelector('.h-services-progress span');
    section.classList.add('is-pinned');
    function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
    // Pause au début (la première carte se lit) et à la fin, puis une piste plus longue que la distance réelle :
    // environ 1,6 px de défilement par pixel de déplacement, pour que chaque carte reste lisible.
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section, start: 'top top', end: function () { return '+=' + (dist() * 1.6 + window.innerHeight * 0.6); },
        pin: true, scrub: 1, invalidateOnRefresh: true, refreshPriority: 2,
        onUpdate: function (s) { gsap.set(bar, { scaleX: s.progress }); }
      }
    });
    tl.to({}, { duration: 0.18 })
      .to(track, { x: function () { return -dist(); }, ease: 'none', duration: 1 })
      .to({}, { duration: 0.12 });
    // Chaque carte : son dessin glisse un peu moins vite que la carte (profondeur)
    // (dans la timeline, pour rester synchronisé avec la pause du début et de la fin)
    track.querySelectorAll('.h-card-art .ill').forEach(function (ill) {
      tl.fromTo(ill, { xPercent: 4 }, { xPercent: -4, ease: 'none', duration: 1 }, 0.18);
    });
    // Entrée des cartes quand la section arrive
    gsap.from(track.querySelectorAll('.h-card'), { y: 80, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: section, start: 'top 70%', once: true } });
    return function () { section.classList.remove('is-pinned'); };
  });

  /* ── Après-midi : la démarche, épinglée. Chaque geste de molette = une étape, ni plus ni moins.
     La section est découpée en n tranches ; chaque étape est posée au centre de sa tranche. Un geste (une rafale
     d'événements de molette, inertie comprise) déplace d'une étape via Lenis ; le reste du geste est ignoré
     (DJP.scrollGate). À la première étape vers le haut ou à la dernière vers le bas, la page reprend son cours.
     Clavier, barre de défilement et tactile restent libres : l'étape affichée suit simplement la position. ── */
  mm.add('(min-width: 900px)', function () {
    var section = document.querySelector('.h-process');
    var steps = [].slice.call(section.querySelectorAll('.h-step'));
    var nav = [].slice.call(section.querySelectorAll('.h-process-nav li'));
    var rail = section.querySelector('.h-rail span');
    var n = steps.length, cur = -1;
    section.classList.add('is-pinned');
    var parts = steps.map(function (s) {
      return { t: lines(s.querySelector('.h-step-title')), rest: s.querySelectorAll('.h-step-chips, .h-step-desc, .h-step-dl > div') };
    });
    steps.forEach(function (s, i) { gsap.set(s, { autoAlpha: i === 0 ? 1 : 0 }); });
    function go(i) {
      if (i === cur) return;
      var prev = cur; cur = i;
      nav.forEach(function (li, k) { li.classList.toggle('on', k === i); });
      if (prev > -1) {
        var o = parts[prev];
        gsap.to(o.t, { yPercent: -110, duration: 0.42, ease: 'power2.in', overwrite: true });
        gsap.to(o.rest, { opacity: 0, y: -12, duration: 0.32, ease: 'power2.in', stagger: 0.03, overwrite: true,
          onComplete: function () { if (cur !== prev) gsap.set(steps[prev], { autoAlpha: 0 }); } });
      }
      var c = parts[i];
      gsap.set(steps[i], { autoAlpha: 1 });
      gsap.fromTo(c.t, { yPercent: 110 }, { yPercent: 0, duration: 1.05, ease: 'expo.out', delay: prev > -1 ? 0.28 : 0, overwrite: true });
      gsap.fromTo(c.rest, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: prev > -1 ? 0.38 : 0.15, overwrite: true });
    }
    go(0);
    var st = ScrollTrigger.create({
      trigger: section, start: 'top top', end: function () { return '+=' + (n * window.innerHeight * 0.75); },
      pin: '.h-process-pin', refreshPriority: 1,
      onUpdate: function (s) {
        gsap.set(rail, { scaleY: s.progress });
        go(Math.min(n - 1, Math.floor(s.progress * n)));
      },
      onEnter: function () { arrive(0); },
      onEnterBack: function () { arrive(n - 1); }
    });
    function pos(i) { return st.start + (i + 0.5) / n * (st.end - st.start); }
    var idx = 0, gesture = 0, consumed = -1, lastT = 0, prevAbs = 0;
    var easeOut = function (t) { return 1 - Math.pow(2, -10 * t); };
    var gliding = false;
    function glide(i) {
      idx = i; gliding = true;
      setTimeout(function () { gliding = false; }, 1050);
      if (DJP.lenis) DJP.lenis.scrollTo(pos(i), { duration: 0.95, easing: easeOut, force: true, onComplete: function () { gliding = false; } });
      else window.scrollTo({ top: pos(i), behavior: 'smooth' });
    }
    // N'aimante à l'arrivée que si la destination du défilement est dans la section (molette) ;
    // un lien d'ancre ou un saut qui la traverse n'est jamais ramené en arrière.
    function arrive(i) {
      if (!DJP.lenis) return;
      var dest = DJP.lenis.targetScroll;
      if (dest < st.start - 2 || dest > st.end + 2) return;
      consumed = gesture; glide(i);
    }
    DJP.scrollGate = function (d) {
      var e = d && d.event;
      if (!e || e.type !== 'wheel') return true;
      var now = performance.now(), a = Math.abs(d.deltaY);
      var fresh = now - lastT > 160 || (a > prevAbs * 1.6 && a > 12);
      lastT = now; prevAbs = a;
      if (fresh) gesture++;
      if (consumed === gesture) return false;            // la fin d'un geste déjà utilisé
      var y = DJP.lenis ? DJP.lenis.scroll : window.scrollY;
      if (y < st.start - 2 || y > st.end + 2) return true; // hors de la section : défilement normal
      if (!gliding) idx = Math.max(0, Math.min(n - 1, Math.floor(st.progress * n)));
      var dir = d.deltaY > 0 ? 1 : -1, target = idx + dir;
      if (target < 0 || target > n - 1) return true;      // on sort de la section dans le sens du geste
      consumed = gesture;
      glide(target);
      return false;
    };
    return function () { DJP.scrollGate = null; section.classList.remove('is-pinned'); steps.forEach(function (s) { gsap.set(s, { clearProps: 'all' }); }); };
  });

  /* ── À propos : le portrait s'ouvre d'un cadre resserré, l'image glisse en parallaxe ── */
  var portrait = document.querySelector('.h-portrait-inner');
  if (portrait) {
    gsap.fromTo(portrait, { clipPath: 'inset(14% 10% 14% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
      scrollTrigger: { trigger: portrait, start: 'top 90%', end: 'center 55%', scrub: true } });
    gsap.fromTo(portrait.querySelector('.h-portrait-img'), { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1, ease: 'none',
      scrollTrigger: { trigger: portrait, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ── Crépuscule : le ciel vire à l'ambre ── */
  gsap.to(sky, { dusk: 1, night: 0, density: 0.62, ease: 'none',
    scrollTrigger: { trigger: '.h-dusk', start: 'top bottom', end: 'center center', scrub: 1 } });

  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  // Les polices changent la hauteur des titres : on remesure une fois chargées
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
