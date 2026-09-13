# Telmo Partilhas — V21

Projeto organizado para Cloudflare Workers + Static Assets + D1 + R2.

## Estrutura
- `public/` — tudo o que o visitante e o Admin carregam no navegador.
- `cloudflare/worker.js` — entrada única do Worker.
- `cloudflare/api.js` — API Admin/site e ligação D1/R2.
- `database/migrations/` — migrations D1.
- `docs/` — documentação e auditoria.
- `wrangler.toml` — única configuração de deploy.

## Deploy
O projeto foi preparado para o comando que o teu pipeline já executa:

```bash
npx wrangler deploy
```

Não uses `wrangler pages deploy` neste pacote: esta versão usa Workers + Static Assets, com `public/` como diretório de assets.

## Bindings
- D1 binding: `DB` → `80d0977f-5cd6-4efa-9e6e-e2656b6f9e59`
- R2 binding: `MEDIA` → `telmo-partilhas-media`
- Secret: `ADMIN_PASSWORD`
