import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminApiUrl } from '@/shared/config/env';
import { ACCESS_COOKIE } from '@/shared/auth/cookies';
import { ApiError } from './errors';

type Query = Record<string, string | number | boolean | undefined | null>;

export function toQueryString(query?: Query): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  const text = params.toString();
  return text ? `?${text}` : '';
}

/** 서버 API 호출 (토큰 없이). 로그인 · 갱신용 */
export async function callAdminApi<T>(
  path: string,
  init: { method?: string; body?: unknown; token?: string; query?: Query } = {},
): Promise<T> {
  const response = await fetch(`${getAdminApiUrl()}${path}${toQueryString(init.query)}`, {
    method: init.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      ...(init.token ? { authorization: `Bearer ${init.token}` } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
  });
  if (response.status === 204) {
    return undefined as T;
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const { code, message } = (body ?? {}) as { code?: string; message?: string | string[] };
    throw new ApiError(
      response.status,
      code ?? null,
      (Array.isArray(message) ? message[0] : message) ?? `요청 실패 (${response.status})`,
      body,
    );
  }
  return body as T;
}

/**
 * 로그인한 관리자로 서버 API를 부른다 (서버 컴포넌트 · 서버 액션 전용).
 * 접근 토큰 갱신은 proxy가 요청 앞에서 끝내 두므로, 여기서 401이면 세션이 끝난 것이다.
 */
export async function adminApi<T>(
  path: string,
  init: { method?: string; body?: unknown; query?: Query } = {},
): Promise<T> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) {
    redirect('/login');
  }
  try {
    return await callAdminApi<T>(path, { ...init, token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login');
    }
    if (error instanceof ApiError && error.code === 'PASSWORD_CHANGE_REQUIRED') {
      redirect('/password-change');
    }
    throw error;
  }
}
