# Telmo Partilhas — V23

Projeto organizado para Cloudflare Workers + Static Assets + D1 + R2.

## Estrutura
- `public/` — tudo o que o visitante e o Admin carregam no navegador.
- `cloudflare/worker.js` — entrada única do Worker.
- `cloudflare/api.js` — API Admin/site e ligação D1/R2.
- `database/migrations/` — migrations D1.
- `docs/` — documentação e auditoria.
- `wrangler.toml` — única configuração de deploy.

## Deploy
O projeto foi preparado para o comando que o teu pipeline já executa:

```bash
npx wrangler deploy
```

Não uses `wrangler pages deploy` neste pacote: esta versão usa Workers + Static Assets, com `public/` como diretório de assets.

## Bindings
- D1 binding: `DB` → `80d0977f-5cd6-4efa-9e6e-e2656b6f9e59`
- R2 binding: `MEDIA` → `telmo-partilhas-media`
- Secret: `ADMIN_PASSWORD`


## Hero video

O vídeo de fundo da página inicial é gerido no Admin em **Fotografias**. O ficheiro é carregado para o bucket R2 `telmo-partilhas-media` através do binding `MEDIA`; depois pode ser selecionado, ativado/desativado e definido um fallback de imagem sem editar textos do site.


## V30 — Media workflow
Fotografias do site são armazenadas na D1 através de `/api/d1-photo`. O R2 `telmo-partilhas-media` é reservado ao vídeo de fundo da homepage. O Admin tem uma única área "Fotografias + Hero" para gerir ambos.
