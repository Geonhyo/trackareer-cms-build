'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/ui/DataTable';
import type { Schemas } from '@/shared/api/types';
import { formatDateTime, formatRelative } from '@/shared/lib/format';
import {
  INQUIRY_CATEGORY_LABEL,
  INQUIRY_STATUS_LABEL,
  INQUIRY_STATUS_TONE,
  label,
} from '@/shared/lib/labels';

type Inquiry = Schemas['AdminInquiryListItemDto'];

const columns: ColumnDef<Inquiry, unknown>[] = [
  {
    header: '상태',
    cell: ({ row }) => (
      <Badge tone={INQUIRY_STATUS_TONE[row.original.status]}>
        {label(INQUIRY_STATUS_LABEL, row.original.status)}
      </Badge>
    ),
    size: 92,
  },
  {
    header: '유형',
    cell: ({ row }) => label(INQUIRY_CATEGORY_LABEL, row.original.category),
    size: 88,
  },
  { header: '제목', accessorKey: 'title', meta: { wrap: true } },
  { header: '작성자', cell: ({ row }) => row.original.nickname ?? `회원 ${row.original.userId}` },
  {
    header: '마지막 글',
    cell: ({ row }) => (
      <span title={formatDateTime(row.original.lastMessageAt)}>
        {formatRelative(row.original.lastMessageAt)}
      </span>
    ),
    size: 96,
  },
  { header: '작성일', cell: ({ row }) => formatDateTime(row.original.createdAt), size: 160 },
];

export function InquiriesTable({ inquiries }: { inquiries: Inquiry[] }) {
  return (
    <DataTable
      columns={columns}
      data={inquiries}
      rowHref={(inquiry) => `/inquiries/${inquiry.id}`}
      empty="문의가 없어요."
    />
  );
}
