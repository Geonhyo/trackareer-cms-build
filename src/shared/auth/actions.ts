'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminApi, callAdminApi } from '@/shared/api/admin-api';
import { toActionError, type ActionResult } from '@/shared/api/errors';
import type { AdminLoginResponse } from '@/shared/api/types';
import { toSafeNext } from '@/shared/lib/safe-next';
import {
  ACCESS_COOKIE,
  ADMIN_COOKIE,
  REFRESH_COOKIE,
  parseAdminCookie,
  sessionCookies,
} from './cookies';

async function login(email: string, password: string): Promise<AdminLoginResponse> {
  const result = await callAdminApi<AdminLoginResponse>('/admin/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  const store = await cookies();
  for (const cookie of sessionCookies(result, { ...result.admin, email })) {
    store.set(cookie.name, cookie.value, cookie.options);
  }
  return result;
}

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) {
    return { ok: false, error: '이메일과 비밀번호를 입력해 주세요.' };
  }
  let result: AdminLoginResponse;
  try {
    result = await login(email, password);
  } catch (error) {
    return toActionError(error);
  }
  redirect(result.admin.mustChangePassword ? '/password-change' : toSafeNext(formData.get('next')));
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    // 서버 세션을 끊지 못해도 이 브라우저의 쿠키는 지운다
    await adminApi('/admin/auth/logout', { method: 'POST', body: { refreshToken } }).catch(
      () => undefined,
    );
  }
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, ADMIN_COOKIE]) {
    store.delete(name);
  }
  redirect('/login');
}

export async function changePasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const currentPassword = String(formData.get('currentPassword') ?? '');
  const newPassword = String(formData.get('newPassword') ?? '');
  const confirm = String(formData.get('confirmPassword') ?? '');
  if (newPassword !== confirm) {
    return { ok: false, error: '새 비밀번호가 서로 달라요.' };
  }
  const admin = parseAdminCookie((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!admin) {
    redirect('/login');
  }
  try {
    await adminApi('/admin/auth/password', {
      method: 'PATCH',
      body: { currentPassword, newPassword },
    });
    // 서버가 비밀번호를 바꾸면서 기존 세션을 끊는다 → 새 비밀번호로 다시 로그인해 쿠키를 바꾼다
    await login(admin.email, newPassword);
  } catch (error) {
    return toActionError(error);
  }
  redirect('/');
}
