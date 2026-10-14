'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminApi } from '@/shared/api/admin-api';
import { toActionError, type ActionResult } from '@/shared/api/errors';
import type { Schemas } from '@/shared/api/types';

/** 새 게시물(id null) 또는 수정 */
export async function saveInstagramDmPostAction(
  id: number | null,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const text = (name: string) => String(formData.get(name) ?? '').trim();
  const body = {
    title: text('title'),
    postUrl: text('postUrl'),
    keyword: text('keyword') || null,
    message: text('message'),
    linkUrl: text('linkUrl'),
    buttonLabel: text('buttonLabel') || null,
    isActive: formData.get('isActive') === 'on',
  };
  let saved: Schemas['AdminInstagramDmPostDto'];
  try {
    const result = await adminApi<Schemas['AdminInstagramDmPostResponseDto']>(
      id ? `/admin/instagram-dm/posts/${id}` : '/admin/instagram-dm/posts',
      { method: id ? 'PATCH' : 'POST', body },
    );
    saved = result.item;
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath('/instagram-dm');
  if (!id) redirect(`/instagram-dm/${saved.id}`);
  revalidatePath(`/instagram-dm/${id}`);
  return { ok: true, data: undefined, message: '저장했어요. 다음 댓글부터 바로 적용돼요.' };
}

export async function deleteInstagramDmPostAction(id: number): Promise<ActionResult> {
  try {
    await adminApi(`/admin/instagram-dm/posts/${id}`, { method: 'DELETE' });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath('/instagram-dm');
  redirect('/instagram-dm');
}
