TELMO PARTILHAS V18

Objetivo desta versão: eliminar o erro `Missing entry-point to Worker script or to assets directory` quando o ambiente atual executa `npx wrangler deploy`.

Modo atual: Cloudflare Worker + Static Assets + D1; API em /api/*.

D1:
  Binding = DB
  Database ID = 80d0977f-5cd6-4efa-9e6e-e2656b6f9e59

Secret:
  ADMIN_PASSWORD

R2:
  Binding esperado pelo código = MEDIA
  Bucket configurado:
  Binding = MEDIA
  Bucket = telmo-partilhas-media

Importante:
  `functions/` continua no projeto como fonte da API, mas é excluído dos assets públicos e é importado pelo Worker.
