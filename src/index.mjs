const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const DEFAULT_STATE = {
  settings: {
    siteName: "Telmo Partilhas",
    email: "telmo@example.com",
    instagram: "#",
    facebook: "#",
    location: "Portugal",
    logo: "assets/logo.png"
  },
  texts: {
    heroTitle: "O RALLYCROSS ATRAVÉS DA MINHA LENTE",
    heroSubtitle: "Fotografia de Rallycross, Motorsport e momentos que ficam para a história.",
    aboutTitle: "SOBRE O MEU TRABALHO",
    aboutText: "Telmo Partilhas acompanha provas, pilotos, equipas e eventos de Motorsport através da fotografia, procurando a velocidade, a emoção e os detalhes que tornam cada prova única.",
    contactText: "Para cobertura fotográfica, parcerias, media ou colaboração, entra em contacto."
  },
  stats: { races: 0, photos: 0, events: 0, partners: 0 },
  races: [
    {
      id: "r1", name: "RALLYCROSS PORTUGAL", date: "2027-06-20", endDate: "2027-06-21",
      location: "Montalegre", circuit: "Circuito de Montalegre", country: "Portugal",
      category: "SuperCars", status: "next", image: "", description: "A próxima grande paragem de Rallycross.",
      link: "", result: ""
    },
    {
      id: "r2", name: "MOTORSPORT FEST", date: "2027-07-11", endDate: "2027-07-11",
      location: "Lousada", circuit: "Circuito de Lousada", country: "Portugal",
      category: "Touring", status: "featured", image: "", description: "Fim de semana dedicado à velocidade e ao Motorsport.",
      link: "", result: ""
    }
  ],
  photos: [
    {
      id: "p1", title: "Ataque na curva", category: "Rallycross", event: "Rallycross Portugal",
      driver: "Piloto / Equipa", date: "2027-06-20", location: "Montalegre",
      description: "Substitui esta imagem pela tua fotografia através do Admin.",
      image: "", featured: true, order: 1
    },
    {
      id: "p2", title: "Linha de meta", category: "Motorsport", event: "Motorsport Fest",
      driver: "Piloto / Equipa", date: "2027-07-11", location: "Lousada",
      description: "Substitui esta imagem pela tua fotografia através do Admin.",
      image: "", featured: false, order: 2
    }
  ],
  partners: [],
  news: [],
  results: []
};

const clone = (v) => JSON.parse(JSON.stringify(v));
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

function secret(env) {
  return env.ADMIN_PASSWORD || "admin123";
}

function b64url(bytes) {
  let s = "";
  const a = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (const b of a) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromB64url(value) {
  const pad = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const raw = atob(pad);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function signToken(env, text) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret(env)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(text)
  ));
}

async function issueToken(env) {
  const payload = JSON.stringify({ exp: Date.now() + 12 * 60 * 60 * 1000 });
  const sig = await signToken(env, payload);
  return `${b64url(new TextEncoder().encode(payload))}.${b64url(sig)}`;
}

async function isValidToken(request, env) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return false;

  const parts = auth.slice(7).split(".");
  if (parts.length !== 2) return false;

  try {
    const payload = new TextDecoder().decode(fromB64url(parts[0]));
    const parsed = JSON.parse(payload);
    if (!parsed.exp || parsed.exp < Date.now()) return false;

    const expected = await signToken(env, payload);
    const given = fromB64url(parts[1]);
    if (expected.length !== given.length) return false;

    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ given[i];
    return diff === 0;
  } catch {
    return false;
  }
}

async function ensureSchema(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS site_state (
      id INTEGER PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0
    )`)
  ]);

  const row = await db.prepare("SELECT id FROM site_state WHERE id=1").first();
  if (!row) {
    await db.prepare(
      "INSERT INTO site_state (id,payload,updated_at) VALUES (1,?,?)"
    ).bind(JSON.stringify(DEFAULT_STATE), new Date().toISOString()).run();
  }
}

async function readState(db) {
  const row = await db.prepare("SELECT payload FROM site_state WHERE id=1").first();
  if (!row) return clone(DEFAULT_STATE);

  try {
    return JSON.parse(row.payload);
  } catch {
    return clone(DEFAULT_STATE);
  }
}

async function writeState(db, state) {
  const safe = {
    settings: state.settings || {},
    texts: state.texts || {},
    stats: state.stats || {},
    races: Array.isArray(state.races) ? state.races : [],
    photos: Array.isArray(state.photos) ? state.photos : [],
    partners: Array.isArray(state.partners) ? state.partners : [],
    news: Array.isArray(state.news) ? state.news : [],
    results: Array.isArray(state.results) ? state.results : []
  };

  await db.prepare(
    "UPDATE site_state SET payload=?, updated_at=? WHERE id=1"
  ).bind(JSON.stringify(safe), new Date().toISOString()).run();

  return safe;
}

async function messages(db) {
  const result = await db.prepare(
    `SELECT id,name,email,subject,message,created_at AS date,read
     FROM messages ORDER BY created_at DESC`
  ).all();

  return (result.results || []).map(m => ({ ...m, read: !!m.read }));
}

async function api(request, env) {
  await ensureSchema(env.DB);

  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/api/health" && request.method === "GET") {
    return json({
      ok: true,
      cloudflare: {
        d1: !!env.DB,
        r2: !!env.MEDIA,
        assets: !!env.ASSETS
      }
    });
  }

  if (path === "/api/auth/login" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    if (body.password !== secret(env)) {
      return json({ error: "Palavra-passe incorreta." }, 401);
    }
    return json({ token: await issueToken(env) });
  }

  if (path === "/api/site" && request.method === "GET") {
    const state = await readState(env.DB);
    return json({ ...state, messages: [] });
  }

  if (path === "/api/messages" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return json({ error: "Preenche nome, email e mensagem." }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO messages
       (id,name,email,subject,message,created_at,read)
       VALUES (?,?,?,?,?,?,0)`
    ).bind(
      crypto.randomUUID(), name, email, subject, message, new Date().toISOString()
    ).run();

    return json({ ok: true });
  }

  if (!await isValidToken(request, env)) {
    return json({ error: "Sessão inválida ou expirada." }, 401);
  }

  if (path === "/api/admin/state" && request.method === "GET") {
    const state = await readState(env.DB);
    return json({ ...state, messages: await messages(env.DB) });
  }

  if (path === "/api/admin/state" && request.method === "PUT") {
    const body = await request.json().catch(() => ({}));
    const state = await writeState(env.DB, body);
    return json({ ...state, messages: await messages(env.DB) });
  }

  if (path === "/api/admin/messages/mark-read" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id || "");
    if (!id) return json({ error: "Mensagem inválida." }, 400);

    await env.DB.prepare("UPDATE messages SET read=1 WHERE id=?").bind(id).run();
    return json({ ok: true });
  }

  if (path.startsWith("/api/admin/messages/") && request.method === "DELETE") {
    const id = decodeURIComponent(path.split("/").pop());
    await env.DB.prepare("DELETE FROM messages WHERE id=?").bind(id).run();
    return json({ ok: true });
  }

  if (path === "/api/upload" && request.method === "POST") {
    if (!env.MEDIA) return json({ error: "R2 não está ligado ao Worker." }, 503);

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) return json({ error: "Ficheiro em falta." }, 400);
    if (!file.type.startsWith("image/")) return json({ error: "Só são aceites imagens." }, 415);
    if (file.size > 15 * 1024 * 1024) return json({ error: "A imagem ultrapassa 15 MB." }, 413);

    const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
    const key = `uploads/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;

    await env.MEDIA.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000, immutable"
      }
    });

    return json({ ok: true, url: `/media/${key}` });
  }

  return json({ error: "Rota não encontrada." }, 404);
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (url.pathname.startsWith("/api/")) {
        return await api(request, env);
      }

      if (url.pathname.startsWith("/media/")) {
        if (!env.MEDIA) return new Response("R2 indisponível", { status: 503 });

        const key = decodeURIComponent(url.pathname.slice("/media/".length));
        const object = await env.MEDIA.get(key);
        if (!object) return new Response("Imagem não encontrada", { status: 404 });

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("cache-control", "public, max-age=31536000, immutable");

        return new Response(object.body, { headers });
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(error);
      return json({
        error: "Erro interno do servidor.",
        detail: error?.message || String(error)
      }, 500);
    }
  }
};
