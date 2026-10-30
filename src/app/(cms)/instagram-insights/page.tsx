import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, LinkButton, PageHeader, Row, Stack, Tabs } from '@/components/ui';
import { ActionButton } from '@/components/ui/ActionButton';
import { syncInsightsAction } from '@/features/instagram-insights/actions';
import { CategoriesSection } from '@/features/instagram-insights/CategoriesSection';
import { BASES, INSIGHTS_DAYS } from '@/features/instagram-insights/insights-types';
import { MediaSection } from '@/features/instagram-insights/MediaSection';
import { OverviewSection } from '@/features/instagram-insights/OverviewSection';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { getSessionAdmin, isSuperAdmin } from '@/shared/auth/session';
import { formatDateTime } from '@/shared/lib/format';
import { param, withQuery } from '@/shared/lib/url';

export const metadata: Metadata = { title: '인스타 성과' };

const TABS = [
  { key: 'overview', label: '개요' },
  { key: 'media', label: '게시물' },
  { key: 'categories', label: '카테고리 비교' },
];

const pick = <T extends string>(value: string | undefined, allowed: readonly T[], fallback: T) =>
  allowed.includes(value as T) ? (value as T) : fallback;

/** 마지막으로 성공한 수집 (배치 실행 기록) */
async function lastCollectedAt(): Promise<string | null> {
  const { items } = await adminApi<Schemas['AdminBatchJobSummaryResponseDto']>(
    '/admin/batch-runs/summary',
  ).catch(() => ({ items: [] }));
  const job = items.find((item) => item.jobName === 'instagram-insights');
  return job?.lastSuccessAt ?? null;
}

export default async function InstagramInsightsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tab = pick(param(params.tab), ['overview', 'media', 'categories'], 'overview');
  const days = pick(param(params.days), INSIGHTS_DAYS, '30');
  const basis = pick(param(params.basis), BASES, 'final');
  const [collectedAt, admin] = await Promise.all([lastCollectedAt(), getSessionAdmin()]);

  return (
    <>
      <PageHeader
        title="인스타 성과"
        description={`마지막 수집 ${formatDateTime(collectedAt)} · 게시 후 30일까지 매일 06:00에 수집해요`}
        action={
          <Row>
            <LinkButton href="/instagram-insights/categories">카테고리 관리</LinkButton>
            {isSuperAdmin(admin) && (
              <ActionButton
                action={syncInsightsAction}
                confirm="지금 한 번 수집할까요? 처음이면 전체 게시물을 등록해 1분쯤 걸릴 수 있어요."
              >
                지금 수집
              </ActionButton>
            )}
          </Row>
        }
      />
      <Stack>
        <Tabs
          active={tab}
          items={TABS.map((item) => ({
            ...item,
            href: withQuery('/instagram-insights', {}, { tab: item.key, days }),
          }))}
        />
        <Tabs
          active={days}
          items={INSIGHTS_DAYS.map((value) => ({
            key: value,
            label: `최근 ${value}일 게시`,
            href: withQuery(
              '/instagram-insights',
              {},
              { tab, days: value, basis: tab === 'categories' ? basis : undefined },
            ),
          }))}
        />
        <Suspense key={JSON.stringify(params)} fallback={<Card>불러오는 중…</Card>}>
          {tab === 'media' ? (
            <MediaSection days={days} params={params} />
          ) : tab === 'categories' ? (
            <CategoriesSection days={days} basis={basis} />
          ) : (
            <OverviewSection days={days} />
          )}
        </Suspense>
      </Stack>
    </>
  );
}
