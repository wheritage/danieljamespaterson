/* ==========================================================================
   CALCULATEUR DE BESOIN EN ASSURANCE VIE (page Assurance vie)
   Besoin = revenu × part à remplacer × années + dettes + études + frais au décès
            − assurance existante − épargne disponible.
   Barre empilée : chaque besoin est un segment ; la part déjà couverte est hachurée par-dessus.
   Aucun rendement, aucune inflation, aucun impôt : c'est une première estimation, dite comme telle.
   ========================================================================== */
(function () {
  'use strict';
  var root = document.querySelector('[data-needs]');
  if (!root) return;
  var DJP = window.DJP || {};
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var form = root.querySelector('form'), bar = root.querySelector('[data-bar]'), legend = root.querySelector('[data-legend]');
  function lang() { return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'fr'; }
  function money(n) { return new Intl.NumberFormat(lang() === 'en' ? 'en-CA' : 'fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(Math.round(n || 0)); }
  function val(name) { return Math.max(0, parseFloat(form.elements[name].value) || 0); }

  var PARTS = [
    { k: 'income', fr: 'Revenu', en: 'Income', c: 'var(--encre)' },
    { k: 'debt', fr: 'Dettes', en: 'Debts', c: 'var(--ciel-fonce)' },
    { k: 'edu', fr: 'Études', en: 'Education', c: 'var(--ciel)' },
    { k: 'fin', fr: 'Frais au décès', en: 'Final expenses', c: 'var(--ciel-clair)' }
  ];

  // Segments créés une fois ; seules leurs échelles changent (transform), jamais leur largeur
  bar.innerHTML = PARTS.map(function (p) { return '<span class="nb-seg" data-k="' + p.k + '" style="background:' + p.c + '"></span>'; }).join('') + '<span class="nb-cover"></span>';
  var segs = {}; bar.querySelectorAll('.nb-seg').forEach(function (e) { segs[e.getAttribute('data-k')] = e; });
  var cover = bar.querySelector('.nb-cover');

  function render() {
    var pct = val('pct'), yrs = val('yrs');
    root.querySelector('[data-out="pct"]').textContent = pct;
    root.querySelector('[data-out="yrs"]').textContent = yrs;
    var v = { income: val('income') * pct / 100 * yrs, debt: val('debt'), edu: val('edu'), fin: val('fin') };
    var gross = v.income + v.debt + v.edu + v.fin;
    var have = val('insured') + val('savings');
    var need = Math.max(0, gross - have);

    var big = root.querySelector('[data-odo="big"]');
    if (DJP.odometer) DJP.odometer(big, money(need)); else big.textContent = money(need);

    // Barre : positions en pourcentage de la largeur, via scaleX et translate (pas de width animée)
    var x = 0, total = gross || 1;
    PARTS.forEach(function (p) {
      var w = v[p.k] / total;
      var props = { scaleX: w, x: x * bar.clientWidth };
      if (window.gsap && !reduce) gsap.to(segs[p.k], Object.assign({ duration: 0.7, ease: 'expo.out', overwrite: true }, props));
      else segs[p.k].style.transform = 'translateX(' + props.x + 'px) scaleX(' + w + ')';
      x += w;
    });
    var cw = Math.min(1, have / total);
    if (window.gsap && !reduce) gsap.to(cover, { scaleX: cw, duration: 0.7, ease: 'expo.out', overwrite: true });
    else cover.style.transform = 'scaleX(' + cw + ')';

    var en = lang() === 'en';
    legend.innerHTML = PARTS.filter(function (p) { return v[p.k] > 0; }).map(function (p) {
      return '<div><dt><i class="sw" style="background:' + p.c + '"></i>' + (en ? p.en : p.fr) + '</dt><dd>' + money(v[p.k]) + '</dd></div>';
    }).join('') + (have > 0 ? '<div><dt><i class="sw sw-cover"></i>' + (en ? 'Already covered' : 'Déjà couvert') + '</dt><dd>− ' + money(have) + '</dd></div>' : '');

    var ex;
    if (need === 0) ex = en ? 'Based on these numbers, what you have in place seems to cover the essentials. A review confirms it, and checks the beneficiaries.' : 'Selon ces chiffres, ce qui est en place semble couvrir l\'essentiel. Une révision le confirme, et vérifie les bénéficiaires.';
    else ex = en ? 'Your family would need about ' + money(need) + ' more to keep its standard of living and clear its debts. A 20 or 30-year term is often the most affordable way to cover it.'
      : 'Il manquerait environ ' + money(need) + ' à votre famille pour garder son niveau de vie et effacer ses dettes. Une temporaire 20 ou 30 ans est souvent la façon la plus abordable de le couvrir.';
    root.querySelector('[data-res="explain"]').textContent = ex;
  }
  form.addEventListener('input', render);
  document.addEventListener('djp:lang', render);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(render, 150); });
  render();
})();
