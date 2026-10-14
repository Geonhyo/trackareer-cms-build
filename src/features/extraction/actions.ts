'use server';

import { revalidatePath } from 'next/cache';
import { adminApi } from '@/shared/api/admin-api';
import { toActionError, type ActionResult } from '@/shared/api/errors';

const done = (message: string): ActionResult => {
  revalidatePath('/extraction');
  return { ok: true, data: undefined, message };
};

export async function blockDomainAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const domain = String(formData.get('domain') ?? '').trim();
  const reason = String(formData.get('reason') ?? '').trim();
  try {
    await adminApi('/admin/extraction/blocked-domains', {
      method: 'POST',
      body: { domain, ...(reason ? { reason } : {}) },
    });
  } catch (error) {
    return toActionError(error);
  }
  return done('막았어요. 다음 요청부터 스크래퍼를 부르지 않아요.');
}

export async function blockDomainQuickAction(domain: string): Promise<ActionResult> {
  try {
    await adminApi('/admin/extraction/blocked-domains', { method: 'POST', body: { domain } });
  } catch (error) {
    return toActionError(error);
  }
  return done('막았어요.');
}

export async function unblockDomainAction(domain: string): Promise<ActionResult> {
  try {
    await adminApi(`/admin/extraction/blocked-domains/${encodeURIComponent(domain)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return toActionError(error);
  }
  return done('풀었어요.');
}

export async function refreshExtractionAction(id: number): Promise<ActionResult> {
  try {
    await adminApi(`/admin/extraction/results/${id}/refresh`, { method: 'POST' });
  } catch (error) {
    return toActionError(error);
  }
  return done('다음 요청에서 다시 추출해요.');
}
