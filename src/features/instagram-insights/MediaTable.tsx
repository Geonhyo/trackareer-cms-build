'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/ui/DataTable';
import { formatDate, formatNumber } from '@/shared/lib/format';
import { MEDIA_PRODUCT_LABEL, label } from '@/shared/lib/labels';
import { formatRate, type MediaItem } from './insights-types';
import { Thumbnail } from './Thumbnail';
import { SignalChips, VerdictBadge, verdictReason, type VerdictRules } from './verdict';
import styles from './insights.module.css';

const thumb: ColumnDef<MediaItem, unknown> = {
  header: '',
  id: 'thumb',
  cell: ({ row }) => <Thumbnail src={row.original.thumbnailUrl} size={40} />,
  size: 56,
};

const title: ColumnDef<MediaItem, unknown> = {
  header: '제목',
  meta: { wrap: true },
  cell: ({ row }) => (
    <span className={styles.title}>
      {row.original.title || '(캡션 없음)'}
      {row.original.lastError && <Badge tone="warning">수집 실패</Badge>}
    </span>
  ),
};

const category: ColumnDef<MediaItem, unknown> = {
  header: '카테고리',
  cell: ({ row }) => (
    <span className={styles.title}>
      {row.original.categoryName}
      {row.original.categorySource === 'MANUAL' && <Badge tone="brand">수동</Badge>}
    </span>
  ),
  size: 160,
};

const posted: ColumnDef<MediaItem, unknown> = {
  header: '게시일',
  cell: ({ row }) => formatDate(row.original.postedAt),
  size: 104,
};

const numeric = (
  header: string,
  value: (item: MediaItem) => string,
  size = 80,
): ColumnDef<MediaItem, unknown> => ({
  header,
  cell: ({ row }) => value(row.original),
  meta: { align: 'right' },
  size,
});

// 한눈에: 성적 · 이유 · 강점 약점
const glanceColumns = (rules: VerdictRules): ColumnDef<MediaItem, unknown>[] => [
  thumb,
  title,
  {
    header: '성적',
    cell: ({ row }) => <VerdictBadge verdict={row.original.verdict} />,
    size: 112,
  },
  {
    header: '이유',
    meta: { wrap: true },
    cell: ({ row }) => (
      <span className={styles.pickBody}>
        <span>{verdictReason(row.original, rules)}</span>
        <SignalChips verdict={row.original.verdict} />
      </span>
    ),
  },
  category,
  posted,
];

// 숫자로: 최신 누적값 · 비율 · DM
const numberColumns: ColumnDef<MediaItem, unknown>[] = [
  thumb,
  title,
  posted,
  {
    header: '유형',
    cell: ({ row }) => (
      <span className={styles.title}>
        {label(MEDIA_PRODUCT_LABEL, row.original.productType)}
        {row.original.productTypeManual && <Badge tone="brand">수동</Badge>}
      </span>
    ),
    size: 128,
  },
  category,
  {
    header: '경과일',
    cell: ({ row }) => (
      <span title={row.original.tracking ? '30일 안이라 매일 수집 중' : '수집 끝'}>
        {row.original.dayIndex ?? '—'}
        {row.original.tracking && <span className={styles.live}> ●</span>}
      </span>
    ),
    meta: { align: 'right' },
    size: 72,
  },
  numeric('도달', (item) => formatNumber(item.metrics?.reach)),
  numeric('저장률', (item) => formatRate(item.rates.saveRate)),
  numeric('공유율', (item) => formatRate(item.rates.shareRate)),
  numeric('팔로우 (인스타)', (item) => formatNumber(item.follows.post), 104),
  numeric('팔로우 (DM)', (item) => formatNumber(item.follows.dm), 96),
  numeric('팔로우 전환', (item) => formatRate(item.rates.followRate), 96),
  numeric('첫 DM', (item) => formatNumber(item.dm?.firstDmCount)),
  numeric('링크 발송', (item) => formatNumber(item.dm?.linkSentCount)),
];

export function MediaTable({
  items,
  view,
  rules,
}: {
  items: MediaItem[];
  view: 'glance' | 'numbers';
  rules: VerdictRules;
}) {
  const glance = useMemo(() => glanceColumns(rules), [rules]);
  return (
    <DataTable
      columns={view === 'numbers' ? numberColumns : glance}
      data={items}
      rowHref={(item) => `/instagram-insights/${item.id}`}
      empty="조건에 맞는 게시물이 없어요. 아직 수집 전이면 최고관리자가 '지금 수집'을 눌러 주세요."
    />
  );
}
