// REST fetch utility — sends credentials (HTTP-only cookie auth).

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function restRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const { headers, ...rest } = init;

  const res = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    },
    ...rest,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const json = await res.json();
      message = json.message ?? json.error ?? message;
    } catch {
      // non-JSON error body — keep statusText
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}
