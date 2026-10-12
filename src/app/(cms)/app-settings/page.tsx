import type { Metadata } from 'next';
import { Notice, PageHeader, Stack } from '@/components/ui';
import { AppSettingsForms } from '@/features/app-settings/AppSettingsForms';
import { BuildDistribution } from '@/features/app-settings/BuildDistribution';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { getSessionAdmin, isSuperAdmin } from '@/shared/auth/session';

export const metadata: Metadata = { title: '앱 버전' };

export default async function AppSettingsPage() {
  const [{ item: settings }, admin] = await Promise.all([
    adminApi<Schemas['AdminAppSettingsResponseDto']>('/admin/app-settings'),
    getSessionAdmin(),
  ]);
  const readOnly = !isSuperAdmin(admin);
  return (
    <div style={{ maxWidth: 1040 }}>
      <PageHeader
        title="앱 버전"
        description="강제 · 권장 업데이트와 점검을 배포 없이 바꿔요. 2.0 앱이 시작할 때 읽어요."
      />
      <Stack>
        {readOnly && <Notice>보기만 할 수 있어요. 바꾸려면 최고관리자로 들어와 주세요.</Notice>}
        <BuildDistribution settings={settings} />
        <AppSettingsForms settings={settings} readOnly={readOnly} />
      </Stack>
    </div>
  );
}
