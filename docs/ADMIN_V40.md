# Admin V40

## Objetivo
Painel CMS completo e sincronizado com o `index.html`.

## Áreas editáveis
- Conteúdo global: marca, Hero, textos de todas as secções, navegação e contactos.
- Hero & Media: vídeo, poster, fallback, overlay, Open Graph e Shot of the Week.
- Estatísticas: os 4 números do bloco Sobre.
- SEO & Social: title, description, canonical, OG image e redes.
- Galeria: criação, edição, upload R2, pesquisa e remoção.
- Calendário: provas e todos os dados exibidos na homepage.
- Resultados: classificações exibidas no website.
- Parceiros: dados, links, logo e publicação.
- Notícias: título, resumo, conteúdo, imagem e publicação.
- Reviews: aprovação, destaque, edição e remoção.
- Mensagens: leitura, resposta e limpeza.
- Sistema: saúde Cloudflare, export/import e auditoria.

## Sincronização
As definições e dados editoriais são persistidos na D1 e lidos pelo frontend através de `/api/state`. As mutações do Admin passam pelos endpoints protegidos e atualizam o `_state_version`.

## Media
Novas fotografias e vídeos são enviados para R2. Fotografias antigas que ainda apontem para `/api/d1-photo/...` continuam válidas.
