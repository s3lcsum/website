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
