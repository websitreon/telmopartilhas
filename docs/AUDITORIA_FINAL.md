# Telmo Partilhas V15 — Auditoria final

## Problemas críticos encontrados na V14

1. **Sessão do Admin quebrada.** O descodificador Base64URL calculava o padding com `4 - base.length` em vez de `4 - (base.length % 4)`. O cookie era criado, mas a validação falhava; o Admin podia não abrir.
2. **Persistência local indevida.** Admin e site usavam `localStorage` como fallback/persistência principal. Isto permitia alterações que só existiam naquele navegador e explicava o comportamento de “guardei mas o site não mudou”.
3. **D1 num único JSON.** O conteúdo ficava concentrado em `app_state`, sem estrutura para media, reviews e CRUD real.
4. **Uploads incompletos.** Só havia upload de imagem; não existia biblioteca de media com metadata D1 e remoção segura do objeto R2.
5. **Reviews incompletas.** Não existia fluxo público de envio + pendente + aprovação + destaque totalmente implementado.
6. **Conteúdo não totalmente ligado ao frontend.** Alguns textos estavam no HTML ou não eram re-renderizados quando alterados.
7. **Vídeo de fundo ausente.** Não havia fluxo Admin → R2 → Hero com fallback.
8. **Risco de XSS.** Vários valores guardados eram inseridos diretamente em `innerHTML` sem escape.
9. **Cache insuficientemente controlado.** As APIs não estavam explicitamente protegidas contra respostas antigas.
10. **Configuração orientada a Worker.** A versão anterior estava estruturada principalmente para Worker Static Assets, apesar do objetivo ser Pages + Pages Functions.
11. **URL de script mal formada.** O site tinha `js/site.js?v=14?v=13`.
12. **Dashboard podia representar modo local.** O Admin podia dar aparência de funcionamento mesmo sem D1.

## Arquitetura V15

`Admin → /api/* → Pages Functions → D1 / R2 → Site público`

Também foi mantido `worker.js` como alternativa para Cloudflare Workers Static Assets.

## D1

Foi criada a migration `0002_cms.sql` com tabelas para:

- site_settings
- site_stats
- gallery
- races
- results
- partners
- news
- reviews
- media
- messages
- audit_log

`app_state` continua presente para migração segura de versões anteriores.

## Sincronização

O Admin já não declara “guardado” sem confirmação da API. A operação é:

`editar → PUT /api/state → validar → D1 → resposta com dados normalizados → estado do Admin`

O site usa a API como fonte de verdade e faz refresh periódico/ao regressar à página.

## Media

- Imagens: JPG, PNG, GIF, WEBP, até 15 MB.
- Vídeos: MP4, WEBM, até 120 MB.
- MIME e assinatura inicial do ficheiro são verificados.
- O objeto fica no R2.
- Metadata e referência ficam na D1.
- Não é permitido apagar media que esteja a ser usada pelo site.

## Segurança

- Secret `ADMIN_PASSWORD`, sem password de produção hardcoded como fallback.
- Sessão HttpOnly, SameSite e Secure em HTTPS.
- Operações administrativas exigem sessão + `X-TP-Admin` + origem compatível.
- Validação de inputs e URLs.
- Conteúdo textual é escapado no frontend.
- Reviews pendentes não são devolvidas ao site público.
- APIs usam `Cache-Control: no-store`.

## Testes realizados nesta entrega

- `node --check` em todos os JavaScript do projeto: **OK**.
- Validação dos caminhos locais referenciados pelo HTML: **OK**.
- Teste de login/sessão com Cloudflare API simulada: **OK**.
- Teste `PUT D1 → GET público → GET Admin`: **OK**; o título alterado regressou da D1 e reviews privadas ficaram visíveis apenas ao Admin.
- Teste de envio de review pública pendente: **OK**.
- Teste de entrega HTTP local dos principais ficheiros: **OK**.

## Validação de produção

Não é possível confirmar o binding real da tua conta Cloudflare sem acesso ao projeto publicado. A V15 está preparada para Pages Functions e identifica a D1 pelo ID fornecido; o binding `DB`, o bucket R2 `MEDIA` e o secret `ADMIN_PASSWORD` têm de estar configurados no Dashboard Cloudflare.
