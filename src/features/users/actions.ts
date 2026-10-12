'use server';

import { revalidatePath } from 'next/cache';
import { adminApi } from '@/shared/api/admin-api';
import { toActionError, type ActionResult } from '@/shared/api/errors';

export async function setUserInternalAction(
  userId: number,
  isInternal: boolean,
): Promise<ActionResult> {
  try {
    await adminApi(`/admin/users/${userId}/internal`, { method: 'PATCH', body: { isInternal } });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath(`/users/${userId}`);
  return { ok: true, data: undefined };
}

export async function restoreUserAction(userId: number): Promise<ActionResult> {
  try {
    await adminApi(`/admin/users/${userId}/restore`, { method: 'POST' });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath(`/users/${userId}`);
  return { ok: true, data: undefined, message: '복구했어요.' };
}
