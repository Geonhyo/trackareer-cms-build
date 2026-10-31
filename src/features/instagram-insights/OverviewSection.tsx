import Link from 'next/link';
import { Card, DefinitionList, Grid, LinkButton, Notice, Stack, Stat } from '@/components/ui';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { formatNumber } from '@/shared/lib/format';
import { DmFunnel, funnelSinceText, share } from './DmFunnel';
import { focusText } from './focus';
import { formatRate, type MediaItem } from './insights-types';
import { FollowerChangeChart, FollowersChart } from './InsightsCharts';
import { MoreDetails } from './MoreDetails';
import { Thumbnail } from './Thumbnail';
import { SignalChips, VerdictBadge, VerdictBar, verdictReason, type VerdictRules } from './verdict';
import styles from './insights.module.css';

type Overview = Schemas['AdminInstagramOverviewDto'];

const signed = (value: number) => `${value > 0 ? '+' : ''}${formatNumber(value)}`;

/** 이번 주 팔로워 증감을 지난주와 비교한 한 줄 */
function followerTrend({ thisWeek, lastWeek }: Overview['followers']): string {
  if (thisWeek === null) return '일주일치 기록이 쌓이면 보여요';
  if (lastWeek === null) return '지난주 기록이 아직 없어요';
  const gap = thisWeek - lastWeek;
  if (gap === 0) return `지난주(${signed(lastWeek)})와 같아요`;
  return `지난주(${signed(lastWeek)})보다 ${formatNumber(Math.abs(gap))}명 ${gap > 0 ? '더 늘었어요' : '덜 늘었어요'}`;
}

function PickCard({
  title,
  media,
  rules,
}: {
  title: string;
  media: MediaItem | null;
  rules: VerdictRules;
}) {
  return (
    <Card title={title}>
      {media ? (
        <Link href={`/instagram-insights/${media.id}`} className={styles.pickCard}>
          <Thumbnail src={media.thumbnailUrl} size={72} />
          <span className={styles.pickBody}>
            <span className={styles.title}>
              <VerdictBadge verdict={media.verdict} />
              <b>{media.title || '(캡션 없음)'}</b>
            </span>
            <span>{verdictReason(media, rules)}</span>
            <SignalChips verdict={media.verdict} />
          </span>
        </Link>
      ) : (
        <p className={styles.muted}>판정한 게시물이 아직 없어요.</p>
      )}
    </Card>
  );
}

/** 요약: 한눈에(팔로워 · 성적 · DM 팔로우) → 집중할 것 → 잘된 · 부진한 게시물 → 숫자는 접어서 */
export async function OverviewSection() {
  const { item } = await adminApi<Schemas['AdminInstagramOverviewResponseDto']>(
    '/admin/instagram/overview',
  );
  const { followers, dmFunnel, totals, rules } = item;

  return (
    <Stack>
      <Grid min={240}>
        <Card>
          <Stat
            label="이번 주 팔로워"
            value={followers.thisWeek === null ? '—' : `${signed(followers.thisWeek)}명`}
            sub={`${followerTrend(followers)} · 지금 ${formatNumber(followers.current)}명`}
          />
        </Card>
        <Card>
          <Stack>
            <Stat
              label="최근 30일 게시물 성적"
              value={`${formatNumber(item.mediaCount)}개`}
              sub={`같은 카테고리 평소(게시 ${rules.verdictDay}일 기준)와 비교`}
            />
            <VerdictBar counts={item.verdicts} />
          </Stack>
        </Card>
        <Card>
          <Stat
            label="자동 DM으로 팔로우"
            value={`${formatNumber(dmFunnel.followed)}명`}
            sub={
              dmFunnel.askedFollow
                ? `팔로우 요청 받은 ${formatNumber(dmFunnel.askedFollow)}명 중 ${share(dmFunnel.followed, dmFunnel.askedFollow)} · ${funnelSinceText(rules.funnelSince)}`
                : `아직 팔로우 요청 기록이 없어요 · ${funnelSinceText(rules.funnelSince)}`
            }
          />
        </Card>
      </Grid>

      <Card title="집중할 것" description="쌓인 성적에서 골라낸 것">
        {item.focus.length ? (
          <Stack>
            {item.focus.map((focus) => {
              const text = focusText(focus);
              return (
                <Notice key={focus.kind} tone={focus.tone}>
                  <div className={styles.focusItem}>
                    <div className={styles.focusBody}>
                      <b>{text.title}</b>
                      <p>{text.detail}</p>
                    </div>
                    {text.href && (
                      <LinkButton href={text.href} size="sm">
                        바로 가기
                      </LinkButton>
                    )}
                  </div>
                </Notice>
              );
            })}
          </Stack>
        ) : (
          <p className={styles.muted}>
            아직 짚을 게 없어요. 게시물이 {rules.verdictDay}일 넘게 쌓이면 카테고리끼리 비교해 알려
            드려요.
          </p>
        )}
      </Card>

      <Grid min={320}>
        <PickCard title="가장 잘된 게시물" media={item.best} rules={rules} />
        <PickCard title="가장 부진한 게시물" media={item.worst} rules={rules} />
      </Grid>

      <MoreDetails>
        <Card title="최근 30일 게시물 합계">
          <DefinitionList
            items={[
              { label: '도달', value: formatNumber(totals.reach) },
              { label: '저장', value: formatNumber(totals.saved) },
              { label: '공유', value: formatNumber(totals.shares) },
              { label: '팔로우 합계 (인스타 + DM)', value: formatNumber(totals.follows) },
              { label: '팔로우 전환 (합계 ÷ 도달)', value: formatRate(item.followRate) },
            ]}
          />
        </Card>
        <Grid min={360}>
          <Card title="팔로워 추이" description="하루 한 번 06:00에 센 값">
            <FollowersChart days={followers.daily} />
          </Card>
          <Card title="일별 팔로워 증감">
            <FollowerChangeChart days={followers.daily} />
          </Card>
        </Grid>
        <Card
          title="자동 DM 단계"
          description={`최근 30일 게시물 합 · ${funnelSinceText(rules.funnelSince)}`}
        >
          <DmFunnel funnel={dmFunnel} since={rules.funnelSince} />
        </Card>
      </MoreDetails>
    </Stack>
  );
}
