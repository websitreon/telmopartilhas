TELMO PARTILHAS — CLOUDFLARE WORKER + D1

Este pacote foi preparado para o comando de build/deploy que tens no Cloudflare:

npx wrangler deploy

IMPORTANTE
O erro anterior acontecia porque o projeto tinha configuração de Pages (pages_build_output_dir) mas estava a ser publicado com `wrangler deploy`, que espera um Worker com `main`/entry-point.

Esta versão já tem:
- worker.js como entry-point
- assets.directory = "."
- binding ASSETS para servir o site
- API /api/state ligada ao D1
- API /api/messages ligada ao D1
- API /api/auth para o admin
- API /api/upload e /api/media para R2 (opcional)

CLOUDFLARE
1. No projeto, mantém o Root directory em /.
2. Build command: npx wrangler deploy
3. D1: cria/associa um binding chamado DB para a base:
   ID = 80d0977f-5cd6-4efa-9e6e-e2656b6f9e59
   O nome da base é o nome que aparece no teu dashboard D1; este nome não pode ser inferido apenas pelo UUID.
4. Secrets / Variables:
   ADMIN_PASSWORD = a password que vais usar no /admin.html
5. Para carregamento de fotos pelo Admin, associa um bucket R2 com binding MEDIA.

NOTA
O site público lê o estado de /api/state. Quando guardares uma alteração no Admin, ela é gravada em D1 e fica disponível para todos os visitantes/dispositivos.

SEGURANÇA
ADMIN_PASSWORD deve ser configurada como secret no Cloudflare e não deve ser colocada no código-fonte.
