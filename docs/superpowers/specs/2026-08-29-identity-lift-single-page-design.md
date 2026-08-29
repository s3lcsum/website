# Identity lift — artistic single-page site

**Date:** 2026-08-29  
**Status:** Draft for user review  
**Site:** https://dominiksiejak.pl  
**Owner:** Dominik Siejak (`s3lcsum`)

## Goal

Replace the Hugo + Bulma multi-page portfolio with one artistic, performant single page. Brand-first, anti–AI-slop visual craft, purple accent `#560591`, GSAP motion used sparingly, all outbound profile links via shortcurls on `url.dominiksiejak.pl`.

## Decisions locked

| Topic | Choice |
|---|---|
| Approach | Identity lift (not polish-in-place, not React rewrite) |
| IA | Single page (drop multi-page Hugo) |
| Stack | Plain HTML + SCSS + GSAP → Cloudflare Pages |
| Hero atmosphere | CSS film grain + one diagonal wash from `#560591` (no multi-blob mesh) |
| Type | Space Grotesk (name only) + IBM Plex Mono (body/UI) — SIL OFL, self-host woff2 |
| Accent | `#560591` (light); readable lighter sibling on dark (e.g. ~`#c084fc`) |
| CSS framework | None — remove Bulma CDN entirely |
| Icons | Tiny inline SVG only — remove Font Awesome CDN |
| Links | Only `https://url.dominiksiejak.pl/…` shortcurls for socials |
| CV / Uses pages | Fold light CV signal into About/Work; skip Uses desk until photo exists |
| Motion | Vanilla GSAP + ScrollTrigger; reduced-motion off-ramp; no ScrollSmoother |

## Anti-slop art direction

Voice: dry infra craft. Purple is an **ink stamp**, not a glow wash.

- Asymmetric hero: name huge, left/top heavy; avatar small, off-center; tagline mono and quiet. Not a centered SaaS stack.
- Atmosphere: fine film grain + **one** low-opacity diagonal wash from `#560591`. No multi-orb mesh, no neon glow, no floating pills/badges on media.
- Type: Space Grotesk only for the name (tight tracking; optional slight overflow/crop). Body and UI in IBM Plex Mono.
- Chrome: hairline rules, not card decks. 1px borders. Hover = color / underline — not lift + multi-shadow.
- Motion: slow, few beats. Name stagger + section batch fades. No bounce, elastic, or scroll theater.
- Kill: icon walls, badge chips, gradient buttons, purple→indigo skies, emoji-as-design, centered-everything default.

Brand test: remove nav — page must still read as Dominik Siejak / s3lcsum, not a generic template.

## Architecture

```
website/
  index.html          # single page
  styles/
    main.scss         # tokens, layout, sections
  scripts/
    motion.js         # GSAP timelines + ScrollTrigger
  assets/
    fonts/            # Space Grotesk + IBM Plex Mono subsets (woff2)
    images/           # avatar (WebP + fallback), optional later desk photo
  docs/superpowers/   # specs / plans
```

- Build: SCSS → minified CSS (simple script or Lightning CSS / sass CLI). No React, no Hugo.
- Deploy: Cloudflare Pages on existing `dominiksiejak.pl` (CNAME → Pages). Static only.
- Theme: `data-theme` light/dark; FOUC prevention via tiny inline `<head>` script reading `localStorage` / `prefers-color-scheme` before paint.
- Content today lives in Hugo markdown/JSON — migrate copy into `index.html` (or a small `content.json` fetched/inlined at build). Prefer inlined HTML for zero JS content fetch on first paint.

### Retire

- Hugo theme `themes/s3lcsum` layouts as the live site
- Bulma + Font Awesome CDNs
- Multi-page routes (`/about/`, `/stack/`, `/projects/`, `/cv/`, `/uses/`) as primary UX
- Empty `hugo-coder` submodule noise if still present

Redirects (Pages `_redirects` or Worker): old paths → `/#about`, `/#work`, `/#stack`, `/#contact` as needed so bookmarks do not 404.

## Page structure (one scroll)

1. **Nav** — minimal: name / section anchors / theme toggle. Not a dashboard.
2. **Hero** — brand name hero-level; mono tagline (`DevOps • Cloud • Automation` or tighter); CTA anchors to About + Work; social row via shortcurls; avatar with `width`/`height`, `fetchpriority="high"`, WebP preferred.
3. **About** — narrative from current who-am-i voice + styled timeline rail (roles from existing timeline data). No Quick Facts / Interests / Find Me card stack.
4. **Work** — selected projects as text blocks or hairline list. Only show link affordance when a real URL / shortcurl exists. Current project `url` fields are empty — present as work descriptions without fake footers until shortcurls exist.
5. **Stack** — 4–6 clusters in mono (Cloud, Orchestration, Infra, Languages, etc.). No per-item FA icons.
6. **Contact / footer** — shortcurl socials + copyright.

Light CV: one timeline already covers career; optional “based in Spain / PL origin / languages” line in About. Full printable CV deferred.

## Shortcurls (source of truth)

Worker: `shorturl`  
Host: `https://url.dominiksiejak.pl`  
KV namespace: `shorturl-links` (`9b577555a3b0459eb5cbacd381ded154`)  
Storage: single JSON blob key `links:v1`

**Current map (2026-08-29):**

| Path | Destination |
|---|---|
| `/github` | `https://github.com/s3lcsum` |
| `/gitlab` | `https://gitlab.com/s3lcsum` |
| `/linkedin` | `https://linkedin.com/in/dominiksiejak` |
| `/telegram` | `https://t.me/s3lcsum` |
| `/whatsapp` | `https://wa.me/34621020018` |
| `/email` | `mailto:office@dominiksiejak.pl` |
| `/chess` | `https://www.chess.com/s3lcsum` |
| `/github/dotfiles` | `https://github.com/s3lcsum/dotfiles` |

Site `href`s must use `https://url.dominiksiejak.pl/<path>` only for these destinations. Never hardcode the long destination URLs in the page for socials.

Listing API: `GET https://url.dominiksiejak.pl/` with `Accept: application/json` returns the map.

### Follow-up: update CF Worker / KV with proper commands

Implementation plan must include a documented, copy-pasteable procedure to update `links:v1` (add project shortcurls, fix paths, etc.) via Wrangler or Cloudflare API — e.g.:

```bash
# After wrangler auth + account_id
npx wrangler kv key get --namespace-id=9b577555a3b0459eb5cbacd381ded154 --remote links:v1
# Edit JSON locally, then:
npx wrangler kv key put --namespace-id=9b577555a3b0459eb5cbacd381ded154 --remote links:v1 --path=./links.json
```

Exact commands verified at implementation time (token scopes, account id `e092ee6780d8a561afd1530702c0fd6a`). New short paths (e.g. `/homelab`) only after KV update — then wire site links.

## Motion (GSAP)

- File: `scripts/motion.js`; load deferred after first paint (or module defer).
- Register `ScrollTrigger`; wrap in `gsap.context` + `gsap.matchMedia`.
- Hero timeline: avatar → name words → tagline → socials (`autoAlpha` / `y`, `power2.out` / `power3.out`, short durations).
- Scroll: `ScrollTrigger.batch` for about timeline items, work blocks, stack clusters (`once: true`, start ~`top 85%`).
- `prefers-reduced-motion: reduce` → skip or zero-duration.
- Animate transforms/opacity only. Refresh after `document.fonts.ready`.
- Skip SplitText Club plugins unless license available; CSS/`split` by words via simple markup is enough for name.

## Performance

- No Bulma (~678KB) / no FA kit.
- Self-host fonts (subset) + CSS; fingerprint or cache-busted filenames.
- Avatar: dimensions, `fetchpriority="high"`, WebP (+ jpeg fallback).
- Theme script in `<head>` before CSS paint when possible.
- GSAP: self-host or one CDN with `preconnect` only if used; prefer self-host for CSP simplicity.
- CSP: tighten to `'self'` + any remaining needed origins; drop unused Google Fonts / jsDelivr / GA allowances when unused.

## Out of scope (v1)

- React / framework rewrite
- ScrollSmoother, heavy pin horizontal galleries
- Full printable CV page
- Uses desk photography section
- Project case-study pages
- CMS

## Success criteria

- First viewport: brand-dominant, artistic, not template-centered.
- Lighthouse-style wins: no multi-hundred-KB CSS frameworks; LCP avatar sane; no theme FOUC.
- All social links hit `url.dominiksiejak.pl`.
- Motion respects reduced-motion; feels intentional, not busy.
- Old multi-page URLs redirect or land on sensible anchors.

## Open for implementation plan only

- Exact SCSS tooling (dart-sass CLI vs Lightning CSS) — pick simplest.
- Whether content is fully static HTML or generated from a small JSON at build.
- Precise dark-mode accent hex sibling of `#560591`.
- Which old paths get `_redirects` entries.
