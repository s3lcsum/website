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

- **Root directory:** repository root (folder containing `index.html`)
- **Build command:** `npm run build`
- **Build output directory:** `.` (serve the repo after build)

If your Pages project requires a dedicated output folder:

```bash
npm run build && mkdir -p public && rsync -a --exclude node_modules --exclude .git --exclude .wrangler --exclude public ./ public/
```

Then set the build output directory to `public`.

Legacy Hugo paths redirect via `_redirects` to page anchors (`/about` → `/#about`, etc.).

## Shorturls

Social links use `https://url.dominiksiejak.pl/...` only. See [`docs/shorturl-kv.md`](docs/shorturl-kv.md) to update KV `links:v1`.
