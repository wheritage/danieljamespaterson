/* ==========================================================================
   404 — des nuages que l'on pousse du pointeur (ou du doigt)
   Nuages en aplats blancs (cercles superposés, aucun flou). Dérive très lente vers la droite ; le pointeur
   transmet sa vitesse aux nuages proches, qui ralentissent ensuite par frottement (aucun rebond).
   Mouvement réduit : une image fixe.
   ========================================================================== */
(function () {
  'use strict';
  var cv = document.querySelector('.nf-clouds');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var w = 0, h = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var clouds = [];
  function make() {
    clouds = [];
    var n = w < 700 ? 6 : 10;
    for (var i = 0; i < n; i++) {
      var s = (w < 700 ? 0.55 : 0.8) + rnd() * 0.7;
      var puffs = [], k = 4 + Math.floor(rnd() * 3);
      for (var j = 0; j < k; j++) puffs.push({ dx: (j - (k - 1) / 2) * 34 * s + (rnd() - 0.5) * 14 * s, dy: -rnd() * 26 * s, r: (26 + rnd() * 22) * s });
      clouds.push({ x: rnd() * w, y: h * (0.12 + rnd() * 0.76), vx: 0, vy: 0, drift: 6 + rnd() * 10, s: s, puffs: puffs, a: 0.75 + rnd() * 0.25 });
    }
  }
  function size() {
    var r = cv.getBoundingClientRect(); w = r.width; h = r.height;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      ctx.fillStyle = 'rgba(255,255,255,' + c.a + ')';
      ctx.beginPath();
      for (var j = 0; j < c.puffs.length; j++) { var p = c.puffs[j]; ctx.moveTo(c.x + p.dx + p.r, c.y + p.dy); ctx.arc(c.x + p.dx, c.y + p.dy, p.r, 0, Math.PI * 2); }
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,' + c.a + ')';
      ctx.fillRect(c.puffs[0].dx + c.x - c.puffs[0].r * 0.4, c.y - 2, (c.puffs[c.puffs.length - 1].dx - c.puffs[0].dx) + c.puffs[0].r * 0.8, 24 * c.s);
    }
  }
  size(); make(); draw();
  window.addEventListener('resize', function () { size(); make(); draw(); });
  if (reduce) return;

  var px = -1e4, py = -1e4, pvx = 0, pvy = 0, lastT = 0;
  window.addEventListener('pointermove', function (e) {
    var now = performance.now(), dt = Math.max(8, now - lastT); lastT = now;
    var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (px > -1e3) { pvx = (x - px) / dt * 16; pvy = (y - py) / dt * 16; }
    px = x; py = y;
  }, { passive: true });

  var prev = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - prev) / 1000); prev = now;
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i], dx = c.x - px, dy = c.y - py, d = Math.sqrt(dx * dx + dy * dy), R = 150 * c.s + 60;
      if (d < R) { var f = (1 - d / R) * 0.12; c.vx += pvx * f; c.vy += pvy * f; }
      c.vx *= 0.94; c.vy *= 0.94;
      c.x += c.vx + c.drift * dt; c.y += c.vy;
      var span = 160 * c.s;
      if (c.x - span > w) c.x = -span; if (c.x + span < 0) c.x = w + span;
      if (c.y < 30) { c.y = 30; c.vy = 0; } if (c.y > h - 30) { c.y = h - 30; c.vy = 0; }
    }
    pvx *= 0.8; pvy *= 0.8;
    draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
