import Link from 'next/link';
import { Card, Stack, Stat } from '@/components/ui';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { formatNumber, formatPercent } from '@/shared/lib/format';
import { AlertList } from '@/features/status/AlertList';
import { loadAlerts } from '@/features/status/load-alerts';
import { DauChart } from './DauChart';
import styles from './dashboard.module.css';

function Delta({
  current,
  previous,
  unit = '',
}: {
  current: number;
  previous: number;
  unit?: string;
}) {
  const diff = current - previous;
  if (diff === 0) return <span className={styles.delta}>앞 7일과 같아요</span>;
  const rate = previous ? ` (${diff > 0 ? '+' : ''}${Math.round((diff / previous) * 100)}%)` : '';
  return (
    <span className={`${styles.delta} ${diff > 0 ? styles.up : styles.down}`}>
      앞 7일보다 {diff > 0 ? '+' : ''}
      {formatNumber(diff)}
      {unit}
      {rate}
    </span>
  );
}

export async function OverviewSection() {
  const [{ item }, alerts] = await Promise.all([
    adminApi<Schemas['AdminOverviewResponseDto']>('/admin/stats/overview'),
    loadAlerts(),
  ]);
  const avgDau =
    item.dauSeries.reduce((sum, point) => sum + point.count, 0) /
    Math.max(1, item.dauSeries.length);

  return (
    <Stack>
      {alerts && alerts.length > 0 && (
        <Card
          title={`이상 징후 ${alerts.length}건`}
          description="지금 상태로 계산했어요. 고치면 사라져요."
        >
          <AlertList alerts={alerts} withLinks />
        </Card>
      )}
      <div className={styles.tiles}>
        <Card className={styles.hero}>
          <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.85 }}>
            북극성 · 주간 지원 진행 회원
          </span>
          <div className={styles.heroValue}>{formatNumber(item.northStar.current)}명</div>
          <Delta current={item.northStar.current} previous={item.northStar.previous} unit="명" />
          <p style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            최근 7일에 지원 완료 · 전형 완료 · 결과 기록 중 하나를 한 회원
          </p>
        </Card>
        <Link href="/inquiries" className={styles.tileLink}>
          <Card>
            <Stat
              label="답변이 필요한 문의"
              value={`${formatNumber(item.pendingInquiries)}건`}
              sub={item.pendingInquiries ? '눌러서 답하러 가기' : '모두 답했어요'}
            />
          </Card>
        </Link>
        <Card>
          <Stat
            label="오늘 신규 가입"
            value={`${formatNumber(item.signupsToday)}명`}
            sub={
              <>
                최근 7일 {formatNumber(item.signups7d.current)}명 ·{' '}
                <Delta
                  current={item.signups7d.current}
                  previous={item.signups7d.previous}
                  unit="명"
                />
              </>
            }
          />
        </Card>
        <Card>
          <Stat
            label="활성 회원"
            value={`${formatNumber(item.activeMembers)}명`}
            sub="탈퇴하지 않은 회원"
          />
        </Card>
        <Card>
          <Stat
            label="DAU (오늘)"
            value={`${formatNumber(item.dauToday)}명`}
            sub={`어제 ${formatNumber(item.dauYesterday)}명 · WAU ${formatNumber(item.wau)}명`}
          />
        </Card>
        <Card>
          <Stat
            label="MAU (최근 30일)"
            value={`${formatNumber(item.mau)}명`}
            sub={`고착도(평균 DAU ÷ MAU) ${formatPercent(item.mau ? avgDau / item.mau : 0, 0)}`}
          />
        </Card>
      </div>
      <Card title="최근 14일 DAU" description="하루에 앱을 연 회원 (내부 계정 제외)">
        <DauChart data={item.dauSeries} />
      </Card>
    </Stack>
  );
}
