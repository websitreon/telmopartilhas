# TELMO PARTILHAS — Cloudflare full-stack

Projeto preparado para **GitHub + Cloudflare Workers + D1 + R2**.

## O que fica na Cloudflare
- Site público: Workers Static Assets
- Backend/API: Cloudflare Worker
- Base de dados: D1
- Fotografias enviadas pelo Admin: R2
- Sessões do Admin: tokens assinados no Worker

A Cloudflare suporta publicar assets estáticos juntamente com código Worker; D1 e R2 são ligados através de bindings. Consulte a documentação oficial antes de publicar. 

## Preparação
1. Criar uma base D1 chamada `telmo-partilhas-db`.
2. Criar um bucket R2 chamado `telmo-partilhas-media`.
3. Substituir `REPLACE_AFTER_CREATE` no `wrangler.jsonc` pelo ID da base D1.
4. Definir os secrets:
   - `npx wrangler secret put ADMIN_PASSWORD`
   - `npx wrangler secret put ADMIN_SESSION_SECRET`
5. Aplicar a migração:
   - `npm install`
   - `npm run db:remote`
6. Publicar:
   - `npm run deploy`

## GitHub
Subir o conteúdo deste projeto para um repositório GitHub. Depois, no Cloudflare Workers, ligar o repositório para o deploy automático ou usar o pipeline escolhido.

## Nota importante
Não colocar passwords ou secrets no GitHub. O `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` devem ficar como secrets do Worker.

## Fotografias
O Admin envia as imagens para `/api/upload`; o Worker grava-as no R2 e devolve uma URL `/media/...`. Os metadados continuam na D1.
