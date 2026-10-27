'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/DataTable';
import type { Schemas } from '@/shared/api/types';
import { formatNumber, formatPercent } from '@/shared/lib/format';
import { MEDIA_CATEGORY_LABEL, label } from '@/shared/lib/labels';
import { formatRate } from './insights-types';

type Stat = Schemas['AdminInstagramCategoryStatDto'];

const columns: ColumnDef<Stat, unknown>[] = [
  { header: '카테고리', cell: ({ row }) => label(MEDIA_CATEGORY_LABEL, row.original.category) },
  {
    header: '게시물',
    cell: ({ row }) => formatNumber(row.original.mediaCount),
    meta: { align: 'right' },
  },
  {
    header: '도달 중앙값',
    cell: ({ row }) => formatNumber(row.original.reachMedian),
    meta: { align: 'right' },
  },
  {
    header: '저장률',
    cell: ({ row }) => formatRate(row.original.saveRateMedian),
    meta: { align: 'right' },
  },
  {
    header: '공유율',
    cell: ({ row }) => formatRate(row.original.shareRateMedian),
    meta: { align: 'right' },
  },
  {
    header: '팔로우 전환율',
    cell: ({ row }) => formatRate(row.original.followRateMedian),
    meta: { align: 'right' },
  },
  {
    header: '팔로우 평균',
    cell: ({ row }) => formatNumber(row.original.followsAvg),
    meta: { align: 'right' },
  },
  {
    header: '팔로우 비중',
    cell: ({ row }) => formatPercent(row.original.followsShare, 0),
    meta: { align: 'right' },
  },
];

export function CategoriesTable({ items }: { items: Stat[] }) {
  return <DataTable columns={columns} data={items} />;
}
