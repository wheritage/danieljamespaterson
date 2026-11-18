import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SITE = 'https://danieljamespaterson.vercel.app'

def bi(fr, en):
    return f'<span lang="fr">{fr}</span><span lang="en">{en}</span>'

MARK = ('<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">'
        '<rect x="0.75" y="0.75" width="38.5" height="38.5" fill="none" stroke="currentColor" stroke-width="1.5"/>'
        '<path d="M1.5 27.5 H38.5" stroke="#7EC3E6" stroke-width="2"/>'
        '<path d="M6 21 C12 18.5 17 23 23 20.5" fill="none" stroke="#7EC3E6" stroke-width="1"/>'
        '<rect x="25" y="9" width="6" height="6" fill="#B8452C"/></svg>')

ARROW = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg>'

NAV = [('index', 'Accueil', 'Home', '/'), ('services', 'Services', 'Services', '/#services'),
       ('demarche', 'Démarche', 'Approach', '/#demarche'), ('a-propos', 'À propos', 'About', '/a-propos'),
       ('contact', 'Contact', 'Contact', '/contact')]

def head(page, title_fr, title_en, desc_fr, desc_en, path, noindex=False):
    robots = '<meta name="robots" content="noindex">\n' if noindex else ''
    return f'''<!doctype html>
<html lang="fr" data-lang="fr" class="no-js" data-title-fr="{title_fr}" data-title-en="{title_en}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>(function(h){{h.className='js';try{{var l=new URLSearchParams(location.search).get('lang')||localStorage.getItem('djp-lang');if(l==='en'){{h.setAttribute('data-lang','en');h.lang='en'}}}}catch(e){{}}if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)h.className+=' reduce'}})(document.documentElement)</script>
<title>{title_fr}</title>
<meta name="description" content="{desc_fr}">
{robots}<link rel="canonical" href="{SITE}{path}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title_fr}">
<meta property="og:description" content="{desc_fr}">
<meta property="og:url" content="{SITE}{path}">
<meta property="og:locale" content="fr_CA">
<meta property="og:locale:alternate" content="en_CA">
<meta name="theme-color" content="#B9DEF1">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
<script src="/assets/vendor/lenis.min.js" defer></script>
<script src="/assets/vendor/gsap.min.js" defer></script>
<script src="/assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="/assets/site.js" defer></script>
</head>
<body data-page="{page}">
<a class="skip" href="#main">{bi("Aller au contenu", "Skip to content")}</a>
'''

def header(page):
    links = ''.join(
        f'<li><a href="{href}"{" aria-current=\"page\"" if key == page else ""}>{bi(fr, en)}</a></li>'
        for key, fr, en, href in NAV)
    mlinks = ''.join(f'<li><a href="{href}">{bi(fr, en)}</a></li>' for key, fr, en, href in NAV)
    return f'''<header class="site-header">
  <div class="wrap nav">
    <a class="brand" href="/" data-aria-fr="Daniel James Paterson, accueil" data-aria-en="Daniel James Paterson, home" aria-label="Daniel James Paterson, accueil">{MARK}<span class="brand-name">Daniel James Paterson<small>{bi("Conseiller en sécurité financière", "Financial security advisor")}</small></span></a>
    <nav aria-label="Principale"><ul class="nav-links">{links}</ul></nav>
    <div class="nav-tools">
      <div class="lang-toggle" role="group" aria-label="Langue / Language"><button type="button" data-l="fr" class="on" aria-pressed="true">FR</button><button type="button" data-l="en" aria-pressed="false">EN</button></div>
      <a class="btn btn--primary nav-cta" href="/contact" data-booking>{bi("Prendre rendez-vous", "Book a meeting")}</a>
      <button class="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="mobile-menu" data-lenis-prevent>
  <ul>{mlinks}</ul>
  <a class="btn btn--primary" href="/contact" data-booking>{bi("Prendre rendez-vous", "Book a meeting")} {ARROW}</a>
</div>
'''

FOOTER = f'''<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="brand" href="/">{MARK}<span class="brand-name">Daniel James Paterson<small>{bi("Conseiller en sécurité financière", "Financial security advisor")}</small></span></a>
        <p style="margin-top:1.4rem;max-width:26em">{bi("Des protections et des stratégies financières expliquées simplement, choisies pour votre situation.", "Protection and financial strategies explained plainly, chosen for your situation.")}</p>
      </div>
      <div>
        <h4>{bi("Navigation", "Navigation")}</h4>
        <ul>{''.join(f'<li><a href="{h}">{bi(fr, en)}</a></li>' for k, fr, en, h in NAV)}</ul>
      </div>
      <div>
        <h4>{bi("Nous joindre", "Get in touch")}</h4>
        <ul>
          <li><a href="/contact" data-booking>{bi("Prendre rendez-vous", "Book a meeting")}</a></li>
          <li><a href="/contact">{bi("Écrire à Daniel", "Write to Daniel")}</a></li>
          <li><a href="/confidentialite">{bi("Confidentialité", "Privacy")}</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-legal">
      <p>{bi("Daniel James Paterson, conseiller en sécurité financière. <em class=\"todo\">Inscription AMF et cabinet de rattachement à confirmer.</em> Les informations de ce site sont générales et ne remplacent pas un conseil personnalisé.", "Daniel James Paterson, financial security advisor. <em class=\"todo\">AMF registration and firm to be confirmed.</em> The information on this site is general and does not replace personalized advice.")}</p>
      <p>© <span data-year></span> Daniel James Paterson</p>
    </div>
  </div>
</footer>
</body>
</html>
'''

PORTRAIT = f'''<div class="portrait-placeholder"><div>{MARK.replace('class="brand-mark"', 'class="brand-mark" style="width:72px;height:72px;margin:0 auto 1rem;color:#7A8B9B"')}{bi("Portrait de Daniel à venir", "Daniel's portrait coming soon")}</div></div>'''

ICONS = {
 'listen': '<svg class="pillar-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 26 C10 20 16 30 22 24 S34 18 36 22"/><path d="M4 18 C10 12 16 22 22 16 S34 10 36 14"/></svg>',
 'clear': '<svg class="pillar-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5" y="5" width="30" height="30"/><path d="M5 25 H35"/><path d="M12 14 H28 M12 19 H22"/></svg>',
 'long': '<svg class="pillar-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 32 H36"/><path d="M8 32 V22 M16 32 V17 M24 32 V12 M32 32 V7"/></svg>',
}

def index():
    services = [
        ('vie', 'Assurance vie', 'Life insurance', "Protéger les vôtres et prévoir la succession, avec le bon type de couverture plutôt que la plus vendue.", "Protect your family and plan your estate with the right type of coverage, not the most sold one."),
        ('invalidite', 'Invalidité et maladies graves', 'Disability and critical illness', "Garder un revenu et des choix si la santé vous arrête, en complément de ce que votre employeur offre déjà.", "Keep an income and your options if your health stops you, on top of what your employer already offers."),
        ('epargne', 'Épargne et retraite', 'Savings and retirement', "REER, CELI, CELIAPP : dans quel ordre, combien, et pour quel projet.", "RRSP, TFSA, FHSA: in what order, how much, and for which goal."),
        ('entreprise', 'Entrepreneurs', 'Business owners', "Protéger l'entreprise, ses associés et ses personnes clés, et sortir les surplus intelligemment.", "Protect the business, its partners and key people, and draw out surplus wisely."),
        ('hypotheque', 'Protection hypothécaire', 'Mortgage protection', "Comparer l'assurance de la banque avec une couverture qui vous appartient.", "Compare the bank's insurance with coverage you actually own."),
    ]
    srv = ''.join(f'''
      <a class="service" href="/contact?sujet={k}" data-reveal>
        <h3>{bi(fr, en)}</h3>
        <p>{bi(dfr, den)}</p>
        <svg class="arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg>
      </a>''' for k, fr, en, dfr, den in services)
    steps = [
        ('Le premier appel', 'The first call', "Vingt minutes pour comprendre où vous en êtes et ce qui vous préoccupe. Aucune vente à cette étape.", "Twenty minutes to understand where you stand and what worries you. No selling at this stage."),
        ('Le portrait', 'The full picture', "Revenus, dettes, protections existantes, projets : tout est mis à plat, y compris ce qui fonctionne déjà.", "Income, debts, existing coverage, plans: everything is laid out, including what already works."),
        ('Les recommandations', 'The recommendations', "Un plan écrit, priorisé, avec les coûts et les raisons. Vous décidez à votre rythme.", "A written, prioritized plan with costs and reasons. You decide at your own pace."),
        ('Le suivi', 'The follow-up', "Une revue chaque année et à chaque grand changement de vie : naissance, maison, entreprise, retraite.", "A review every year and at every major life change: a birth, a home, a business, retirement."),
    ]
    st = ''.join(f'<div class="step" data-reveal><h3>{bi(a, b)}</h3><p>{bi(c, d)}</p></div>' for a, b, c, d in steps)
    pillars = [
        ('listen', "D'abord écouter", 'Listen first', "Vos objectifs passent avant les produits. On part de votre vie, pas d'un formulaire.", "Your goals come before products. We start from your life, not from a form."),
        ('clear', 'Parler clairement', 'Speak plainly', "Chaque recommandation est expliquée sans jargon, avec ce qu'elle coûte et ce qu'elle ne couvre pas.", "Every recommendation is explained without jargon, with what it costs and what it does not cover."),
        ('long', 'Voir loin', 'Think long term', "Un plan qui tient dans vingt ans, révisé quand votre situation change.", "A plan that still holds in twenty years, reviewed when your situation changes."),
    ]
    pl = ''.join(f'<div class="pillar" data-reveal>{ICONS[i]}<h3>{bi(a, b)}</h3><p>{bi(c, d)}</p></div>' for i, a, b, c, d in pillars)
    body = f'''{header("index")}
<main id="main">
  <section class="hero">
    <div class="hero-sky" aria-hidden="true" data-parallax="-0.06"><canvas></canvas></div>
    <div class="wrap">
      <div class="hero-grid">
        <div>
          <p class="eyebrow">{bi("Conseiller en sécurité financière", "Financial security advisor")}</p>
          <h1 data-split><span lang="fr">Votre avenir financier,<br><em>l'esprit clair.</em></span><span lang="en">Your financial future,<br><em>with a clear mind.</em></span></h1>
          <p class="lede" data-reveal>{bi("Assurance, épargne et planification expliquées simplement, pour que chaque décision vous ressemble et protège ce qui compte.", "Insurance, savings and planning explained plainly, so every decision fits you and protects what matters.")}</p>
          <div class="hero-actions" data-reveal>
            <a class="btn btn--primary" href="/contact" data-booking>{bi("Prendre rendez-vous", "Book a meeting")} {ARROW}</a>
            <a class="btn btn--ghost" href="#demarche">{bi("Voir la démarche", "See the approach")}</a>
          </div>
        </div>
        <div class="hero-portrait wipe">{PORTRAIT}</div>
      </div>
    </div>
    <div class="horizon" aria-hidden="true"></div>
  </section>

  <section class="section section--white" id="approche">
    <div class="wrap">
      <div class="section-head">
        <div><p class="eyebrow">{bi("Approche", "Approach")}</p><h2 data-split><span lang="fr">Conseiller,<br>pas vendre.</span><span lang="en">Advise,<br>not sell.</span></h2></div>
        <p class="lede" data-reveal>{bi("Un bon plan financier commence par une conversation honnête. Daniel prend le temps de comprendre votre situation avant de proposer quoi que ce soit.", "A good financial plan starts with an honest conversation. Daniel takes the time to understand your situation before proposing anything.")}</p>
      </div>
      <div class="pillars" data-rule>{pl}</div>
    </div>
  </section>

  <section class="section" id="services">
    <div class="wrap">
      <div class="section-head">
        <div><p class="eyebrow">Services</p><h2 data-split><span lang="fr">Ce que nous<br>protégeons ensemble.</span><span lang="en">What we protect<br>together.</span></h2></div>
        <p class="lede" data-reveal>{bi("Chaque sujet ouvre une conversation. Choisissez celui qui vous concerne, Daniel vous rappelle.", "Each topic opens a conversation. Pick the one that concerns you and Daniel will call you back.")}</p>
      </div>
      <div class="services" data-rule>{srv}
      </div>
    </div>
  </section>

  <section class="section section--ink" id="demarche">
    <div class="wrap">
      <div class="section-head">
        <div><p class="eyebrow">{bi("Démarche", "Approach")}</p><h2 data-split><span lang="fr">Quatre rendez-vous,<br>aucune surprise.</span><span lang="en">Four meetings,<br>no surprises.</span></h2></div>
        <p class="lede" data-reveal>{bi("Vous savez toujours où vous en êtes, ce qui vient ensuite et pourquoi.", "You always know where you stand, what comes next and why.")}</p>
      </div>
      <div class="steps">{st}</div>
    </div>
  </section>

  <section class="section section--white" id="a-propos">
    <div class="wrap about-grid">
      <div class="hero-portrait wipe">{PORTRAIT}</div>
      <div>
        <p class="eyebrow">{bi("À propos", "About")}</p>
        <h2 data-split>Daniel James<br>Paterson</h2>
        <blockquote data-reveal>{bi("« Mon travail, c'est que vous compreniez chaque protection que vous payez. »", "“My job is to make sure you understand every protection you pay for.”")}</blockquote>
        <p data-reveal style="color:var(--texte2)">{bi('<em class="todo">Biographie à compléter avec Daniel : parcours, clientèle, langues, région desservie.</em>', '<em class="todo">Bio to complete with Daniel: background, clients, languages, area served.</em>')}</p>
        <div class="hero-actions" data-reveal><a class="btn btn--ghost" href="/a-propos">{bi("Lire son parcours", "Read his story")} {ARROW}</a></div>
      </div>
    </div>
  </section>

  <section class="section section--sky cta-band" id="rendez-vous">
    <div class="wrap">
      <p class="eyebrow" style="justify-content:center">{bi("Premier rendez-vous", "First meeting")}</p>
      <h2 data-split><span lang="fr">Commençons par<br>une conversation.</span><span lang="en">Let's start with<br>a conversation.</span></h2>
      <p class="lede" data-reveal>{bi("Vingt minutes, au téléphone ou en vidéo, sans engagement.", "Twenty minutes, by phone or video, with no commitment.")}</p>
      <div class="hero-actions" data-reveal><a class="btn btn--primary" href="/contact" data-booking>{bi("Prendre rendez-vous", "Book a meeting")} {ARROW}</a></div>
    </div>
  </section>
</main>
{FOOTER}'''
    return head('index', 'Daniel James Paterson, conseiller en sécurité financière', 'Daniel James Paterson, financial security advisor',
                "Assurance vie, invalidité, épargne et planification expliquées simplement. Prenez rendez-vous avec Daniel James Paterson.",
                "Life and disability insurance, savings and planning explained plainly. Book a meeting with Daniel James Paterson.", '/') + body

def about():
    body = f'''{header("a-propos")}
<main id="main">
  <section class="page-hero">
    <div class="wrap">
      <p class="eyebrow">{bi("À propos", "About")}</p>
      <h1 data-split><span lang="fr">Un conseiller qui<br>prend le temps.</span><span lang="en">An advisor who<br>takes the time.</span></h1>
      <p class="lede" data-reveal>{bi("Daniel accompagne familles, professionnels et entrepreneurs dans leurs décisions de protection et d'épargne.", "Daniel helps families, professionals and business owners with their protection and savings decisions.")}</p>
    </div>
  </section>
  <section class="section section--white">
    <div class="wrap about-grid">
      <div class="hero-portrait wipe">{PORTRAIT}</div>
      <div class="prose">
        <h2 data-split style="margin-top:0">{bi("Parcours", "Background")}</h2>
        <p data-reveal>{bi('<em class="todo">À compléter avec Daniel : formation, années de pratique, ce qui l\'a amené au métier.</em>', '<em class="todo">To complete with Daniel: training, years in practice, what brought him to the profession.</em>')}</p>
        <h2 data-split>{bi("Pour qui", "Who he works with")}</h2>
        <p data-reveal>{bi('<em class="todo">À compléter : clientèle principale, langues, région desservie.</em>', '<em class="todo">To complete: main clients, languages, area served.</em>')}</p>
        <h2 data-split>{bi("Ses engagements", "His commitments")}</h2>
        <ul data-reveal>
          <li>{bi("Expliquer chaque recommandation, ce qu'elle coûte et ce qu'elle ne couvre pas.", "Explain every recommendation, what it costs and what it does not cover.")}</li>
          <li>{bi("Comparer plusieurs assureurs plutôt que pousser un produit.", "Compare several insurers rather than push one product.")}</li>
          <li>{bi("Revoir votre dossier chaque année et à chaque grand changement.", "Review your file every year and at every major change.")}</li>
        </ul>
        <div class="hero-actions" data-reveal><a class="btn btn--primary" href="/contact" data-booking>{bi("Prendre rendez-vous", "Book a meeting")} {ARROW}</a></div>
      </div>
    </div>
  </section>
</main>
{FOOTER}'''
    return head('a-propos', 'À propos de Daniel James Paterson', 'About Daniel James Paterson',
                "Le parcours et les engagements de Daniel James Paterson, conseiller en sécurité financière.",
                "Daniel James Paterson's background and commitments as a financial security advisor.", '/a-propos') + body

def contact():
    opts = [('', 'Choisir un sujet', 'Choose a topic'), ('vie', 'Assurance vie', 'Life insurance'), ('invalidite', 'Invalidité et maladies graves', 'Disability and critical illness'),
            ('epargne', 'Épargne et retraite', 'Savings and retirement'), ('entreprise', 'Entrepreneurs', 'Business owners'),
            ('hypotheque', 'Protection hypothécaire', 'Mortgage protection'), ('autre', 'Autre', 'Other')]
    o = ''.join(f'<option value="{v}" data-txt-fr="{fr}" data-txt-en="{en}">{fr}</option>' for v, fr, en in opts)
    body = f'''{header("contact")}
<main id="main">
  <section class="page-hero">
    <div class="wrap">
      <p class="eyebrow">Contact</p>
      <h1 data-split><span lang="fr">Parlons de<br>votre situation.</span><span lang="en">Let's talk about<br>your situation.</span></h1>
      <p class="lede" data-reveal>{bi("Laissez vos coordonnées et le sujet qui vous préoccupe. Daniel vous répond sous un jour ouvrable.", "Leave your details and the topic on your mind. Daniel replies within one business day.")}</p>
    </div>
  </section>
  <section class="section section--white">
    <div class="wrap contact-grid">
      <form data-contact novalidate>
        <div class="form-grid">
          <div class="field"><label for="f-nom">{bi("Nom", "Name")}</label><input id="f-nom" name="nom" autocomplete="name" required></div>
          <div class="field"><label for="f-courriel">{bi("Courriel", "Email")}</label><input id="f-courriel" name="courriel" type="email" autocomplete="email" required></div>
          <div class="field"><label for="f-tel">{bi("Téléphone", "Phone")}</label><input id="f-tel" name="telephone" type="tel" autocomplete="tel"></div>
          <div class="field"><label for="f-sujet">{bi("Sujet", "Topic")}</label><select id="f-sujet" name="sujet">{o}</select></div>
          <div class="field field--full"><label for="f-msg">Message</label><textarea id="f-msg" name="message" data-ph-fr="Quelques mots sur votre situation (facultatif)" data-ph-en="A few words about your situation (optional)" placeholder="Quelques mots sur votre situation (facultatif)"></textarea></div>
          <div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
          <label class="consent field--full"><input type="checkbox" name="consentement" required> <span>{bi("J'accepte que Daniel James Paterson me contacte au sujet de ma demande. Voir la <a href=\"/confidentialite\">politique de confidentialité</a>.", "I agree that Daniel James Paterson may contact me about my request. See the <a href=\"/confidentialite\">privacy policy</a>.")}</span></label>
        </div>
        <div class="hero-actions"><button class="btn btn--primary" type="submit">{bi("Envoyer", "Send")} {ARROW}</button></div>
        <p class="form-status" role="status" aria-live="polite"></p>
      </form>
      <aside class="contact-aside" data-reveal>
        <dl>
          <div><dt>{bi("Rendez-vous", "Meetings")}</dt><dd>{bi("Téléphone, vidéo ou en personne", "Phone, video or in person")}</dd></div>
          <div><dt>{bi("Courriel", "Email")}</dt><dd><em class="todo">{bi("à confirmer", "to be confirmed")}</em></dd></div>
          <div><dt>{bi("Téléphone", "Phone")}</dt><dd><em class="todo">{bi("à confirmer", "to be confirmed")}</em></dd></div>
        </dl>
      </aside>
    </div>
  </section>
</main>
{FOOTER}'''
    return head('contact', 'Contact | Daniel James Paterson', 'Contact | Daniel James Paterson',
                "Écrivez à Daniel James Paterson ou prenez rendez-vous pour un premier appel sans engagement.",
                "Write to Daniel James Paterson or book a first call with no commitment.", '/contact') + body

def privacy():
    body = f'''{header("")}
<main id="main">
  <section class="page-hero">
    <div class="wrap">
      <p class="eyebrow">{bi("Loi 25", "Law 25")}</p>
      <h1 data-split>{bi("Confidentialité", "Privacy")}</h1>
    </div>
  </section>
  <section class="section section--white">
    <div class="wrap prose">
      <div lang="fr">
        <h2>Renseignements recueillis</h2>
        <p>Le formulaire de contact recueille votre nom, votre courriel, votre téléphone, le sujet et votre message, uniquement pour répondre à votre demande.</p>
        <h2>Fournisseurs</h2>
        <p>Les polices de caractères sont servies par Google Fonts. Les scripts d'animation sont hébergés sur ce site, aucun autre service tiers ne reçoit votre adresse IP à la consultation. Les demandes du formulaire transitent par Web3Forms pour l'envoi du courriel.</p>
        <h2>Vos droits</h2>
        <p>Vous pouvez demander l'accès, la rectification ou la suppression de vos renseignements en écrivant à Daniel. <em class="todo">Responsable de la protection des renseignements personnels et courriel à confirmer.</em></p>
      </div>
      <div lang="en">
        <h2>Information collected</h2>
        <p>The contact form collects your name, email, phone, topic and message, only to answer your request.</p>
        <h2>Providers</h2>
        <p>Fonts are served by Google Fonts. Animation scripts are hosted on this site, so no other third party receives your IP address when you browse. Form requests go through Web3Forms to send the email.</p>
        <h2>Your rights</h2>
        <p>You may request access to, correction or deletion of your information by writing to Daniel. <em class="todo">Privacy officer and email to be confirmed.</em></p>
      </div>
    </div>
  </section>
</main>
{FOOTER}'''
    return head('confidentialite', 'Confidentialité | Daniel James Paterson', 'Privacy | Daniel James Paterson',
                "Politique de confidentialité du site de Daniel James Paterson.", "Privacy policy for Daniel James Paterson's site.", '/confidentialite') + body

def notfound():
    body = f'''{header("")}
<main id="main" class="notfound">
  <div>
    <p class="eyebrow" style="justify-content:center">404</p>
    <h1>{bi("Cette page s'est perdue<br>dans les nuages.", "This page got lost<br>in the clouds.")}</h1>
    <a class="btn btn--primary" href="/">{bi("Retour à l'accueil", "Back to home")} {ARROW}</a>
  </div>
</main>
{FOOTER}'''
    return head('404', 'Page introuvable | Daniel James Paterson', 'Page not found | Daniel James Paterson', 'Page introuvable.', 'Page not found.', '/404', noindex=True) + body

for name, fn in [('index', index), ('a-propos', about), ('contact', contact), ('confidentialite', privacy), ('404', notfound)]:
    open(os.path.join(OUT, name + '.html'), 'w').write(fn())

fav = MARK.replace('class="brand-mark" ', 'xmlns="http://www.w3.org/2000/svg" ').replace('currentColor', '#13283B').replace('<rect x="0.75"', '<rect width="40" height="40" fill="#F6F8FA"/><rect x="0.75"')
open(os.path.join(OUT, 'assets/favicon.svg'), 'w').write(fav)
print('ok')
