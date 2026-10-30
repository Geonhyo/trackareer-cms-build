'use server';

import { revalidatePath } from 'next/cache';
import { adminApi } from '@/shared/api/admin-api';
import { toActionError, type ActionResult } from '@/shared/api/errors';
import type { Schemas } from '@/shared/api/types';
import { AUTO_CATEGORY } from './insights-types';

/**
 * 게시물 상세의 유형 · 카테고리 · 메모. 지금과 같은 카테고리는 서버가 그대로 두고(자동 분류 유지),
 * '자동 분류로 되돌리기'는 null로 보낸다
 */
export async function updateMediaAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const category = String(formData.get('categoryId') ?? '');
  try {
    await adminApi(`/admin/instagram/media/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: {
        productType: String(formData.get('productType') ?? ''),
        categoryId: category === AUTO_CATEGORY ? null : Number(category),
        memo: String(formData.get('memo') ?? '').trim() || null,
      },
    });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath('/instagram-insights', 'layout');
  return { ok: true, data: undefined, message: '저장했어요.' };
}

/** 카테고리 추가(id null) · 이름 변경 */
export async function saveCategoryAction(
  id: number | null,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await adminApi(
      id ? `/admin/instagram/media-categories/${id}` : '/admin/instagram/media-categories',
      { method: id ? 'PATCH' : 'POST', body: { name: String(formData.get('name') ?? '').trim() } },
    );
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath('/instagram-insights', 'layout');
  return { ok: true, data: undefined, message: id ? '이름을 바꿨어요.' : '추가했어요.' };
}

/** 추가한 카테고리 삭제. 그 게시물은 서버가 자동 분류로 되돌린다 */
export async function deleteCategoryAction(id: number): Promise<ActionResult> {
  try {
    await adminApi(`/admin/instagram/media-categories/${id}`, { method: 'DELETE' });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath('/instagram-insights', 'layout');
  return { ok: true, data: undefined };
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
