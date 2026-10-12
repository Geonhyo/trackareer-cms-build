'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminApi } from '@/shared/api/admin-api';
import { toActionError, type ActionResult } from '@/shared/api/errors';
import type { Schemas } from '@/shared/api/types';
import { fromKstInputValue } from '@/shared/lib/format';

/** 새 공지(id null) 또는 수정 */
export async function saveNoticeAction(
  id: number | null,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const body = {
    title: String(formData.get('title') ?? '').trim(),
    body: String(formData.get('body') ?? ''),
    isImportant: formData.get('isImportant') === 'on',
    showAsModal: formData.get('showAsModal') === 'on',
    allowDismissForever: formData.get('allowDismissForever') === 'on',
    startsAt: fromKstInputValue(formData.get('startsAt')) ?? new Date().toISOString(),
    endsAt: fromKstInputValue(formData.get('endsAt')),
  };
  let saved: Schemas['AdminNoticeDto'];
  try {
    const result = await adminApi<Schemas['AdminNoticeResponseDto']>(
      id ? `/admin/notices/${id}` : '/admin/notices',
      { method: id ? 'PATCH' : 'POST', body },
    );
    saved = result.item;
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath('/notices');
  if (!id) redirect(`/notices/${saved.id}`);
  revalidatePath(`/notices/${id}`);
  return { ok: true, data: undefined, message: '저장했어요.' };
}

/** 지금 내리기 (지우지 않고 종료 시각을 지금으로) */
export async function endNoticeAction(id: number): Promise<ActionResult> {
  try {
    await adminApi(`/admin/notices/${id}`, {
      method: 'PATCH',
      body: { endsAt: new Date().toISOString() },
    });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath('/notices');
  revalidatePath(`/notices/${id}`);
  return { ok: true, data: undefined, message: '내렸어요. 앱 공지 목록과 모달에서 빠져요.' };
}
