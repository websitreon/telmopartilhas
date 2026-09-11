import { json, isAdmin } from './_utils.js';

function safeExt(name, type) {
  const byType = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };
  const ext = byType[type] || String(name || '').split('.').pop()?.toLowerCase();
  return /^[a-z0-9]{2,5}$/.test(ext || '') ? ext : 'jpg';
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false, error: 'Não autorizado.' }, 401);
  if (!env.MEDIA) return json({ ok: false, error: 'R2 não está ligado. Adiciona o bucket MEDIA no wrangler.toml.' }, 503);
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json({ ok: false, error: 'Ficheiro em falta.' }, 400);
  if (!String(file.type).startsWith('image/')) return json({ ok: false, error: 'Apenas imagens são permitidas.' }, 400);
  if (file.size > 15 * 1024 * 1024) return json({ ok: false, error: 'A imagem ultrapassa 15 MB.' }, 413);
  const ext = safeExt(file.name, file.type);
  const key = `uploads/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;
  await env.MEDIA.put(key, file.stream(), { httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' } });
  return json({ ok: true, key, url: `/api/media?key=${encodeURIComponent(key)}` });
}
