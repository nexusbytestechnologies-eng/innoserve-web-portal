import type { Handle } from '@sveltejs/kit';

const RAILWAY_BASE = 'https://innoserve-web-api-production.up.railway.app';

// Paths that should be proxied to the Railway backend.
// /api/otp/* is intentionally excluded — those are SvelteKit server routes.
function shouldProxy(pathname: string): boolean {
  if (pathname === '/graphql') return true;
  if (pathname === '/upload') return true;
  if (pathname.startsWith('/file/')) return true;
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/otp/')) return true;
  return false;
}

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname, search } = event.url;

  if (shouldProxy(pathname)) {
    const target = `${RAILWAY_BASE}${pathname}${search}`;

    const proxyHeaders = new Headers(event.request.headers);
    proxyHeaders.delete('host');

    const response = await fetch(target, {
      method: event.request.method,
      headers: proxyHeaders,
      body: ['GET', 'HEAD'].includes(event.request.method)
        ? undefined
        : event.request.body,
      // @ts-expect-error — Node 18+ streams need duplex hint
      duplex: 'half',
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  return resolve(event);
};
