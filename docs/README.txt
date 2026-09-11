TELMO PARTILHAS — CLOUDFLARE SYNC
=================================

Esta versão sincroniza o conteúdo do site com Cloudflare Pages Functions + D1.
As mensagens do formulário também ficam no D1. O upload de imagens usa R2.
O site continua a abrir diretamente pelos ficheiros HTML quando estiver offline,
usando LocalStorage como fallback.

O QUE FICA SINCRONIZADO
- Textos e definições
- Calendário / provas
- Resultados
- Galeria e fotografia de destaque
- Parceiros
- Notícias
- Mensagens de contacto
- Imagens carregadas no admin, quando o R2 está configurado

CONFIGURAÇÃO CLOUDFLARE
1. Cria um projeto Pages para esta pasta. Como existem Pages Functions, não uses
   o Direct Upload simples do dashboard; publica através de Git ou Wrangler.
2. Cria uma D1 database com o nome: telmo-partilhas-db
3. Cria um R2 bucket para fotografias.
4. Edita ./wrangler.toml e substitui:
   - <CRIAR_NO_CLOUDFLARE> no database_id pelo ID real da D1.
   - <CRIAR_NO_CLOUDFLARE> no bucket_name pelo nome real do bucket R2.
5. Cria a variável secreta ADMIN_PASSWORD no projeto Cloudflare.
6. Aplica a migration:
   npx wrangler d1 migrations apply telmo-partilhas-db --remote
7. Faz deploy do projeto.

COMANDOS (terminal)
- npx wrangler login
- npx wrangler d1 create telmo-partilhas-db
- npx wrangler r2 bucket create telmo-partilhas-media
- npx wrangler d1 migrations apply telmo-partilhas-db --remote
- npx wrangler pages deploy .

IMPORTANTE
Os IDs de D1 e o nome do bucket são específicos da tua conta, por isso não podem
ser preenchidos automaticamente neste ficheiro. Depois de os colocares no
./wrangler.toml e criares ADMIN_PASSWORD no Cloudflare, a sincronização passa a ser
feita automaticamente pelo site.
