# TELMO PARTILHAS — sincronização Cloudflare corrigida

Esta versão corrige a sincronização entre Admin, Cloudflare D1/R2 e o site público.

## Fluxo
- Admin -> `/api/admin/data` -> Cloudflare D1
- Fotografias -> `/api/upload` -> Cloudflare R2
- Site -> `/api/site` -> Cloudflare D1
- Imagens R2 -> `/media/...`

## Importante
O Admin **não entra em modo local** quando a Cloudflare falha. Se houver erro, mostra-o para que as alterações não fiquem silenciosamente presas no navegador.

## Configuração
- Worker: `telmopartilhas`
- D1: `telmo-partilhas-db`
- D1 ID: `80d0977f-5cd6-4efa-9e6e-e2656b6f9e59`
- R2: `telmo-partilhas-media`

## GitHub
Substituir o projeto inteiro por esta versão e fazer commit. A Cloudflare faz novo deploy pelo GitHub.
