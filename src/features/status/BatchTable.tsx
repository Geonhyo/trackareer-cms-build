'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge, type Tone } from '@/components/ui';
import { DataTable } from '@/components/ui/DataTable';
import type { Schemas } from '@/shared/api/types';
import { formatDateTime, formatRelative } from '@/shared/lib/format';

type Job = Schemas['AdminBatchJobSummaryDto'];

const STATE: Record<string, { text: string; tone: Tone }> = {
  OK: { text: '정상', tone: 'positive' },
  FAILED: { text: '실패', tone: 'critical' },
  STUCK: { text: '멈춤', tone: 'warning' },
  LATE: { text: '늦음', tone: 'warning' },
  NEVER: { text: '기록 없음', tone: 'neutral' },
};

const columns: ColumnDef<Job, unknown>[] = [
  {
    header: '상태',
    cell: ({ row }) => {
      const state = STATE[row.original.state];
      return <Badge tone={state?.tone}>{state?.text ?? row.original.state}</Badge>;
    },
    size: 88,
  },
  {
    header: '배치',
    cell: ({ row }) => (
      <>
        <strong>{row.original.label}</strong>
        <div style={{ color: 'var(--fg-subtle)', fontSize: 12 }}>
          {row.original.jobName} · {row.original.schedule}
        </div>
      </>
    ),
  },
  {
    header: '마지막 실행',
    cell: ({ row }) =>
      row.original.lastRun ? (
        <span title={formatDateTime(row.original.lastRun.startedAt)}>
          {formatRelative(row.original.lastRun.startedAt)}
          {row.original.lastRun.durationMs !== null &&
            ` · ${Math.round(row.original.lastRun.durationMs / 1000)}초`}
        </span>
      ) : (
        '—'
      ),
  },
  {
    header: '마지막 성공',
    cell: ({ row }) =>
      row.original.lastSuccessAt ? formatDateTime(row.original.lastSuccessAt) : '—',
  },
  {
    header: '7일 실패',
    cell: ({ row }) => row.original.failures7d,
    meta: { align: 'right' },
    size: 80,
  },
  {
    header: '오류',
    meta: { wrap: true },
    cell: ({ row }) =>
      row.original.state === 'FAILED' ? (row.original.lastRun?.error ?? '—') : '',
  },
];

export function BatchTable({ jobs }: { jobs: Job[] }) {
  return <DataTable columns={columns} data={jobs} empty="배치가 없어요." />;
}
