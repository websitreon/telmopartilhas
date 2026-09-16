# Auditoria final V27

## Estado
Projeto revisto e preparado para publicação.

## Frontend
- Conteúdo editorial do site permanece no `public/data/content.js`.
- O frontend só aceita da D1 as estruturas geridas pelo CMS e as definições técnicas de media/SEO autorizadas.
- O refresh remoto não substitui o site por um estado vazio quando a D1 ainda não foi inicializada.
- A sincronização periódica foi estabilizada: só volta a renderizar a página quando o estado remoto realmente mudou.
- Filtros de galeria/calendário passam a reconhecer categorias existentes nos dados.
- Imagens sem URL válida usam fallback visual para evitar imagens partidas.
- Revelações por scroll usam um único `IntersectionObserver`, evitando acumulação de observers a cada sincronização.

## Admin
- Removido o editor dedicado de "Conteúdo & textos".
- Navegação reorganizada por gestão do projeto, ficheiros/comunicação e sistema.
- Dashboard apresenta métricas, ações rápidas e estado real da infraestrutura.
- Alterações só são apresentadas como guardadas depois da confirmação da API.
- Em falha de gravação, o Admin repõe o estado anterior em vez de deixar alterações apenas locais.
- Upload de media continua a usar R2 e as referências ficam sincronizadas com D1.

## D1 / Worker
- `ensureSchema()` cria tabelas em falta, repara estruturas legadas incompatíveis e adiciona colunas introduzidas por versões posteriores.
- O estado legado `app_state` é migrado de forma compatível.
- `site_settings` guarda apenas as definições técnicas autorizadas pelo runtime; os textos editoriais não são regravados pelo CMS.
- Endpoints `/api/*` usam `Cache-Control: no-store`.
- Autenticação de Admin usa cookie HttpOnly com sessão assinada por HMAC.

## Validação local
- `node --check` passou em `cloudflare/api.js`, `cloudflare/worker.js`, `public/js/admin.js`, `public/js/site.js` e `public/js/cloudflare-sync.js`.
- O schema SQL das migrations foi aplicado numa base SQLite de teste sem erros.
- Foram verificados caminhos de assets e referências principais do HTML.

## Publicação
O deploy real na conta Cloudflare não é executado neste ambiente. Antes da publicação, a conta deve ter:
- binding D1 `DB`
- binding R2 `MEDIA`
- secret `ADMIN_PASSWORD`
- Worker configurado com o `wrangler.toml` incluído
