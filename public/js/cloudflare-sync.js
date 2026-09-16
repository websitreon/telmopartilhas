(() => {
  let health = null;
  let lastError = '';
  async function request(url, options = {}) {
    const method=(options.method||'GET').toUpperCase();
    const headers = new Headers(options.headers || {});
    const adminMutation = ['POST','PUT','PATCH','DELETE'].includes(method) && !url.includes('/api/auth') && options.admin !== false;
    if (adminMutation) headers.set('X-TP-Admin', '1');
    const stateRead=url==='/api/state' && method==='GET';
    const res = await fetch(url, { ...options, method, headers, cache: stateRead ? 'default' : 'no-store', credentials: 'same-origin' });
    const type = res.headers.get('content-type') || '';
    const body = type.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`);
    return body;
  }
  async function checkCloud(){try{health=await request('/api/health',{admin:false});lastError='';return health}catch(e){lastError=e.message||'API indisponível';health={ok:false,d1:false,r2:false,tables:false,schemaError:lastError};return health}}
  async function session(){try{return !!(await request('/api/auth',{admin:false}))?.ok}catch{return false}}
  async function login(password){return await request('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password}),admin:false})}
  async function logout(){try{await request('/api/auth',{method:'DELETE',admin:false})}catch{}}
  async function pullStateInfo(){try{return await request('/api/state',{admin:false})}catch(e){lastError=e.message||'Falha ao ler a D1';throw e}}
  async function pullData(fallback=null){const r=await pullStateInfo();return r?.data??fallback}
  async function pushData(data){try{return await request('/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})}catch(e){lastError=e.message||'Falha ao guardar a D1';return {ok:false,error:lastError}}}
  async function listMedia(type='video'){return (await request(`/api/media?list=1&type=${encodeURIComponent(type)}`,{admin:false}))?.media||[]}
  async function listReviews(){return (await request('/api/admin/reviews'))?.reviews||[]}
  async function saveEntity(entity,item){return await request(`/api/admin/${encodeURIComponent(entity)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)})}
  async function createEntity(entity,item){return await request(`/api/admin/${encodeURIComponent(entity)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)})}
  async function deleteEntity(entity,id){return (await request(`/api/admin/${encodeURIComponent(entity)}?id=${encodeURIComponent(id)}`,{method:'DELETE'})).ok===true}
  async function patchSettings(settings){return await request('/api/admin/settings',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)})}
  async function pullMessages(){return (await request('/api/messages',{admin:false})).messages||[]}
  async function audit(limit=100){return await request(`/api/admin/audit?limit=${encodeURIComponent(limit)}`)}
  async function markMessageRead(id,read=true){return (await request('/api/messages',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,read})})).ok===true}
  async function clearMessages(){return (await request('/api/messages',{method:'DELETE'})).ok===true}
  async function addMessage(message){try{return (await request('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(message),admin:false})).ok===true}catch(e){lastError=e.message||'Falha ao enviar mensagem';return false}}
  async function addReview(review){try{return await request('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(review),admin:false})}catch(e){lastError=e.message||'Falha ao enviar review';return {ok:false,error:lastError}}}
  async function upload(file){if(!file||!/^((video\/(mp4|webm))|(image\/(jpeg|png|webp)))$/i.test(file.type))throw new Error('Formato não suportado. Usa JPG, PNG, WEBP, MP4 ou WEBM.');const fd=new FormData();fd.append('file',file,file.name);return (await request('/api/media',{method:'POST',body:fd})).media}
  async function uploadImage(file){if(!file||!/^image\/(jpeg|png|webp)$/i.test(file.type))throw new Error('Usa JPG, PNG ou WEBP.');return upload(file)}
  async function uploadD1Photo(data,name,mime){return (await request('/api/d1-photo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data,name,mime})})).photo}
  async function deleteMedia(id){return (await request(`/api/media?id=${encodeURIComponent(id)}`,{method:'DELETE'})).ok===true}
  window.TPCloud={checkCloud,session,login,logout,pullData,pullStateInfo,pushData,listMedia,listReviews,saveEntity,createEntity,deleteEntity,patchSettings,pullMessages,audit,markMessageRead,clearMessages,addMessage,addReview,upload,uploadImage,uploadD1Photo,deleteMedia,lastError:()=>lastError,getHealth:()=>health};
})();
