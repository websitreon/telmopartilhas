TELMO PARTILHAS — CLOUDFLARE READY
===================================

D1 DATABASE ID
80d0977f-5cd6-4efa-9e6e-e2656b6f9e59

IMPORTANTE: este projeto é Cloudflare PAGES + Functions.
NÃO usar `npx wrangler deploy`.

1) Build settings no Cloudflare Pages
-------------------------------------
Root directory: /
Build command: (vazio)
Build output directory: /

Como o projeto já contém a pasta /functions, o Cloudflare Pages publica as Pages Functions automaticamente.

2) D1
------
No deploy, usar:

npx wrangler pages deploy . --d1 DB=80d0977f-5cd6-4efa-9e6e-e2656b6f9e59

O binding usado pelo site é `DB`.

Também podes configurar o binding no dashboard:
Workers & Pages > o projeto > Settings > Bindings > D1 database bindings
Variable name: DB
Selecionar a D1 correspondente ao ID acima
Depois fazer novo deploy.

3) R2 (fotografias)
-------------------
O Admin usa o binding `MEDIA` para uploads.
No dashboard:
Settings > Functions > Bindings > R2 bucket bindings
Variable name: MEDIA
Seleciona o teu bucket R2.

Não foi colocado um nome fictício de bucket no wrangler.toml porque isso faz o deploy falhar.

4) ADMIN PASSWORD
-----------------
Em Settings > Environment variables / Secrets adiciona:
ADMIN_PASSWORD = a_password_do_admin

5) DADOS SINCRONIZADOS
----------------------
O site lê e grava o conteúdo em D1 através de /api/state.
Qualquer alteração feita no Admin é gravada na D1 e pode ser vista noutro computador/telemóvel.
As mensagens de contacto também usam D1.

6) IMPORTANTE SOBRE IMAGENS
---------------------------
As imagens enviadas pelo Admin dependem do binding R2 `MEDIA`.
Sem esse binding, o restante conteúdo continua sincronizado em D1, mas os uploads de imagens não funcionam.

7) DEPLOY AUTOMÁTICO POR GIT
----------------------------
Se o projeto estiver ligado a Git no Cloudflare Pages, não coloques `npx wrangler deploy` como deploy command.
O método recomendado é deixar o Pages tratar do deploy do projeto.
Se a tua configuração exigir um comando explícito, usar:

npx wrangler pages deploy . --d1 DB=80d0977f-5cd6-4efa-9e6e-e2656b6f9e59

Documentação oficial:
https://developers.cloudflare.com/pages/functions/wrangler-configuration/
https://developers.cloudflare.com/pages/functions/bindings/
