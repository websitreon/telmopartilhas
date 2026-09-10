# TELMO PARTILHAS — sincronização total Cloudflare

Arquitetura:
- GitHub: código
- Cloudflare Workers: frontend + API
- Cloudflare D1: fonte de verdade de todos os dados
- Cloudflare R2: fotografias e uploads

## Recursos
Worker: `telmopartilhas`
D1: `telmo-partilhas-db`
D1 ID: `80d0977f-5cd6-4efa-9e6e-e2656b6f9e59`
R2: `telmo-partilhas-media`

## Fluxo de sincronização
Admin -> API -> D1/R2 -> Site
O site público não usa localStorage como fonte de dados.

## Cloudflare Workers Builds
Build command: deixar vazio
Deploy command: `npx wrangler deploy`

A Cloudflare pode ligar o repositório GitHub ao Worker e fazer deploy automático a cada push.

## Admin
Abrir `/admin.html`
Palavra-passe inicial: `admin123`
Para produção, criar o segredo `ADMIN_PASSWORD` no Worker.

## Migração
A aplicação cria/verifica as tabelas necessárias no primeiro pedido. A migração `migrations/0001_initial.sql` mantém o esquema versionado.

## Teste
1. Entrar no Admin.
2. Adicionar/editar uma fotografia, prova, notícia ou parceiro.
3. Guardar.
4. Abrir o site público noutra janela/dispositivo.
5. O conteúdo deverá vir diretamente da D1.
