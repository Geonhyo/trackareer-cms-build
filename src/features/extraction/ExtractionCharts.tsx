'use client';

import { SERIES } from '@/features/dashboard/chart-theme';
import { Bars, TrendLine } from '@/features/dashboard/Charts';

type Day = { date: string; requests: number; judged: number; success: number };

export function RequestsChart({ days }: { days: Day[] }) {
  return (
    <Bars
      data={days}
      xKey="date"
      series={[{ key: 'requests', name: '요청', color: SERIES.primary }]}
    />
  );
}

export function SuccessRateChart({ days }: { days: Day[] }) {
  const data = days.map((day) => ({
    date: day.date,
    rate: day.judged ? Math.round((day.success / day.judged) * 100) : 0,
  }));
  return <TrendLine data={data} xKey="date" valueKey="rate" name="성공률(%)" />;
}
