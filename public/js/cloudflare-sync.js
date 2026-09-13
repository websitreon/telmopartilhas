(() => {
  let health = null;
  let lastError = '';
  async function request(url, options = {}) {
    const headers = new Headers(options.headers || {});
    const adminMutation = ['POST','PUT','PATCH','DELETE'].includes((options.method || 'GET').toUpperCase()) && !url.includes('/api/auth') && !url.includes('/api/messages') && options.admin !== false;
    if (adminMutation) headers.set('X-TP-Admin', '1');
    const res = await fetch(url, { ...options, headers, cache: 'no-store', credentials: 'same-origin' });
    const type = res.headers.get('content-type') || '';
    const body = type.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`);
    return body;
  }
  async function checkCloud() { try { health = await request('/api/health', { admin:false }); lastError=''; return health; } catch(e) { lastError=e.message||'API indisponível'; health={ok:false,d1:false,r2:false,tables:false}; return health; } }
  async function session() { try { const r=await request('/api/auth',{admin:false}); return !!r?.ok; } catch { return false; } }
  async function login(password) { const r=await request('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password}),admin:false}); if(!r.ok)throw new Error(r.error||'Falha no login'); return r; }
  async function logout(){try{await request('/api/auth',{method:'DELETE',admin:false})}catch{}}
  async function pullData(fallback=null){try{const r=await request('/api/state',{admin:false});return r?.data??fallback}catch(e){lastError=e.message||'Falha ao ler a D1';throw e}}
  async function pushData(data){try{const r=await request('/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return r}catch(e){lastError=e.message||'Falha ao guardar na D1';return {ok:false,error:lastError}}}
  async function pullMessages(){const r=await request('/api/messages',{admin:false});return r?.messages||[]}
  async function addMessage(message){try{return (await request('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(message),admin:false})).ok===true}catch(e){lastError=e.message||'Falha ao enviar mensagem';return false}}
  async function addReview(review){try{const r=await request('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(review),admin:false});return r}catch(e){lastError=e.message||'Falha ao enviar review';return {ok:false,error:lastError}}}
  async function markMessageRead(id,read=true){try{return (await request('/api/messages',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,read})})).ok===true}catch(e){lastError=e.message||'Falha ao atualizar mensagem';return false}}
  async function clearMessages(){try{return (await request('/api/messages',{method:'DELETE'})).ok===true}catch(e){lastError=e.message||'Falha ao apagar mensagens';return false}}
  async function upload(file){const fd=new FormData();fd.append('file',file,file.name);const r=await request('/api/media',{method:'POST',body:fd});return r.media}
  async function deleteMedia(id){return (await request(`/api/media?id=${encodeURIComponent(id)}`,{method:'DELETE'})).ok===true}
  window.TPCloud={checkCloud,session,login,logout,pullData,pushData,pullMessages,addMessage,addReview,markMessageRead,clearMessages,upload,deleteMedia,lastError:()=>lastError,getHealth:()=>health};
})();
