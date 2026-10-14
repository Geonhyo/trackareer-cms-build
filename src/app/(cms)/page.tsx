import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, PageHeader, Tabs } from '@/components/ui';
import { GrowthSection } from '@/features/dashboard/GrowthSection';
import { OverviewSection } from '@/features/dashboard/OverviewSection';
import {
  RANKING_DAYS,
  RankingSection,
  type RankingDays,
} from '@/features/dashboard/RankingSection';
import { param } from '@/shared/lib/url';

export const metadata: Metadata = { title: '대시보드' };

const TABS = [
  { key: 'overview', label: '현황', href: '/' },
  { key: 'growth', label: '성장', href: '/?tab=growth' },
  { key: 'ranking', label: '공고 순위', href: '/?tab=ranking' },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tab = param(params.tab) ?? 'overview';
  const days = (RANKING_DAYS as readonly string[]).includes(param(params.days) ?? '')
    ? (param(params.days) as RankingDays)
    : '30';

  return (
    <>
      <PageHeader
        title="대시보드"
        description="내부 계정(팀원 · 테스트 · 심사)은 모든 숫자에서 빠져요."
      />
      <Tabs items={TABS} active={tab} />
      <Suspense key={`${tab}-${days}`} fallback={<Card>불러오는 중…</Card>}>
        {tab === 'growth' ? (
          <GrowthSection />
        ) : tab === 'ranking' ? (
          <RankingSection days={days} />
        ) : (
          <OverviewSection />
        )}
      </Suspense>
    </>
  );
}
