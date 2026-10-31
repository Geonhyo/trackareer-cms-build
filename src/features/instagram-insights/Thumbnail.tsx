'use client';

import { useState } from 'react';
import styles from './insights.module.css';

/**
 * 게시물 썸네일. 인스타 CDN 주소는 며칠 뒤 만료되므로 깨지면 회색 칸으로 둔다.
 * 외부 주소라 next/image 대신 img (이미지 최적화 · 도메인 설정이 필요 없게)
 */
export function Thumbnail({ src, size = 48 }: { src: string | null; size?: number }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return <span className={styles.thumb} style={{ width: size, height: size }} aria-hidden />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={styles.thumb}
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  );
}
