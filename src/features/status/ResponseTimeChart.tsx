'use client';

import { TrendLine } from '@/features/dashboard/Charts';

const timeLabel = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));

export function ResponseTimeChart({ points }: { points: Array<{ at: string; ms: number }> }) {
  return (
    <TrendLine data={points} xKey="at" valueKey="ms" name="응답 시간(ms)" xLabel={timeLabel} />
  );
}
