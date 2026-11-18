#!/usr/bin/env python3
"""Génère les pages de services à partir de tools/services_content.py et remet le pied de page
partagé à jour sur toutes les pages. Usage : python3 tools/build-services.py"""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
sys.path.insert(0, HERE)
from services_content import SERVICES
from illustrations import illustration

SITE = 'https://danieljamespaterson.vercel.app'
BOOKING = 'https://bookings.cloud.microsoft/bookwithme/user/1d5a7ad95edf4c28bd1fdcfe008be4d1%40agc.ia.ca?anonymous&ismsaljsauthenabled'
PHONE_HREF, PHONE = 'tel:+15147950381', '514 795-0381'
EMAIL = 'danieljames.paterson@agc.ia.ca'

def bi(fr, en): return f'<span lang="fr">{fr}</span><span lang="en">{en}</span>'
ARROW = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg>'
EXT = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M8 4H4v12h12v-4M11 3h6v6M17 3l-8 8" stroke="currentColor" stroke-width="1.5"/></svg>'
MARK = ('<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">'
        '<rect x="0.75" y="0.75" width="38.5" height="38.5" fill="none" stroke="currentColor" stroke-width="1.5"/>'
        '<path d="M1.5 27.5 H38.5" stroke="#7EC3E6" stroke-width="2"/>'
        '<path d="M6 21 C12 18.5 17 23 23 20.5" fill="none" stroke="#7EC3E6" stroke-width="1"/>'
        '<rect x="25" y="9" width="6" height="6" fill="#B8452C"/></svg>')

ILL = {
 'vie': '<path d="M30 70 L60 40 L90 70 V110 H30 Z"/><path d="M60 40 V20"/><rect x="50" y="80" width="20" height="30"/><path d="M95 70 L120 50 L145 70 V110 H95"/>',
 'invalidite': '<path d="M10 70 H50 L60 45 L72 95 L84 60 L92 70 H150"/>',
 'epargne': '<path d="M20 110 H50 V90 H80 V70 H110 V45 H140 V20"/><path d="M20 110 H150"/>',
 'entreprise': '<rect x="25" y="45" width="40" height="65"/><rect x="75" y="25" width="50" height="85"/><path d="M85 40 H115 M85 55 H115 M85 70 H115 M35 60 H55 M35 75 H55"/>',
 'hypotheque': '<path d="M20 70 L80 25 L140 70"/><path d="M35 60 V110 H125 V60"/><path d="M80 110 V80 H100 V110"/>',
 'auto': '<path d="M20 90 V75 L35 55 H110 L130 75 H145 V90 Z"/><circle cx="45" cy="92" r="11"/><circle cx="118" cy="92" r="11"/><path d="M45 55 L52 75 H120"/>',
 'habitation': '<path d="M25 65 L80 22 L135 65"/><path d="M38 56 V110 H122 V56"/><rect x="55" y="72" width="20" height="18"/><rect x="88" y="72" width="20" height="38"/>',
}

def card_ill(key, cls='h-card-art', uid=None):
    return f'<div class="{cls}">{illustration(key, uid or (cls + "-" + key))}</div>'

FOOTER = f'''<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="brand" href="/">{MARK}<span class="brand-name">Daniel James Paterson<small>{bi("Conseiller en sécurité financière", "Financial security advisor")}</small></span></a>
        <p style="margin-top:1.4rem;max-width:26em">{bi("Des protections et des stratégies financières expliquées simplement, choisies pour votre situation.", "Protection and financial strategies explained plainly, chosen for your situation.")}</p>
        <ul class="footer-contact">
          <li><a href="{PHONE_HREF}">{PHONE}</a></li>
          <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
        </ul>
      </div>
      <div>
        <h4>Services</h4>
        <ul>{''.join(f'<li><a href="/{s["slug"]}">{bi(*s["name"])}</a></li>' for s in SERVICES)}</ul>
      </div>
      <div>
        <h4>{bi("Navigation", "Navigation")}</h4>
        <ul>
          <li><a href="/">{bi("Accueil", "Home")}</a></li>
          <li><a href="/#demarche">{bi("Démarche", "Approach")}</a></li>
          <li><a href="/profil">{bi("Profil en 60 secondes", "60-second profile")}</a></li>
          <li><a href="/a-propos">{bi("À propos", "About")}</a></li>
          <li><a href="/contact">{bi("Contact", "Contact")}</a></li>
          <li><a href="{BOOKING}" target="_blank" rel="noopener">{bi("Réserver un moment", "Book a time")}</a></li>
          <li><a href="/confidentialite">{bi("Confidentialité", "Privacy")}</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-giant" aria-hidden="true"><span class="line-mask"><span>Daniel James</span></span><span class="line-mask"><span><em>Paterson</em></span></span></div>
    <div class="footer-legal">
      <p>{bi("Daniel James Paterson, conseiller en sécurité financière. Rattaché au cabinet Industrielle Alliance, Assurance et services financiers inc. Certificat de l'Autorité des marchés financiers (AMF) no 273174, <a href=\"https://lautorite.qc.ca/grand-public/registres/registre-des-entreprises-et-des-individus-autorises-a-exercer\" target=\"_blank\" rel=\"noopener\">vérifiable au registre de l'AMF</a>. Les informations de ce site sont générales et ne remplacent pas un conseil personnalisé.", "Daniel James Paterson, financial security advisor. Attached to the firm Industrial Alliance Insurance and Financial Services Inc. Autorité des marchés financiers (AMF) certificate no. 273174, <a href=\"https://lautorite.qc.ca/en/general-public/registers/register-of-firms-and-individuals-authorized-to-practise\" target=\"_blank\" rel=\"noopener\">verifiable in the AMF register</a>. The information on this site is general and does not replace personalized advice.")}</p>
      <p>© <span data-year></span> Daniel James Paterson</p>
    </div>
  </div>
</footer>'''

def page(s):
    head = open(os.path.join(ROOT, 'a-propos.html')).read()
    pre = head.split('<main id="main">')[0]
    nf, ne = s['name']
    tf = f'{nf} | Daniel James Paterson'; te = f'{ne} | Daniel James Paterson'
    pre = re.sub(r'data-title-fr="[^"]*" data-title-en="[^"]*"', f'data-title-fr="{tf}" data-title-en="{te}"', pre)
    pre = re.sub(r'<title>[^<]*</title>', f'<title>{tf}</title>', pre)
    desc = re.sub('<[^>]+>', '', s['lede'][0]).replace('"', '&quot;')
    pre = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', pre)
    pre = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{desc}">', pre)
    pre = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{tf}">', pre)
    pre = pre.replace(f'{SITE}/a-propos', f'{SITE}/{s["slug"]}')
    pre = pre.replace('data-page="a-propos"', f'data-page="service" data-service="{s["key"]}"')
    pre = pre.replace(' aria-current="page"', '')
    pre = pre.replace('<link rel="stylesheet" href="/assets/site.css">', '<link rel="stylesheet" href="/assets/site.css">\n<link rel="stylesheet" href="/assets/service.css">')
    extra = '<script src="/assets/service.js" defer></script>'
    if s.get('calculator'): extra += '\n<script src="/assets/calc.js" defer></script>'
    if s.get('needs'): extra += '\n<script src="/assets/needs.js" defer></script>'
    pre = pre.replace('<script src="/assets/site.js" defer></script>', '<script src="/assets/site.js" defer></script>\n' + extra)

    quote = s.get('quote')
    if quote:
        actions = (f'<a class="btn btn--primary" href="{quote}" target="_blank" rel="noopener" data-magnetic><span>{bi("Obtenir une soumission", "Get a quote")}</span>{EXT}</a>'
                   f'<a class="btn btn--line" href="/contact" data-booking data-magnetic><span>{bi("Réserver un moment avec moi", "Book time with me")}</span></a>')
    else:
        actions = f'<a class="btn btn--primary" href="/contact" data-booking data-magnetic><span>{bi("Réserver un moment avec moi", "Book time with me")}</span>{ARROW}</a>'
        if s.get('calculator') or s.get('needs'):
            actions += f'<a class="btn btn--line" href="#calculateur" data-magnetic><span>{bi("Essayer le calculateur", "Try the calculator")}</span></a>'

    keys = ''.join(f'<div class="s-key" data-reveal><h3>{bi(a, b)}</h3><p>{bi(c, d)}</p></div>' for a, b, c, d in s['keys'])
    how = ''.join(f'''<div class="s-how-item" data-reveal><h3>{bi(a, b)}</h3><p>{bi(c, d)}</p></div>''' for a, b, c, d in s['how'])
    prods = ''.join(f'''<article class="s-prod" data-reveal>
          <p class="s-prod-tag">{bi(*tag)}</p>
          <h3>{bi(a, b)}</h3>
          <p>{bi(c, d)}</p>
        </article>''' for a, b, c, d, tag in s['products'])
    tabs = ''.join(f'<button type="button" role="tab" id="tab-{i}" aria-controls="panel-{i}" aria-selected="{"true" if i == 0 else "false"}" tabindex="{0 if i == 0 else -1}">{bi(a, b)}</button>' for i, (a, b, c, d) in enumerate(s['profiles']))
    panels = ''.join(f'<div class="s-panel" role="tabpanel" id="panel-{i}" aria-labelledby="tab-{i}"{"" if i == 0 else " hidden"}><p>{bi(c, d)}</p></div>' for i, (a, b, c, d) in enumerate(s['profiles']))
    faq = ''.join(f'''<div class="s-faq-item" data-reveal>
          <h3><button type="button" aria-expanded="false" aria-controls="faq-{i}" id="faq-b-{i}"><span>{bi(a, b)}</span><i aria-hidden="true"></i></button></h3>
          <div class="s-faq-a" id="faq-{i}" role="region" aria-labelledby="faq-b-{i}" hidden><p>{bi(c, d)}</p></div>
        </div>''' for i, (a, b, c, d) in enumerate(s['faq']))

    calc = ''
    if s.get('calculator'):
        calc = f'''
  <section class="section s-calc" id="calculateur">
    <div class="wrap">
      <div class="section-head">
        <div><p class="eyebrow">{bi("Calculateur", "Calculator")}</p><h2 data-split><span lang="fr">Voyez votre épargne<br>grandir.</span><span lang="en">Watch your savings<br>grow.</span></h2></div>
        <p class="lede" data-reveal>{bi("Ajustez les montants : la projection se met à jour. Le rendement est une hypothèse que vous choisissez, pas une promesse.", "Adjust the amounts: the projection updates. The return is an assumption you choose, not a promise.")}</p>
      </div>
      <div class="calc" data-calc>
        <form class="calc-inputs" onsubmit="return false">
          <div class="calc-field"><label>{bi("Ce que vous voulez savoir", "What you want to know")}</label>
            <div class="calc-seg calc-seg--2" role="radiogroup" aria-label="Mode" data-aria-fr="Mode" data-aria-en="Mode">
              <label><input type="radio" name="mode" value="project" checked><span>{bi("Combien j'aurai", "How much I'll have")}</span></label>
              <label><input type="radio" name="mode" value="goal"><span>{bi("Combien mettre par mois", "How much to save monthly")}</span></label>
            </div>
          </div>
          <div class="calc-field"><label for="c-type">{bi("Compte", "Account")}</label>
            <div class="calc-seg" role="radiogroup" aria-label="Compte" data-aria-fr="Compte" data-aria-en="Account">
              <label><input type="radio" name="type" value="celi" checked><span>{bi("CELI", "TFSA")}</span></label>
              <label><input type="radio" name="type" value="reer"><span>{bi("REER", "RRSP")}</span></label>
              <label><input type="radio" name="type" value="celiapp"><span>{bi("CELIAPP", "FHSA")}</span></label>
            </div>
          </div>
          <div class="calc-field"><label for="c-init">{bi("Montant de départ", "Starting amount")}</label><div class="calc-num"><input id="c-init" name="init" type="number" min="0" step="500" value="5000" inputmode="numeric"><span>$</span></div></div>
          <div class="calc-field" data-mode="goal" hidden><label for="c-goal">{bi("Votre objectif", "Your goal")}</label><div class="calc-num"><input id="c-goal" name="goal" type="number" min="0" step="1000" value="60000" inputmode="numeric"><span>$</span></div></div>
          <div class="calc-field" data-mode="project"><label for="c-month">{bi("Cotisation mensuelle", "Monthly contribution")}</label><div class="calc-num"><input id="c-month" name="month" type="number" min="0" step="25" value="300" inputmode="numeric"><span>$</span></div></div>
          <div class="calc-field"><label for="c-years">{bi("Durée", "Time horizon")} <output data-out="years">20</output> {bi("ans", "years")}</label><input id="c-years" name="years" type="range" min="1" max="40" value="20"></div>
          <div class="calc-field"><label for="c-rate">{bi("Rendement annuel hypothétique", "Hypothetical annual return")} <output data-out="rate">5</output> %</label><input id="c-rate" name="rate" type="range" min="0" max="10" step="0.5" value="5"></div>
          <div class="calc-field" data-show="reer celiapp"><label for="c-tax">{bi("Votre taux marginal d'imposition", "Your marginal tax rate")} <output data-out="tax">37</output> %</label><input id="c-tax" name="tax" type="range" min="14" max="54" step="1" value="37"></div>
          <p class="calc-note" data-show="celiapp">{bi("Le CELIAPP est limité à 8 000 $ par année et 40 000 $ à vie : le calculateur plafonne les cotisations.", "The FHSA is capped at $8,000 a year and $40,000 lifetime: the calculator caps contributions.")}</p>
        </form>
        <div class="calc-out" aria-live="polite">
          <div class="calc-total"><p><span data-mode="project">{bi("Valeur projetée", "Projected value")}</span><span data-mode="goal" hidden>{bi("Cotisation mensuelle nécessaire", "Monthly contribution needed")}</span></p><strong data-odo="big">0 $</strong></div>
          <div class="calc-goal-total" data-mode="goal" hidden><p>{bi("Valeur atteinte", "Value reached")} : <b data-res="total">0 $</b></p></div>
          <dl class="calc-split">
            <div><dt><i class="sw sw-in"></i>{bi("Vos cotisations", "Your contributions")}</dt><dd data-res="contrib">0 $</dd></div>
            <div><dt><i class="sw sw-gr"></i>{bi("Croissance", "Growth")}</dt><dd data-res="growth">0 $</dd></div>
            <div data-show="reer celiapp"><dt><i class="sw sw-tx"></i>{bi("Remboursements d'impôt estimés", "Estimated tax refunds")}</dt><dd data-res="refund">0 $</dd></div>
          </dl>
          <svg class="calc-chart" role="img" aria-label="Projection" data-chart></svg>
          <p class="calc-explain" data-res="explain"></p>
          <p class="calc-disc">{bi("Projection hypothétique à des fins d'illustration. Rendements non garantis, avant frais et sans tenir compte de l'inflation. Les remboursements d'impôt sont estimés au taux indiqué ; les retraits d'un REER sont imposables.", "Hypothetical projection for illustration. Returns are not guaranteed, before fees and without inflation. Tax refunds are estimated at the rate shown; RRSP withdrawals are taxable.")}</p>
        </div>
      </div>
    </div>
  </section>'''

    if s.get('needs'):
        def num(id_, name, fr, en, val, step=1000, minus=False):
            return f'<div class="calc-field"><label for="n-{id_}">{"<i class=\"calc-minus\">−</i> " if minus else ""}{bi(fr, en)}</label><div class="calc-num"><input id="n-{id_}" name="{name}" type="number" min="0" step="{step}" value="{val}" inputmode="numeric"><span>$</span></div></div>'
        calc = f"""
  <section class="section s-calc" id="calculateur">
    <div class="wrap">
      <div class="section-head">
        <div><p class="eyebrow">{bi("Calculateur", "Calculator")}</p><h2 data-split><span lang="fr">De combien d'assurance<br>avez-vous besoin ?</span><span lang="en">How much coverage<br>do you need?</span></h2></div>
        <p class="lede" data-reveal>{bi("Une première estimation en une minute. Les montants de départ sont des exemples : remplacez-les par les vôtres.", "A first estimate in one minute. The starting amounts are examples: replace them with your own.")}</p>
      </div>
      <div class="calc" data-needs>
        <form class="calc-inputs" onsubmit="return false">
          <p class="calc-group">{bi("Ce qu'il faudrait couvrir", "What would need covering")}</p>
          {num("inc", "income", "Revenu annuel à remplacer", "Annual income to replace", 65000)}
          <div class="calc-field"><label for="n-pct">{bi("Part du revenu à remplacer", "Share of income to replace")} <output data-out="pct">70</output> %</label><input id="n-pct" name="pct" type="range" min="30" max="100" step="5" value="70"></div>
          <div class="calc-field"><label for="n-yrs">{bi("Pendant", "For")} <output data-out="yrs">10</output> {bi("ans", "years")}</label><input id="n-yrs" name="yrs" type="range" min="0" max="25" value="10"></div>
          {num("debt", "debt", "Hypothèque et dettes", "Mortgage and debts", 250000)}
          {num("edu", "edu", "Études des enfants", "Children's education", 0, 5000)}
          {num("fin", "fin", "Frais au décès (funérailles, succession)", "Final expenses (funeral, estate)", 15000)}
          <p class="calc-group">{bi("Ce qui est déjà en place", "What is already in place")}</p>
          {num("ins", "insured", "Assurance vie existante (travail et personnelle)", "Existing life insurance (work and personal)", 50000, minus=True)}
          {num("sav", "savings", "Épargne et placements disponibles", "Available savings and investments", 20000, minus=True)}
        </form>
        <div class="calc-out" aria-live="polite">
          <div class="calc-total"><p>{bi("Besoin estimé", "Estimated need")}</p><strong data-odo="big">0 $</strong></div>
          <div class="needs-bar" data-bar aria-hidden="true"></div>
          <dl class="needs-legend" data-legend></dl>
          <p class="calc-explain" data-res="explain"></p>
          <div><a class="btn btn--primary" href="/contact" data-booking data-magnetic><span>{bi("Valider ce montant avec Daniel", "Check this amount with Daniel")}</span>{ARROW}</a></div>
          <p class="calc-disc">{bi("Estimation simplifiée à des fins d'illustration : elle ne tient compte ni de l'inflation, ni du rendement des sommes versées, ni de l'impôt au décès, ni des prestations gouvernementales. Le bon montant se valide lors d'une analyse complète.", "Simplified estimate for illustration: it does not account for inflation, returns on the money paid, tax at death or government benefits. The right amount is confirmed through a full analysis.")}</p>
        </div>
      </div>
    </div>
  </section>"""

    other = [x for x in SERVICES if x['slug'] != s['slug']]
    idx = SERVICES.index(s)
    nxt = SERVICES[(idx + 1) % len(SERVICES)]

    main = f'''<main id="main">
  <section class="page-hero s-hero">
    <div class="wrap s-hero-grid">
      <div>
        <p class="eyebrow"><a href="/#services">Services</a></p>
        <h1 data-split><span lang="fr">{s["title"][0]}</span><span lang="en">{s["title"][1]}</span></h1>
        <p class="lede" data-reveal>{bi(*s["lede"])}</p>
        <div class="hero-actions" data-reveal>{actions}</div>
      </div>
      <div class="s-hero-ill wipe" aria-hidden="true">{illustration(s["ill"], "hero-" + s["ill"])}</div>
    </div>
  </section>

  <section class="s-keys">
    <div class="wrap s-keys-grid" data-rule>{keys}</div>
  </section>

  <section class="section section--white">
    <div class="wrap">
      <div class="section-head">
        <div><p class="eyebrow">{bi("L'essentiel", "The essentials")}</p><h2 data-split>{bi(*s["how_title"])}</h2></div>
      </div>
      <div class="s-how">{how}</div>
    </div>
  </section>
{calc}
  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <div><p class="eyebrow">{bi("Options", "Options")}</p><h2 data-split>{bi(*s["products_title"])}</h2></div>
        <p class="lede" data-reveal>{bi("Chaque option répond à un besoin précis. Daniel vous aide à choisir, et à éviter de payer pour ce qui ne vous sert pas.", "Each option answers a specific need. Daniel helps you choose, and avoid paying for what does not serve you.")}</p>
      </div>
      <div class="s-prods">{prods}</div>
    </div>
  </section>

  <section class="section section--ink s-profiles">
    <div class="wrap">
      <div class="section-head">
        <div><p class="eyebrow">{bi("Votre situation", "Your situation")}</p><h2 data-split>{bi(*s["profiles_title"])}</h2></div>
      </div>
      <div class="s-tabs" data-tabs>
        <div class="s-tablist" role="tablist" aria-label="Profils" data-aria-fr="Profils" data-aria-en="Profiles">{tabs}<span class="s-tab-ink" aria-hidden="true"></span></div>
        <div class="s-panels">{panels}</div>
      </div>
    </div>
  </section>

  <section class="section section--white">
    <div class="wrap s-faq-grid">
      <div><p class="eyebrow">{bi("Questions fréquentes", "Common questions")}</p><h2 data-split>{bi("Vous vous demandez", "You may be wondering")}</h2></div>
      <div class="s-faq" data-faq>{faq}</div>
    </div>
  </section>

  <section class="section section--sky cta-band">
    <div class="wrap">
      <h2 data-split><span lang="fr">Parlons de votre<br>situation.</span><span lang="en">Let's talk about<br>your situation.</span></h2>
      <p class="lede" data-reveal>{bi("Vingt minutes, au téléphone ou en vidéo, sans engagement.", "Twenty minutes, by phone or video, with no commitment.")}</p>
      <div class="hero-actions" data-reveal><a class="btn btn--primary" href="/contact" data-booking data-magnetic><span>{bi("Réserver un moment avec moi", "Book time with me")}</span>{ARROW}</a></div>
    </div>
  </section>

  <nav class="s-next" aria-label="Service suivant" data-aria-fr="Service suivant" data-aria-en="Next service">
    <a class="wrap s-next-in" href="/{nxt["slug"]}" data-cursor-fr="Suivant" data-cursor-en="Next">
      <span class="eyebrow">{bi("Service suivant", "Next service")}</span>
      <span class="s-next-title">{bi(*nxt["name"])}</span>
    </a>
  </nav>
</main>
'''
    return pre + main + FOOTER + '\n</body>\n</html>\n'

def profil_page():
    head = open(os.path.join(ROOT, 'a-propos.html')).read()
    pre = head.split('<main id="main">')[0]
    tf, te = 'Profil en 60 secondes | Daniel James Paterson', '60-second profile | Daniel James Paterson'
    pre = re.sub(r'data-title-fr="[^"]*" data-title-en="[^"]*"', f'data-title-fr="{tf}" data-title-en="{te}"', pre)
    pre = re.sub(r'<title>[^<]*</title>', f'<title>{tf}</title>', pre)
    d = "Cinq questions pour savoir par où commencer : assurance vie, invalidité, épargne, hypothèque ou entreprise."
    pre = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{d}">', pre)
    pre = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{d}">', pre)
    pre = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{tf}">', pre)
    pre = pre.replace(f'{SITE}/a-propos', f'{SITE}/profil').replace('data-page="a-propos"', 'data-page="profil"').replace(' aria-current="page"', '')
    pre = pre.replace('<script src="/assets/site.js" defer></script>', '<script src="/assets/site.js" defer></script>\n<script src="/assets/profil.js" defer></script>')
    main = f"""<main id="main">
  <section class="page-hero qz-hero">
    <div class="wrap">
      <p class="eyebrow">{bi("Profil en 60 secondes", "60-second profile")}</p>
      <h1 data-split><span lang="fr">Ce qu'il vous faut,<br><em>en cinq questions.</em></span><span lang="en">What you need,<br><em>in five questions.</em></span></h1>
      <p class="lede" data-reveal>{bi("Répondez du bout des doigts : vous saurez par où commencer, et pourquoi. Aucune coordonnée demandée.", "Answer with a few taps: you will know where to start, and why. No contact details asked.")}</p>
    </div>
  </section>
  <section class="section section--white qz-section">
    <div class="wrap">
      <div class="quiz" data-quiz>
        <div class="qz-prog" aria-hidden="true"><span><i></i></span><span><i></i></span><span><i></i></span><span><i></i></span><span><i></i></span></div>
        <p class="sr-only" aria-live="polite" data-live></p>
        <div class="qz-stage" data-stage></div>
      </div>
    </div>
  </section>
</main>
"""
    return pre + main + FOOTER + '\n</body>\n</html>\n'

def patch_footer(path):
    s = open(path).read()
    s = re.sub(r'<footer class="footer">.*?</footer>', lambda m: FOOTER, s, count=1, flags=re.S)
    open(path, 'w').write(s)

if __name__ == '__main__':
    for s in SERVICES:
        open(os.path.join(ROOT, s['slug'] + '.html'), 'w').write(page(s))
    open(os.path.join(ROOT, 'profil.html'), 'w').write(profil_page())
    for f in os.listdir(ROOT):
        if f.endswith('.html'): patch_footer(os.path.join(ROOT, f))
    # sitemap
    urls = ['', 'a-propos', 'profil', 'contact', 'confidentialite'] + [s['slug'] for s in SERVICES]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + \
         ''.join(f'  <url><loc>{SITE}/{u}</loc></url>\n' for u in urls) + '</urlset>\n'
    open(os.path.join(ROOT, 'sitemap.xml'), 'w').write(sm)
    print('ok', len(SERVICES), 'pages')
