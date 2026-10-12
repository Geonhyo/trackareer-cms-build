import type { ReactNode } from 'react';
import { Card, Notice } from '@/components/ui';
import { getSessionAdmin, isSuperAdmin } from '@/shared/auth/session';

/** 최고관리자 전용 화면. 서버 API도 막지만, 화면에서 먼저 안내한다 */
export async function SuperOnly({ children }: { children: ReactNode }) {
  if (isSuperAdmin(await getSessionAdmin())) return children;
  return (
    <Card title="최고관리자만 쓸 수 있어요">
      <Notice>이 화면은 최고관리자 계정으로 들어와야 보여요.</Notice>
    </Card>
  );
}
