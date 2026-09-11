const SESSION = 'tp_admin';
const SESSION_TTL = 8 * 60 * 60 * 1000;
function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra}})}
function cookieValue(request,name){const raw=request.headers.get('Cookie')||'';const hit=raw.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));return hit?hit.slice(name.length+1):''}
function b64u(input){const bytes=typeof input==='string'?new TextEncoder().encode(input):input;let binary='';for(const b of bytes)binary+=String.fromCharCode(b);return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'')}
function fromB64u(s){const base=s.replace(/-/g,'+').replace(/_/g,'/');const pad=base.length%4?'='.repeat(4-base.length%4):'';const binary=atob(base+pad);const out=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)out[i]=binary.charCodeAt(i);return out}
async function hmac(secret,text){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(text)))}
async function makeSession(secret){const payload=`${Date.now()+SESSION_TTL}.${crypto.randomUUID()}`;return `${b64u(payload)}.${b64u(await hmac(secret,payload))}`}
async function isAdmin(request,env){if(!env.ADMIN_PASSWORD)return false;const token=cookieValue(request,SESSION);if(!token)return false;const [payload64,sig]=token.split('.');if(!payload64||!sig)return false;let payload;try{payload=new TextDecoder().decode(fromB64u(payload64))}catch{return false}const [exp]=payload.split('.');if(!Number(exp)||Number(exp)<Date.now())return false;const expected=b64u(await hmac(env.ADMIN_PASSWORD,payload));if(expected.length!==sig.length)return false;let diff=0;for(let i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^sig.charCodeAt(i);return diff===0}
function sessionCookie(value,maxAge=SESSION_TTL/1000){return `${SESSION}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(maxAge)}`}
function clearSessionCookie(){return `${SESSION}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`}
export{json,cookieValue,makeSession,isAdmin,sessionCookie,clearSessionCookie};
