import { handleApi } from './api.js';

function securityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    try {
      const api = await handleApi(request, env);
      if (api) return securityHeaders(api);

      const response = await env.ASSETS.fetch(request);
      return securityHeaders(response);
    } catch (error) {
      console.error('Telmo Partilhas Worker error:', error);
      return new Response('Erro interno. Tenta novamente.', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }
  }
};
