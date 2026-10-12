import type { Metadata } from 'next';
import { LinkButton, PageHeader } from '@/components/ui';
import { NoticesTable } from '@/features/notices/NoticesTable';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';

export const metadata: Metadata = { title: '공지' };

export default async function NoticesPage() {
  const result = await adminApi<Schemas['AdminNoticeListResponseDto']>('/admin/notices');
  return (
    <>
      <PageHeader
        title="공지"
        description="앱 공지 목록과 시작 모달에 나와요. 지우지 않고 종료 시각으로 내려요."
        action={
          <LinkButton href="/notices/new" variant="primary">
            새 공지
          </LinkButton>
        }
      />
      <NoticesTable notices={result.items} />
    </>
  );
}
