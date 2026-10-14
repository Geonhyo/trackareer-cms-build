'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/ui/DataTable';
import type { Schemas } from '@/shared/api/types';
import { formatDateTime, formatNumber } from '@/shared/lib/format';

type Campaign = Schemas['PushCampaignItemDto'];

const STATUS: Record<string, { text: string; tone: 'brand' | 'positive' | 'critical' }> = {
  SENDING: { text: '보내는 중', tone: 'brand' },
  SENT: { text: '보냄', tone: 'positive' },
  FAILED: { text: '실패', tone: 'critical' },
};

const columns: ColumnDef<Campaign, unknown>[] = [
  {
    header: '상태',
    cell: ({ row }) => {
      const status = STATUS[row.original.status];
      return <Badge tone={status?.tone}>{status?.text ?? row.original.status}</Badge>;
    },
    size: 80,
  },
  {
    header: '종류',
    cell: ({ row }) => (row.original.kind === 'MARKETING' ? '광고' : '공지'),
    size: 64,
  },
  {
    header: '내용',
    meta: { wrap: true },
    cell: ({ row }) => (
      <>
        <strong>{row.original.title}</strong>
        <div style={{ color: 'var(--fg-muted)' }}>{row.original.body}</div>
      </>
    ),
  },
  {
    header: '대상',
    cell: ({ row }) => formatNumber(row.original.targetCount),
    meta: { align: 'right' },
  },
  {
    header: '성공',
    cell: ({ row }) => formatNumber(row.original.successCount),
    meta: { align: 'right' },
  },
  {
    header: '실패',
    cell: ({ row }) => formatNumber(row.original.failCount),
    meta: { align: 'right' },
  },
  { header: '보낸 시각', cell: ({ row }) => formatDateTime(row.original.createdAt), size: 160 },
];

export function PushHistory({ campaigns }: { campaigns: Campaign[] }) {
  return <DataTable columns={columns} data={campaigns} empty="보낸 푸시가 없어요." />;
}
