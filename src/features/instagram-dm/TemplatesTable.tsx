'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/DataTable';
import type { Schemas } from '@/shared/api/types';
import { formatDate } from '@/shared/lib/format';

type Template = Schemas['AdminInstagramDmTemplateDto'];

const columns: ColumnDef<Template, unknown>[] = [
  { header: '이름', cell: ({ row }) => row.original.name, size: 200 },
  { header: '문구', meta: { wrap: true }, cell: ({ row }) => row.original.message },
  {
    header: '형식',
    cell: ({ row }) =>
      row.original.dmType === 'CARDS'
        ? `카드 ${row.original.cards.length}장`
        : `버튼 ${row.original.buttons.length}개`,
    size: 110,
  },
  { header: '수정', cell: ({ row }) => formatDate(row.original.updatedAt), size: 120 },
];

export function TemplatesTable({ templates }: { templates: Template[] }) {
  return (
    <DataTable
      columns={columns}
      data={templates}
      rowHref={(template) => `/instagram-dm/templates/${template.id}`}
      empty="템플릿이 없어요. 자주 쓰는 DM 문구를 템플릿으로 저장해 두세요."
    />
  );
}
