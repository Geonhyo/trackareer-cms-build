import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import styles from './ui.module.css';

const cx = (...names: Array<string | false | null | undefined>) => names.filter(Boolean).join(' ');

export type Tone = 'neutral' | 'brand' | 'positive' | 'critical' | 'warning';
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  variant = 'secondary',
  size,
  className,
  ...props
}: ComponentProps<'button'> & { variant?: Variant; size?: 'sm' }) {
  return (
    <button
      type="button"
      className={cx(styles.button, styles[variant], size && styles[size], className)}
      {...props}
    />
  );
}

export function LinkButton({
  variant = 'secondary',
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: 'sm' }) {
  return (
    <Link
      className={cx(styles.button, styles[variant], size && styles[size], className)}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
      {error ? (
        <span className={styles.fieldError}>{error}</span>
      ) : hint ? (
        <span className={styles.hint}>{hint}</span>
      ) : null}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cx(styles.input, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cx(styles.textarea, className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cx(styles.select, className)} {...props} />;
}

export function Checkbox({ label, ...props }: ComponentProps<'input'> & { label: ReactNode }) {
  return (
    <label className={styles.checkbox}>
      <input type="checkbox" {...props} />
      {label}
    </label>
  );
}

export function Card({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx(styles.card, className)}>
      {(title || action) && (
        <div className={styles.cardHeader}>
          <div>
            {title && <h2 className={styles.cardTitle}>{title}</h2>}
            {description && <div className={styles.cardDescription}>{description}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {description && <div className={styles.pageDescription}>{description}</div>}
      </div>
      {action}
    </header>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cx(styles.badge, styles[`tone-${tone}`])}>{children}</span>;
}

export function Notice({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div className={cx(styles.notice, styles[`tone-${tone}`])} role="status">
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
      {sub && <span className={styles.statSub}>{sub}</span>}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className={styles.empty}>{children}</div>;
}

export function Tabs({
  items,
  active,
}: {
  items: Array<{ key: string; label: ReactNode; href: string }>;
  active: string;
}) {
  return (
    <nav className={styles.tabs}>
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={cx(styles.tab, item.key === active && styles.tabActive)}
          aria-current={item.key === active ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function DefinitionList({
  items,
}: {
  items: Array<{ label: ReactNode; value: ReactNode }>;
}) {
  return (
    <dl className={styles.dl}>
      {items.map((item, index) => (
        <div key={index} style={{ display: 'contents' }}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.row, className)}>{children}</div>;
}

export function Stack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.stack, className)}>{children}</div>;
}

export function Grid({ children, min }: { children: ReactNode; min?: number }) {
  return (
    <div
      className={styles.grid}
      style={min ? ({ '--grid-min': `${min}px` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

/** 목록 아래 페이지 이동 (링크 — 서버 렌더) */
export function Pagination({
  page,
  limit,
  total,
  hrefFor,
}: {
  page: number;
  limit: number;
  total: number;
  hrefFor: (page: number) => string;
}) {
  const last = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(total, page * limit);
  return (
    <div className={styles.pagination}>
      <span className="num">
        {total.toLocaleString('ko-KR')}개 중 {start.toLocaleString('ko-KR')}–
        {end.toLocaleString('ko-KR')}
      </span>
      <div className={styles.pageLinks}>
        {page > 1 ? (
          <LinkButton size="sm" href={hrefFor(page - 1)}>
            이전
          </LinkButton>
        ) : (
          <Button size="sm" disabled>
            이전
          </Button>
        )}
        <span className="num" style={{ alignSelf: 'center', padding: '0 8px' }}>
          {page} / {last}
        </span>
        {page < last ? (
          <LinkButton size="sm" href={hrefFor(page + 1)}>
            다음
          </LinkButton>
        ) : (
          <Button size="sm" disabled>
            다음
          </Button>
        )}
      </div>
    </div>
  );
}
