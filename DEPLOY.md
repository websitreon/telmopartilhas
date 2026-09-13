# Telmo Partilhas — publicação

## Cloudflare

1. Publica este projeto como Worker com o `wrangler.toml` incluído.
2. Mantém o binding D1 `DB` e o R2 `MEDIA`.
3. Cria/configura o secret `ADMIN_PASSWORD`.
4. Faz deploy do Worker e dos Assets.

## Administração

O painel não possui editor de textos do site. Textos editoriais continuam no `public/data/content.js`; o Admin gere fotografias, provas, resultados, parceiros, notícias, reviews, media e mensagens.

## Persistência

A D1 é preparada automaticamente pelo Worker. A aplicação repara tabelas legadas quando necessário e não considera uma alteração guardada até a API devolver sucesso.

## Media

Imagens e vídeos carregados pelo Admin são enviados para R2. O site guarda apenas referências/metadados na D1.


## Fundo de vídeo da página inicial

O Admin agora disponibiliza o controlo do vídeo do Hero dentro de **Fotografias**. O upload aceita MP4 e WEBM e guarda o ficheiro no binding R2 `MEDIA`, apontado para o bucket `telmo-partilhas-media`. O Admin permite selecionar um vídeo existente, carregar um novo, ativar/desativar o vídeo e escolher a imagem de fallback.

O endpoint `/api/media/:id` também suporta pedidos HTTP Range para reprodução de vídeo no navegador.


## V30 — Media workflow
Fotografias do site são armazenadas na D1 através de `/api/d1-photo`. O R2 `telmo-partilhas-media` é reservado ao vídeo de fundo da homepage. O Admin tem uma única área "Fotografias + Hero" para gerir ambos.
