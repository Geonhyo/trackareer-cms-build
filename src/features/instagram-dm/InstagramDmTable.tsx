'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/ui/DataTable';
import type { Schemas } from '@/shared/api/types';
import { formatDate, formatNumber } from '@/shared/lib/format';

type Post = Schemas['AdminInstagramDmPostDto'];

const columns: ColumnDef<Post, unknown>[] = [
  {
    header: '상태',
    cell: ({ row }) =>
      row.original.isActive ? <Badge tone="positive">켜짐</Badge> : <Badge>꺼짐</Badge>,
    size: 80,
  },
  { header: '이름', meta: { wrap: true }, cell: ({ row }) => row.original.title },
  {
    header: '키워드',
    cell: ({ row }) => row.original.keyword ?? '모든 댓글',
    size: 120,
  },
  {
    header: '첫 DM',
    cell: ({ row }) => formatNumber(row.original.firstDmCount),
    size: 90,
  },
  {
    header: '링크 발송',
    cell: ({ row }) => formatNumber(row.original.linkSentCount),
    size: 90,
  },
  {
    header: '재시도 대기',
    cell: ({ row }) => formatNumber(row.original.pendingDmCount),
    size: 100,
  },
  {
    header: '놓침',
    cell: ({ row }) => formatNumber(row.original.missedDmCount),
    size: 80,
  },
  { header: '등록', cell: ({ row }) => formatDate(row.original.createdAt), size: 120 },
];

export function InstagramDmTable({ posts }: { posts: Post[] }) {
  return (
    <DataTable
      columns={columns}
      data={posts}
      rowHref={(post) => `/instagram-dm/${post.id}`}
      empty="등록한 게시물이 없어요. 게시물을 올린 뒤 주소와 DM 문구 · 링크를 등록하세요."
    />
  );
}
