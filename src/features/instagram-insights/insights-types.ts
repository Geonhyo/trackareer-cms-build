import type { Schemas } from '@/shared/api/types';
import { formatPercent } from '@/shared/lib/format';

export type MediaItem = Schemas['AdminInstagramMediaItemDto'];
export type MediaCategory = Schemas['AdminInstagramMediaCategoryDto'];

export const BASIS_LABEL: Record<string, string> = {
  d1: '1일',
  d3: '3일',
  d7: '7일',
  final: '최종',
};

// 카테고리 select의 '자동 분류로 되돌리기' 값 (서버에는 null로 보낸다)
export const AUTO_CATEGORY = '__auto';

/** 비율 0~1 → 1.23% (도달이 0이거나 값이 없으면 '—') */
export const formatRate = (ratio: number | null | undefined) => formatPercent(ratio, 2);

/** 도달 1,000명당 몇 명 · 몇 개 (전환율 소수점이 작아 읽기 어려워서) */
export const perThousand = (ratio: number | null | undefined) =>
  ratio === null || ratio === undefined ? '—' : (ratio * 1000).toFixed(1);
