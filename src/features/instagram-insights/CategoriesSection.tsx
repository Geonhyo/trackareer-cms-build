import { Card, Stack, Tabs } from '@/components/ui';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { formatDate } from '@/shared/lib/format';
import { withQuery } from '@/shared/lib/url';
import { CategoriesTable } from './CategoriesTable';
import { BASES, BASIS_LABEL } from './insights-types';
import { CategoryFollowsChart } from './InsightsCharts';
import styles from './insights.module.css';

export async function CategoriesSection({ days, basis }: { days: string; basis: string }) {
  const { item } = await adminApi<Schemas['AdminInstagramCategoriesResponseDto']>(
    '/admin/instagram/categories',
    { query: { days, basis } },
  );

  return (
    <Stack>
      <Tabs
        active={basis}
        items={BASES.map((key) => ({
          key,
          label: `${BASIS_LABEL[key]} 기준`,
          href: withQuery('/instagram-insights', {}, { tab: 'categories', days, basis: key }),
        }))}
      />
      <p className={styles.muted}>
        {formatDate(item.from)}부터 올린 게시물 ·{' '}
        {basis === 'final'
          ? '마지막 수집값(30일 추적이 끝났거나 최신)'
          : `게시 후 ${BASIS_LABEL[basis]}(24시간 단위) 값. 그날 수집이 없는 게시물은 빠져요`}{' '}
        · 비율은 게시물별 비율의 중앙값
      </p>
      <Card>
        <CategoriesTable items={item.items} />
      </Card>
      <Card title="카테고리별 팔로우 평균">
        <CategoryFollowsChart items={item.items} />
      </Card>
    </Stack>
  );
}
