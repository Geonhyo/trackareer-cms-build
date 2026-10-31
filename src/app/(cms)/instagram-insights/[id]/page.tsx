import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  Badge,
  Card,
  DefinitionList,
  Grid,
  LinkButton,
  Notice,
  PageHeader,
  Row,
  Stack,
  Stat,
  Tabs,
} from '@/components/ui';
import { listCategories } from '@/features/instagram-insights/categories';
import {
  BASIS_LABEL,
  formatRate,
  type MediaItem,
} from '@/features/instagram-insights/insights-types';
import {
  CumulativeChart,
  IncreaseChart,
  type SnapshotMetric,
} from '@/features/instagram-insights/InsightsCharts';
import { DmFunnel } from '@/features/instagram-insights/DmFunnel';
import { MediaEditForm } from '@/features/instagram-insights/MediaEditForm';
import { MoreDetails } from '@/features/instagram-insights/MoreDetails';
import {
  basisPhrase,
  rulesPhrase,
  SignalChips,
  VerdictBadge,
  verdictReason,
  type VerdictRules,
} from '@/features/instagram-insights/verdict';
import { Thumbnail } from '@/features/instagram-insights/Thumbnail';
import styles from '@/features/instagram-insights/insights.module.css';
import { adminApi } from '@/shared/api/admin-api';
import { ApiError } from '@/shared/api/errors';
import type { Schemas } from '@/shared/api/types';
import { formatDateTime, formatNumber } from '@/shared/lib/format';
import { MEDIA_PRODUCT_LABEL, label } from '@/shared/lib/labels';
import { param } from '@/shared/lib/url';

export const metadata: Metadata = { title: '인스타 게시물 성과' };

type Detail = Schemas['AdminInstagramMediaDetailDto'];
type Rates = Schemas['AdminInstagramRatesDto'];

const METRICS: Record<SnapshotMetric, string> = {
  reach: '도달',
  follows: '팔로우',
  saved: '저장',
  shares: '공유',
};
const RATE_COLUMNS: Array<[keyof Rates, string]> = [
  ['saveRate', '저장률'],
  ['shareRate', '공유율'],
  ['followRate', '팔로우 전환율'],
];

async function loadDetail(id: string): Promise<Detail> {
  if (!/^\d+$/.test(id)) notFound();
  try {
    return (
      await adminApi<Schemas['AdminInstagramMediaDetailResponseDto']>(
        `/admin/instagram/media/${id}`,
      )
    ).item;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

/** 판정 기준 설명 한 줄 */
function verdictNote(media: MediaItem, rules: VerdictRules): string {
  const { verdict } = media;
  if (verdict.level === 'PENDING' || verdict.level === 'NO_BASELINE') {
    return `같은 카테고리 게시물의 게시 ${rules.verdictDay}일 시점 값과 비교해요. ${rulesPhrase(rules)}.`;
  }
  return `${basisPhrase(verdict, rules)} · 같은 카테고리 ${verdict.sampleSize}개와 비교 · ${rulesPhrase(rules)}.`;
}

export default async function InstagramMediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [{ media, snapshots, comparison, rules }, categories] = await Promise.all([
    loadDetail(id),
    listCategories(),
  ]);
  const metricKey = param(query.metric);
  const metric: SnapshotMetric =
    metricKey && metricKey in METRICS ? (metricKey as SnapshotMetric) : 'reach';

  return (
    <>
      <PageHeader
        title={
          <span className={styles.header}>
            <Thumbnail src={media.thumbnailUrl} size={56} />
            <span>{media.title || '(캡션 없음)'}</span>
          </span>
        }
        description={
          <Row>
            <Badge tone="brand">{media.categoryName}</Badge>
            {media.categorySource === 'MANUAL' && <Badge>수동 분류</Badge>}
            {media.productTypeManual && <Badge>유형 수동</Badge>}
            {label(MEDIA_PRODUCT_LABEL, media.productType)} · {formatDateTime(media.postedAt)} 게시
            · 경과 {media.dayIndex ?? '—'}일 {media.tracking ? '(수집 중)' : '(수집 끝)'}
          </Row>
        }
        action={
          <Row>
            <LinkButton href={media.permalink} target="_blank" rel="noreferrer">
              인스타에서 보기
            </LinkButton>
            <LinkButton href="/instagram-insights?tab=media">목록</LinkButton>
          </Row>
        }
      />
      <Stack>
        {media.lastError && (
          <Notice tone="warning">마지막 수집이 실패했어요: {media.lastError}</Notice>
        )}
        <Grid min={320}>
          <Card title="성적">
            <Stack>
              <span className={styles.title}>
                <VerdictBadge verdict={media.verdict} />
                <b>{verdictReason(media, rules)}</b>
              </span>
              <SignalChips verdict={media.verdict} />
              <span className={styles.muted}>{verdictNote(media, rules)}</span>
            </Stack>
          </Card>
          <Card title="팔로우">
            <Stat
              label="팔로우 합계"
              value={`${formatNumber(media.follows.total)}명`}
              sub={
                <>
                  게시물에서 {formatNumber(media.follows.post)}명 · 자동 DM으로{' '}
                  {formatNumber(media.follows.dm)}명
                  <br />
                  {media.follows.post === null
                    ? '인스타가 이 게시물(릴스)의 팔로우 수를 주지 않아 DM 팔로우만 있어요'
                    : `도달 대비 ${formatRate(media.rates.followRate)}`}
                </>
              }
            />
          </Card>
        </Grid>
        <Card title="자동 DM" description="첫 DM → 버튼 누름 → 팔로우 요청 → 팔로우 → 링크">
          {media.dm ? (
            <DmFunnel funnel={media.dm.funnel} since={rules.funnelSince} />
          ) : (
            <Stack>
              <Notice>
                자동 DM에 등록되지 않은 게시물이에요. 등록하면 댓글 단 사람을 팔로우로 이어 갈 수
                있어요.
              </Notice>
              <div>
                <LinkButton href="/instagram-dm/new">인스타 DM에 등록하기</LinkButton>
              </div>
            </Stack>
          )}
        </Card>
        <MoreDetails open={metricKey !== undefined}>
          <Grid min={200}>
            {(Object.keys(METRICS) as SnapshotMetric[]).map((key) => (
              <Card key={key}>
                <DefinitionList
                  items={[{ label: METRICS[key], value: formatNumber(media.metrics?.[key]) }]}
                />
              </Card>
            ))}
          </Grid>
          <Card
            title="게시 후 추이"
            description="누적값과 앞 수집 대비 증가 (경과일 = 게시 후 24시간 단위, 인스타 집계)"
          >
            <Stack>
              <Tabs
                active={metric}
                items={(Object.keys(METRICS) as SnapshotMetric[]).map((key) => ({
                  key,
                  label: METRICS[key],
                  href: `/instagram-insights/${media.id}?metric=${key}`,
                }))}
              />
              {snapshots.length === 0 ? (
                <p className={styles.muted}>아직 수집 전이에요.</p>
              ) : (
                <Grid min={320}>
                  <CumulativeChart
                    snapshots={snapshots}
                    metric={metric}
                    name={`누적 ${METRICS[metric]}`}
                  />
                  <IncreaseChart
                    snapshots={snapshots}
                    metric={metric}
                    name={`${METRICS[metric]} 증가`}
                  />
                </Grid>
              )}
            </Stack>
          </Card>
          <Card
            title="같은 카테고리와 비교"
            description="이 게시물 값 / 같은 카테고리 중간값 (팔로우 전환은 인스타 + DM, 그 기준 값이 없으면 '—')"
          >
            <div className={styles.tableWrap}>
              <table className={styles.compare}>
                <thead>
                  <tr>
                    <th>기준</th>
                    {RATE_COLUMNS.map(([key, text]) => (
                      <th key={key}>{text}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.basis}>
                      <td>
                        {BASIS_LABEL[row.basis]}
                        <small>{row.sampleSize}개 비교</small>
                      </td>
                      {RATE_COLUMNS.map(([key]) => (
                        <td key={key}>
                          {formatRate(row.media?.[key])}
                          <small>중간값 {formatRate(row.median?.[key])}</small>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </MoreDetails>
        <Card title="관리">
          <MediaEditForm
            key={`${media.categoryId}-${media.productType}-${media.memo}`}
            media={media}
            categories={categories}
          />
        </Card>
      </Stack>
    </>
  );
}
