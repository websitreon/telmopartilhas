const SESSION='tp_admin';
const SESSION_TTL=8*60*60*1000;

function json(data,status=200,extra={}){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra}});
}
function cookieValue(request,name){
  const raw=request.headers.get('Cookie')||'';
  const hit=raw.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));
  return hit?hit.slice(name.length+1):'';
}
function b64u(input){
  const bytes=typeof input==='string'?new TextEncoder().encode(input):input;
  let binary=''; for(const b of bytes) binary+=String.fromCharCode(b);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
}
function fromB64u(s){
  const base=s.replace(/-/g,'+').replace(/_/g,'/');
  const pad=base.length%4?'='.repeat(4-base.length%4):'';
  const binary=atob(base+pad), out=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++) out[i]=binary.charCodeAt(i);
  return out;
}
async function hmac(secret,text){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(text)));
}
async function makeSession(secret){
  const payload=`${Date.now()+SESSION_TTL}.${crypto.randomUUID()}`;
  return `${b64u(payload)}.${b64u(await hmac(secret,payload))}`;
}
async function isAdmin(request,env){
  const secret=env.ADMIN_PASSWORD;
  if(!secret) return false;
  const token=cookieValue(request,SESSION); if(!token) return false;
  const [payload64,sig]=token.split('.'); if(!payload64||!sig) return false;
  let payload; try{payload=new TextDecoder().decode(fromB64u(payload64));}catch{return false;}
  const [exp]=payload.split('.'); if(!Number(exp)||Number(exp)<Date.now()) return false;
  const expected=b64u(await hmac(secret,payload));
  if(expected.length!==sig.length) return false;
  let diff=0; for(let i=0;i<expected.length;i++) diff|=expected.charCodeAt(i)^sig.charCodeAt(i);
  return diff===0;
}
function sessionCookie(value,maxAge=SESSION_TTL/1000){return `${SESSION}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(maxAge)}`;}
function clearSessionCookie(){return `${SESSION}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;}

async function ensureTables(env){
  if(!env.DB) return false;
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id=1), data TEXT NOT NULL, updated_at TEXT NOT NULL)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY,date TEXT NOT NULL,name TEXT NOT NULL,email TEXT NOT NULL,subject TEXT,message TEXT NOT NULL,read INTEGER NOT NULL DEFAULT 0)`).run();
  return true;
}

function safeExt(name,type){
  const byType={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/avif':'avif'};
  const ext=byType[type]||String(name||'').split('.').pop()?.toLowerCase();
  return /^[a-z0-9]{2,5}$/.test(ext||'')?ext:'jpg';
}

async function api(request,env){
  const url=new URL(request.url), path=url.pathname;

  if(path==='/api/auth' && request.method==='POST'){
    if(!env.ADMIN_PASSWORD) return json({ok:false,error:'ADMIN_PASSWORD não configurada no Cloudflare.'},503);
    let body; try{body=await request.json();}catch{return json({ok:false,error:'Pedido inválido.'},400);}
    if(body.password!==env.ADMIN_PASSWORD) return json({ok:false,error:'Password incorreta.'},401);
    const token=await makeSession(env.ADMIN_PASSWORD);
    return json({ok:true},200,{'Set-Cookie':sessionCookie(token)});
  }
  if(path==='/api/auth' && request.method==='DELETE') return json({ok:true},200,{'Set-Cookie':clearSessionCookie()});

  if(path==='/api/state' && request.method==='GET'){
    if(!env.DB) return json({ok:false,error:'D1 não está ligado.'},503);
    try{
      await ensureTables(env);
      const row=await env.DB.prepare('SELECT data,updated_at FROM app_state WHERE id=1').first();
      return row?json({ok:true,data:JSON.parse(row.data),updatedAt:row.updated_at}):json({ok:true,data:null,updatedAt:null});
    }catch(e){return json({ok:false,error:String(e?.message||e)},500);}
  }
  if(path==='/api/state' && request.method==='PUT'){
    if(!(await isAdmin(request,env))) return json({ok:false,error:'Não autorizado.'},401);
    if(!env.DB) return json({ok:false,error:'D1 não está ligado.'},503);
    let data; try{data=await request.json();}catch{return json({ok:false,error:'JSON inválido.'},400);}
    await ensureTables(env);
    const now=new Date().toISOString();
    await env.DB.prepare('INSERT INTO app_state(id,data,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at').bind(JSON.stringify(data),now).run();
    return json({ok:true,updatedAt:now});
  }

  if(path==='/api/messages' && request.method==='POST'){
    if(!env.DB) return json({ok:false,error:'D1 não está ligado.'},503);
    let body; try{body=await request.json();}catch{return json({ok:false,error:'JSON inválido.'},400);}
    if(!body.name||!body.email||!body.message) return json({ok:false,error:'Campos obrigatórios em falta.'},400);
    await ensureTables(env);
    const id=`${Date.now()}-${crypto.randomUUID()}`;
    await env.DB.prepare('INSERT INTO messages(id,date,name,email,subject,message,read) VALUES(?,?,?,?,?,?,0)').bind(id,body.date||new Date().toISOString(),String(body.name),String(body.email),String(body.subject||''),String(body.message)).run();
    return json({ok:true,id});
  }
  if(path==='/api/messages' && request.method==='GET'){
    if(!(await isAdmin(request,env))) return json({ok:false,error:'Não autorizado.'},401);
    if(!env.DB) return json({ok:false,error:'D1 não está ligado.'},503);
    await ensureTables(env);
    const {results}=await env.DB.prepare('SELECT id,date,name,email,subject,message,read FROM messages ORDER BY date DESC').all();
    return json({ok:true,messages:results||[]});
  }
  if(path==='/api/messages' && request.method==='DELETE'){
    if(!(await isAdmin(request,env))) return json({ok:false,error:'Não autorizado.'},401);
    if(!env.DB) return json({ok:false,error:'D1 não está ligado.'},503);
    await ensureTables(env); await env.DB.prepare('DELETE FROM messages').run(); return json({ok:true});
  }

  if(path==='/api/upload' && request.method==='POST'){
    if(!(await isAdmin(request,env))) return json({ok:false,error:'Não autorizado.'},401);
    if(!env.MEDIA) return json({ok:false,error:'R2 não está ligado. Adiciona o binding MEDIA.'},503);
    const form=await request.formData(), file=form.get('file');
    if(!(file instanceof File)) return json({ok:false,error:'Ficheiro em falta.'},400);
    if(!String(file.type).startsWith('image/')) return json({ok:false,error:'Apenas imagens são permitidas.'},400);
    if(file.size>15*1024*1024) return json({ok:false,error:'A imagem ultrapassa 15 MB.'},413);
    const ext=safeExt(file.name,file.type), key=`uploads/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;
    await env.MEDIA.put(key,file.stream(),{httpMetadata:{contentType:file.type,cacheControl:'public, max-age=31536000, immutable'}});
    return json({ok:true,key,url:`/api/media?key=${encodeURIComponent(key)}`});
  }
  if(path==='/api/media' && request.method==='GET'){
    if(!env.MEDIA) return new Response('R2 not configured',{status:503});
    const key=url.searchParams.get('key'); if(!key) return new Response('Missing key',{status:400});
    const object=await env.MEDIA.get(key); if(!object) return new Response('Not found',{status:404});
    const headers=new Headers(); object.writeHttpMetadata(headers); headers.set('etag',object.httpEtag); headers.set('Cache-Control','public, max-age=31536000, immutable');
    return new Response(object.body,{headers});
  }

  if(path.startsWith('/api/')) return json({ok:false,error:'Endpoint não encontrado.'},404);
  return null;
}

export default {
  async fetch(request,env,ctx){
    const response=await api(request,env);
    if(response) return response;
    return env.ASSETS.fetch(request);
  }
};
