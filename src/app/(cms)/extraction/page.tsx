import type { Metadata } from 'next';
import { ActionButton } from '@/components/ui/ActionButton';
import { Badge, Button, Card, Grid, Input, PageHeader, Stack, Stat, Tabs } from '@/components/ui';
import { AlertList } from '@/features/status/AlertList';
import { loadAlerts } from '@/features/status/load-alerts';
import {
  blockDomainQuickAction,
  refreshExtractionAction,
  unblockDomainAction,
} from '@/features/extraction/actions';
import { BlockForm } from '@/features/extraction/BlockForm';
import { RequestsChart, SuccessRateChart } from '@/features/extraction/ExtractionCharts';
import styles from '@/features/extraction/extraction.module.css';
import { SitesTable } from '@/features/extraction/SitesTable';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { getSessionAdmin, isSuperAdmin } from '@/shared/auth/session';
import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelative,
} from '@/shared/lib/format';
import { param } from '@/shared/lib/url';

export const metadata: Metadata = { title: '공고 추출' };

const PERIODS = ['1', '7', '30'] as const;
const PERIOD_LABEL: Record<string, string> = {
  '1': '최근 24시간',
  '7': '최근 7일',
  '30': '최근 30일',
};

const ratio = (part: number, whole: number) => (whole ? part / whole : null);

export default async function ExtractionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const days = (PERIODS as readonly string[]).includes(param(params.days) ?? '')
    ? param(params.days)!
    : '7';
  const q = param(params.q)?.trim();
  const [overview, sites, domains, blocked, results, alerts, admin] = await Promise.all([
    adminApi<Schemas['AdminExtractionOverviewResponseDto']>('/admin/extraction/overview', {
      query: { days },
    }),
    adminApi<Schemas['AdminExtractionSiteListResponseDto']>('/admin/extraction/sites', {
      query: { days },
    }),
    adminApi<Schemas['AdminExtractionDomainListResponseDto']>('/admin/extraction/domains', {
      query: { days: days === '1' ? 7 : days },
    }),
    adminApi<Schemas['AdminBlockedDomainListResponseDto']>('/admin/extraction/blocked-domains'),
    q
      ? adminApi<Schemas['AdminExtractionResultListResponseDto']>('/admin/extraction/results', {
          query: { q },
        })
      : Promise.resolve(null),
    loadAlerts(),
    getSessionAdmin(),
  ]);
  const o = overview.item;
  const canEdit = isSuperAdmin(admin);
  const extractionAlerts = alerts?.filter((alert) => alert.source === 'EXTRACTION') ?? [];

  return (
    <>
      <PageHeader
        title="공고 추출"
        description="링크로 공고를 등록할 때의 추출 결과. 성공률 분모는 성공 · 부분 · 실패 요청 (차단 · 장애 제외)"
      />
      <Tabs
        active={days}
        items={PERIODS.map((value) => ({
          key: value,
          label: PERIOD_LABEL[value],
          href: `/extraction?days=${value}`,
        }))}
      />
      <Stack>
        {extractionAlerts.length > 0 && (
          <Card title="경고">
            <AlertList alerts={extractionAlerts} />
          </Card>
        )}
        <Grid min={200}>
          <Card>
            <Stat
              label="요청"
              value={formatNumber(o.requests)}
              sub={`캐시 ${formatPercent(ratio(o.cached, o.requests), 0)} · 새 추출 ${formatNumber(o.newExtractions)}`}
            />
          </Card>
          <Card>
            <Stat
              label="성공률"
              value={formatPercent(ratio(o.success, o.judged), 0)}
              sub={`부분 ${formatNumber(o.partial)} · 실패 ${formatNumber(o.failed)}`}
            />
          </Card>
          <Card>
            <Stat
              label="장애 · 차단"
              value={formatNumber(o.unavailable)}
              sub={`차단 ${formatNumber(o.blocked)} · 공고 아님 ${formatNumber(o.notPosting)}`}
            />
          </Card>
          <Card>
            <Stat
              label="평균 응답"
              value={o.avgFreshMs !== null ? `${(o.avgFreshMs / 1000).toFixed(1)}초` : '—'}
              sub={`캐시 ${o.avgCachedMs ?? '—'}ms`}
            />
          </Card>
          <Card>
            <Stat
              label="비용"
              value={`LLM ${formatNumber(o.llmTokens)}`}
              sub={`토큰 · browserless ${formatNumber(o.browserless)}번`}
            />
          </Card>
        </Grid>
        <Grid min={360}>
          <Card title="일별 요청" description="KST 날짜별 (최소 7일)">
            <RequestsChart days={o.daily} />
          </Card>
          <Card title="일별 성공률" description="성공 ÷ (성공 + 부분 + 실패)">
            <SuccessRateChart days={o.daily} />
          </Card>
        </Grid>
        <Card
          title="화이트리스트 사이트"
          description="키 규칙 실패가 늘면 사이트가 링크 규칙을 바꾼 것, LLM이 늘면 페이지 구조를 바꾼 것"
        >
          <SitesTable sites={sites.items} />
        </Card>
        <Grid min={420}>
          <Card
            title="화이트리스트 밖 도메인"
            description={`${days === '1' ? '최근 7일' : PERIOD_LABEL[days]} 요청 많은 순. 채용 플랫폼이면 POSTING_SITES에 규칙을 더해요`}
          >
            <div className={styles.list}>
              {domains.items.length === 0 && <p className={styles.meta}>없어요.</p>}
              {domains.items.map((domain) => (
                <div key={domain.domain} className={styles.item}>
                  <div style={{ minWidth: 0 }}>
                    <strong>{domain.domain}</strong> {domain.blocked && <Badge>차단됨</Badge>}
                    <p className={styles.meta}>
                      요청 {domain.requests} · 성공률{' '}
                      {formatPercent(ratio(domain.success, domain.judged), 0)} ·{' '}
                      {formatRelative(domain.lastSeen)}
                      {domain.exampleUrl && (
                        <>
                          {' · '}
                          <a href={domain.exampleUrl} target="_blank" rel="noreferrer">
                            예시
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                  {canEdit && !domain.blocked && (
                    <ActionButton
                      size="sm"
                      variant="ghost"
                      action={blockDomainQuickAction.bind(null, domain.domain)}
                      confirm={`${domain.domain}을(를) 막을까요? 다음 요청부터 추출하지 않고 직접 입력하게 해요.`}
                    >
                      막기
                    </ActionButton>
                  )}
                </div>
              ))}
            </div>
          </Card>
          <Card
            title="차단 도메인"
            description="추출하지 않는 도메인 (로그인해야 보이는 곳처럼 실패만 하는 곳)"
          >
            <Stack>
              <div className={styles.list}>
                {blocked.items.length === 0 && <p className={styles.meta}>없어요.</p>}
                {blocked.items.map((item) => (
                  <div key={item.domain} className={styles.item}>
                    <div>
                      <strong>{item.domain}</strong>
                      <p className={styles.meta}>
                        {item.reason ?? '이유 없음'} · {formatDate(item.createdAt)}
                      </p>
                    </div>
                    {canEdit && (
                      <ActionButton
                        size="sm"
                        variant="ghost"
                        action={unblockDomainAction.bind(null, item.domain)}
                        confirm={`${item.domain} 차단을 풀까요?`}
                      >
                        풀기
                      </ActionButton>
                    )}
                  </div>
                ))}
              </div>
              {canEdit && <BlockForm />}
            </Stack>
          </Card>
        </Grid>
        <Card
          title="추출 결과 찾기"
          description="공고가 바뀌었으면 '다시 받기'로 다음 요청 때 새로 추출해요"
        >
          <form className={styles.search}>
            <input type="hidden" name="days" value={days} />
            <div style={{ flex: 1 }}>
              <Input name="q" defaultValue={q} placeholder="링크 · 공고 키(saramin:123) · 기업명" />
            </div>
            <Button type="submit">찾기</Button>
          </form>
          {results && (
            <div className={styles.list}>
              {results.items.length === 0 && <p className={styles.meta}>찾은 결과가 없어요.</p>}
              {results.items.map((result) => (
                <div key={result.id} className={styles.item}>
                  <div style={{ minWidth: 0 }}>
                    <strong>{result.company ?? '기업 모름'}</strong> {result.position}{' '}
                    <Badge
                      tone={
                        result.status === 'SUCCESS'
                          ? 'positive'
                          : result.status === 'FAILED'
                            ? 'critical'
                            : 'warning'
                      }
                    >
                      {result.status}
                    </Badge>{' '}
                    {result.refreshRequested && <Badge tone="brand">다시 받기 대기</Badge>}
                    <p className={styles.meta}>
                      {result.siteName ?? result.postingKey} ·{' '}
                      {result.deadlineDate ? `${formatDate(result.deadlineDate)} 마감 · ` : ''}
                      {result.extractMethod ?? '—'} · 캐시 {result.hitCount}번 ·{' '}
                      {formatDateTime(result.updatedAt)}
                      <br />
                      <a href={result.url} target="_blank" rel="noreferrer">
                        {result.url}
                      </a>
                    </p>
                  </div>
                  {canEdit && !result.refreshRequested && (
                    <ActionButton size="sm" action={refreshExtractionAction.bind(null, result.id)}>
                      다시 받기
                    </ActionButton>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </Stack>
    </>
  );
}
