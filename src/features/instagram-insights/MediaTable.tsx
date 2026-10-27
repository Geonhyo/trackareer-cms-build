'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/ui/DataTable';
import { formatDate, formatNumber } from '@/shared/lib/format';
import { MEDIA_CATEGORY_LABEL, MEDIA_PRODUCT_LABEL, label } from '@/shared/lib/labels';
import { followRateTone, formatRate, type MediaListItem } from './insights-types';
import { Thumbnail } from './Thumbnail';
import styles from './insights.module.css';

const columns: ColumnDef<MediaListItem, unknown>[] = [
  {
    header: '',
    id: 'thumb',
    cell: ({ row }) => <Thumbnail src={row.original.thumbnailUrl} size={40} />,
    size: 56,
  },
  {
    header: '제목',
    meta: { wrap: true },
    cell: ({ row }) => (
      <span className={styles.title}>
        {row.original.title || '(캡션 없음)'}
        {row.original.lastError && <Badge tone="warning">수집 실패</Badge>}
      </span>
    ),
  },
  { header: '게시일', cell: ({ row }) => formatDate(row.original.postedAt), size: 104 },
  {
    header: '유형',
    cell: ({ row }) => label(MEDIA_PRODUCT_LABEL, row.original.productType),
    size: 96,
  },
  {
    header: '카테고리',
    cell: ({ row }) => (
      <span className={styles.title}>
        {label(MEDIA_CATEGORY_LABEL, row.original.category)}
        {row.original.categorySource === 'MANUAL' && <Badge tone="brand">수동</Badge>}
      </span>
    ),
    size: 160,
  },
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
  {
    header: '도달',
    cell: ({ row }) => formatNumber(row.original.metrics?.reach),
    meta: { align: 'right' },
    size: 80,
  },
  {
    header: '저장률',
    cell: ({ row }) => formatRate(row.original.rates.saveRate),
    meta: { align: 'right' },
    size: 80,
  },
  {
    header: '공유율',
    cell: ({ row }) => formatRate(row.original.rates.shareRate),
    meta: { align: 'right' },
    size: 80,
  },
  {
    header: '팔로우',
    cell: ({ row }) => formatNumber(row.original.metrics?.follows),
    meta: { align: 'right' },
    size: 72,
  },
  {
    header: '팔로우 전환율',
    cell: ({ row }) => {
      const { followRate } = row.original.rates;
      const tone = followRateTone(followRate, row.original.categoryFollowRateMedian);
      const median = `같은 카테고리 중앙값 ${formatRate(row.original.categoryFollowRateMedian)}`;
      return (
        <span title={median}>
          {tone ? <Badge tone={tone}>{formatRate(followRate)}</Badge> : formatRate(followRate)}
        </span>
      );
    },
    meta: { align: 'right' },
    size: 112,
  },
  {
    header: '첫 DM',
    cell: ({ row }) => formatNumber(row.original.dm?.firstDmCount),
    meta: { align: 'right' },
    size: 72,
  },
  {
    header: '링크 발송',
    cell: ({ row }) => formatNumber(row.original.dm?.linkSentCount),
    meta: { align: 'right' },
    size: 80,
  },
];

export function MediaTable({ items }: { items: MediaListItem[] }) {
  return (
    <DataTable
      columns={columns}
      data={items}
      rowHref={(item) => `/instagram-insights/${item.id}`}
      empty="조건에 맞는 게시물이 없어요. 아직 수집 전이면 최고관리자가 '지금 수집'을 눌러 주세요."
    />
  );
}
