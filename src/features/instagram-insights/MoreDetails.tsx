import type { ReactNode } from 'react';
import styles from './insights.module.css';

/** 한눈에 볼 것 아래에 숫자를 접어 둔다 (펼치면 표 · 차트) */
export function MoreDetails({
  open,
  children,
}: {
  // 안의 링크(탭)로 다시 그린 화면이면 펼친 채로
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details className={styles.more} open={open}>
      <summary>자세히 보기 — 숫자 · 차트</summary>
      <div className={styles.moreBody}>{children}</div>
    </details>
  );
}
