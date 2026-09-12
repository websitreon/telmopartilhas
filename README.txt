TELMO PARTILHAS V17

Projeto estático + Cloudflare Pages Functions.

Publicação por Git integration:
- Build command: exit 0 (ou vazio)
- Output directory: .
- Não usar `npx wrangler deploy` como build/deploy command do Pages.

Publicação manual:
- npx wrangler pages deploy . --project-name=telmo-partilhas

Bindings:
- DB -> D1 80d0977f-5cd6-4efa-9e6e-e2656b6f9e59
- MEDIA -> R2
- ADMIN_PASSWORD -> Secret
