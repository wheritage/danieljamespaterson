/* ==========================================================================
   CALCULATEUR D'ÉPARGNE (page Épargne et retraite)
   Capitalisation mensuelle : V(m+1) = V(m) × (1 + r/12) + cotisation. Résultats par année.
   REER / CELIAPP : remboursement d'impôt estimé = cotisations annuelles × taux marginal (non réinvesti).
   CELIAPP : cotisations plafonnées à 8 000 $ par année et 40 000 $ à vie (montant de départ inclus).
   Le graphique est en SVG, redessiné à chaque changement ; les barres montent (expo.out) au premier affichage.
   ========================================================================== */
(function () {
  'use strict';
  var root = document.querySelector('[data-calc]');
  if (!root) return;
  var DJP = window.DJP || {};
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var form = root.querySelector('form'), svg = root.querySelector('[data-chart]');
  var NS = 'http://www.w3.org/2000/svg';
  function lang() { return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'fr'; }
  function money(n) {
    return new Intl.NumberFormat(lang() === 'en' ? 'en-CA' : 'fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(Math.round(n || 0));
  }
  function short(n) {
    var en = lang() === 'en', a = Math.abs(n), s;
    if (a >= 1e6) s = (n / 1e6).toFixed(1).replace('.0', '') + (en ? 'M' : ' M');
    else if (a >= 1e3) s = Math.round(n / 1e3) + (en ? 'k' : ' k');
    else s = String(Math.round(n));
    return en ? '$' + s : s.replace('.', ',') + ' $';
  }
  function val(name) { var el = form.elements[name]; return Math.max(0, parseFloat(el.value) || 0); }
  function type() { var c = form.querySelector('input[name="type"]:checked'); return c ? c.value : 'celi'; }

  function compute() {
    var t = type(), init = val('init'), month = val('month'), years = Math.round(val('years')) || 1;
    var rate = val('rate') / 100, tax = val('tax') / 100;
    var capYear = Infinity, capLife = Infinity;
    if (t === 'celiapp') { capYear = 8000; capLife = 40000; }
    var lifetime = Math.min(init, capLife, capYear);
    var v = lifetime, contrib = lifetime, refund = (t === 'celi') ? 0 : lifetime * tax;
    var rows = [];
    for (var y = 1; y <= years; y++) {
      var yearIn = y === 1 ? lifetime : 0;
      for (var m = 0; m < 12; m++) {
        var c = month;
        var roomYear = capYear - yearIn, roomLife = capLife - contrib;
        c = Math.max(0, Math.min(c, roomYear, roomLife));
        v = v * (1 + rate / 12) + c;
        contrib += c; yearIn += c;
        if (t !== 'celi') refund += c * tax;
      }
      rows.push({ year: y, value: v, contrib: contrib });
    }
    return { t: t, years: years, total: v, contrib: contrib, growth: v - contrib, refund: refund, rows: rows, capped: t === 'celiapp' && contrib >= capLife - 0.5 };
  }

  var drawn = false;
  function chart(res) {
    var w = Math.max(280, svg.clientWidth || 560), h = 240, pad = { l: 46, r: 6, t: 10, b: 24 };
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var max = res.rows.reduce(function (m, r) { return Math.max(m, r.value); }, 1);
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b, n = res.rows.length;
    var gap = n > 25 ? 2 : 4, bw = Math.max(2, iw / n - gap);
    function el(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; }
    [0, 0.5, 1].forEach(function (f) {
      var y = pad.t + ih - ih * f;
      el('line', { x1: pad.l, x2: w - pad.r, y1: y, y2: y, class: 'axis', 'stroke-width': 1 });
      var tx = el('text', { x: pad.l - 8, y: y + 4, 'text-anchor': 'end' }); tx.textContent = short(max * f);
    });
    var bars = [];
    res.rows.forEach(function (r, i) {
      var x = pad.l + i * (iw / n) + gap / 2;
      var hIn = ih * (Math.min(r.contrib, r.value) / max), hGr = ih * (Math.max(0, r.value - r.contrib) / max);
      var g = el('g', { class: 'bar' });
      var a = document.createElementNS(NS, 'rect'); a.setAttribute('class', 'bar-in');
      a.setAttribute('x', x); a.setAttribute('width', bw); a.setAttribute('y', pad.t + ih - hIn); a.setAttribute('height', hIn);
      var b = document.createElementNS(NS, 'rect'); b.setAttribute('class', 'bar-gr');
      b.setAttribute('x', x); b.setAttribute('width', bw); b.setAttribute('y', pad.t + ih - hIn - hGr); b.setAttribute('height', hGr);
      g.appendChild(a); g.appendChild(b);
      bars.push(g);
      if (i === 0 || i === n - 1 || (n > 10 && (i + 1) % 5 === 0)) {
        var tx = el('text', { x: x + bw / 2, y: h - 6, 'text-anchor': 'middle' }); tx.textContent = (lang() === 'en' ? 'Yr ' : 'An ') + r.year;
      }
    });
    if (!drawn && window.gsap && !reduce) {
      drawn = true;
      gsap.from(bars, { scaleY: 0, transformOrigin: '50% 100%', duration: 1.1, ease: 'expo.out', stagger: { amount: 0.5 },
        scrollTrigger: window.ScrollTrigger ? { trigger: svg, start: 'top 85%', once: true } : undefined });
    }
  }

  var shown = { total: 0, contrib: 0, growth: 0, refund: 0 };
  function render() {
    var res = compute();
    root.querySelectorAll('[data-show]').forEach(function (el) { el.hidden = el.getAttribute('data-show').split(' ').indexOf(res.t) < 0; });
    root.querySelector('[data-out="years"]').textContent = res.years;
    root.querySelector('[data-out="rate"]').textContent = String(val('rate')).replace('.', lang() === 'en' ? '.' : ',');
    root.querySelector('[data-out="tax"]').textContent = Math.round(val('tax'));
    var target = { total: res.total, contrib: res.contrib, growth: res.growth, refund: res.refund };
    function paint() { Object.keys(shown).forEach(function (k) { var e = root.querySelector('[data-res="' + k + '"]'); if (e) e.textContent = money(shown[k]); }); }
    if (window.gsap && !reduce) gsap.to(shown, Object.assign({ duration: 0.6, ease: 'expo.out', overwrite: true, onUpdate: paint }, target));
    else { Object.assign(shown, target); paint(); }
    var en = lang() === 'en', ex;
    if (res.t === 'celi') ex = en ? 'In a TFSA, growth and withdrawals are not taxed: the projected amount is yours to withdraw.' : "Dans un CELI, la croissance et les retraits ne sont pas imposés : le montant projeté peut être retiré tel quel.";
    else if (res.t === 'reer') ex = en ? 'In an RRSP, each contribution generates a tax refund now; withdrawals will be taxed, ideally at a lower rate in retirement.' : "Dans un REER, chaque cotisation génère un remboursement d'impôt maintenant ; les retraits seront imposés, idéalement à un taux plus bas à la retraite.";
    else ex = (en ? 'The FHSA combines a deduction now and a tax-free withdrawal for a first home.' : "Le CELIAPP combine une déduction maintenant et un retrait non imposé pour une première propriété.") + (res.capped ? (en ? ' The lifetime $40,000 limit is reached in this scenario.' : ' Le plafond à vie de 40 000 $ est atteint dans ce scénario.') : '');
    root.querySelector('[data-res="explain"]').textContent = ex;
    chart(res);
  }
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  document.addEventListener('djp:lang', render);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { chart(compute()); }, 150); });
  render();
})();
