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
- Hero ambient layer: canvas wind lines driven by the GSAP ticker time, paused off-screen, ~1/3 speed of the primary layer.
- House rules: zero bounce, exits `power2.in` ~35 % shorter, no infinite loops without state, no glow, no gradient text,
  no glassmorphism, no invented figures or "since 20XX" badges, no numbered eyebrows, no scroll cues, no em dashes in copy.
- `prefers-reduced-motion`: resolved frames, opacity only, no Lenis.

## Skills
`.claude/skills/` is a copy of the W Héritage set (Three.js, GSAP, design-dna, motion-design, genjutsu
cast/paint/bunshin). Sources and commits in `.claude/skills/SOURCES.md`. Workflow: direct (`motion-design`),
style (`design-dna`), build (GSAP timeline, Three.js only for ambient), audit (genjutsu `_jutsu/tells/references/web.md`).

## Wiring (`CONFIG` at the top of `assets/site.js`)
- `web3formsKey`: contact form sends an email via Web3Forms. Empty = form shows "bientôt actif" (or mailto if `email` set).
- `bookingUrl`: every `[data-booking]` link opens Daniel's calendar.
- `email`: public email.

## Pages
`index`, `a-propos`, `contact` (form, `?sujet=vie|invalidite|epargne|entreprise|hypotheque` preselects the topic),
`confidentialite`, `404`. `tools/scaffold-pages.py` generated the first version; edit the HTML directly from now on
(re-running it overwrites hand edits).
