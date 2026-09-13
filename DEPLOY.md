# Telmo Partilhas — publicação

## Cloudflare

1. Publica o projeto como Worker usando o `wrangler.toml` incluído.
2. Mantém o binding D1 `DB` e o binding R2 `MEDIA` configurados.
3. Define o secret `ADMIN_PASSWORD`.
4. Faz o deploy do Worker e dos Static Assets.

## Administração

Abre `/admin.html`. O painel permite gerir textos, galeria, provas, resultados, parceiros, notícias, reviews, mensagens e media.

## Media

Novas fotografias e vídeos são enviados para R2. A aplicação mantém compatibilidade com referências de fotografias legadas em D1.

## SEO

O sitemap incluído é apenas um marcador porque o domínio público não está definido no projeto. Antes da publicação, substitui-o por um sitemap XML com o domínio real.
