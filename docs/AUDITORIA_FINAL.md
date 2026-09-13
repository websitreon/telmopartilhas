# Auditoria final V20

## Correção principal do deploy
O erro observado no pipeline foi causado pela publicação de `.` como diretório de assets. A CI instala `node_modules` no diretório raiz e o Wrangler tentou publicar o binário `node_modules/wrangler/bin/wrangler` com 148 MiB, acima do limite de 25 MiB por asset.

Na V20, o Worker continua a ser o entry point (`worker.js`) e os assets estáticos ficam exclusivamente em `public/`. Assim, `node_modules` nunca entra na lista de assets.

## Configuração
- Worker: `worker.js`
- Static Assets: `./public`
- D1 binding: `DB`
- D1 database: `80d0977f-5cd6-4efa-9e6e-e2656b6f9e59`
- R2 binding: `MEDIA`
- R2 bucket: `telmo-partilhas-media`
- CI command: `npx wrangler deploy`

## O que foi validado localmente
- `public/index.html` presente
- `public/admin.html` presente
- CSS/JS/assets presentes em `public/`
- worker.js fora de `public/`
- migrations fora de `public/`
- functions/backend fora de `public/`
- package.json fora de `public/`
- caminhos principais internos mantêm `/css`, `/js`, `/assets`

## Nota de produção
O deploy real na conta Cloudflare não foi executado neste ambiente. É necessário ter o secret `ADMIN_PASSWORD` configurado e bindings D1/R2 disponíveis na conta.
