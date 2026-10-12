'use server';

import { revalidatePath } from 'next/cache';
import { adminApi } from '@/shared/api/admin-api';
import { ApiError, toActionError, type ActionResult } from '@/shared/api/errors';
import type { Schemas } from '@/shared/api/types';

const text = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();

function done(message: string): ActionResult {
  revalidatePath('/test-accounts');
  return { ok: true, data: undefined, message };
}

export async function createTestAccountAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await adminApi('/admin/test-accounts', {
      method: 'POST',
      body: {
        email: text(formData, 'email'),
        accountType: text(formData, 'accountType'),
        password: String(formData.get('password') ?? ''),
      },
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === 'EMAIL_IN_USE') {
      return {
        ok: false,
        error: '이미 가입된 이메일이에요. 아래 "기존 회원 바꾸기"로 바꿔 주세요.',
      };
    }
    return toActionError(error);
  }
  return done('만들었어요. 앱 로고를 5번 눌러 이 이메일 · 비밀번호로 들어가요.');
}

/** 기존 회원을 이메일로 찾아 테스트 · 심사 계정으로 */
export async function convertAccountAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = text(formData, 'email').toLowerCase();
  const password = String(formData.get('password') ?? '');
  try {
    const found = await adminApi<Schemas['AdminUserListResponseDto']>('/admin/users', {
      query: { q: email, includeInternal: true, limit: 10 },
    });
    const user = found.items.find((item) => item.email.toLowerCase() === email);
    if (!user) {
      return { ok: false, error: '그 이메일의 회원이 없어요. (탈퇴 대기 회원은 상태 필터로 확인)' };
    }
    await adminApi(`/admin/test-accounts/${user.id}`, {
      method: 'PATCH',
      body: {
        accountType: text(formData, 'accountType'),
        ...(password ? { password } : {}),
        confirmSocial: formData.get('confirmSocial') === 'on',
      },
    });
  } catch (error) {
    return toActionError(error);
  }
  return done('바꿨어요.');
}

export async function updateTestAccountAction(
  userId: number,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const password = String(formData.get('password') ?? '');
  try {
    await adminApi(`/admin/test-accounts/${userId}`, {
      method: 'PATCH',
      body: {
        accountType: text(formData, 'accountType'),
        ...(password ? { password } : {}),
        // 목록에서 고치는 것은 이미 테스트 · 심사로 확인된 계정이다
        confirmSocial: true,
      },
    });
  } catch (error) {
    return toActionError(error);
  }
  return done(password ? '바꿨어요. 이 계정의 기존 로그인은 끊겼어요.' : '바꿨어요.');
}

export async function reseedPostingsAction(userId: number): Promise<ActionResult> {
  try {
    const result = await adminApi<Schemas['AdminReseedPostingsResponseDto']>(
      `/admin/test-accounts/${userId}/demo-postings`,
      { method: 'POST' },
    );
    return done(`오늘 기준 목업 공고 ${result.postingCount}개로 다시 채웠어요.`);
  } catch (error) {
    return toActionError(error);
  }
}
