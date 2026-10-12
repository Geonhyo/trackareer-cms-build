import type { Schemas } from '@/shared/api/types';
import { formatDate, formatPercent } from '@/shared/lib/format';
import styles from './dashboard.module.css';

// 순차 색(파랑 한 색, 연함 → 진함). 진한 칸은 흰 글자
const STEPS = ['#eaf0fa', '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95'];

function cellStyle(ratio: number) {
  const index = Math.min(STEPS.length - 1, Math.floor(ratio * STEPS.length));
  return { background: STEPS[index], color: index >= 4 ? '#ffffff' : 'var(--fg-neutral)' };
}

export function CohortTable({ cohorts }: { cohorts: Schemas['AdminCohortDto'][] }) {
  const weeks = cohorts[0]?.retention?.length ?? 0;
  return (
    <div className={styles.cohortWrap}>
      <table className={styles.cohort}>
        <thead>
          <tr>
            <th>가입 주</th>
            <th>가입</th>
            {Array.from({ length: weeks }, (_, index) => (
              <th key={index}>{index + 1}주차</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort) => (
            <tr key={cohort.weekStart}>
              <td>{formatDate(cohort.weekStart)}</td>
              <td className="num">{cohort.size}명</td>
              {(cohort.retention ?? []).map((ratio, index) =>
                ratio === null ? (
                  <td key={index} className={styles.cohortEmpty} />
                ) : (
                  <td key={index} style={cohort.size ? cellStyle(ratio) : undefined}>
                    {cohort.size ? formatPercent(ratio, 0) : '—'}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.note}>
        가입한 주의 회원 중 다음 몇 주차에 앱을 한 번이라도 연 비율이에요. 빈 칸은 아직 다 지나지
        않은 주예요.
      </p>
    </div>
  );
}
