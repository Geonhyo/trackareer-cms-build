import Image from 'next/image';
import type { ReactNode } from 'react';
import styles from './auth.module.css';

export function AuthPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.screen}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <Image src="/brand/symbol.svg" alt="" width={28} height={28} />
          트래커리어 <small>CMS</small>
        </div>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        {children}
      </div>
    </main>
  );
}
