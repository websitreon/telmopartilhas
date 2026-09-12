(() => {
  const KEY = 'telmoPartilhasDataV1';
  const MSG = 'telmoPartilhasMessages';
  let cloudAvailable = null;
  let lastError = '';

  async function request(url, options = {}) {
    const res = await fetch(url, { cache: 'no-store', credentials: 'same-origin', ...options });
    const type = res.headers.get('content-type') || '';
    const body = type.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`);
    return body;
  }

  async function pullData(fallback) {
    try {
      const result = await request('/api/state');
      if (result.ok && result.data) {
        localStorage.setItem(KEY, JSON.stringify(result.data));
        cloudAvailable = true;
        lastError = '';
        return result.data;
      }
      cloudAvailable = !!result.ok;
    } catch (e) {
      cloudAvailable = false;
      lastError = e.message || 'Cloudflare indisponível';
    }
    return fallback;
  }

  async function pushData(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
    try {
      const result = await request('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      cloudAvailable = true;
      lastError = '';
      return result;
    } catch (e) {
      cloudAvailable = false;
      lastError = e.message || 'Não foi possível sincronizar';
      return { ok: false, error: lastError };
    }
  }

  async function session() { const r = await request('/api/auth'); return !!r?.ok; }

  async function login(password) {
    const result = await request('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    cloudAvailable = true;
    lastError = '';
    return result;
  }

  async function logout() { try { await request('/api/auth', { method: 'DELETE' }); } catch {} }

  async function pullMessages() {
    try {
      const result = await request('/api/messages');
      if (result.ok) {
        localStorage.setItem(MSG, JSON.stringify(result.messages || []));
        return result.messages || [];
      }
    } catch (e) { lastError = e.message || lastError; }
    try { return JSON.parse(localStorage.getItem(MSG) || '[]'); } catch { return []; }
  }

  async function addMessage(message) {
    try {
      const result = await request('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message) });
      if (result.ok) {
        const current = (() => { try { return JSON.parse(localStorage.getItem(MSG) || '[]'); } catch { return []; } })();
        current.unshift({ ...message, id: result.id });
        localStorage.setItem(MSG, JSON.stringify(current));
        return true;
      }
    } catch (e) { lastError = e.message || lastError; }
    return false;
  }

  async function markMessageRead(id, read=true) { try { const r=await request('/api/messages',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,read})}); return !!r.ok; } catch(e){ lastError=e.message||lastError; return false; } }

  async function clearMessages() {
    try { const r = await request('/api/messages', { method: 'DELETE' }); if (r.ok) localStorage.removeItem(MSG); return !!r.ok; } catch (e) { lastError = e.message || lastError; return false; }
  }

  async function checkCloud() {
    try { const r = await request('/api/health'); cloudAvailable = !!r.ok; lastError = ''; return r; }
    catch (e) { cloudAvailable = false; lastError = e.message || 'Cloudflare indisponível'; return { ok:false, error:lastError, d1:false, r2:false, tables:false, adminPassword:false }; }
  }

  window.TPCloud = {
    pullData, pushData, login, logout, session, pullMessages, addMessage, markMessageRead, clearMessages, checkCloud,
    isCloudAvailable: () => cloudAvailable,
    lastError: () => lastError
  };
})();
