'use client';

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import styles from './DataTable.module.css';

// 열 설정: align 숫자는 오른쪽, wrap 긴 글만 줄바꿈 (나머지 칸은 한 줄)
export type ColumnMeta = { align?: 'right' | 'center'; wrap?: boolean };

/**
 * 표 (TanStack Table). 정렬 · 페이지는 서버가 하고 URL로 넘기므로 여기서는 그리기만 한다.
 * rowHref를 주면 행을 눌러 상세로 간다.
 */
export function DataTable<T>({
  columns,
  data,
  rowHref,
  empty = '데이터가 없어요.',
}: {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  rowHref?: (row: T) => string;
  empty?: string;
}) {
  const router = useRouter();
  // TanStack Table은 React Compiler 자동 메모이제이션 대상이 아니다 (이 컴포넌트만 건너뛴다)
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ width: header.column.columnDef.size }}
                  data-align={(header.column.columnDef.meta as ColumnMeta)?.align}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                {empty}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={rowHref ? styles.clickable : undefined}
                onClick={rowHref ? () => router.push(rowHref(row.original)) : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    data-align={(cell.column.columnDef.meta as ColumnMeta)?.align}
                    data-wrap={(cell.column.columnDef.meta as ColumnMeta)?.wrap}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
