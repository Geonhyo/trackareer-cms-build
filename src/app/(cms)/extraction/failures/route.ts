import type { NextRequest } from 'next/server';
import { toFailureCsv } from '@/features/extraction/failure-csv';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { todayKst } from '@/shared/lib/format';

const PERIODS = ['1', '7', '30'];

/** 공고 추출 실패 로그 CSV 내려받기 (?days=1 · 7 · 30, 공고 추출 화면의 기간 탭) */
export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get('days') ?? '';
  const days = PERIODS.includes(requested) ? requested : '7';
  const { items, truncated } = await adminApi<Schemas['AdminExtractionFailureListResponseDto']>(
    '/admin/extraction/failures',
    { query: { days } },
  );
  const filename = `extraction-failures-${days}d-${todayKst()}${truncated ? '-partial' : ''}.csv`;
  return new Response(toFailureCsv(items), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
