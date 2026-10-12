'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge, Row } from '@/components/ui';
import { DataTable } from '@/components/ui/DataTable';
import { formatDateTime } from '@/shared/lib/format';
import { noticeState, type Notice } from './notice-status';

const columns: ColumnDef<Notice, unknown>[] = [
  {
    header: '상태',
    cell: ({ row }) => {
      const state = noticeState(row.original);
      return <Badge tone={state.tone}>{state.text}</Badge>;
    },
    size: 92,
  },
  {
    header: '제목',
    meta: { wrap: true },
    cell: ({ row }) => (
      <Row>
        {row.original.title}
        {row.original.isImportant && <Badge tone="critical">중요</Badge>}
        {row.original.showAsModal && <Badge tone="brand">모달</Badge>}
      </Row>
    ),
  },
  { header: '게시 시작', cell: ({ row }) => formatDateTime(row.original.startsAt), size: 160 },
  {
    header: '게시 종료',
    cell: ({ row }) => (row.original.endsAt ? formatDateTime(row.original.endsAt) : '계속'),
    size: 160,
  },
];

export function NoticesTable({ notices }: { notices: Notice[] }) {
  return (
    <DataTable
      columns={columns}
      data={notices}
      rowHref={(notice) => `/notices/${notice.id}`}
      empty="공지가 없어요."
    />
  );
}
