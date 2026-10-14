import type { AdminSummary } from '@/shared/api/types';

/**
 * 인증 쿠키. 모두 httpOnly라 브라우저 JS는 읽지 못하고, Next 서버(proxy · 서버 컴포넌트 · 서버 액션)만 쓴다.
 * - 접근 토큰: 서버 API 호출용 (30분)
 * - 갱신 토큰: 접근 토큰이 끝나 가면 proxy가 새로 받는다 (7일, 서버가 회전시킨다)
 * - 관리자 요약: 이름 · 권한 · 비밀번호 변경 필요 여부 (화면 표시와 이동 판단용, 권한 검사는 서버가 한다)
 */
export const ACCESS_COOKIE = 'cms_at';
export const REFRESH_COOKIE = 'cms_rt';
export const ADMIN_COOKIE = 'cms_admin';

const ACCESS_MAX_AGE = 30 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

export type SessionAdmin = AdminSummary & { email: string };

type CookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
};

const base = (maxAge: number): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge,
});

/**
 * 로그인 · 갱신 응답을 쿠키로. refreshToken이 null이면(서버 30초 유예 — 같은 토큰으로 다른 요청이
 * 먼저 갱신했다) 갱신 토큰 쿠키는 건드리지 않는다. 먼저 끝난 응답이 새 토큰을 넣는다
 */
export function sessionCookies(
  tokens: { accessToken: string; refreshToken: string | null },
  admin: SessionAdmin,
): Array<{ name: string; value: string; options: CookieOptions }> {
  const cookies = [
    { name: ACCESS_COOKIE, value: tokens.accessToken, options: base(ACCESS_MAX_AGE) },
    { name: ADMIN_COOKIE, value: JSON.stringify(admin), options: base(REFRESH_MAX_AGE) },
  ];
  if (tokens.refreshToken) {
    cookies.push({
      name: REFRESH_COOKIE,
      value: tokens.refreshToken,
      options: base(REFRESH_MAX_AGE),
    });
  }
  return cookies;
}

export function parseAdminCookie(value: string | undefined): SessionAdmin | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as SessionAdmin;
  } catch {
    return null;
  }
}

/** JWT exp(초). 서명은 서버가 검증하고 여기서는 만료 시각만 본다 */
export function tokenExpiresAt(token: string): number | null {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: number;
    };
    return typeof json.exp === 'number' ? json.exp : null;
  } catch {
    return null;
  }
}
