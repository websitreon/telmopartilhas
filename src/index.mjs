const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const ALLOWED_ORIGINS = new Set(['null']);

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extra } });
}
function base64url(bytes) {
  let s = '';
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function unbase64url(s) {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(padded); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function hmac(secret, message) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign','verify']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
}
function sessionSecret(env) {
  return env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || 'admin123';
}
async function issueToken(env) {
  const payload = `${Date.now() + 1000 * 60 * 60 * 12}`;
  const sig = base64url(await hmac(sessionSecret(env), payload));
  return `${base64url(new TextEncoder().encode(payload))}.${sig}`;
}
async function verifyToken(request, env) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return false;
  const token = header.slice(7); const [p, sig] = token.split('.');
  if (!p || !sig) return false;
  const payload = new TextDecoder().decode(unbase64url(p));
  if (Number(payload) < Date.now()) return false;
  const expected = await hmac(sessionSecret(env), payload);
  const given = unbase64url(sig);
  if (expected.length !== given.length) return false;
  let diff = 0; for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ given[i];
  return diff === 0;
}
function cleanObj(v) { return v == null ? '' : String(v); }
function int(v) { return Number.isFinite(Number(v)) ? Number(v) : 0; }


async function ensureSchema(db) {
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS site_texts (key TEXT PRIMARY KEY, value TEXT NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS site_stats (key TEXT PRIMARY KEY, value INTEGER NOT NULL DEFAULT 0)'),
    db.prepare('CREATE TABLE IF NOT EXISTS races (id TEXT PRIMARY KEY, name TEXT NOT NULL, date TEXT NOT NULL, endDate TEXT, location TEXT, circuit TEXT, country TEXT, category TEXT, status TEXT, image TEXT, description TEXT, link TEXT, result TEXT)'),
    db.prepare('CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT, event TEXT, driver TEXT, date TEXT, location TEXT, description TEXT, image TEXT, featured INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0)'),
    db.prepare('CREATE TABLE IF NOT EXISTS partners (id TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT, description TEXT, website TEXT, instagram TEXT, facebook TEXT, category TEXT, sort_order INTEGER DEFAULT 0, active INTEGER DEFAULT 1)'),
    db.prepare('CREATE TABLE IF NOT EXISTS news (id TEXT PRIMARY KEY, title TEXT NOT NULL, summary TEXT, content TEXT, date TEXT, category TEXT, image TEXT, published INTEGER DEFAULT 0)'),
    db.prepare('CREATE TABLE IF NOT EXISTS results (id TEXT PRIMARY KEY, race TEXT, date TEXT, driver TEXT, category TEXT, position TEXT, time TEXT, notes TEXT)'),
    db.prepare('CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, name TEXT, email TEXT, subject TEXT, message TEXT, created_at TEXT, read INTEGER DEFAULT 0)')
  ]);
}

async function readCollection(db, table, mapper) {
  const { results } = await db.prepare(`SELECT * FROM ${table}`).all();
  return results.map(mapper);
}
async function readSite(db) {
  const [settingsRows, textRows, statRows, races, photos, partners, news, results] = await Promise.all([
    db.prepare('SELECT key,value FROM site_settings').all(),
    db.prepare('SELECT key,value FROM site_texts').all(),
    db.prepare('SELECT key,value FROM site_stats').all(),
    readCollection(db, 'races', r => ({...r})),
    readCollection(db, 'photos', r => ({id:r.id,title:r.title,category:r.category,event:r.event,driver:r.driver,date:r.date,location:r.location,description:r.description,image:r.image,featured:!!r.featured,order:r.sort_order})),
    readCollection(db, 'partners', r => ({id:r.id,name:r.name,logo:r.logo,description:r.description,website:r.website,instagram:r.instagram,facebook:r.facebook,category:r.category,order:r.sort_order,active:!!r.active})),
    readCollection(db, 'news', r => ({...r,published:!!r.published})),
    readCollection(db, 'results', r => ({...r}))
  ]);
  const settings = Object.fromEntries(settingsRows.results.map(x => [x.key, x.value]));
  const texts = Object.fromEntries(textRows.results.map(x => [x.key, x.value]));
  const stats = Object.fromEntries(statRows.results.map(x => [x.key, Number(x.value) || 0]));
  return { settings, texts, stats, races, photos, partners, news, results, messages: [] };
}

const FALLBACK = {
  settings:{siteName:'Telmo Partilhas',logo:'assets/logo.png',email:'telmo@example.com',instagram:'#',facebook:'#',location:'Portugal'},
  texts:{heroTitle:'O RALLYCROSS ATRAVÉS DA MINHA LENTE',heroSubtitle:'Fotografia de Rallycross, Motorsport e momentos que ficam para a história.',aboutTitle:'SOBRE O MEU TRABALHO',aboutText:'Telmo Partilhas acompanha provas, pilotos, equipas e eventos de Motorsport através da fotografia, procurando a velocidade, a emoção e os detalhes que tornam cada prova única.',contactText:'Para cobertura fotográfica, parcerias, media ou colaboração, entra em contacto.'},
  stats:{races:0,photos:0,events:0,partners:0},races:[],photos:[],partners:[],news:[],results:[],messages:[]
};

async function upsertAll(db, d) {
  const stmts = [];
  for (const [k,v] of Object.entries(d.settings||{})) stmts.push(db.prepare('INSERT INTO site_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k, cleanObj(v)));
  for (const [k,v] of Object.entries(d.texts||{})) stmts.push(db.prepare('INSERT INTO site_texts(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k, cleanObj(v)));
  for (const [k,v] of Object.entries(d.stats||{})) stmts.push(db.prepare('INSERT INTO site_stats(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k, int(v)));
  stmts.push(db.prepare('DELETE FROM races'), db.prepare('DELETE FROM photos'), db.prepare('DELETE FROM partners'), db.prepare('DELETE FROM news'), db.prepare('DELETE FROM results'));
  for (const r of d.races||[]) stmts.push(db.prepare('INSERT INTO races(id,name,date,endDate,location,circuit,country,category,status,image,description,link,result) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(r.id,r.name,r.date,r.endDate||'',r.location||'',r.circuit||'',r.country||'',r.category||'',r.status||'',r.image||'',r.description||'',r.link||'',r.result||''));
  for (const p of d.photos||[]) stmts.push(db.prepare('INSERT INTO photos(id,title,category,event,driver,date,location,description,image,featured,sort_order) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(p.id,p.title,p.category||'',p.event||'',p.driver||'',p.date||'',p.location||'',p.description||'',p.image||'',p.featured?1:0,int(p.order)));
  for (const p of d.partners||[]) stmts.push(db.prepare('INSERT INTO partners(id,name,logo,description,website,instagram,facebook,category,sort_order,active) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(p.id,p.name,p.logo||'',p.description||'',p.website||'',p.instagram||'',p.facebook||'',p.category||'',int(p.order),p.active?1:0));
  for (const n of d.news||[]) stmts.push(db.prepare('INSERT INTO news(id,title,summary,content,date,category,image,published) VALUES(?,?,?,?,?,?,?,?)').bind(n.id,n.title,n.summary||'',n.content||'',n.date||'',n.category||'',n.image||'',n.published?1:0));
  for (const r of d.results||[]) stmts.push(db.prepare('INSERT INTO results(id,race,date,driver,category,position,time,notes) VALUES(?,?,?,?,?,?,?,?)').bind(r.id,r.race||'',r.date||'',r.driver||'',r.category||'',r.position||'',r.time||'',r.notes||''));
  // D1 batch is atomic per request in practical terms for this workload.
  await db.batch(stmts);
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  if (env.DB) await ensureSchema(env.DB);
  const path = url.pathname;
  if (path === '/api/auth/login' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const adminPassword = env.ADMIN_PASSWORD || 'admin123';
    if (body.password !== adminPassword) return json({error:'Palavra-passe incorreta.'},401);
    return json({token:await issueToken(env)});
  }
  if (path === '/api/site' && request.method === 'GET') {
    let site = FALLBACK;
    try {
      site = await readSite(env.DB);
      if (!site.races.length && !site.photos.length && !site.news.length) site = FALLBACK;
    } catch (_) {}
    return json(site);
  }
  if (path === '/api/messages' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO messages(id,name,email,subject,message,created_at,read) VALUES(?,?,?,?,?,?,0)').bind(id,cleanObj(body.name),cleanObj(body.email),cleanObj(body.subject),cleanObj(body.message),new Date().toISOString()).run();
    return json({ok:true});
  }
  const authed = await verifyToken(request, env);
  if (!authed) return json({error:'Não autorizado.'},401);
  if (path === '/api/admin/data' && request.method === 'GET') {
    const site = await readSite(env.DB);
    const {results:messages} = await env.DB.prepare('SELECT id,name,email,subject,message,created_at AS date,read FROM messages ORDER BY created_at DESC').all();
    site.messages = messages.map(m=>({...m,read:!!m.read}));
    return json(site);
  }
  if (path === '/api/admin/data' && request.method === 'PUT') {
    const body = await request.json();
    await upsertAll(env.DB, body);
    return json({ok:true});
  }
  if (path === '/api/upload' && request.method === 'POST') {
    const form = await request.formData(); const file = form.get('file');
    if (!(file instanceof File)) return json({error:'Ficheiro em falta.'},400);
    if (!file.type.startsWith('image/')) return json({error:'Apenas imagens são aceites.'},415);
    if (file.size > 15 * 1024 * 1024) return json({error:'A imagem ultrapassa 15 MB.'},413);
    const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi,'').toLowerCase() || 'jpg';
    const key = `uploads/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;
    await env.MEDIA.put(key,file.stream(),{httpMetadata:{contentType:file.type,cacheControl:'public, max-age=31536000, immutable'}});
    return json({ok:true,url:`/media/${key}`});
  }
  if (path.startsWith('/api/')) return json({error:'Rota não encontrada.'},404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await handleApi(request, env); }
      catch (err) { console.error(err); return json({error:'Erro interno.',detail:err?.message||String(err)},500); }
    }
    if (url.pathname.startsWith('/media/')) {
      const key = decodeURIComponent(url.pathname.slice('/media/'.length));
      const obj = await env.MEDIA.get(key);
      if (!obj) return new Response('Imagem não encontrada.', {status:404});
      const headers = new Headers(); obj.writeHttpMetadata(headers); headers.set('etag', obj.httpEtag); headers.set('cache-control','public, max-age=31536000, immutable');
      return new Response(obj.body,{headers});
    }
    return env.ASSETS.fetch(request);
  }
};
