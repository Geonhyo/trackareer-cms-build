import { Badge, type Tone } from '@/components/ui';
import type { Schemas } from '@/shared/api/types';
import type { MediaItem } from './insights-types';
import styles from './insights.module.css';

type Verdict = Schemas['AdminInstagramVerdictDto'];
type VerdictLevel = Verdict['level'];
type Signal = Schemas['AdminInstagramSignalDto'];
type VerdictCounts = Schemas['AdminInstagramVerdictCountsDto'];
export type VerdictRules = Schemas['AdminInstagramVerdictRulesDto'];

// 서버 domain/media-verdict: 같은 카테고리 중간값 대비 rules.goodRatio 이상 잘됨 · rules.weakRatio 이하 부진
export const VERDICT_LABEL: Record<VerdictLevel, string> = {
  GOOD: '잘됨',
  OK: '보통',
  WEAK: '부진',
  PENDING: '집계 중',
  NO_BASELINE: '비교 대상 부족',
};
const VERDICT_TONE: Record<VerdictLevel, Tone> = {
  GOOD: 'positive',
  OK: 'neutral',
  WEAK: 'critical',
  PENDING: 'neutral',
  NO_BASELINE: 'neutral',
};
export const VERDICT_FILTERS = Object.keys(VERDICT_LABEL) as VerdictLevel[];

const SIGNAL_LABEL: Record<Signal['key'], string> = {
  reach: '도달',
  followRate: '팔로우 전환',
  saveRate: '저장',
  shareRate: '공유',
};

const times = (ratio: number) => `${ratio.toFixed(1)}배`;

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return <Badge tone={VERDICT_TONE[verdict.level]}>{VERDICT_LABEL[verdict.level]}</Badge>;
}

/** 어느 시점 값으로 판정했는지 */
export function basisPhrase(verdict: Verdict, rules: VerdictRules): string {
  if (verdict.provisional) return `게시 ${rules.provisionalDay}일 기준 잠정`;
  return verdict.basis === 'final' ? '최종값 기준' : `게시 ${rules.verdictDay}일 기준`;
}

/** 판정 규칙 한 줄 */
export const rulesPhrase = (rules: VerdictRules) =>
  `같은 카테고리 중간값의 ${rules.goodRatio}배 이상이면 잘됨, ${rules.weakRatio}배 이하면 부진`;

/** 성적 이유 한 줄: "단건공고 캐러셀 평소보다 팔로우 전환 2.1배" */
export function verdictReason(media: MediaItem, rules: VerdictRules): string {
  const { verdict } = media;
  if (verdict.level === 'PENDING') {
    return media.dayIndex === null
      ? '아직 수집 전이에요'
      : `게시 ${media.dayIndex}일째 — ${rules.provisionalDay}일이 지나면 판정해요`;
  }
  if (verdict.level === 'NO_BASELINE' || verdict.ratio === null) {
    return `${media.categoryName} 게시물이 ${rules.minPosts}개 이상 쌓이면 비교해요`;
  }
  const what = verdict.metric === 'FOLLOW' ? '팔로우 전환' : '저장 · 공유';
  const basis = verdict.basis === 'd7' ? '' : ` (${basisPhrase(verdict, rules)})`;
  return `${media.categoryName} 평소보다 ${what} ${times(verdict.ratio)}${basis}`;
}

/** 강점 · 약점 칩. verdict를 주면 이유 문장에 이미 있는 판정 지표는 뺀다 */
export function SignalChips({ signals, verdict }: { signals?: Signal[]; verdict?: Verdict }) {
  const skip = verdict?.metric === 'FOLLOW' ? 'followRate' : undefined;
  const shown = (signals ?? verdict?.signals ?? []).filter((signal) => signal.key !== skip);
  if (!shown.length) return null;
  return (
    <span className={styles.title}>
      {shown.map((signal) => (
        <Badge key={signal.key} tone={signal.ratio >= 1 ? 'positive' : 'critical'}>
          {SIGNAL_LABEL[signal.key]} {signal.ratio >= 1 ? '↑' : '↓'} {times(signal.ratio)}
        </Badge>
      ))}
    </span>
  );
}

const BAR_LEVELS: Array<{ level: VerdictLevel; className: string }> = [
  { level: 'GOOD', className: styles.barGood },
  { level: 'OK', className: styles.barOk },
  { level: 'WEAK', className: styles.barWeak },
  { level: 'PENDING', className: styles.barPending },
  { level: 'NO_BASELINE', className: styles.barPending },
];

/** 성적 분포 막대 + 범례 (잘됨 · 보통 · 부진, 판정 못 한 것은 회색) */
export function VerdictBar({ counts }: { counts: VerdictCounts }) {
  const total = BAR_LEVELS.reduce((sum, { level }) => sum + counts[level], 0);
  const unjudged = counts.PENDING + counts.NO_BASELINE;
  if (!total) return <p className={styles.muted}>게시물이 없어요.</p>;
  return (
    <div className={styles.verdictBar}>
      <div className={styles.barTrackStacked}>
        {BAR_LEVELS.map(({ level, className }) =>
          counts[level] ? (
            <span
              key={level}
              className={className}
              style={{ flexGrow: counts[level] }}
              title={`${VERDICT_LABEL[level]} ${counts[level]}`}
            />
          ) : null,
        )}
      </div>
      <div className={styles.muted}>
        잘됨 <b className={styles.good}>{counts.GOOD}</b> · 보통 {counts.OK} · 부진{' '}
        <b className={styles.weak}>{counts.WEAK}</b>
        {unjudged > 0 && ` · 아직 판정 전 ${unjudged}`}
      </div>
    </div>
  );
}
