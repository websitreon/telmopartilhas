# Telmo Partilhas V36 — CMS/D1 publish fix

Esta versão corrige a ligação entre o Admin, D1 e a página pública.

## O que mudou
- A homepage tenta ler a D1 antes de renderizar os valores locais, evitando que o design inicial esconda ou substitua temporariamente o conteúdo publicado.
- A homepage volta a consultar `/api/state` a cada 5 segundos e ao regressar ao separador/página.
- O `siteTitle` e os textos estáticos relevantes passam a ser sincronizados pelo mesmo estado CMS.
- Filtros e estados do calendário/galeria usam os valores editáveis do Admin.
- O Admin confirma uma publicação com uma nova leitura da D1 depois do `PUT`.
- Foram adicionadas ao editor CMS as etiquetas de menu e estados que fazem parte do novo redesign.

## Deploy
Publicar o projeto como Cloudflare Worker com o binding D1/R2 já existente. Não publicar apenas a pasta `public/` como site estático, porque nesse caso `/api/state` não existe e o CMS não consegue sincronizar com a página pública.
