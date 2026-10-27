'use server';

import { revalidatePath } from 'next/cache';
import { adminApi } from '@/shared/api/admin-api';
import { toActionError, type ActionResult } from '@/shared/api/errors';
import type { Schemas } from '@/shared/api/types';
import { AUTO_CATEGORY } from './insights-types';

/** 카테고리 · 메모. 카테고리를 '자동 분류로 되돌리기'로 고르면 null을 보내 서버가 다시 분류한다 */
export async function updateMediaAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const category = String(formData.get('category') ?? '');
  try {
    await adminApi(`/admin/instagram/media/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: {
        category: category === AUTO_CATEGORY ? null : category,
        memo: String(formData.get('memo') ?? '').trim() || null,
      },
    });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath(`/instagram-insights/${id}`);
  revalidatePath('/instagram-insights');
  return { ok: true, data: undefined, message: '저장했어요.' };
}

/** 수집 배치를 지금 한 번 (최고관리자). 첫 실행은 전체 게시물을 등록한다 */
export async function syncInsightsAction(): Promise<ActionResult> {
  let result: Schemas['AdminInstagramSyncResponseDto'];
  try {
    result = await adminApi<Schemas['AdminInstagramSyncResponseDto']>('/admin/instagram/sync', {
      method: 'POST',
    });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath('/instagram-insights', 'layout');
  return {
    ok: true,
    data: undefined,
    message: `수집했어요. 새 게시물 ${result.newMedia}개 · 스냅샷 ${result.snapshots}개${result.failed ? ` · 실패 ${result.failed}개` : ''}`,
  };
}
