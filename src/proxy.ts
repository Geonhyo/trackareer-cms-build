import { NextResponse, type NextRequest } from 'next/server';
import {
  ACCESS_COOKIE,
  ADMIN_COOKIE,
  REFRESH_COOKIE,
  parseAdminCookie,
  sessionCookies,
  tokenExpiresAt,
} from '@/shared/auth/cookies';
import { refreshSession } from '@/shared/auth/refresh';

// 접근 토큰이 이만큼 안 남았으면 미리 갱신한다 (화면이 그리는 도중에 끝나지 않게)
const REFRESH_BEFORE_SECONDS = 120;
const LOGIN_PATH = '/login';
const PASSWORD_PATH = '/password-change';

/**
 * 모든 화면 요청 앞에서: 로그인 확인 → 접근 토큰 갱신 → 비밀번호 변경 강제.
 * 갱신한 토큰은 이번 요청(서버 컴포넌트 · 서버 액션)에도 바로 쓰이게 요청 쿠키에도 넣는다.
 * 권한 검사는 서버 API가 한다 (여기는 이동만 정한다).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let admin = parseAdminCookie(request.cookies.get(ADMIN_COOKIE)?.value);

  if (!refreshToken || !admin) {
    return pathname === LOGIN_PATH ? NextResponse.next() : toLogin(request);
  }
  if (pathname === LOGIN_PATH) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  let refreshed: ReturnType<typeof sessionCookies> | null = null;
  if (needsRefresh(request.cookies.get(ACCESS_COOKIE)?.value)) {
    const result = await refreshSession(refreshToken, admin.email);
    if (!result) {
      return toLogin(request);
    }
    admin = result.admin;
    refreshed = sessionCookies(result.tokens, result.admin);
    for (const cookie of refreshed) {
      request.cookies.set(cookie.name, cookie.value);
    }
  }

  const response =
    admin.mustChangePassword && pathname !== PASSWORD_PATH
      ? NextResponse.redirect(new URL(PASSWORD_PATH, request.url))
      : NextResponse.next({ request: { headers: request.headers } });
  for (const cookie of refreshed ?? []) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}

function needsRefresh(accessToken: string | undefined): boolean {
  const expiresAt = accessToken ? tokenExpiresAt(accessToken) : null;
  return expiresAt === null || expiresAt - Date.now() / 1000 < REFRESH_BEFORE_SECONDS;
}

function toLogin(request: NextRequest): NextResponse {
  const url = new URL(LOGIN_PATH, request.url);
  const { pathname, search } = request.nextUrl;
  if (pathname !== '/') {
    url.searchParams.set('next', `${pathname}${search}`);
  }
  const response = NextResponse.redirect(url);
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, ADMIN_COOKIE]) {
    response.cookies.delete(name);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|brand/|fonts/).*)'],
};
