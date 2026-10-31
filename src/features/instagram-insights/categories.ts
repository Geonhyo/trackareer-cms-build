import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import type { MediaCategory } from './insights-types';

/** 카테고리 목록 (기본 · 추가한 순, 기타는 맨 뒤). 필터 · 수정 select가 쓴다 */
export async function listCategories(): Promise<MediaCategory[]> {
  const { items } = await adminApi<Schemas['AdminInstagramMediaCategoryListResponseDto']>(
    '/admin/instagram/media-categories',
  );
  return items;
}
