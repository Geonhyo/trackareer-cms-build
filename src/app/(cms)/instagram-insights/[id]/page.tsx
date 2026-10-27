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
  Tabs,
} from '@/components/ui';
import { BarList } from '@/features/dashboard/BarList';
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
import { MediaEditForm } from '@/features/instagram-insights/MediaEditForm';
import { Thumbnail } from '@/features/instagram-insights/Thumbnail';
import styles from '@/features/instagram-insights/insights.module.css';
import { adminApi } from '@/shared/api/admin-api';
import { ApiError } from '@/shared/api/errors';
import type { Schemas } from '@/shared/api/types';
import { formatDateTime, formatNumber, formatPercent } from '@/shared/lib/format';
import { MEDIA_CATEGORY_LABEL, MEDIA_PRODUCT_LABEL, label } from '@/shared/lib/labels';
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

/** 단계 비율 (앞 단계 대비) */
const step = (value: number | null | undefined, prev: number | null | undefined) =>
  value === null || value === undefined || !prev ? undefined : formatPercent(value / prev, 1);

function DmFunnel({ media }: { media: MediaItem }) {
  if (!media.dm) {
    return (
      <Stack>
        <Notice>DM 자동화에 등록되지 않은 게시물이에요.</Notice>
        <div>
          <LinkButton href="/instagram-dm/new">인스타 DM에 등록하기</LinkButton>
        </div>
      </Stack>
    );
  }
  const reach = media.metrics?.reach ?? 0;
  const comments = media.metrics?.comments ?? 0;
  const { firstDmCount, linkSentCount } = media.dm;
  return (
    <BarList
      max={Math.max(1, reach)}
      items={[
        { key: 'reach', name: '도달', value: reach },
        { key: 'comments', name: '댓글', value: comments, sub: step(comments, reach) },
        { key: 'firstDm', name: '첫 DM', value: firstDmCount, sub: step(firstDmCount, comments) },
        {
          key: 'link',
          name: '링크 발송',
          value: linkSentCount,
          sub: step(linkSentCount, firstDmCount),
        },
      ]}
    />
  );
}

export default async function InstagramMediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { media, snapshots, comparison } = await loadDetail(id);
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
            <Badge tone="brand">{label(MEDIA_CATEGORY_LABEL, media.category)}</Badge>
            {media.categorySource === 'MANUAL' && <Badge>수동 분류</Badge>}
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
          description="누적값과 앞 수집 대비 증가 (경과일 = 게시 후 24시간 단위)"
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
        <Grid min={420}>
          <Card
            title="같은 카테고리와 비교"
            description="이 게시물 값 / 같은 카테고리 중앙값 (그날 수집이 없으면 '—')"
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
                          <small>중앙값 {formatRate(row.median[key])}</small>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="DM 퍼널" description="도달 → 댓글 → 첫 DM → 링크 발송 (앞 단계 대비)">
            <DmFunnel media={media} />
          </Card>
        </Grid>
        <Card title="관리">
          <MediaEditForm key={`${media.category}-${media.memo}`} media={media} />
        </Card>
      </Stack>
    </>
  );
}
