GUIA DE PUBLICAÇÃO — TELMO PARTILHAS V15

CLOUDFARE PAGES
1. Publica esta pasta como projeto Pages.
2. O backend está em /functions.
3. Cria o binding D1 com variável DB para a base existente:
   80d0977f-5cd6-4efa-9e6e-e2656b6f9e59
4. Cria o binding R2 com variável MEDIA.
5. Cria o secret ADMIN_PASSWORD.
6. Aplica migrations/0002_cms.sql à D1 existente.
7. Abre /admin.html.

CLOUDFARE WORKERS (alternativa)
worker.js inclui a mesma API e serve os assets pelo binding ASSETS.

IMPORTANTE
- Não usar localStorage como fonte de verdade.
- O Admin só mostra sucesso depois da resposta da API.
- O R2 é necessário para novos uploads de imagem/vídeo.
- O ID da D1 é o fornecido no pedido; o database_name não foi inventado.
