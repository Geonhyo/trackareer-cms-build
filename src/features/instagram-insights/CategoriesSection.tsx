import { Card, Stack } from '@/components/ui';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { formatNumber } from '@/shared/lib/format';
import { CategoriesTable } from './CategoriesTable';
import { perThousand } from './insights-types';
import { CategoryFollowsChart } from './InsightsCharts';
import { MoreDetails } from './MoreDetails';
import { SignalChips, VerdictBar } from './verdict';
import styles from './insights.module.css';

type Stat = Schemas['AdminInstagramCategoryStatDto'];
type Rules = Schemas['AdminInstagramVerdictRulesDto'];

/** 카드 한 장의 핵심 문장: 이 카테고리가 무엇을 얼마나 데려오는지 */
function headline(stat: Stat, rules: Rules): string {
  if (stat.rank === null) {
    return `${rules.verdictDay}일이 지난 게시물이 ${stat.judgedCount}개라 아직 비교하지 않아요 (${rules.minPosts}개부터)`;
  }
  return stat.metric === 'ENGAGEMENT'
    ? `도달 1,000명당 저장 · 공유 ${perThousand(stat.engagementRateMedian)}개 (인스타가 릴스 팔로우 수를 주지 않아 저장 · 공유로 봐요)`
    : `도달 1,000명당 팔로우 ${perThousand(stat.followRateMedian)}명`;
}

/** 카테고리 비교: 팔로우를 잘 데려오는 순서대로 카드 → 숫자는 접어서 */
export async function CategoriesSection() {
  const { item } = await adminApi<Schemas['AdminInstagramCategoriesResponseDto']>(
    '/admin/instagram/categories',
  );

  return (
    <Stack>
      <p className={styles.muted}>
        전체 게시물을 게시 {item.rules.verdictDay}일 시점 값으로 비교해요. 팔로우는 인스타가 센
        팔로우와 자동 DM으로 생긴 팔로우를 더한 값이에요. 칩은 전체 게시물 평소와 비교한 강점 ·
        약점이에요.
      </p>
      <div className={styles.categoryCards}>
        {item.items.map((stat) => (
          <Card key={stat.categoryId}>
            <Stack>
              <span className={styles.rank}>
                {stat.rank === null ? '비교 전' : `${stat.rank}위`} · 게시물{' '}
                {formatNumber(stat.mediaCount)}개
              </span>
              <b>{stat.name}</b>
              <span>{headline(stat, item.rules)}</span>
              <SignalChips signals={stat.signals} />
              <VerdictBar counts={stat.verdicts} />
            </Stack>
          </Card>
        ))}
      </div>
      <MoreDetails>
        <Card
          title="카테고리별 숫자"
          description={`게시 ${item.rules.verdictDay}일 시점 중간값 (게시물별 비율의 중간값)`}
        >
          <CategoriesTable items={item.items} />
        </Card>
        <Card
          title="카테고리별 팔로우 평균"
          description={`게시 ${item.rules.verdictDay}일 시점, 인스타 + DM`}
        >
          <CategoryFollowsChart items={item.items} />
        </Card>
      </MoreDetails>
    </Stack>
  );
}
