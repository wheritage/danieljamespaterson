/* ==========================================================================
   PROFIL EN 60 SECONDES — cinq questions, trois services recommandés, avec la raison
   Tout se passe dans le navigateur : aucune réponse n'est envoyée ni conservée.
   Transitions : la question sortante file vers le haut (power2.in, courte), la suivante monte (expo.out).
   ========================================================================== */
(function () {
  'use strict';
  var root = document.querySelector('[data-quiz]');
  if (!root) return;
  var DJP = window.DJP || {};
  var G = window.gsap && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) ? window.gsap : null;
  function L() { return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'fr'; }
  function t(o) { return o[L()]; }

  var Q = [
    { id: 'vie', q: { fr: 'Où en êtes-vous dans la vie ?', en: 'Where are you in life?' }, a: [
      { v: 'seul', fr: 'Seul ou seule', en: 'Single' },
      { v: 'couple', fr: 'En couple, sans enfant', en: 'In a couple, no kids' },
      { v: 'famille', fr: 'Famille avec enfants', en: 'Family with kids' },
      { v: 'retraite', fr: 'Retraité ou presque', en: 'Retired or almost' }] },
    { id: 'logement', q: { fr: 'Et côté logement ?', en: 'And your home?' }, a: [
      { v: 'locataire', fr: 'Locataire', en: 'Tenant' },
      { v: 'hypo', fr: 'Propriétaire avec hypothèque', en: 'Owner with a mortgage' },
      { v: 'libre', fr: 'Propriétaire, maison payée', en: 'Owner, home paid off' },
      { v: 'copro', fr: 'Copropriétaire', en: 'Condo owner' }] },
    { id: 'travail', q: { fr: 'Comment gagnez-vous votre revenu ?', en: 'How do you earn your income?' }, a: [
      { v: 'coll', fr: 'Salarié, avec assurance collective', en: 'Employee, with group insurance' },
      { v: 'sans', fr: 'Salarié, sans assurance collective', en: 'Employee, no group insurance' },
      { v: 'autonome', fr: 'Travailleur autonome', en: 'Self-employed' },
      { v: 'entreprise', fr: "Propriétaire d'entreprise", en: 'Business owner' }] },
    { id: 'priorite', q: { fr: "Qu'est-ce qui compte le plus en ce moment ?", en: 'What matters most right now?' }, a: [
      { v: 'proteger', fr: 'Protéger ma famille', en: 'Protect my family' },
      { v: 'epargne', fr: 'Faire croître mon épargne', en: 'Grow my savings' },
      { v: 'maison', fr: 'Acheter une première maison', en: 'Buy a first home' },
      { v: 'retraite', fr: 'Préparer ma retraite', en: 'Prepare my retirement' },
      { v: 'entreprise', fr: 'Protéger mon entreprise', en: 'Protect my business' }] },
    { id: 'place', q: { fr: "Qu'avez-vous déjà en place ?", en: 'What do you already have in place?' }, a: [
      { v: 'rien', fr: 'Aucune assurance personnelle', en: 'No personal insurance' },
      { v: 'travail', fr: 'Seulement celle du travail', en: 'Only my work coverage' },
      { v: 'anciennes', fr: 'Quelques protections, jamais révisées', en: 'Some coverage, never reviewed' },
      { v: 'complet', fr: 'Un plan complet et à jour', en: 'A complete, up-to-date plan' }] }
  ];

  var POINTS = {
    vie: { seul: { invalidite: 2, epargne: 2 }, couple: { vie: 2, epargne: 1, invalidite: 1 }, famille: { vie: 4, invalidite: 2, epargne: 1 }, retraite: { epargne: 3, vie: 2 } },
    logement: { locataire: { epargne: 1 }, hypo: { hypotheque: 4, vie: 1 }, libre: { vie: 1, epargne: 1 }, copro: { hypotheque: 2 } },
    travail: { coll: { invalidite: 1 }, sans: { invalidite: 3 }, autonome: { invalidite: 4, epargne: 1 }, entreprise: { entreprise: 5, invalidite: 2 } },
    priorite: { proteger: { vie: 4 }, epargne: { epargne: 4 }, maison: { epargne: 3, hypotheque: 2 }, retraite: { epargne: 4, vie: 1 }, entreprise: { entreprise: 4 } },
    place: { rien: { vie: 2, invalidite: 2 }, travail: { vie: 1, invalidite: 1 }, anciennes: { vie: 1, invalidite: 1, hypotheque: 1 }, complet: { epargne: 1 } }
  };

  var SERVICES = {
    vie: { href: '/assurance-vie', name: { fr: 'Assurance vie', en: 'Life insurance' } },
    invalidite: { href: '/assurance-invalidite-maladies-graves', name: { fr: 'Invalidité et maladies graves', en: 'Disability and critical illness' } },
    epargne: { href: '/epargne-retraite', name: { fr: 'Épargne et retraite', en: 'Savings and retirement' } },
    entreprise: { href: '/entrepreneurs', name: { fr: 'Entrepreneurs', en: 'Business owners' } },
    hypotheque: { href: '/protection-hypothecaire', name: { fr: 'Protection hypothécaire', en: 'Mortgage protection' } }
  };

  function reason(k, A) {
    var r = {
      vie: A.vie === 'famille' ? { fr: "Avec des enfants, l'assurance vie garde la maison et l'école intactes si vous n'êtes plus là.", en: 'With children, life insurance keeps the home and the school intact if you are gone.' }
        : A.vie === 'couple' ? { fr: 'Votre conjoint garderait son niveau de vie, et les dettes communes seraient effacées.', en: 'Your partner would keep their standard of living, and shared debts would be cleared.' }
        : A.vie === 'retraite' ? { fr: "À cette étape, la question devient l'impôt au décès et le legs à vos proches.", en: 'At this stage, the question becomes tax at death and the legacy for your family.' }
        : { fr: "Une protection simple pour que personne n'hérite de vos dettes.", en: 'Simple coverage so no one inherits your debts.' },
      invalidite: A.travail === 'autonome' ? { fr: 'Sans employeur, rien ne remplace votre revenu si la santé vous arrête.', en: 'With no employer, nothing replaces your income if your health stops you.' }
        : A.travail === 'entreprise' ? { fr: "Votre entreprise et votre revenu reposent sur vous : l'invalidité est le risque le plus probable.", en: 'Your business and your income rest on you: disability is the most likely risk.' }
        : A.travail === 'sans' ? { fr: "Sans assurance collective, un arrêt de travail toucherait directement votre revenu.", en: 'Without group insurance, time off work would hit your income directly.' }
        : { fr: 'On vérifie ce que couvre vraiment votre assurance collective, et ce qui manque.', en: 'We check what your group insurance really covers, and what is missing.' },
      epargne: A.priorite === 'maison' ? { fr: 'Le CELIAPP et le RAP peuvent financer votre mise de fonds.', en: 'The FHSA and the HBP can fund your down payment.' }
        : A.priorite === 'retraite' || A.vie === 'retraite' ? { fr: "L'ordre des retraits (REER, CELI, rentes) peut réduire l'impôt et allonger votre capital.", en: 'The order of withdrawals (RRSP, TFSA, pensions) can lower tax and stretch your capital.' }
        : A.vie === 'famille' ? { fr: 'Le REEE va chercher les subventions pour les études des enfants, chaque année.', en: "The RESP collects the education grants for your children, every year." }
        : { fr: 'Le bon compte dans le bon ordre : souvent plus payant que le rendement lui-même.', en: 'The right account in the right order: often worth more than the return itself.' },
      entreprise: { fr: 'Convention entre actionnaires, personne clé et surplus de la société : à planifier avec votre comptable.', en: "Shareholders' agreement, key person and corporate surplus: to plan with your accountant." },
      hypotheque: A.logement === 'hypo' || A.logement === 'copro' ? { fr: "Comparez l'assurance de la banque avec une protection qui vous appartient et vous suit.", en: "Compare the bank's insurance with coverage that you own and that follows you." }
        : { fr: "Avant de signer l'assurance prêt, comparez avec une assurance individuelle.", en: 'Before signing the mortgage insurance, compare it with individual coverage.' }
    };
    return r[k];
  }

  var answers = {}, step = 0;
  var stage = root.querySelector('[data-stage]'), bars = root.querySelectorAll('.qz-prog i'), live = root.querySelector('[data-live]');

  function progress() {
    bars.forEach(function (b, i) {
      var on = i < step || (step >= Q.length);
      if (G) G.to(b, { scaleX: on ? 1 : 0, duration: 0.6, ease: 'expo.out' }); else b.style.transform = 'scaleX(' + (on ? 1 : 0) + ')';
    });
  }

  function swap(html, focusSel) {
    function put() {
      stage.innerHTML = html;
      var items = stage.querySelectorAll('[data-in]');
      if (G) G.fromTo(items, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75, ease: 'expo.out', stagger: 0.05 });
      var f = stage.querySelector(focusSel);
      if (f) f.focus({ preventScroll: true });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
    var old = stage.querySelectorAll('[data-in]');
    if (G && old.length) G.to(old, { opacity: 0, y: -18, duration: 0.3, ease: 'power2.in', stagger: 0.02, onComplete: put });
    else put();
  }

  function question() {
    var q = Q[step];
    live.textContent = (L() === 'en' ? 'Question ' + (step + 1) + ' of ' + Q.length : 'Question ' + (step + 1) + ' sur ' + Q.length);
    var html = '<p class="qz-count" data-in>' + live.textContent + '</p>' +
      '<h2 class="qz-q" tabindex="-1" data-in>' + t(q.q) + '</h2>' +
      '<div class="qz-answers">' + q.a.map(function (a) {
        return '<button type="button" class="qz-a' + (answers[q.id] === a.v ? ' is-on' : '') + '" data-v="' + a.v + '" data-in><span>' + t(a) + '</span>' +
          '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg></button>';
      }).join('') + '</div>' +
      (step > 0 ? '<button type="button" class="qz-back" data-back data-in>' + (L() === 'en' ? 'Previous question' : 'Question précédente') + '</button>' : '');
    swap(html, '.qz-q');
    progress();
  }

  function results() {
    var score = { vie: 0, invalidite: 0, epargne: 0, entreprise: 0, hypotheque: 0 };
    Object.keys(answers).forEach(function (qid) {
      var pts = POINTS[qid][answers[qid]] || {};
      Object.keys(pts).forEach(function (k) { score[k] += pts[k]; });
    });
    var top = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; }).filter(function (k) { return score[k] > 0; }).slice(0, 3);
    var chips = ['vie', 'logement', 'travail'].map(function (qid) {
      var a = Q.filter(function (q) { return q.id === qid; })[0].a.filter(function (x) { return x.v === answers[qid]; })[0];
      return a ? '<span>' + t(a) + '</span>' : '';
    }).join('');
    var en = L() === 'en';
    var note = answers.place === 'anciennes' ? '<p class="qz-note" data-in>' + (en ? 'Your coverage has never been reviewed: that is often where gaps or duplicates hide.' : "Vos protections n'ont jamais été révisées : c'est souvent là que se cachent des trous ou des doublons.") + '</p>' : '';
    var html = '<p class="qz-count" data-in>' + (en ? 'Your profile' : 'Votre profil') + '</p>' +
      '<h2 class="qz-q" tabindex="-1" data-in>' + (en ? 'Where Daniel would start with you.' : 'Par où Daniel commencerait avec vous.') + '</h2>' +
      '<p class="qz-chips" data-in>' + chips + '</p>' + note +
      '<ol class="qz-res">' + top.map(function (k, i) {
        var s = SERVICES[k];
        return '<li data-in><a href="' + s.href + '" data-cursor-fr="Découvrir" data-cursor-en="Explore"><span class="qz-rank">' + (i === 0 ? (en ? 'First' : "D'abord") : i === 1 ? (en ? 'Then' : 'Ensuite') : (en ? 'And' : 'Et')) + '</span>' +
          '<span class="qz-name">' + t(s.name) + '</span><span class="qz-why">' + t(reason(k, answers)) + '</span></a></li>';
      }).join('') + '</ol>' +
      ('<p class="qz-extra" data-in>' + (en ? 'Also: get an online quote for your ' : 'Aussi : soumission en ligne pour votre ') +
        '<a href="/assurance-auto">' + (en ? 'car' : 'auto') + '</a> ' + (en ? 'or your ' : 'ou votre ') + '<a href="/assurance-habitation">' + (en ? 'home' : 'habitation') + '</a>.</p>') +
      '<div class="qz-actions" data-in><a class="btn btn--primary btn--xl" href="' + ((DJP.config && DJP.config.bookingUrl) || '/contact') + '" target="_blank" rel="noopener"><span>' + (en ? 'Book time with Daniel' : 'Réserver un moment avec Daniel') + '</span>' +
        '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg></a>' +
        '<button type="button" class="qz-back" data-restart>' + (en ? 'Start over' : 'Refaire le profil') + '</button></div>' +
      '<p class="qz-private" data-in>' + (en ? 'Your answers stay in your browser: nothing is sent or saved.' : "Vos réponses restent dans votre navigateur : rien n'est envoyé ni conservé.") + '</p>';
    live.textContent = en ? 'Your profile is ready.' : 'Votre profil est prêt.';
    swap(html, '.qz-q');
    progress();
  }

  function render() { if (step >= Q.length) results(); else question(); }

  stage.addEventListener('click', function (e) {
    var a = e.target.closest('.qz-a');
    if (a) {
      answers[Q[step].id] = a.getAttribute('data-v');
      a.classList.add('is-on');
      step++;
      setTimeout(render, G ? 160 : 0);
      return;
    }
    if (e.target.closest('[data-back]')) { step = Math.max(0, step - 1); render(); return; }
    if (e.target.closest('[data-restart]')) { answers = {}; step = 0; render(); }
  });
  document.addEventListener('djp:lang', function () { stage.innerHTML = ''; render(); });
  render();
})();
