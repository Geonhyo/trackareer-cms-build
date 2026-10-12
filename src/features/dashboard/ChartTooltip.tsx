'use client';

import styles from './dashboard.module.css';

/** 값이 먼저, 계열 이름은 뒤 · 색은 짧은 선으로 (dataviz 툴팁 규칙) */
export function ChartTooltip({
  active,
  payload,
  label,
  formatLabel,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ dataKey?: unknown; value?: unknown; name?: unknown; color?: string }>;
  label?: unknown;
  formatLabel?: (label: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>
        {formatLabel ? formatLabel(String(label)) : String(label)}
      </p>
      {payload.map((item) => (
        <p key={String(item.dataKey)} className={styles.tooltipRow}>
          <span className={styles.tooltipKey} style={{ background: item.color }} />
          <strong className="num">{Number(item.value).toLocaleString('ko-KR')}</strong>
          <span>{String(item.name)}</span>
        </p>
      ))}
    </div>
  );
}
