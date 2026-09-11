TELMO PARTILHAS — V10 COMPLETA

Esta versão corrige os principais problemas do Admin:
- botão de adicionar fotografia já funciona;
- campo de imagem aceita URL OU ficheiro;
- se R2 estiver configurado, o ficheiro é enviado para R2;
- se R2 NÃO estiver configurado, o ficheiro é comprimido no navegador e guardado no conteúdo, para o Admin continuar a funcionar;
- editar/apagar/destacar fotografias funciona;
- provas, resultados, parceiros, notícias, textos e configurações continuam com formulários;
- sincronização usa a API do Worker + D1 quando o binding DB está ligado;
- site público lê o mesmo estado Cloudflare;
- password inicial do Admin: telmo2027 (pode ser substituída pelo secret ADMIN_PASSWORD).

CLOUDFLARE

O projeto usa Cloudflare Workers + Static Assets.
No teu projeto Cloudflare mantém:
Root directory: /
Build command: npx wrangler deploy

BINDING D1
O UUID fornecido é:
80d0977f-5cd6-4efa-9e6e-e2656b6f9e59

No Cloudflare:
Workers & Pages -> projeto -> Settings -> Bindings -> D1 database bindings
Variable name: DB
Seleciona a D1 correspondente ao UUID acima.

Wrangler exige também o database_name para uma configuração escrita no wrangler.toml. Como só foi fornecido o UUID, a versão usa o binding pelo painel para não inventar um nome e provocar erro de deploy.

R2 (OPCIONAL)
Para teres uploads originais, cria/usa um bucket R2 e adiciona:
Variable name: MEDIA
Bucket: o teu bucket R2

Mesmo sem R2, o botão CARREGAR do Admin funciona com compressão local. Depois de guardar, o conteúdo fica sincronizado via D1, dentro do tamanho suportado.

PASSWORD
Sem ADMIN_PASSWORD configurada, a password inicial é telmo2027.
Recomendação: criar um secret ADMIN_PASSWORD no Cloudflare com uma password tua.

D1 E TABELAS
Não é obrigatório executar uma migration manualmente para começar: o Worker cria app_state e messages automaticamente na primeira utilização.
A pasta migrations/ fica incluída para referência futura.

ENDPOINTS
GET  /api/health
POST /api/auth
DELETE /api/auth
GET  /api/state
PUT  /api/state
POST /api/messages
GET  /api/messages
DELETE /api/messages
POST /api/upload
GET  /api/media?key=...

TESTE
Depois do deploy:
1. Abre /admin.html
2. Password: telmo2027 (ou a tua ADMIN_PASSWORD)
3. Abre Fotografias -> Adicionar fotografia
4. Seleciona uma imagem -> CARREGAR -> GUARDAR
5. Abre o website noutra janela/dispositivo e confirma a fotografia.

NOTA
O sincronismo entre dispositivos depende do binding DB estar efetivamente ligado ao Worker. O Admin mostra uma indicação de Cloudflare quando a API está disponível.
