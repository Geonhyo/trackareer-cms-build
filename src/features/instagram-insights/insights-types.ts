import type { Tone } from '@/components/ui';
import type { Schemas } from '@/shared/api/types';
import { formatPercent } from '@/shared/lib/format';

export type MediaItem = Schemas['AdminInstagramMediaItemDto'];
export type MediaListItem = Schemas['AdminInstagramMediaListItemDto'];
export type MediaCategory = Schemas['AdminInstagramMediaCategoryDto'];

export const INSIGHTS_DAYS = ['7', '30', '90', '365'] as const;
export const BASES = ['d1', 'd3', 'd7', 'final'] as const;
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

/** 팔로우 전환율이 같은 카테고리 중앙값보다 높으면 초록, 절반 미만이면 빨강 */
export function followRateTone(rate: number | null, median: number | null): Tone | null {
  if (rate === null || median === null || median === 0) return null;
  if (rate > median) return 'positive';
  if (rate < median / 2) return 'critical';
  return null;
}
