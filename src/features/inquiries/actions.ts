'use server';

import { revalidatePath } from 'next/cache';
import { adminApi } from '@/shared/api/admin-api';
import { toActionError, type ActionResult } from '@/shared/api/errors';

export async function replyInquiryAction(
  inquiryId: number,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const content = String(formData.get('content') ?? '').trim();
  if (!content) {
    return { ok: false, error: '답변을 입력해 주세요.' };
  }
  try {
    await adminApi(`/admin/inquiries/${inquiryId}/reply`, { method: 'POST', body: { content } });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath(`/inquiries/${inquiryId}`);
  revalidatePath('/inquiries');
  return { ok: true, data: undefined, message: '답변을 보냈어요. 앱 알림으로도 전해져요.' };
}
