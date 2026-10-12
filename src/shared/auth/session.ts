import 'server-only';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, parseAdminCookie, type SessionAdmin } from './cookies';

/** 지금 로그인한 관리자 (화면 표시용). proxy가 로그인을 확인한 뒤라 보통 있다 */
export async function getSessionAdmin(): Promise<SessionAdmin | null> {
  return parseAdminCookie((await cookies()).get(ADMIN_COOKIE)?.value);
}

export function isSuperAdmin(admin: SessionAdmin | null): boolean {
  return admin?.role === 'SUPER_ADMIN';
}
