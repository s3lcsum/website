# AGENTS.md

Rules for AI models working in this repo. Read fully before editing.

## Stack

- Static site built with [Hugo](https://gohugo.io/). Entry point: `config.toml`.
- Custom theme: `themes/s3lcsum` (layouts, SCSS, JS). Base theme: `themes/hugo-coder` (git submodule).
- Content lives in `content/*.md`; structured data (CV, stack, certs) lives in `data/*.json`.

## Hard rules

- **Never edit `themes/hugo-coder/`** — vendored submodule. Override via `themes/s3lcsum` layouts instead.
- **Never edit `public/` or `resources/`** — gitignored build output.
- **Do not invent facts.** CV data (`data/timeline.json`, `data/certifications.json`, etc.) must reflect real history the owner states. No fabricated dates, employers, or metrics.
- **Do not push without being asked.** Committing is fine; `git push` requires explicit instruction.

## Editing workflow

1. Read target files before editing — never edit blind.
2. Smallest diff that works. No drive-by refactors, no comment additions, no new abstractions.
3. After content/template changes, rebuild and verify:
   ```sh
   hugo --quiet
   ```
   Then spot-check the generated HTML in `public/`.
4. JSON in `data/` must stay valid — a syntax error breaks the whole site build.

## Writing style (site copy)

- Professional and natural; never paste the owner's raw phrasing verbatim into CV/site copy — rewrite it cleanly while preserving every fact and number.
- Neutral-professional tone, no hype words ("passionate", "rockstar"), no emoji.
- En dashes for ranges (`2020 — 2022`), plain numbers for stats.

## Commits

- Conventional Commits format: `feat(scope): imperative summary ≤50 chars`.
- Subject only unless a non-obvious "why" exists; then short body wrapped at 72 chars.
- One logical change per commit (e.g., CV content vs. docs go in separate commits).
