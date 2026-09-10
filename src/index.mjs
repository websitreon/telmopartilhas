const JSON_HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"no-store"};
const DEFAULT_STATE={
  settings:{siteName:"Telmo Partilhas",email:"telmo@example.com",instagram:"#",facebook:"#",location:"Portugal",logo:"assets/logo.png"},
  texts:{heroTitle:"O RALLYCROSS ATRAVÉS DA MINHA LENTE",heroSubtitle:"Fotografia de Rallycross, Motorsport e momentos que ficam para a história.",aboutTitle:"SOBRE O MEU TRABALHO",aboutText:"Telmo Partilhas acompanha provas, pilotos, equipas e eventos de Motorsport através da fotografia, procurando a velocidade, a emoção e os detalhes que tornam cada prova única.",contactText:"Para cobertura fotográfica, parcerias, media ou colaboração, entra em contacto."},
  stats:{races:0,photos:0,events:0,partners:0},
  races:[
    {id:"r1",name:"RALLYCROSS PORTUGAL",date:"2027-06-20",endDate:"2027-06-21",location:"Montalegre",circuit:"Circuito de Montalegre",country:"Portugal",category:"SuperCars",status:"next",image:"",description:"A próxima grande prova. Adiciona a fotografia oficial no Admin.",link:"",result:""},
    {id:"r2",name:"MOTORSPORT FEST",date:"2027-07-11",endDate:"2027-07-11",location:"Lousada",circuit:"Circuito de Lousada",country:"Portugal",category:"Touring",status:"featured",image:"",description:"Fim de semana dedicado à velocidade e ao Motorsport.",link:"",result:""}
  ],
  photos:[
    {id:"p1",title:"Ataque na curva",category:"Rallycross",event:"RALLYCROSS PORTUGAL",raceName:"RALLYCROSS PORTUGAL",raceId:"r1",album:"Álbum principal",driver:"Piloto / Equipa",date:"2027-06-20",location:"Montalegre",description:"Substitui esta imagem por uma fotografia real através do Admin.",image:"",featured:true,order:1},
    {id:"p2",title:"Linha de meta",category:"Motorsport",event:"MOTORSPORT FEST",raceName:"MOTORSPORT FEST",raceId:"r2",album:"Álbum principal",driver:"Piloto / Equipa",date:"2027-07-11",location:"Lousada",description:"Substitui esta imagem por uma fotografia real através do Admin.",image:"",featured:false,order:2}
  ],
  partners:[],news:[],results:[]
};
const clone=v=>JSON.parse(JSON.stringify(v));
const json=(b,s=200)=>new Response(JSON.stringify(b),{status:s,headers:JSON_HEADERS});
function secret(env){return env.ADMIN_PASSWORD||"admin123"}
function b64(bytes){let s="";const a=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);for(const b of a)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function ub64(v){const p=v.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((v.length+3)%4),s=atob(p),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a}
async function sign(env,text){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret(env)),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(text)))}
async function issue(env){const payload=JSON.stringify({exp:Date.now()+12*60*60*1000});return b64(new TextEncoder().encode(payload))+"."+b64(await sign(env,payload))}
async function valid(req,env){const h=req.headers.get("authorization")||"";if(!h.startsWith("Bearer "))return false;const [p,s]=h.slice(7).split(".");if(!p||!s)return false;try{const txt=new TextDecoder().decode(ub64(p)),obj=JSON.parse(txt);if(obj.exp<Date.now())return false;const a=await sign(env,txt),b=ub64(s);if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a[i]^b[i];return d===0}catch{return false}}
async function schema(db){await db.batch([db.prepare(`CREATE TABLE IF NOT EXISTS site_state(id INTEGER PRIMARY KEY,payload TEXT NOT NULL,updated_at TEXT NOT NULL)`),db.prepare(`CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,subject TEXT,message TEXT NOT NULL,created_at TEXT NOT NULL,read INTEGER NOT NULL DEFAULT 0)`)]);const r=await db.prepare("SELECT id FROM site_state WHERE id=1").first();if(!r)await db.prepare("INSERT INTO site_state(id,payload,updated_at) VALUES(1,?,?)").bind(JSON.stringify(DEFAULT_STATE),new Date().toISOString()).run()}
async function state(db){const r=await db.prepare("SELECT payload FROM site_state WHERE id=1").first();try{return r?JSON.parse(r.payload):clone(DEFAULT_STATE)}catch{return clone(DEFAULT_STATE)}}
async function messages(db){const r=await db.prepare("SELECT id,name,email,subject,message,created_at AS date,read FROM messages ORDER BY created_at DESC").all();return(r.results||[]).map(m=>({...m,read:!!m.read}))}
async function save(db,input){const s={settings:input.settings||{},texts:input.texts||{},stats:input.stats||{},races:Array.isArray(input.races)?input.races:[],photos:Array.isArray(input.photos)?input.photos:[],partners:Array.isArray(input.partners)?input.partners:[],news:Array.isArray(input.news)?input.news:[],results:Array.isArray(input.results)?input.results:[]};await db.prepare("UPDATE site_state SET payload=?,updated_at=? WHERE id=1").bind(JSON.stringify(s),new Date().toISOString()).run();return s}
async function api(req,env){
 await schema(env.DB);const url=new URL(req.url),p=url.pathname;
 if(p==="/api/health"&&req.method==="GET")return json({ok:true,d1:!!env.DB,r2:!!env.MEDIA,assets:!!env.ASSETS});
 if(p==="/api/auth/login"&&req.method==="POST"){const body=await req.json().catch(()=>({}));if(body.password!==secret(env))return json({error:"Palavra-passe incorreta."},401);return json({token:await issue(env)})}
 if(p==="/api/site"&&req.method==="GET")return json({...await state(env.DB),messages:[]});
 if(p==="/api/messages"&&req.method==="POST"){const b=await req.json().catch(()=>({}));if(!b.name||!b.email||!b.message)return json({error:"Preenche nome, email e mensagem."},400);await env.DB.prepare("INSERT INTO messages(id,name,email,subject,message,created_at,read) VALUES(?,?,?,?,?,?,0)").bind(crypto.randomUUID(),String(b.name).trim(),String(b.email).trim(),String(b.subject||"").trim(),String(b.message).trim(),new Date().toISOString()).run();return json({ok:true})}
 if(!await valid(req,env))return json({error:"Sessão inválida ou expirada."},401);
 if(p==="/api/admin/state"&&req.method==="GET")return json({...await state(env.DB),messages:await messages(env.DB)});
 if(p==="/api/admin/state"&&req.method==="PUT"){const s=await save(env.DB,await req.json());return json({...s,messages:await messages(env.DB)})}
 if(p==="/api/admin/messages/read"&&req.method==="POST"){const b=await req.json().catch(()=>({}));await env.DB.prepare("UPDATE messages SET read=1 WHERE id=?").bind(String(b.id)).run();return json({ok:true})}
 if(p.startsWith("/api/admin/messages/")&&req.method==="DELETE"){await env.DB.prepare("DELETE FROM messages WHERE id=?").bind(decodeURIComponent(p.split("/").pop())).run();return json({ok:true})}
 if(p==="/api/upload"&&req.method==="POST"){if(!env.MEDIA)return json({error:"R2 não está ligado ao Worker."},503);const f=(await req.formData()).get("file");if(!(f instanceof File))return json({error:"Ficheiro em falta."},400);if(!f.type.startsWith("image/"))return json({error:"Só são aceites imagens."},415);if(f.size>15*1024*1024)return json({error:"A imagem ultrapassa 15 MB."},413);const ext=(f.name.split(".").pop()||"jpg").replace(/[^a-z0-9]/gi,"").toLowerCase()||"jpg",key=`uploads/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;await env.MEDIA.put(key,f.stream(),{httpMetadata:{contentType:f.type,cacheControl:"public, max-age=31536000, immutable"}});return json({ok:true,url:`/media/${key}`})}
 return json({error:"Rota não encontrada."},404)
}
export default{async fetch(req,env){try{const u=new URL(req.url);if(u.pathname.startsWith("/api/"))return await api(req,env);if(u.pathname.startsWith("/media/")){if(!env.MEDIA)return new Response("R2 indisponível",{status:503});const key=decodeURIComponent(u.pathname.slice(7)),o=await env.MEDIA.get(key);if(!o)return new Response("Imagem não encontrada",{status:404});const h=new Headers();o.writeHttpMetadata(h);h.set("etag",o.httpEtag);h.set("cache-control","public, max-age=31536000, immutable");return new Response(o.body,{headers:h})}return env.ASSETS.fetch(req)}catch(e){console.error(e);return json({error:"Erro interno do servidor.",detail:e?.message||String(e)},500)}}};
