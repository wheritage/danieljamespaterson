/* ==========================================================================
   PAGES DE SERVICES — onglets de profils et FAQ
   Onglets : clavier (flèches, Début, Fin), trait ambre qui glisse (transform), panneau qui monte.
   FAQ : un seul bouton par question, aria-expanded, ouverture expo.out, fermeture power2.in plus courte.
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap && !reduce ? window.gsap : null;

  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var ink = root.querySelector('.s-tab-ink'), list = root.querySelector('[role="tablist"]');
    var cur = 0;
    function placeInk(animate) {
      var t = tabs[cur], lr = list.getBoundingClientRect(), r = t.getBoundingClientRect();
      var x = r.left - lr.left, y = r.bottom - lr.bottom, w = r.width;
      if (G && animate) G.to(ink, { x: x, y: y, scaleX: w / 10, duration: 0.55, ease: 'expo.out' });
      else { ink.style.transform = 'translate(' + x + 'px,' + y + 'px) scaleX(' + (w / 10) + ')'; }
    }
    function select(i, focus) {
      if (i === cur) return;
      var prev = cur; cur = i;
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
      panels[prev].hidden = true;
      panels[i].hidden = false;
      if (G) G.fromTo(panels[i], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
      placeInk(true);
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = tabs.length, j = null;
        if (k === 'ArrowRight') j = (cur + 1) % n; else if (k === 'ArrowLeft') j = (cur - 1 + n) % n;
        else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1;
        if (j !== null) { e.preventDefault(); select(j, true); }
      });
    });
    placeInk(false);
    window.addEventListener('resize', function () { placeInk(false); });
    document.addEventListener('djp:lang', function () { placeInk(false); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeInk(false); });
  });

  document.querySelectorAll('[data-faq] button[aria-controls]').forEach(function (b) {
    var a = document.getElementById(b.getAttribute('aria-controls'));
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!G) { a.hidden = !open; return; }
      if (open) {
        a.hidden = false;
        G.fromTo(a, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.55, ease: 'expo.out',
          onComplete: function () { a.style.height = ''; if (window.ScrollTrigger) ScrollTrigger.refresh(); } });
      } else {
        G.to(a, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.in',
          onComplete: function () { a.hidden = true; a.style.height = ''; if (window.ScrollTrigger) ScrollTrigger.refresh(); } });
      }
    });
  });
})();
