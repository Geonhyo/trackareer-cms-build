import Link from 'next/link';
import { Badge, Notice, Stack } from '@/components/ui';
import type { Schemas } from '@/shared/api/types';
import { formatDateTime } from '@/shared/lib/format';
import styles from './status.module.css';

type Alert = Schemas['AdminAlertDto'];

// 징후마다 볼 화면
const SOURCE_PAGE: Record<string, { href: string; label: string }> = {
  SERVER: { href: '/status', label: '상태' },
  BATCH: { href: '/status', label: '상태' },
  EXTRACTION: { href: '/extraction', label: '공고 추출' },
};

export function AlertList({ alerts, withLinks }: { alerts: Alert[]; withLinks?: boolean }) {
  if (alerts.length === 0) {
    return <Notice tone="positive">지금 이상 징후가 없어요.</Notice>;
  }
  return (
    <Stack>
      {alerts.map((alert) => (
        <div key={alert.key} className={styles.alert} data-level={alert.level}>
          <div className={styles.alertHead}>
            <Badge tone={alert.level === 'critical' ? 'critical' : 'warning'}>
              {alert.level === 'critical' ? '심각' : '주의'}
            </Badge>
            <strong>{alert.title}</strong>
          </div>
          <p className={styles.alertDetail}>
            {alert.detail}
            {alert.since && <span> · {formatDateTime(alert.since)}부터</span>}
          </p>
          {withLinks && (
            <Link href={SOURCE_PAGE[alert.source]?.href ?? '/status'} className={styles.alertLink}>
              {SOURCE_PAGE[alert.source]?.label ?? '상태'}에서 보기 →
            </Link>
          )}
        </div>
      ))}
    </Stack>
  );
}
