'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NAV } from './nav';
import styles from './AppShell.module.css';

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

export function Sidebar({ isSuper, badges }: { isSuper: boolean; badges: Record<string, number> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={styles.menuButton}
        aria-label="메뉴 열기"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>
      <aside className={styles.sidebar} data-open={open}>
        <Link href="/" className={styles.brand}>
          <Image src="/brand/symbol.svg" alt="" width={24} height={24} />
          트래커리어 <small>CMS</small>
        </Link>
        <nav className={styles.nav}>
          {NAV.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              <p className={styles.navLabel}>{group.label}</p>
              {group.items
                .filter((item) => isSuper || !item.superOnly)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={styles.navItem}
                    aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                    // 모바일: 메뉴를 고르면 닫는다
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                    {badges[item.href] ? (
                      <span className={styles.navBadge}>{badges[item.href]}</span>
                    ) : null}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
      </aside>
      {open && <div className={styles.scrim} onClick={() => setOpen(false)} />}
    </>
  );
}
