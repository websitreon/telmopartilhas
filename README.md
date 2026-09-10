# TELMO PARTILHAS — Cloudflare Full-Stack

Versão preparada para GitHub + Cloudflare Workers + D1 + R2.

## Estrutura
- `public/` — site público e Admin
- `src/index.mjs` — Worker/API
- `migrations/0001_initial.sql` — estrutura da D1
- `wrangler.jsonc` — bindings da Cloudflare

## Sincronização
O Admin e o site usam a mesma base D1. Alterações feitas no Admin são guardadas em `/api/admin/data` e passam a estar disponíveis no site através de `/api/site`.

As imagens enviadas pelo Admin vão para o bucket R2 `telmo-partilhas-media`.

## Credenciais
Palavra-passe inicial: `admin123`.
Para produção, recomenda-se definir `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` como secrets no Worker.

## Deploy
O Worker está configurado com:
- D1: `telmo-partilhas-db`
- D1 ID: `80d0977f-5cd6-4efa-9e6e-e2656b6f9e59`
- R2: `telmo-partilhas-media`
- Assets: `public/`

Depois de subir os ficheiros para o GitHub, o deployment da Cloudflare pode ser acionado pelo repositório ligado.


## CORREÇÃO FINAL DO ADMIN
O admin.html desta versão não usa IIFE: as funções do login são globais e `showApp` é explicitamente exposto em `window`.

Substituir no GitHub o conteúdo completo de `public/`, `src/`, `wrangler.jsonc` e `package.json` por esta versão.
