import { json } from './_utils.js';
export async function onRequestGet({ request, env }) {
  if (!env.MEDIA) return json({ ok: false, error: 'R2 não está ligado.' }, 503);
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!key) return json({ ok: false, error: 'Key em falta.' }, 400);
  const object = await env.MEDIA.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}
