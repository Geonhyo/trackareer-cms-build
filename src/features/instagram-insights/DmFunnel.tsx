import { BarList } from '@/features/dashboard/BarList';
import type { Schemas } from '@/shared/api/types';
import { formatDate, formatNumber, formatPercent } from '@/shared/lib/format';
import styles from './insights.module.css';

type Funnel = Schemas['AdminInstagramDmFunnelDto'];

/** 앞 단계 대비 비율 (분모가 0이면 없음) */
export const share = (part: number, whole: number) =>
  whole ? formatPercent(part / whole, 0) : undefined;

/** 기록 시작 안내 */
export const funnelSinceText = (since: string | null) =>
  since ? `${formatDate(since)}부터 기록` : '자동 DM을 등록하면 기록돼요';

/** 자동 DM 단계를 한 문장 + 단계별 막대로 (앞 단계 대비 %) */
export function DmFunnel({ funnel, since }: { funnel: Funnel; since: string | null }) {
  if (!funnel.firstDm && !funnel.tapped) {
    return <p className={styles.muted}>아직 기록이 없어요 ({funnelSinceText(since)}).</p>;
  }
  return (
    <>
      <p>
        첫 DM을 받은 {formatNumber(funnel.firstDm)}명 중 <b>{formatNumber(funnel.tapped)}명</b>이
        &apos;링크 받기&apos;를 눌렀고, 팔로우 요청을 받은 {formatNumber(funnel.askedFollow)}명 중{' '}
        <b>{formatNumber(funnel.followed)}명</b>이 팔로우했어요.
      </p>
      <BarList
        max={Math.max(1, funnel.firstDm, funnel.tapped)}
        items={[
          { key: 'firstDm', name: '첫 DM', value: funnel.firstDm },
          {
            key: 'tapped',
            name: "'링크 받기' 누름",
            value: funnel.tapped,
            sub: share(funnel.tapped, funnel.firstDm),
          },
          {
            key: 'already',
            name: '└ 원래 팔로워',
            value: funnel.alreadyFollower,
            sub: share(funnel.alreadyFollower, funnel.tapped),
          },
          {
            key: 'asked',
            name: '└ 팔로우 요청 받음',
            value: funnel.askedFollow,
            sub: share(funnel.askedFollow, funnel.tapped),
          },
          {
            key: 'followTapped',
            name: "'팔로우했어요' 누름",
            value: funnel.followTapped,
            sub: share(funnel.followTapped, funnel.askedFollow),
          },
          {
            key: 'followed',
            name: 'DM으로 팔로우',
            value: funnel.followed,
            sub: share(funnel.followed, funnel.askedFollow),
          },
          {
            key: 'link',
            name: '링크 받음',
            value: funnel.linkSent,
            sub: share(funnel.linkSent, funnel.tapped),
          },
        ]}
      />
    </>
  );
}
