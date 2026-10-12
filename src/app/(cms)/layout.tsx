import { Sidebar } from '@/components/layout/Sidebar';
import styles from '@/components/layout/AppShell.module.css';
import { Button } from '@/components/ui';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { loadAlerts } from '@/features/status/load-alerts';
import { logoutAction } from '@/shared/auth/actions';
import { getSessionAdmin, isSuperAdmin } from '@/shared/auth/session';

// 메뉴 옆 숫자: 답변 대기 문의, 이상 징후 (상태 · 공고 추출)
async function loadBadges(): Promise<Record<string, number>> {
  const [inquiries, alerts] = await Promise.all([
    adminApi<Schemas['AdminInquiryListResponseDto']>('/admin/inquiries', {
      query: { status: 'PENDING', limit: 1 },
    }).catch(() => null),
    loadAlerts(),
  ]);
  const count = (source: string) => alerts?.filter((alert) => alert.source === source).length ?? 0;
  return {
    '/inquiries': inquiries?.total ?? 0,
    '/status': count('SERVER') + count('BATCH'),
    '/extraction': count('EXTRACTION'),
  };
}

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const [admin, badges] = await Promise.all([getSessionAdmin(), loadBadges()]);
  return (
    <div className={styles.shell}>
      <Sidebar isSuper={isSuperAdmin(admin)} badges={badges} />
      <header className={styles.topbar}>
        <span className={styles.who}>
          {admin?.name} · {admin?.role === 'SUPER_ADMIN' ? '최고관리자' : '관리자'}
        </span>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm">
            로그아웃
          </Button>
        </form>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
