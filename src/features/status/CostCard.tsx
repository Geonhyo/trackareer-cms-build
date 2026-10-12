import { Card, Notice, Stat } from '@/components/ui';
import type { Schemas } from '@/shared/api/types';
import { formatCurrency, formatDateTime, formatRelative } from '@/shared/lib/format';
import styles from './status.module.css';

type Costs = Schemas['CostsDto'];

/** 이번 달 서비스 순서대로, 지난달에만 있던 서비스는 뒤에 */
function mergeServices(costs: Costs) {
  const previous = new Map(costs.previousMonth?.services.map((item) => [item.service, item.cost]));
  const rows: Array<{ service: string; current: number | null; previous: number | null }> = (
    costs.currentMonth?.services ?? []
  ).map((item) => ({
    service: item.service,
    current: item.cost,
    previous: previous.get(item.service) ?? null,
  }));
  const seen = new Set(rows.map((row) => row.service));
  for (const item of costs.previousMonth?.services ?? []) {
    if (!seen.has(item.service)) {
      rows.push({ service: item.service, current: null, previous: item.cost });
    }
  }
  return rows;
}

/**
 * 인프라 비용 (GCP 결제 내보내기 → BigQuery). 무료 등급 크레딧을 뺀 실제 청구 금액이고,
 * 청구 월은 GCP 규칙대로 미국 태평양 시간 기준이다. Supabase · UptimeRobot 등 GCP 밖은 들어 있지 않다.
 */
export function CostCard({ costs }: { costs: Costs | null }) {
  return (
    <Card
      title="인프라 비용 (GCP)"
      description="결제 내보내기 기준, 무료 등급을 뺀 청구 금액. 몇 시간 늦게 반영되고 Supabase는 들어 있지 않아요"
    >
      {!costs ? (
        <Notice tone="critical">비용을 불러오지 못했어요.</Notice>
      ) : costs.state === 'NOT_CONFIGURED' ? (
        <Notice>서버에 BILLING_EXPORT_DATASET이 없어 보여 줄 수 없어요.</Notice>
      ) : costs.state === 'WAITING' ? (
        <Notice>결제 내보내기를 켠 뒤 첫 데이터를 기다리는 중이에요. 보통 하루쯤 걸려요.</Notice>
      ) : costs.state === 'ERROR' ? (
        <Notice tone="critical">
          BigQuery에서 비용을 읽지 못했어요. 서버 서비스 계정에 BigQuery 작업 사용자 · 데이터 뷰어
          권한이 있는지 확인해 주세요.
        </Notice>
      ) : (
        <>
          <div className={styles.costTotals}>
            <Stat
              label={`이번 달 (${costs.currentMonth?.month ?? '—'})`}
              value={formatCurrency(costs.currentMonth?.total, costs.currency)}
            />
            <Stat
              label={`지난달 (${costs.previousMonth?.month ?? '—'})`}
              value={formatCurrency(costs.previousMonth?.total, costs.currency)}
            />
          </div>
          {mergeServices(costs).length === 0 ? (
            <p className={styles.muted}>아직 이번 달 · 지난달 사용 기록이 없어요.</p>
          ) : (
            <ul className={styles.costRows}>
              <li>
                <span>서비스</span>
                <span>이번 달</span>
                <span>지난달</span>
              </li>
              {mergeServices(costs).map((row) => (
                <li key={row.service}>
                  <span>{row.service}</span>
                  <span className="num">{formatCurrency(row.current, costs.currency)}</span>
                  <span className="num">{formatCurrency(row.previous, costs.currency)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className={`${styles.muted} ${styles.costFoot}`}>
            결제 데이터 반영 {formatDateTime(costs.exportedAt)} · 조회{' '}
            {formatRelative(costs.fetchedAt)}
          </p>
        </>
      )}
    </Card>
  );
}
