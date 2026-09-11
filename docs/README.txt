GUIA RÁPIDO CLOUDFLARE

O pacote foi preparado para Cloudflare Pages Functions.

Deploy:
  npx wrangler pages deploy .

Bindings necessários no projeto Pages:
  DB    -> D1 Database
  MEDIA -> R2 Bucket

Secret:
  ADMIN_PASSWORD

Não coloques placeholders como <CRIAR_NO_CLOUDFLARE> no wrangler.toml.
