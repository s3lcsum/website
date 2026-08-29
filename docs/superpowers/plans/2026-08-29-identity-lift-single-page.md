# Identity Lift Single-Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Hugo + Bulma multi-page portfolio with one artistic, performant single HTML page (SCSS + GSAP) deployable on Cloudflare Pages, with shortcurl-only socials and documented KV update commands.

**Architecture:** Static site at repo root: `index.html` + compiled `styles/main.css` + `scripts/motion.js` + self-hosted fonts/images. Dart Sass builds SCSS. Old Hugo content migrates inline into HTML. Cloudflare Pages `_redirects` maps old paths to anchors. Shorturl KV updates documented (and attempted if wrangler auth works).

**Tech Stack:** Plain HTML5, SCSS (dart-sass), vanilla GSAP 3 + ScrollTrigger (self-hosted), Space Grotesk + IBM Plex Mono (SIL OFL woff2), Cloudflare Pages + existing shorturl Worker/KV.

## Global Constraints

- Accent light: `#560591`; dark sibling: `#c084fc`
- Type: Space Grotesk = name only; IBM Plex Mono = body/UI; self-host woff2 SIL OFL
- Social `href`s ONLY `https://url.dominiksiejak.pl/...` — never hardcode long social destinations
- Project cards with empty `url` → no fake links
- Anti-slop: asymmetric hero, grain + ONE purple wash, hairlines not cards, mono UI, no Bulma/FA
- GSAP: hero timeline + ScrollTrigger.batch; `prefers-reduced-motion` off-ramp
- FOUC theme fix inline in `<head>`
- Do not commit `.wrangler/` or secrets
- Do not force-push; do not update git config
- Work on feature branch `feat/identity-lift-single-page` (not commit directly to main)

## File Structure

```
website/
  index.html                          # single page (all content inlined)
  _redirects                          # CF Pages old-path → anchors
  package.json                        # sass build scripts + gsap dep for copy
  .gitignore                          # update: keep public out; ignore node_modules; allow dist if used
  styles/
    main.scss                         # tokens, grain, layout, sections
  scripts/
    motion.js                         # GSAP hero + batch + reduced-motion
  vendor/
    gsap/                             # gsap.min.js + ScrollTrigger.min.js (copied from node_modules)
  assets/
    fonts/
      space-grotesk-latin.woff2
      ibm-plex-mono-latin.woff2
      OFL-SpaceGrotesk.txt
      OFL-IBMPlexMono.txt
    images/
      avatar.webp
      avatar.jpg
  docs/
    shorturl-kv.md                    # copy-paste KV update procedure
    superpowers/plans/...             # this plan
    superpowers/specs/...             # approved spec
```

Hugo dirs (`content/`, `themes/`, `layouts/`, `config.toml`, `data/`) remain in repo as archive until a later cleanup commit; live deployable site is root `index.html` + assets. Pages build command: `npm run build` (or no-op if CSS precommitted); output = repo root (or `public/` copy — prefer root for simplicity).

---

### Task 1: Branch, scaffold, tooling

**Files:**
- Create: `package.json`
- Modify: `.gitignore`
- Create: `styles/main.scss` (stub)
- Create: `scripts/motion.js` (stub)
- Create: `index.html` (minimal shell)

**Interfaces:**
- Consumes: none
- Produces: `npm run build` → compiles `styles/main.scss` → `styles/main.css`; `npm run vendor:gsap` copies GSAP into `vendor/gsap/`

- [ ] **Step 1: Create feature branch**

```bash
cd /Users/dsiejak/Developer/s3lcsum/website
git checkout -b feat/identity-lift-single-page
```

Expected: on `feat/identity-lift-single-page`

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "dominiksiejak-website",
  "private": true,
  "version": "2.0.0",
  "description": "Single-page identity site for dominiksiejak.pl",
  "scripts": {
    "build:css": "sass styles/main.scss styles/main.css --style=compressed --no-source-map",
    "watch:css": "sass --watch styles/main.scss:styles/main.css --style=expanded",
    "vendor:gsap": "mkdir -p vendor/gsap && cp node_modules/gsap/dist/gsap.min.js node_modules/gsap/dist/ScrollTrigger.min.js vendor/gsap/",
    "build": "npm run build:css && npm run vendor:gsap",
    "preview": "npx --yes serve -l 4173 ."
  },
  "devDependencies": {
    "sass": "^1.77.0"
  },
  "dependencies": {
    "gsap": "^3.12.5"
  }
}
```

- [ ] **Step 3: Update `.gitignore`**

```
*.lock
resources
public
node_modules/
.wrangler/
styles/main.css.map
```

Keep ignoring Hugo `public/`. Do **not** ignore `styles/main.css` (commit built CSS so Pages can deploy without Node if desired). Do not ignore `vendor/gsap/`.

- [ ] **Step 4: Create stub files**

`styles/main.scss`:

```scss
:root {
  --accent: #560591;
  --accent-dark: #c084fc;
}
```

`scripts/motion.js`:

```js
/* GSAP motion — implemented in Task 6 */
```

`index.html` minimal:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dominik Siejak</title>
    <link rel="stylesheet" href="/styles/main.css" />
  </head>
  <body>
    <p>Scaffold</p>
    <script src="/scripts/motion.js" defer></script>
  </body>
</html>
```

- [ ] **Step 5: Install and verify build**

```bash
npm install
npm run build
```

Expected: `styles/main.css` exists; `vendor/gsap/gsap.min.js` and `ScrollTrigger.min.js` exist.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore styles/main.scss styles/main.css scripts/motion.js index.html vendor/gsap/
git commit -m "$(cat <<'EOF'
chore: scaffold single-page site tooling

Add sass/gsap package scripts and stub HTML/SCSS/JS for identity lift.
EOF
)"
```

---

### Task 2: Fonts + avatar assets

**Files:**
- Create: `assets/fonts/space-grotesk-latin.woff2`
- Create: `assets/fonts/ibm-plex-mono-latin.woff2`
- Create: `assets/fonts/OFL-SpaceGrotesk.txt`
- Create: `assets/fonts/OFL-IBMPlexMono.txt`
- Create: `assets/images/avatar.webp`
- Create: `assets/images/avatar.jpg` (copy from `static/images/avatar.jpg`)

**Interfaces:**
- Consumes: `static/images/avatar.jpg` (266×266 JPEG)
- Produces: self-hosted fonts + WebP/JPEG avatar at known paths for `@font-face` and `<picture>`

- [ ] **Step 1: Copy avatar and convert WebP**

```bash
mkdir -p assets/images assets/fonts
cp static/images/avatar.jpg assets/images/avatar.jpg
# Prefer cwebp if available; else sips/magick; else skip webp and use jpeg only
if command -v cwebp >/dev/null; then
  cwebp -q 82 assets/images/avatar.jpg -o assets/images/avatar.webp
elif command -v magick >/dev/null; then
  magick assets/images/avatar.jpg -quality 82 assets/images/avatar.webp
else
  # Python pillow fallback if installed
  python3 - <<'PY'
try:
  from PIL import Image
  Image.open("assets/images/avatar.jpg").save("assets/images/avatar.webp", "WEBP", quality=82)
  print("webp ok")
except Exception as e:
  print("webp skipped:", e)
PY
fi
ls -la assets/images/
```

- [ ] **Step 2: Download SIL OFL font woff2 (latin subsets)**

Use fontsource CDN releases (OFL) — download exact files:

```bash
# Space Grotesk 700 latin
curl -fsSL -o assets/fonts/space-grotesk-latin.woff2 \
  "https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@5.2.8/latin-700-normal.woff2"
# IBM Plex Mono 400 + 500 (download 400 as primary; 500 optional — use 400 only for v1 simplicity)
curl -fsSL -o assets/fonts/ibm-plex-mono-latin.woff2 \
  "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-mono@5.2.6/latin-400-normal.woff2"
# Licenses
curl -fsSL -o assets/fonts/OFL-SpaceGrotesk.txt \
  "https://raw.githubusercontent.com/googlefonts/spacegrotesk/main/OFL.txt"
curl -fsSL -o assets/fonts/OFL-IBMPlexMono.txt \
  "https://raw.githubusercontent.com/IBM/plex/master/LICENSE.txt"
file assets/fonts/*.woff2
```

If jsDelivr URLs 404, fall back to `https://github.com/fontsource/font-files` raw paths or `npx @fontsource/space-grotesk` + copy from `node_modules`.

- [ ] **Step 3: Commit**

```bash
git add assets/
git commit -m "$(cat <<'EOF'
assets: add self-hosted fonts and avatar WebP

Space Grotesk + IBM Plex Mono woff2 (SIL OFL) and avatar for LCP.
EOF
)"
```

---

### Task 3: SCSS identity system

**Files:**
- Modify: `styles/main.scss` (full rewrite)
- Regenerate: `styles/main.css` via `npm run build:css`

**Interfaces:**
- Consumes: font paths under `/assets/fonts/`
- Produces: CSS variables + section classes matching HTML in Task 4: `.site-header`, `.hero`, `.about`, `.work`, `.stack`, `.site-footer`, `[data-theme]`

- [ ] **Step 1: Replace `styles/main.scss` with full identity CSS**

Write the complete file (no placeholders). Key requirements encoded:

```scss
/* Identity lift — anti-slop tokens + sections */

@font-face {
  font-family: "Space Grotesk";
  src: url("/assets/fonts/space-grotesk-latin.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "IBM Plex Mono";
  src: url("/assets/fonts/ibm-plex-mono-latin.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

:root,
[data-theme="light"] {
  --bg: #f7f5f2;
  --fg: #16141a;
  --muted: #5c5666;
  --accent: #560591;
  --rule: color-mix(in srgb, var(--fg) 14%, transparent);
  --wash: color-mix(in srgb, #560591 18%, transparent);
  --grain-opacity: 0.45;
  color-scheme: light;
}

[data-theme="dark"] {
  --bg: #0e0c10;
  --fg: #ece8f1;
  --muted: #a39aaf;
  --accent: #c084fc;
  --rule: color-mix(in srgb, var(--fg) 16%, transparent);
  --wash: color-mix(in srgb, #560591 28%, transparent);
  --grain-opacity: 0.35;
  color-scheme: dark;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: clamp(0.9rem, 0.85rem + 0.3vw, 1rem);
  line-height: 1.55;
  color: var(--fg);
  background: var(--bg);
  position: relative;
}

/* ONE diagonal wash + film grain (pseudo, not multi-blob) */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(
    118deg,
    var(--wash) 0%,
    transparent 42%,
    transparent 100%
  );
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: var(--grain-opacity);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
  mix-blend-mode: multiply;
}

[data-theme="dark"] body::after {
  mix-blend-mode: soft-light;
}

.wrap,
.site-header,
main,
.site-footer {
  position: relative;
  z-index: 1;
}

.wrap {
  width: min(1120px, calc(100% - 2.5rem));
  margin-inline: auto;
}

a {
  color: var(--accent);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
}

a:hover {
  color: var(--fg);
}

.site-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 0 0.75rem;
  border-bottom: 1px solid var(--rule);
}

.brand-mark {
  font-family: "Space Grotesk", sans-serif;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.03em;
  color: var(--fg);
  text-decoration: none;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 1.1rem;
  font-size: 0.78rem;
  text-transform: lowercase;
}

.nav a {
  color: var(--muted);
  text-decoration: none;
}

.nav a:hover {
  color: var(--accent);
  text-decoration: underline;
}

.theme-toggle {
  appearance: none;
  border: 1px solid var(--rule);
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 0.72rem;
  padding: 0.25rem 0.45rem;
  cursor: pointer;
}

.theme-toggle:hover {
  color: var(--accent);
  border-color: var(--accent);
}

/* Asymmetric hero — left/top heavy, not centered SaaS */
.hero {
  display: grid;
  grid-template-columns: 1.4fr 0.6fr;
  gap: 1.5rem 2rem;
  align-items: start;
  padding: clamp(2.5rem, 8vh, 5.5rem) 0 clamp(3rem, 10vh, 6rem);
  min-height: min(88vh, 760px);
}

.hero__copy {
  max-width: 38rem;
}

.hero__name {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
  font-weight: 700;
  font-size: clamp(2.8rem, 1.2rem + 8vw, 6.5rem);
  line-height: 0.92;
  letter-spacing: -0.055em;
  color: var(--fg);
}

.hero__name .word {
  display: inline-block;
}

.hero__tag {
  margin: 1.25rem 0 0;
  color: var(--muted);
  font-size: 0.85rem;
  max-width: 26rem;
}

.hero__ctas {
  margin-top: 1.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  font-size: 0.8rem;
}

.hero__ctas a {
  text-decoration: none;
  border-bottom: 1px solid var(--accent);
  color: var(--accent);
  padding-bottom: 0.1rem;
}

.hero__ctas a:hover {
  color: var(--fg);
  border-color: var(--fg);
}

.socials {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 1rem;
  font-size: 0.72rem;
  text-transform: lowercase;
}

.socials a {
  color: var(--muted);
  text-decoration: none;
  border-bottom: 1px solid transparent;
}

.socials a:hover {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.hero__media {
  justify-self: end;
  align-self: center;
  margin-top: 12vh;
  margin-right: 4%;
}

.hero__media picture,
.hero__media img {
  display: block;
  width: 112px;
  height: 112px;
  object-fit: cover;
  border: 1px solid var(--rule);
  /* no radius card look — slight clip only */
  border-radius: 0;
}

.section {
  padding: clamp(2.5rem, 6vh, 4.5rem) 0;
  border-top: 1px solid var(--rule);
}

.section__title {
  margin: 0 0 1.25rem;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.section__lead {
  margin: 0 0 1.5rem;
  max-width: 40rem;
  color: var(--fg);
}

.prose p {
  margin: 0 0 1rem;
  max-width: 40rem;
}

.timeline {
  list-style: none;
  margin: 2rem 0 0;
  padding: 0;
  border-left: 1px solid var(--rule);
}

.timeline__item {
  position: relative;
  padding: 0 0 1.5rem 1.25rem;
}

.timeline__item::before {
  content: "";
  position: absolute;
  left: -3px;
  top: 0.45rem;
  width: 5px;
  height: 5px;
  background: var(--accent);
}

.timeline__meta {
  font-size: 0.72rem;
  color: var(--muted);
  margin-bottom: 0.2rem;
}

.timeline__role {
  margin: 0;
  font-size: 0.95rem;
}

.timeline__desc {
  margin: 0.35rem 0 0;
  color: var(--muted);
  font-size: 0.82rem;
  max-width: 36rem;
}

.work-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.work-item {
  padding: 1.1rem 0;
  border-top: 1px solid var(--rule);
}

.work-item:last-child {
  border-bottom: 1px solid var(--rule);
}

.work-item__cat {
  font-size: 0.68rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.work-item__name {
  margin: 0.2rem 0 0.4rem;
  font-size: 1rem;
}

.work-item__desc {
  margin: 0;
  color: var(--muted);
  font-size: 0.84rem;
  max-width: 42rem;
}

.work-item__tags {
  margin: 0.55rem 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  font-size: 0.68rem;
  color: var(--muted);
}

.stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem 2rem;
}

.stack-cluster h3 {
  margin: 0 0 0.5rem;
  font-size: 0.72rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
}

.stack-cluster ul {
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--muted);
  font-size: 0.84rem;
}

.stack-cluster li + li {
  margin-top: 0.2rem;
}

.site-footer {
  padding: 2rem 0 3rem;
  border-top: 1px solid var(--rule);
  font-size: 0.72rem;
  color: var(--muted);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
}

.site-footer .socials {
  margin-top: 0;
}

@media (max-width: 720px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-top: 2rem;
  }

  .hero__media {
    justify-self: start;
    margin-top: 0;
    margin-right: 0;
    order: -1;
  }

  .hero__media picture,
  .hero__media img {
    width: 88px;
    height: 88px;
  }
}
```

- [ ] **Step 2: Build CSS**

```bash
npm run build:css
```

Expected: `styles/main.css` compressed, non-empty.

- [ ] **Step 3: Commit**

```bash
git add styles/main.scss styles/main.css
git commit -m "$(cat <<'EOF'
style: add identity tokens, grain wash, asymmetric layout

Anti-slop SCSS: Space Grotesk name, mono UI, hairlines, theme vars.
EOF
)"
```

---

### Task 4: Full `index.html` content + FOUC theme

**Files:**
- Modify: `index.html` (complete page)

**Interfaces:**
- Consumes: CSS classes from Task 3; shortcurl paths from spec; timeline/projects/who-am-i copy
- Produces: semantic sections `#top` `#about` `#work` `#stack` `#contact`; FOUC script setting `data-theme` before paint; hero words split as `.word` spans for GSAP

- [ ] **Step 1: Write complete `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dominik Siejak</title>
    <meta
      name="description"
      content="DevOpsSec engineer specializing in cloud infrastructure, container orchestration, and automation."
    />
    <meta name="theme-color" content="#560591" />
    <link rel="icon" href="/assets/images/avatar.jpg" type="image/jpeg" />
    <link
      rel="preload"
      href="/assets/fonts/space-grotesk-latin.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />
    <link
      rel="preload"
      href="/assets/fonts/ibm-plex-mono-latin.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />
    <script>
      (function () {
        try {
          var k = "theme";
          var s = localStorage.getItem(k);
          var t =
            s === "light" || s === "dark"
              ? s
              : window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
          document.documentElement.setAttribute("data-theme", t);
        } catch (e) {
          document.documentElement.setAttribute("data-theme", "light");
        }
      })();
    </script>
    <link rel="stylesheet" href="/styles/main.css" />
  </head>
  <body>
    <header class="site-header wrap">
      <a class="brand-mark" href="#top">Dominik Siejak</a>
      <nav class="nav" aria-label="Primary">
        <a href="#about">about</a>
        <a href="#work">work</a>
        <a href="#stack">stack</a>
        <a href="#contact">contact</a>
        <button
          type="button"
          class="theme-toggle"
          id="theme-toggle"
          aria-label="Toggle color theme"
        >
          theme
        </button>
      </nav>
    </header>

    <main id="top">
      <section class="hero wrap" aria-label="Intro">
        <div class="hero__copy">
          <h1 class="hero__name">
            <span class="word">Dominik</span>
            <span class="word">Siejak</span>
          </h1>
          <p class="hero__tag">DevOps • Cloud • Automation</p>
          <div class="hero__ctas">
            <a href="#about">About</a>
            <a href="#work">Selected work</a>
          </div>
          <div class="socials" aria-label="Profiles">
            <a href="https://url.dominiksiejak.pl/github" rel="me">github</a>
            <a href="https://url.dominiksiejak.pl/gitlab" rel="me">gitlab</a>
            <a href="https://url.dominiksiejak.pl/linkedin" rel="me">linkedin</a>
            <a href="https://url.dominiksiejak.pl/telegram" rel="me">telegram</a>
            <a href="https://url.dominiksiejak.pl/whatsapp" rel="me">whatsapp</a>
            <a href="https://url.dominiksiejak.pl/email" rel="me">email</a>
            <a href="https://url.dominiksiejak.pl/chess" rel="me">chess</a>
          </div>
        </div>
        <div class="hero__media">
          <picture>
            <source srcset="/assets/images/avatar.webp" type="image/webp" />
            <img
              src="/assets/images/avatar.jpg"
              width="266"
              height="266"
              alt="Portrait of Dominik Siejak"
              fetchpriority="high"
              decoding="async"
            />
          </picture>
        </div>
      </section>

      <section class="section about wrap" id="about">
        <h2 class="section__title">About</h2>
        <div class="prose">
          <p>
            I'm Dominik — online handle <code>s3lcsum</code>. I do DevOps,
            infrastructure, and anything that involves making machines talk to
            each other.
          </p>
          <p>
            Day to day, I build and operate infrastructure. Cloud platforms,
            container orchestration, GitOps pipelines, networking, IoT. The kind
            of work where if everything's running smoothly, nobody notices you
            exist — and that's the point.
          </p>
          <p>
            I started tinkering with computers young. One thing led to another —
            self-hosting, home labs, automating everything that moves. I've been
            running my own infrastructure for years: home automation,
            self-hosted services, tunnels, DNS, the whole stack.
          </p>
          <p>
            Based in Spain, originally from Poland. Polish, English, and
            Spanish. Outside of terminals: chess on
            <a href="https://url.dominiksiejak.pl/chess">Chess.com</a>, and a
            fairly extensive home-automation setup.
          </p>
        </div>
        <ol class="timeline">
          <li class="timeline__item">
            <div class="timeline__meta">Nov 2025 — Present · InPost</div>
            <h3 class="timeline__role">DevOps Engineer</h3>
            <p class="timeline__desc">
              Full-time, remote. DevOps engineering for one of Poland's largest
              logistics and e-commerce platforms.
            </p>
          </li>
          <li class="timeline__item">
            <div class="timeline__meta">Mar 2022 — Nov 2025 · UserTesting</div>
            <h3 class="timeline__role">Senior SysDevOps Engineer</h3>
            <p class="timeline__desc">
              Barcelona, Spain. Systems and DevOps for a user research platform.
              AWS, ArgoCD, Kubernetes, and infrastructure automation.
            </p>
          </li>
          <li class="timeline__item">
            <div class="timeline__meta">Jul 2017 — Dec 2023 · Blockchain House</div>
            <h3 class="timeline__role">DevOps Engineer</h3>
            <p class="timeline__desc">
              Contract. AWS, MySQL, and blockchain infrastructure. Smart
              contract deployment and dApp infrastructure.
            </p>
          </li>
          <li class="timeline__item">
            <div class="timeline__meta">2015 — 2018 · Self-employed</div>
            <h3 class="timeline__role">Freelance Web Developer</h3>
            <p class="timeline__desc">
              Custom plugins, application backends, smart home infrastructure
              (Zigbee, Proxmox, Portainer, Authentik, Home Assistant). Home data
              centers via VPN and MikroTik RouterOS.
            </p>
          </li>
        </ol>
      </section>

      <section class="section work wrap" id="work">
        <h2 class="section__title">Work</h2>
        <p class="section__lead">
          Selected infrastructure and automation work. Links appear when a
          shortcurl exists — none of these have public URLs yet.
        </p>
        <ul class="work-list">
          <li class="work-item">
            <div class="work-item__cat">Infrastructure</div>
            <h3 class="work-item__name">Homelab Infrastructure</h3>
            <p class="work-item__desc">
              Proxmox-based homelab running Kubernetes, Docker, and a full stack
              of self-hosted services. Automated with Terraform and Ansible.
            </p>
            <ul class="work-item__tags">
              <li>Proxmox</li>
              <li>Kubernetes</li>
              <li>Terraform</li>
              <li>Ansible</li>
            </ul>
          </li>
          <li class="work-item">
            <div class="work-item__cat">CI/CD</div>
            <h3 class="work-item__name">GitOps Pipeline</h3>
            <p class="work-item__desc">
              ArgoCD-based GitOps workflow for deploying applications to
              Kubernetes. Helm charts, Kyverno policies, automated rollouts.
            </p>
            <ul class="work-item__tags">
              <li>ArgoCD</li>
              <li>Helm</li>
              <li>Kyverno</li>
              <li>GitLab CI</li>
            </ul>
          </li>
          <li class="work-item">
            <div class="work-item__cat">IoT</div>
            <h3 class="work-item__name">Home Automation</h3>
            <p class="work-item__desc">
              Home Assistant with Zigbee2MQTT, MQTT, and Tasmota. Lighting,
              climate, and security automation.
            </p>
            <ul class="work-item__tags">
              <li>Home Assistant</li>
              <li>Zigbee2MQTT</li>
              <li>MQTT</li>
              <li>Tasmota</li>
            </ul>
          </li>
          <li class="work-item">
            <div class="work-item__cat">Security</div>
            <h3 class="work-item__name">Identity &amp; Access Management</h3>
            <p class="work-item__desc">
              Authentik identity provider with OIDC and LDAP. Centralized auth
              for homelab services.
            </p>
            <ul class="work-item__tags">
              <li>Authentik</li>
              <li>OIDC</li>
              <li>LDAP</li>
              <li>Vault</li>
            </ul>
          </li>
          <li class="work-item">
            <div class="work-item__cat">Monitoring</div>
            <h3 class="work-item__name">Observability Stack</h3>
            <p class="work-item__desc">
              Grafana, Prometheus, and VictoriaMetrics for metrics; ELK for log
              aggregation.
            </p>
            <ul class="work-item__tags">
              <li>Grafana</li>
              <li>Prometheus</li>
              <li>VictoriaMetrics</li>
              <li>ELK</li>
            </ul>
          </li>
          <li class="work-item">
            <div class="work-item__cat">Networking</div>
            <h3 class="work-item__name">Network Infrastructure</h3>
            <p class="work-item__desc">
              MikroTik network with Tailscale and WireGuard tunnels. AdGuard for
              DNS filtering and split DNS.
            </p>
            <ul class="work-item__tags">
              <li>MikroTik</li>
              <li>Tailscale</li>
              <li>WireGuard</li>
              <li>AdGuard</li>
            </ul>
          </li>
        </ul>
      </section>

      <section class="section stack wrap" id="stack">
        <h2 class="section__title">Stack</h2>
        <div class="stack-grid">
          <div class="stack-cluster">
            <h3>Cloud</h3>
            <ul>
              <li>GCP</li>
              <li>AWS</li>
            </ul>
          </div>
          <div class="stack-cluster">
            <h3>Orchestration</h3>
            <ul>
              <li>Kubernetes</li>
              <li>ArgoCD</li>
              <li>Helm</li>
              <li>Terraform</li>
            </ul>
          </div>
          <div class="stack-cluster">
            <h3>Infra</h3>
            <ul>
              <li>Linux</li>
              <li>Docker</li>
              <li>Cloudflare</li>
              <li>Proxmox</li>
            </ul>
          </div>
          <div class="stack-cluster">
            <h3>Languages</h3>
            <ul>
              <li>Python</li>
              <li>Go</li>
              <li>Bash</li>
            </ul>
          </div>
          <div class="stack-cluster">
            <h3>Blockchain</h3>
            <ul>
              <li>Ethereum</li>
              <li>Solidity</li>
            </ul>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer wrap" id="contact">
      <div>
        <p>© 2017–2026 Dominik Siejak · <code>s3lcsum</code></p>
        <p>
          <a href="https://url.dominiksiejak.pl/email">office via shortcurl</a>
        </p>
      </div>
      <div class="socials" aria-label="Contact links">
        <a href="https://url.dominiksiejak.pl/github">github</a>
        <a href="https://url.dominiksiejak.pl/gitlab">gitlab</a>
        <a href="https://url.dominiksiejak.pl/linkedin">linkedin</a>
        <a href="https://url.dominiksiejak.pl/telegram">telegram</a>
        <a href="https://url.dominiksiejak.pl/whatsapp">whatsapp</a>
        <a href="https://url.dominiksiejak.pl/email">email</a>
        <a href="https://url.dominiksiejak.pl/chess">chess</a>
        <a href="https://url.dominiksiejak.pl/github/dotfiles">dotfiles</a>
      </div>
    </footer>

    <script>
      (function () {
        var btn = document.getElementById("theme-toggle");
        if (!btn) return;
        btn.addEventListener("click", function () {
          var cur =
            document.documentElement.getAttribute("data-theme") === "dark"
              ? "dark"
              : "light";
          var next = cur === "dark" ? "light" : "dark";
          document.documentElement.setAttribute("data-theme", next);
          try {
            localStorage.setItem("theme", next);
          } catch (e) {}
        });
      })();
    </script>
    <script src="/vendor/gsap/gsap.min.js" defer></script>
    <script src="/vendor/gsap/ScrollTrigger.min.js" defer></script>
    <script src="/scripts/motion.js" defer></script>
  </body>
</html>
```

- [ ] **Step 2: Smoke-check markup**

```bash
grep -c 'url.dominiksiejak.pl' index.html
grep -E 'github\.com|linkedin\.com|wa\.me|t\.me' index.html || echo "no long social URLs — good"
```

Expected: many shortcurl hits; no long social hostnames (chess.com destination must not appear — only shortcurl).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat: migrate portfolio content into single-page HTML

About, timeline, work, stack, shortcurl socials, FOUC theme script.
EOF
)"
```

---

### Task 5: Redirects + build docs

**Files:**
- Create: `_redirects`
- Create: `README.md` (or update if exists — currently none at root for new stack; create focused deploy README)

**Interfaces:**
- Consumes: section ids `#about` `#work` `#stack` `#contact`
- Produces: CF Pages redirects; documented `npm run build` / `npm run preview`

- [ ] **Step 1: Write `_redirects`**

```
/about /#about 301
/about/ /#about 301
/stack /#stack 301
/stack/ /#stack 301
/projects /#work 301
/projects/ /#work 301
/cv /#about 301
/cv/ /#about 301
/uses /#about 301
/uses/ /#about 301
/posts/who-am-i /#about 301
/posts/who-am-i/ /#about 301
```

- [ ] **Step 2: Write `README.md`**

```markdown
# dominiksiejak.pl

Artistic single-page site (HTML + SCSS + GSAP) for Cloudflare Pages.

## Develop

```bash
npm install
npm run watch:css   # optional
npm run preview     # http://localhost:4173
```

## Build

```bash
npm run build
```

Compiles `styles/main.scss` → `styles/main.css` and copies GSAP into `vendor/gsap/`.

## Deploy (Cloudflare Pages)

- Root directory: repository root (or the folder containing `index.html`)
- Build command: `npm run build`
- Output directory: `/` (root) — Pages serves the repo after build; if the project requires an output folder, set build to copy into `public/`:

```bash
npm run build && mkdir -p public && rsync -a --exclude node_modules --exclude .git --exclude .wrangler ./ public/
```

Prefer configuring Pages **Build output directory** to `.` with build `npm run build` when supported; otherwise use the `public/` sync approach and set output to `public`.

## Shorturls

Social links use `https://url.dominiksiejak.pl/...`. See `docs/shorturl-kv.md` to update KV `links:v1`.
```

- [ ] **Step 3: Commit**

```bash
git add _redirects README.md
git commit -m "$(cat <<'EOF'
docs: add Pages redirects and build/preview instructions

Map legacy Hugo paths to single-page anchors.
EOF
)"
```

---

### Task 6: GSAP motion

**Files:**
- Modify: `scripts/motion.js`
- Skills: gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-performance

**Interfaces:**
- Consumes: `.hero__media`, `.hero__name .word`, `.hero__tag`, `.hero .socials`, `.timeline__item`, `.work-item`, `.stack-cluster`; global `gsap`, `ScrollTrigger`
- Produces: hero timeline + ScrollTrigger.batch; reduced-motion skip; `document.fonts.ready` refresh

- [ ] **Step 1: Implement `scripts/motion.js`**

```js
(function () {
  function boot() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", function () {
      gsap.set(
        [
          ".hero__media",
          ".hero__name .word",
          ".hero__tag",
          ".hero .socials a",
          ".timeline__item",
          ".work-item",
          ".stack-cluster",
        ],
        { clearProps: "all" }
      );
      return function () {};
    });

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      var ctx = gsap.context(function () {
        gsap.set([".hero__media", ".hero__name .word", ".hero__tag", ".hero .socials a"], {
          autoAlpha: 0,
          y: 16,
        });

        var hero = gsap.timeline({ defaults: { ease: "power2.out" } });
        hero
          .to(".hero__media", { autoAlpha: 1, y: 0, duration: 0.55 })
          .to(
            ".hero__name .word",
            { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.08, ease: "power3.out" },
            "-=0.25"
          )
          .to(".hero__tag", { autoAlpha: 1, y: 0, duration: 0.45 }, "-=0.3")
          .to(
            ".hero .socials a",
            { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.04 },
            "-=0.2"
          );

        gsap.set([".timeline__item", ".work-item", ".stack-cluster"], {
          autoAlpha: 0,
          y: 18,
        });

        ScrollTrigger.batch(".timeline__item", {
          start: "top 85%",
          once: true,
          onEnter: function (batch) {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: "power2.out",
              overwrite: true,
            });
          },
        });

        ScrollTrigger.batch(".work-item", {
          start: "top 85%",
          once: true,
          onEnter: function (batch) {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.06,
              ease: "power2.out",
              overwrite: true,
            });
          },
        });

        ScrollTrigger.batch(".stack-cluster", {
          start: "top 85%",
          once: true,
          onEnter: function (batch) {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.05,
              ease: "power2.out",
              overwrite: true,
            });
          },
        });
      });

      return function () {
        ctx.revert();
      };
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        ScrollTrigger.refresh();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
```

- [ ] **Step 2: Preview smoke**

```bash
npm run preview
# manually or curl:
curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/
curl -s http://localhost:4173/scripts/motion.js | head -5
```

Expected: HTTP 200; motion.js starts with IIFE.

- [ ] **Step 3: Commit**

```bash
git add scripts/motion.js
git commit -m "$(cat <<'EOF'
feat: add GSAP hero timeline and ScrollTrigger batch

Respect prefers-reduced-motion; animate opacity/transform only.
EOF
)"
```

---

### Task 7: Shorturl KV docs (+ try update if auth works)

**Files:**
- Create: `docs/shorturl-kv.md`
- Optional local: `links.json` (do **not** commit secrets; may commit sanitized export if fetched)

**Interfaces:**
- Consumes: namespace id `9b577555a3b0459eb5cbacd381ded154`, account `e092ee6780d8a561afd1530702c0fd6a`
- Produces: documented get/put procedure; no breaking changes to existing keys unless intentionally updating

- [ ] **Step 1: Write `docs/shorturl-kv.md`**

```markdown
# Shorturl KV (`links:v1`)

Worker host: `https://url.dominiksiejak.pl`  
KV namespace: `shorturl-links`  
Namespace id: `9b577555a3b0459eb5cbacd381ded154`  
Account id: `e092ee6780d8a561afd1530702c0fd6a`  
Key: `links:v1` (single JSON object map)

## List current map (API)

```bash
curl -sS -H 'Accept: application/json' https://url.dominiksiejak.pl/ | jq .
```

## Read via Wrangler

```bash
npx wrangler kv key get \
  --namespace-id=9b577555a3b0459eb5cbacd381ded154 \
  --remote \
  links:v1 > links.json
```

## Edit locally

`links.json` shape (example — keep all existing paths):

```json
{
  "/github": "https://github.com/s3lcsum",
  "/gitlab": "https://gitlab.com/s3lcsum",
  "/linkedin": "https://linkedin.com/in/dominiksiejak",
  "/telegram": "https://t.me/s3lcsum",
  "/whatsapp": "https://wa.me/34621020018",
  "/email": "mailto:office@dominiksiejak.pl",
  "/chess": "https://www.chess.com/s3lcsum",
  "/github/dotfiles": "https://github.com/s3lcsum/dotfiles"
}
```

Add new project paths only when ready, e.g. `"/homelab": "https://github.com/..."`.

## Write via Wrangler

```bash
npx wrangler kv key put \
  --namespace-id=9b577555a3b0459eb5cbacd381ded154 \
  --remote \
  links:v1 \
  --path=./links.json
```

**Do not** overwrite with a partial map — always get → merge → put.

## Verify

```bash
curl -sS -H 'Accept: application/json' https://url.dominiksiejak.pl/ | jq .
curl -sSI https://url.dominiksiejak.pl/github | head -n 5
```
```

- [ ] **Step 2: Try fetch current KV / API map**

```bash
curl -sS -H 'Accept: application/json' https://url.dominiksiejak.pl/ || true
npx wrangler kv key get --namespace-id=9b577555a3b0459eb5cbacd381ded154 --remote links:v1 2>&1 | head -50 || true
```

If auth works and map matches spec, no put needed for v1. If missing keys from the spec table, merge carefully and put. Never delete existing unrelated keys.

- [ ] **Step 3: Commit docs only**

```bash
git add docs/shorturl-kv.md
git commit -m "$(cat <<'EOF'
docs: document shorturl KV get/put for links:v1

Copy-paste wrangler commands for namespace shorturl-links.
EOF
)"
```

Do not commit `links.json` unless it is a sanitized mirror without secrets.

---

### Task 8: Final verification + Pages build helper

**Files:**
- Modify: `package.json` (optional `build:pages` script that syncs to `public/`)
- Modify: `.gitignore` if `public/` should stay ignored (Hugo legacy) — keep ignored; Pages uses root

**Interfaces:**
- Consumes: all prior deliverables
- Produces: verified static site previewable with `npm run preview`

- [ ] **Step 1: Full build**

```bash
npm run build
test -f styles/main.css
test -f vendor/gsap/gsap.min.js
test -f index.html
test -f _redirects
test -f assets/fonts/space-grotesk-latin.woff2
test -f assets/images/avatar.jpg
```

- [ ] **Step 2: Grep anti-regressions**

```bash
! grep -RIn 'bulma\|fontawesome\|fonts.googleapis\|cdn.jsdelivr.net/npm/bulma' index.html styles scripts 2>/dev/null
grep -n 'url.dominiksiejak.pl' index.html | wc -l
```

- [ ] **Step 3: Preview and check assets**

```bash
npm run preview &
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/styles/main.css
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/assets/fonts/space-grotesk-latin.woff2
kill %1 2>/dev/null || true
```

Expected: all 200.

- [ ] **Step 4: Commit any remaining fixes**

If package.json or small fixes needed:

```bash
git add -u
git status
git commit -m "$(cat <<'EOF'
chore: finalize identity-lift build verification

Ensure build scripts and static assets resolve for Pages preview.
EOF
)"
```

Only commit if there are real changes.

---

## Spec coverage self-check

| Spec requirement | Task |
|---|---|
| Drop Hugo multi-page → single artistic HTML | 4 |
| Plain HTML + SCSS + GSAP → CF Pages | 1, 3, 5, 6 |
| Accent `#560591` / dark `#c084fc` | 3 |
| Space Grotesk + IBM Plex Mono self-host | 2, 3 |
| Anti-slop art direction | 3, 4 |
| Shortcurl-only socials | 4, 7 |
| GSAP hero + batch + reduced-motion | 6 |
| FOUC theme in head | 4 |
| `_redirects` old paths | 5 |
| KV docs + try update | 7 |
| Avatar WebP | 2 |
| Build instructions | 5, 8 |
| Migrate who-am-i / timeline / projects / stack | 4 |

## Placeholder scan

No TBD / "implement later" steps. Font download has explicit fallback. Project links intentionally omitted until KV paths exist.

## Type / interface consistency

CSS class names in Task 3 match HTML in Task 4 and selectors in Task 6. Shortcurl paths match spec table. Namespace id matches throughout Task 7.
