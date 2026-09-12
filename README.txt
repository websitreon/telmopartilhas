TELMO PARTILHAS V15 — CMS REAL CLOUDFLARE

Objetivo:
ADMIN → Pages Functions / Worker → D1 / R2 → SITE PÚBLICO

Principais correções desta versão:
- Retirada a persistência principal em localStorage.
- Admin só mostra "guardado" quando a API confirma a gravação na D1.
- D1 normalizada em tabelas para conteúdos, galeria, provas, resultados, parceiros, notícias, reviews, media e mensagens.
- Migração automática de app_state legado para as tabelas novas.
- Upload de imagens e vídeos para R2, com metadata na D1.
- Validação de MIME + assinatura do ficheiro para uploads suportados.
- API administrativa protegida por sessão HttpOnly + secret ADMIN_PASSWORD + cabeçalho de mutação.
- Reviews públicas entram como pendentes; só as aprovadas aparecem no site.
- Uma review pode ser definida como destaque no Admin.
- Hero com vídeo de fundo, fallback e poster configuráveis no Admin.
- Cache das APIs desativado para evitar conteúdo antigo depois de alterações.
- Escape de conteúdos inseridos no site para reduzir XSS.
- Formulário de contactos e reviews não grava dados falsos no navegador quando a API falha.
- Frontend e Admin em Português de Portugal.

PUBLICAÇÃO CLOUDFLARE PAGES:
1. Publicar esta pasta como projeto Pages.
2. Functions incluídas em /functions.
3. Em Settings > Functions / Bindings configurar:
   DB    → D1 com ID 80d0977f-5cd6-4efa-9e6e-e2656b6f9e59
   MEDIA → bucket R2
4. Em Variables and Secrets criar ADMIN_PASSWORD.
5. Aplicar migrations D1 usando o identificador da tua base.
6. Abrir /admin.html.

ALTERNATIVA:
worker.js está incluído para quem preferir Cloudflare Workers Static Assets em vez de Pages.

NOTA SOBRE O database_name:
O nome humano da D1 não foi inventado. O ID fornecido é mantido no projeto; no Dashboard podes associar diretamente a base existente ao binding DB.

ALTERNATIVA WORKER:
- O ficheiro wrangler.worker.toml existe para a arquitetura Worker + Static Assets.
- A principal recomendação continua a ser Cloudflare Pages + Pages Functions.
