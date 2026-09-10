# TELMO PARTILHAS — V3

Projeto reconstruído com foco em:
- site visual premium Motorsport;
- Admin organizado e fácil de usar;
- fotografia sempre associada a uma Prova/Evento e Álbum;
- sincronização Admin → D1 → Site;
- uploads Admin → R2 → D1 → Site.

## Cloudflare
Worker: telmopartilhas
D1: telmo-partilhas-db
D1 ID: 80d0977f-5cd6-4efa-9e6e-e2656b6f9e59
R2: telmo-partilhas-media

## GitHub / Workers Builds
Build command: deixar vazio
Deploy command: npx wrangler deploy

## Admin
/admin.html
Palavra-passe inicial: admin123
Para produção, definir ADMIN_PASSWORD como segredo do Worker.

## Fotografia
No Admin > Fotografias:
1. escolhe a Prova/Evento;
2. escolhe Álbum;
3. carrega a imagem;
4. guarda.
A fotografia fica ligada à prova e aparece no site através da D1/R2.
