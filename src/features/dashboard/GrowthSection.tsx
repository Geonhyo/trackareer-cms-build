import { Card, Stack } from '@/components/ui';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { formatDate, formatPercent } from '@/shared/lib/format';
import { WITHDRAWAL_REASON_LABEL, label } from '@/shared/lib/labels';
import { BarList } from './BarList';
import { CohortTable } from './CohortTable';
import { SignupsChart, WeeklyLine, WithdrawalsChart } from './GrowthCharts';
import styles from './dashboard.module.css';

export async function GrowthSection() {
  const { item } = await adminApi<Schemas['AdminGrowthResponseDto']>('/admin/stats/growth', {
    query: { weeks: 12 },
  });
  const { funnel } = item;
  const step = (value: number) => formatPercent(funnel.signedUp ? value / funnel.signedUp : 0, 0);

  return (
    <Stack>
      <Card
        title="주별 신규 가입"
        description="최근 12주 · 가입 유형별 (마지막 칸은 진행 중인 이번 주)"
      >
        <SignupsChart weeks={item.weeks} />
      </Card>
      <div className={styles.twoCols}>
        <Card title="WAU" description="그 주에 앱을 한 번이라도 연 회원 (다 지난 주만)">
          <WeeklyLine weeks={item.weeks} valueKey="wau" name="WAU" />
        </Card>
        <Card
          title="북극성 · 주간 지원 진행 회원"
          description="그 주에 지원 · 전형 진행을 기록한 회원 (다 지난 주만)"
        >
          <WeeklyLine weeks={item.weeks} valueKey="northStar" name="지원 진행 회원" />
        </Card>
      </div>
      <div className={styles.twoCols}>
        <Card
          title="가입 뒤 행동"
          description={`${formatDate(funnel.from)} ~ ${formatDate(funnel.to)} 가입 회원 중 각 행동을 한 비율 (2주차를 볼 수 있게 14일 전까지)`}
        >
          <BarList
            max={funnel.signedUp}
            items={[
              { key: 'signup', name: '가입', value: funnel.signedUp, sub: '100%' },
              {
                key: 'registered',
                name: '첫 공고 등록',
                value: funnel.registered,
                sub: step(funnel.registered),
              },
              {
                key: 'applied',
                name: '첫 지원 기록',
                value: funnel.applied,
                sub: step(funnel.applied),
              },
              {
                key: 'week2',
                name: '2주차 재방문',
                value: funnel.returnedWeek2,
                sub: step(funnel.returnedWeek2),
              },
            ]}
          />
        </Card>
        <Card title="탈퇴" description="주별 탈퇴 요청과 사유 (사유는 여러 개 고를 수 있어요)">
          <WithdrawalsChart weeks={item.weeks} />
          <div style={{ marginTop: 16 }}>
            <BarList
              items={item.withdrawalReasons.map((reason) => ({
                key: reason.reasonType,
                name: label(WITHDRAWAL_REASON_LABEL, reason.reasonType),
                value: reason.count,
              }))}
            />
          </div>
        </Card>
      </div>
      <Card title="재방문 코호트" description="가입 주별로 다음 1~7주차에 다시 온 비율">
        <CohortTable cohorts={item.cohorts} />
      </Card>
    </Stack>
  );
}
