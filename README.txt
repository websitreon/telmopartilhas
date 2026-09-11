TELMO PARTILHAS — ESTRUTURA ORGANIZADA
======================================

index.html              -> website público
admin.html              -> painel de administração

assets/                 -> logo e elementos gráficos
css/                    -> folhas de estilo
js/                     -> JavaScript do site/admin e sincronização
 data/                  -> dados/conteúdo inicial do site
functions/api/          -> API Cloudflare Pages Functions
migrations/             -> migrações da base de dados D1

wrangler.toml           -> configuração Cloudflare
_headers                -> cabeçalhos Cloudflare

docs/README.txt         -> guia completo de configuração/sincronização Cloudflare

IMPORTANTE
----------
Os ficheiros wrangler.toml, _headers, functions/ e migrations/ ficam na raiz de propósito,
porque são usados pela estrutura de deploy da Cloudflare.
