'use client';

import type { Schemas } from '@/shared/api/types';
import { PROVIDER_LABEL } from '@/shared/lib/labels';
import { PROVIDER_COLOR, SERIES, shortDate } from './chart-theme';
import { Bars, TrendLine } from './Charts';

type Week = Schemas['AdminGrowthWeekDto'];

// 마지막 주는 진행 중이라 이름을 따로 붙인다
const weekLabel = (thisWeek: string) => (key: string) =>
  key === thisWeek ? '이번 주' : `${shortDate(key)}주`;

function flatten(weeks: Week[]) {
  return weeks.map((week) => ({
    weekStart: week.weekStart,
    wau: week.wau,
    northStar: week.northStar,
    withdrawals: week.withdrawals,
    ...week.signupsByProvider,
  }));
}

export function SignupsChart({ weeks }: { weeks: Week[] }) {
  // 비밀번호 계정(테스트 · 심사)은 통계에서 빠지므로 보통 0 — 값이 있을 때만 계열로
  const providers = (['KAKAO', 'APPLE', 'PASSWORD'] as const).filter(
    (provider) =>
      provider !== 'PASSWORD' || weeks.some((week) => week.signupsByProvider.PASSWORD > 0),
  );
  return (
    <Bars
      data={flatten(weeks)}
      xKey="weekStart"
      xLabel={weekLabel(weeks.at(-1)?.weekStart ?? '')}
      series={providers.map((provider) => ({
        key: provider,
        name: PROVIDER_LABEL[provider] ?? provider,
        color: PROVIDER_COLOR[provider] ?? '#8e8e8e',
      }))}
    />
  );
}

export function WeeklyLine({
  weeks,
  valueKey,
  name,
}: {
  weeks: Week[];
  valueKey: 'wau' | 'northStar';
  name: string;
}) {
  // 진행 중인 이번 주는 값이 덜 쌓여 뚝 떨어져 보이므로 선에서는 뺀다
  return (
    <TrendLine
      data={flatten(weeks.slice(0, -1))}
      xKey="weekStart"
      valueKey={valueKey}
      name={name}
      xLabel={weekLabel(weeks.at(-1)?.weekStart ?? '')}
    />
  );
}

export function WithdrawalsChart({ weeks }: { weeks: Week[] }) {
  return (
    <Bars
      data={flatten(weeks)}
      xKey="weekStart"
      xLabel={weekLabel(weeks.at(-1)?.weekStart ?? '')}
      series={[{ key: 'withdrawals', name: '탈퇴 요청', color: SERIES.secondary }]}
    />
  );
}
