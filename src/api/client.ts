import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// One place for every call to the Hono backend.
// If the user is logged in, the Supabase token is sent automatically,
// so screens never handle tokens themselves (the website passes them around by hand).
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    // The backend's jsonError() responds with { error: "…" }.
    throw new ApiError(body?.error ?? `Request failed: ${path}`, response.status);
  }
  return body as T;
}
