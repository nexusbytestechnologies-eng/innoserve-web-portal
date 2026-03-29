import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch }) => {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) {
      throw redirect(302, '/');
    }

    const data = await res.json();
    const user = data?.user ?? data;

    if (user?.role !== 'national_head') {
      throw redirect(302, '/');
    }

    return { user };
  } catch {
    throw redirect(302, '/');
  }
};
