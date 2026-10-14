'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/ui/DataTable';
import type { Schemas } from '@/shared/api/types';
import { formatDate } from '@/shared/lib/format';
import {
  POSTING_SOURCE_LABEL,
  POSTING_STATUS_LABEL,
  POSTING_STATUS_TONE,
  STAGE_RESULT_LABEL,
  label,
} from '@/shared/lib/labels';

type Posting = Schemas['AdminUserPostingDto'];

const columns: ColumnDef<Posting, unknown>[] = [
  { header: '기업', accessorKey: 'company' },
  { header: '공고', accessorKey: 'position', meta: { wrap: true } },
  {
    header: '상태',
    cell: ({ row }) => (
      <Badge tone={POSTING_STATUS_TONE[row.original.status]}>
        {label(POSTING_STATUS_LABEL, row.original.status)}
      </Badge>
    ),
    size: 96,
  },
  {
    header: '지금 전형',
    cell: ({ row }) => {
      const stage = row.original.currentStage;
      if (!stage) return '—';
      const state = stage.result
        ? label(STAGE_RESULT_LABEL, stage.result)
        : stage.completedAt
          ? '완료'
          : '';
      return state ? `${stage.name} · ${state}` : stage.name;
    },
  },
  { header: '서류 마감', cell: ({ row }) => formatDate(row.original.deadline), size: 112 },
  {
    header: '등록',
    cell: ({ row }) => label(POSTING_SOURCE_LABEL, row.original.source),
    size: 88,
  },
  { header: '등록일', cell: ({ row }) => formatDate(row.original.createdAt), size: 112 },
];

export function PostingsTable({ postings }: { postings: Posting[] }) {
  return <DataTable columns={columns} data={postings} empty="등록한 공고가 없어요." />;
}
