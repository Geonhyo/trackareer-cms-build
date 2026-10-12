'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/ui/DataTable';
import type { Schemas } from '@/shared/api/types';
import { formatDate, formatPercent } from '@/shared/lib/format';
import {
  ACCOUNT_TYPE_LABEL,
  PROVIDER_LABEL,
  USER_STATUS_LABEL,
  USER_STATUS_TONE,
  label,
} from '@/shared/lib/labels';

type User = Schemas['AdminUserListItemDto'];

const yesNo = (value: boolean) => (value ? 'O' : '—');

const columns: ColumnDef<User, unknown>[] = [
  { header: 'ID', accessorKey: 'id', size: 56, meta: { align: 'right' } },
  {
    header: '닉네임',
    cell: ({ row }) => (
      <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        {row.original.nickname}
        {row.original.accountType !== 'NORMAL' && (
          <Badge tone="brand">{label(ACCOUNT_TYPE_LABEL, row.original.accountType)}</Badge>
        )}
        {row.original.isInternal && <Badge>내부</Badge>}
      </span>
    ),
  },
  { header: '이메일', accessorKey: 'email' },
  { header: '가입', cell: ({ row }) => label(PROVIDER_LABEL, row.original.provider), size: 72 },
  {
    header: '상태',
    cell: ({ row }) => (
      <Badge tone={USER_STATUS_TONE[row.original.status]}>
        {label(USER_STATUS_LABEL, row.original.status)}
      </Badge>
    ),
    size: 88,
  },
  {
    header: '공고',
    accessorKey: 'postingCount',
    meta: { align: 'right' },
    size: 64,
  },
  {
    header: '푸시 동의',
    cell: ({ row }) => yesNo(row.original.marketingNotiConsent),
    meta: { align: 'center' },
    size: 76,
  },
  {
    header: '정보 활용',
    cell: ({ row }) => yesNo(row.original.privacyMarketingConsent),
    meta: { align: 'center' },
    size: 76,
  },
  {
    header: '최근 접속',
    cell: ({ row }) => formatDate(row.original.activity.lastActiveDate),
    size: 112,
  },
  {
    header: '30일 접속률',
    cell: ({ row }) => (
      <span title={`최근 30일 중 ${row.original.activity.activeDays30}일`}>
        {formatPercent(row.original.activity.activeRate30, 0)}
      </span>
    ),
    meta: { align: 'right' },
    size: 96,
  },
  { header: '가입일', cell: ({ row }) => formatDate(row.original.createdAt), size: 112 },
];

export function UsersTable({ users }: { users: User[] }) {
  return (
    <DataTable
      columns={columns}
      data={users}
      rowHref={(user) => `/users/${user.id}`}
      empty="조건에 맞는 회원이 없어요."
    />
  );
}
