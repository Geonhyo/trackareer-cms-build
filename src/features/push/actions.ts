'use server';

import { revalidatePath } from 'next/cache';
import { adminApi } from '@/shared/api/admin-api';
import { toActionError, type ActionResult } from '@/shared/api/errors';
import type { Schemas } from '@/shared/api/types';

export type PushInput = {
  kind: 'NOTICE' | 'MARKETING';
  title: string;
  body: string;
  noticeId?: number;
};

const toBody = (input: PushInput) => ({
  kind: input.kind,
  title: input.title.trim(),
  body: input.body.trim(),
  // 공지 연결은 공지 푸시에만
  ...(input.kind === 'NOTICE' && input.noticeId ? { noticeId: input.noticeId } : {}),
});

export async function previewPushAction(
  input: PushInput,
): Promise<ActionResult<Schemas['PushPreviewResponseDto']>> {
  try {
    const data = await adminApi<Schemas['PushPreviewResponseDto']>('/admin/push/preview', {
      method: 'POST',
      body: toBody(input),
    });
    return { ok: true, data };
  } catch (error) {
    return toActionError(error);
  }
}

export async function sendPushAction(
  input: PushInput,
): Promise<ActionResult<Schemas['SendPushResponseDto']>> {
  try {
    const data = await adminApi<Schemas['SendPushResponseDto']>('/admin/push', {
      method: 'POST',
      body: toBody(input),
    });
    revalidatePath('/push');
    return {
      ok: true,
      data,
      message: data.duplicate
        ? '오늘 같은 내용으로 이미 보냈어요. 다시 보내지 않았어요.'
        : `보냈어요. 성공 ${data.item.successCount} · 실패 ${data.item.failCount}`,
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function testPushAction(
  input: PushInput,
  email: string,
): Promise<ActionResult<Schemas['SendPushTestResponseDto']>> {
  try {
    const { kind, title, body } = toBody(input);
    const data = await adminApi<Schemas['SendPushTestResponseDto']>('/admin/push/test', {
      method: 'POST',
      body: { kind, title, body, email: email.trim() },
    });
    return { ok: true, data };
  } catch (error) {
    return toActionError(error);
  }
}
