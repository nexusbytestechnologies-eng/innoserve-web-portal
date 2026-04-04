import { env } from '$env/dynamic/private';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();

  const backendRes = await fetch(`${env.PRIVATE_API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  const text = await backendRes.text();
  return new Response(text, {
    status: backendRes.status,
    headers: { 'Content-Type': backendRes.headers.get('Content-Type') ?? 'application/json' },
  });
};
