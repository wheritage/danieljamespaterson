# Daniel James Paterson — danieljamespaterson.vercel.app (temporary domain)

Site of Daniel James Paterson, financial security advisor, part of the W Héritage family of sites
(same stack and same skills as `wheritage/wheritage`). Static site (plain HTML/CSS/JS) on Vercel with
`cleanUrls`. No build step, no package.json.

## Design system (`assets/site.css`)
- Palette: **sky blue** `--ciel #7EC3E6` (surfaces) / `--ciel-fonce #1F6E9C` (text, links, AA on white),
  **cloud white** `--nuage #F6F8FA` + `--blanc`, **amber red touch** `--ambre #B8452C`, ink `--encre #13283B`.
- Amber is a *touch*: primary CTAs, eyebrow rules, one detail per screen. Never large surfaces.
- Newsreader (titles) + Manrope (body). **No rounded corners** (family rule). Light paper grain on `body::after`.
- Signature curve `--ease-out: cubic-bezier(.16,1,.3,1)` / GSAP `"expo.out"`.
- Bilingual through `[lang="fr"]` / `[lang="en"]` spans toggled by `html[data-lang]` (stored in `djp-lang`,
  `?lang=en` forces it). Vouvoiement on the site.
- `.todo` (amber highlight) marks content still to confirm with Daniel. Remove each one as it is filled.

## Smooth scroll and motion
Same rules as W Héritage: self-hosted `assets/vendor/lenis.min.js` 1.3.27, `gsap.min.js` and
`ScrollTrigger.min.js` 3.15.0 loaded before `site.js` (no third-party CDN, Loi 25).
- `DJP.lockScroll(true/false)` to lock the page, never `documentElement.style.overflow` alone.
- Anything that scrolls on its own needs `data-lenis-prevent` (mobile menu).
- Scroll-linked effects through ScrollTrigger only (`[data-parallax]`, header state).
- `data-split` titles: lines (split on `<br>`, per `lang` span) rise out of a mask, 1.15 s expo.out, 80 ms stagger.
  `data-reveal` blocks: 24 px rise + fade, batched. `.wipe` images: left-to-right `clip-path` wipe.
  `data-rule` containers: top rule drawn by clip-path.
- Inner pages: hero on a static sky gradient; the WebGL sky lives on the home page only (see below).
- House rules: zero bounce, exits `power2.in` ~35 % shorter, no infinite loops without state, no glow, no gradient text,
  no glassmorphism, no invented figures or "since 20XX" badges, no numbered eyebrows, no scroll cues, no em dashes in copy.
- `prefers-reduced-motion`: resolved frames, opacity only, no Lenis.

## Home page: « Une journée dans le ciel » (`index.html` + `assets/home.css` + `assets/home.js` + `assets/sky.js`)
Validated thesis: the home page is one continuous sky that turns from morning blue to amber dusk as you scroll; the
amber touch is the sunset at the call to action. Allowed patterns: paper grain, hairline rules, the WebGL sky in
continuous motion (its state is scroll + time of day), custom cursor (the only round shape, it is a pointer).
- `#sky` canvas: hand-written WebGL shader (sky gradient + fBm clouds), no dependency, rendered at half resolution,
  clock = GSAP ticker. State in `DJP.sky = { climb, density, dusk }`, tweened only by scrubbed ScrollTriggers in home.js.
  No WebGL: CSS gradient on `body.has-sky`. Reduced motion: one still frame, redrawn only when state changes.
- Sequence: intro veil (first visit of the session) → hero lines rise → hero recedes while the view climbs through
  clouds → manifesto words fill from grey to ink (scrub) → services: pinned horizontal track ≥ 900 px (native
  scroll-snap below) → process: pinned, one step per slice of scroll, rail fills → about: portrait opens from an inset
  clip + parallax → dusk: sky turns amber.
- Site-wide (site.js): `#veil` intro + page-transition curtain (`DJP.ready(fn)` fires when the page is uncovered;
  `html.veiled` covers before JS and self-removes after 4 s if JS fails), cursor ring with labels from
  `data-cursor-fr/en`, `data-magnetic` buttons, giant name in the footer.
- Pinned sections set `refreshPriority`; home.js ends with `ScrollTrigger.sort()` + `refresh()` because site.js
  creates its reveal triggers first.

## Skills
`.claude/skills/` is a copy of the W Héritage set (Three.js, GSAP, design-dna, motion-design, genjutsu
cast/paint/bunshin). Sources and commits in `.claude/skills/SOURCES.md`. Workflow: direct (`motion-design`),
style (`design-dna`), build (GSAP timeline, Three.js only for ambient), audit (genjutsu `_jutsu/tells/references/web.md`).

## Contact and booking
- Phone 514 795-0381, email danieljames.paterson@agc.ia.ca (footer, `/contact`, privacy page).
- No form on the site: every « Réserver » link opens Daniel's Microsoft Bookings page (`CONFIG.bookingUrl` in
  `assets/site.js`; `[data-booking]` links are rewritten to it, new tab). `/contact` is the booking page.
  `initForm()` and `web3formsKey` stay dormant in case a form comes back.
- Car and home quotes go to iA Auto and Home online quotes (`QUOTE_AUTO`, `QUOTE_HOME` in `tools/services_content.py`).

## Service pages (generated)
`tools/services_content.py` holds all copy (FR/EN) for the 7 services: assurance-vie, assurance-invalidite-maladies-graves,
epargne-retraite (with the savings calculator, `assets/calc.js`), entrepreneurs, protection-hypothecaire, assurance-auto,
assurance-habitation. `python3 tools/build-services.py` regenerates those pages, the shared footer on every page and
`sitemap.xml`. Edit the content file, never the generated service HTML. Sections: hero, key points, how it works,
(calculator), options, profiles (tabs, `assets/service.js`), FAQ (accordion), CTA, next service.
Copy rules: no invented figures (only legal/public-program amounts: CELIAPP 8 000 $/40 000 $, SCEE 20 %/500 $,
IQEE 10 %/250 $, RC auto minimum 50 000 $); never claim Daniel compares several insurers (iA career agency).

## Home: pacing rules
- Services track: pinned with a dwell at start and end, about 1.6 px of scroll per px of travel.
- Process: one wheel gesture = one step, through `DJP.scrollGate` (Lenis `virtualScroll`), modelled on
  `processus.html` in wheritage. At the first step going up or the last going down, the page scrolls on.
  Keyboard, scrollbar and touch stay free.
- Line masks get `.16em .14em .2em` padding with matching negative margins so ascenders, descenders and italics never clip.

## Pages
`index`, `a-propos`, `contact` (booking page, no form), `confidentialite`, `404`, plus the 7 generated service pages.
`tools/scaffold-pages.py` generated the first version of the non-service pages; edit their HTML directly from now on
(re-running it overwrites hand edits).

## Photo, bio, illustrations
- Portrait: `assets/photos/daniel-paterson-{600,900}.{jpg,webp}` (home about + `/a-propos`); `assets/og.jpg` share image.
- Bio comes from Daniel's brief (financial educator from Montreal's West Island, passion for investing, everyone should
  invest; creating, protecting and preserving wealth for families, businesses and individuals). `/a-propos` develops
  it: story, quote, « Créer, protéger, préserver » pillars, commitments. Nothing beyond the brief (no years, degrees,
  languages) until Daniel confirms it.
- Service illustrations: `tools/illustrations.py`, flat editorial compositions on a shared sky frame (gradient, wind
  lines, hatched ground), ink / deep blue / sky / white, one amber detail each. Used by the home cards (`.h-card-art`)
  and the service heroes. Ids are suffixed per use so gradients never collide.
