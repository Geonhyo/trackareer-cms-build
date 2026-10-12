import type { ReactNode } from 'react';
import styles from './dashboard.module.css';

/** 가로 막대 목록 (값은 숫자로 항상 보인다 — 막대는 비교용) */
export function BarList({
  items,
  max,
}: {
  items: Array<{ key: string; name: ReactNode; value: number; sub?: ReactNode }>;
  max?: number;
}) {
  const top = max ?? Math.max(1, ...items.map((item) => item.value));
  if (items.length === 0) return <p className={styles.note}>데이터가 없어요.</p>;
  return (
    <div className={styles.barList}>
      {items.map((item) => (
        <div key={item.key} className={styles.barRow}>
          <span className={styles.barName}>{item.name}</span>
          <span className={styles.barTrack}>
            <span
              className={styles.barFill}
              style={{ width: `${Math.max(2, (item.value / top) * 100)}%`, display: 'block' }}
            />
          </span>
          <span className={styles.barValue}>
            {item.value.toLocaleString('ko-KR')}
            {item.sub && <small>{item.sub}</small>}
          </span>
        </div>
      ))}
    </div>
  );
}
