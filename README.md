# TELMO PARTILHAS — Cloudflare

Versão completa pronta para colocar no GitHub e ligar ao Cloudflare Workers.

## Estrutura
- `public/` — site público + Admin
- `src/index.mjs` — Cloudflare Worker em ES Module
- `migrations/0001_initial.sql` — esquema D1
- `wrangler.jsonc` — D1 + R2 + Assets configurados

## Recursos Cloudflare
- Worker: `telmopartilhas`
- D1: `telmo-partilhas-db`
- D1 ID: `80d0977f-5cd6-4efa-9e6e-e2656b6f9e59`
- R2: `telmo-partilhas-media`

## GitHub
Substitui o conteúdo do repositório por esta estrutura.

**Importante:** apaga o antigo `src/index.js` e usa `src/index.mjs`.

## Admin
A página do Admin está autocontida em `public/admin.html`.
Palavra-passe inicial: `admin123` (até definires `ADMIN_PASSWORD` no Worker).

## D1
Depois do primeiro deploy bem-sucedido, aplica a migration remota:
`npx wrangler d1 migrations apply telmo-partilhas-db --remote`

O erro 100329 fica resolvido porque o Worker passa a ser ES Module.
