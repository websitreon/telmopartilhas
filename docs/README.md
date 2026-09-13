# Telmo Partilhas — documentação

O projeto usa Cloudflare Workers + Static Assets + D1 + R2.

## Estrutura

- `public/` — website público e painel Admin.
- `public/data/content.js` — conteúdo inicial limpo e textos de fallback.
- `public/data/default-state.json` — estado inicial do CMS sem conteúdo fictício.
- `public/css/` e `public/js/` — camada visual e comportamento do website/Admin.
- `cloudflare/` — Worker e API.
- `database/migrations/` — estrutura D1.
- `wrangler.toml` — configuração de deploy.

## Conteúdo

O site não inventa provas, pilotos, parceiros, notícias, reviews ou estatísticas. O conteúdo editorial deve ser adicionado através do Admin ou sincronizado pela D1.

## Media

Fotografias e vídeos novos são enviados para R2. A D1 guarda os metadados e referências necessários para publicação.

## Publicação

Antes do deploy final, configura o domínio público e atualiza o `sitemap.xml` com URLs absolutas do domínio real.
