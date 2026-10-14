import type { AdminLoginResponse } from '@/shared/api/types';
import type { SessionAdmin } from './cookies';

type Refreshed = { tokens: { accessToken: string; refreshToken: string }; admin: SessionAdmin };

// 서버는 갱신 토큰을 회전시킨다(한 번 쓰면 끝). 한 화면이 요청을 동시에 여러 개 보내도
// 갱신은 한 번만 하고 같은 결과를 나눠 쓴다. 늦게 온 요청도 받을 수 있게 잠깐 남겨 둔다.
const SHARE_MS = 15_000;
const inflight = new Map<string, Promise<Refreshed | null>>();

export function refreshSession(refreshToken: string, email: string): Promise<Refreshed | null> {
  const shared = inflight.get(refreshToken);
  if (shared) return shared;

  const promise = requestRefresh(refreshToken, email);
  inflight.set(refreshToken, promise);
  setTimeout(() => inflight.delete(refreshToken), SHARE_MS);
  return promise;
}

async function requestRefresh(refreshToken: string, email: string): Promise<Refreshed | null> {
  const baseUrl = process.env.ADMIN_API_URL?.replace(/\/$/, '');
  if (!baseUrl) return null;
  try {
    const response = await fetch(`${baseUrl}/admin/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const body = (await response.json()) as AdminLoginResponse;
    return {
      tokens: { accessToken: body.accessToken, refreshToken: body.refreshToken },
      admin: { ...body.admin, email },
    };
  } catch {
    return null;
  }
}
