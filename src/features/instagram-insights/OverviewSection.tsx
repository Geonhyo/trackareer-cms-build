import Link from 'next/link';
import { Card, Grid, Stack, Stat } from '@/components/ui';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { formatNumber } from '@/shared/lib/format';
import { formatRate } from './insights-types';
import { FollowerChangeChart, FollowersChart } from './InsightsCharts';
import { Thumbnail } from './Thumbnail';
import styles from './insights.module.css';

const signed = (value: number | null) =>
  value === null ? '—' : `${value > 0 ? '+' : ''}${formatNumber(value)}`;

export async function OverviewSection({ days }: { days: string }) {
  const { item } = await adminApi<Schemas['AdminInstagramOverviewResponseDto']>(
    '/admin/instagram/overview',
    { query: { days } },
  );
  const { followers, totals } = item;

  return (
    <Stack>
      <Grid min={200}>
        <Card>
          <Stat
            label="팔로워"
            value={`${formatNumber(followers.current)}명`}
            sub={`기간 ${signed(followers.change)}명`}
          />
        </Card>
        <Card>
          <Stat label="기간 게시물" value={`${formatNumber(item.mediaCount)}개`} />
        </Card>
        <Card>
          <Stat
            label="기간 팔로우 합"
            value={`${formatNumber(totals.follows)}명`}
            sub="게시물에서 생긴 팔로우"
          />
        </Card>
        <Card>
          <Stat
            label="평균 팔로우 전환율"
            value={formatRate(item.followRate)}
            sub="팔로우 합 ÷ 도달 합 (피드)"
          />
        </Card>
      </Grid>
      <Grid min={360}>
        <Card title="팔로워 추이" description="하루 한 번 06:00에 센 값">
          <FollowersChart days={followers.daily} />
        </Card>
        <Card title="일별 팔로워 증감">
          <FollowerChangeChart days={followers.daily} />
        </Card>
      </Grid>
      <Card title="팔로우 많은 게시물" description="기간에 올린 게시물 중 최신 누적값 기준">
        {item.topMedia.length === 0 ? (
          <p className={styles.muted}>기간에 올린 게시물이 없어요.</p>
        ) : (
          <div className={styles.topList}>
            {item.topMedia.map((media) => (
              <Link
                key={media.id}
                href={`/instagram-insights/${media.id}`}
                className={styles.topItem}
              >
                <Thumbnail src={media.thumbnailUrl} size={64} />
                <span className={styles.topTitle}>{media.title || '(캡션 없음)'}</span>
                <span className={styles.muted}>
                  팔로우 {formatNumber(media.metrics?.follows)} · 도달{' '}
                  {formatNumber(media.metrics?.reach)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </Stack>
  );
}
