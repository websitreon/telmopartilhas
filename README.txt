TELMO PARTILHAS — V13 ADMIN + SITE — SYNC TOTAL

MELHORIAS
- Admin completamente reorganizado com Dashboard, biblioteca de fotografias e gestão por módulos.
- Biblioteca de fotografias com pesquisa, filtros, destaque, edição e upload múltiplo.
- Upload de imagem para R2 quando o binding MEDIA existe.
- Fallback automático para compressão no navegador quando R2 não está configurado.
- Formulários organizados para provas, resultados, parceiros e notícias.
- Gestão centralizada de textos, contactos e informação do website.
- Todos os textos editáveis do site público estão agora ligados aos campos do Admin; alterações em Conteúdo & Textos são publicadas no D1.
- O site público verifica o D1 de forma periódica e ao regressar ao separador, para refletir alterações sem depender de cache do navegador.
- Caixa de mensagens com marcação de lida e resposta por email.
- Backup e restauração JSON no próprio admin.
- Diagnóstico da API Worker / D1 / R2 em Configurações.
- Sessão Cloudflare verificada antes de abrir o painel quando a API está disponível.
- Website público atualizado para uma identidade Motorsport preto + teal + laranja baseada diretamente nas cores do logótipo Telmo Partilhas.

CLOUDFLARE

O projeto usa Cloudflare Workers + Static Assets.
No projeto Cloudflare mantém:
Root directory: /
Build command: npx wrangler deploy

D1
UUID:
80d0977f-5cd6-4efa-9e6e-e2656b6f9e59

No Cloudflare:
Workers & Pages -> projeto -> Settings -> Bindings -> D1 database bindings
Variable name: DB
Seleciona a D1 correspondente ao UUID acima.

R2 OPCIONAL
Adiciona um bucket R2 como binding:
Variable name: MEDIA

PASSWORD
No Worker, configura o secret ADMIN_PASSWORD.
Se não existir, a password de fallback é telmo2027.

TABELAS
O Worker cria automaticamente app_state e messages na primeira utilização.

TESTE
1. Deploy do projeto.
2. Abre /admin.html.
3. Entra com ADMIN_PASSWORD (ou telmo2027 se não definiste o secret).
4. Vai a Fotografias -> Adicionar fotografia ou Upload múltiplo.
5. Guarda e abre o website noutra janela/dispositivo.
6. Em Configurações confirma que D1 aparece como LIGADO.

NOTA
As alterações que precisam de persistência entre dispositivos dependem do binding D1 estar efetivamente ligado ao Worker. O R2 é recomendado para bibliotecas grandes de fotografias.


IDENTIDADE VISUAL
- O logótipo PNG transparente foi integrado no header, admin, hero, footer e favicon.
- As cores principais agora seguem o logótipo: preto/grafite, teal e laranja.
- O website recebeu uma hierarquia visual mais forte, hero renovado, navegação com Resultados e estados de destaque mais consistentes.
- O admin recebeu o mesmo sistema de cor e uma apresentação mais limpa para a biblioteca de fotografias e restantes módulos.
