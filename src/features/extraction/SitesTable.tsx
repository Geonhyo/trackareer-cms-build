'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/ui/DataTable';
import type { Schemas } from '@/shared/api/types';
import { formatPercent } from '@/shared/lib/format';

type Site = Schemas['AdminExtractionSiteDto'];

const ratio = (part: number, whole: number) => (whole ? part / whole : null);

// 경고 기준과 같은 값 (서버 docs/extraction-admin.md 3장) — 표에서도 눈에 띄게
const WARN = { keyFallback: 0.2, llm: 0.3, min: 5 };

const columns: ColumnDef<Site, unknown>[] = [
  { header: '사이트', accessorKey: 'siteName' },
  { header: '요청', accessorKey: 'requests', meta: { align: 'right' } },
  {
    header: '성공률',
    cell: ({ row }) => formatPercent(ratio(row.original.success, row.original.judged), 0),
    meta: { align: 'right' },
  },
  {
    header: '캐시',
    cell: ({ row }) => formatPercent(ratio(row.original.cached, row.original.requests), 0),
    meta: { align: 'right' },
  },
  {
    header: '키 규칙 실패',
    cell: ({ row }) => {
      const value = ratio(row.original.keyFallback, row.original.requests);
      const warn = row.original.requests >= WARN.min && (value ?? 0) >= WARN.keyFallback;
      return warn ? (
        <Badge tone="warning">{formatPercent(value, 0)}</Badge>
      ) : (
        formatPercent(value, 0)
      );
    },
    meta: { align: 'right' },
  },
  { header: '새 추출', accessorKey: 'newExtractions', meta: { align: 'right' } },
  {
    header: 'LLM',
    cell: ({ row }) => {
      const value = ratio(row.original.llm, row.original.newExtractions);
      const warn = row.original.newExtractions >= WARN.min && (value ?? 0) >= WARN.llm;
      return warn ? (
        <Badge tone="warning">{formatPercent(value, 0)}</Badge>
      ) : (
        formatPercent(value, 0)
      );
    },
    meta: { align: 'right' },
  },
];

export function SitesTable({ sites }: { sites: Site[] }) {
  return (
    <DataTable
      columns={columns}
      data={sites}
      empty="이 기간에 화이트리스트 사이트 요청이 없어요."
    />
  );
}
