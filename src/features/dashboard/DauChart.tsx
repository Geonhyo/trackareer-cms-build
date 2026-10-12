'use client';

import { SERIES } from './chart-theme';
import { Bars } from './Charts';

export function DauChart({ data }: { data: Array<{ date: string; count: number }> }) {
  return (
    <Bars data={data} xKey="date" series={[{ key: 'count', name: 'DAU', color: SERIES.primary }]} />
  );
}
