import type { AdminRefreshResponse } from '@/shared/api/types';
import type { SessionAdmin } from './cookies';

type Refreshed = {
  tokens: Pick<AdminRefreshResponse, 'accessToken' | 'refreshToken'>;
  admin: SessionAdmin;
};

/**
 * 접근 토큰 갱신. 서버가 갱신 토큰을 회전시키고, 같은 토큰으로 겹친 요청(인스턴스가 달라도)은
 * 서버가 앞 토큰을 30초 받아 접근 토큰만 준다(refreshToken null → 갱신 토큰 쿠키는 그대로).
 */
export async function refreshSession(
  refreshToken: string,
  email: string,
): Promise<Refreshed | null> {
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
    const body = (await response.json()) as AdminRefreshResponse;
    return {
      tokens: { accessToken: body.accessToken, refreshToken: body.refreshToken },
      admin: { ...body.admin, email },
    };
  } catch {
    return null;
  }
}
