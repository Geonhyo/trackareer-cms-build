import type { Metadata } from 'next';
import { Card, PageHeader, Pagination, Stack } from '@/components/ui';
import { SuperOnly } from '@/components/layout/SuperOnly';
import { PushComposer } from '@/features/push/PushComposer';
import { PushHistory } from '@/features/push/PushHistory';
import { noticeState } from '@/features/notices/notice-status';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { pageParam, param, withQuery } from '@/shared/lib/url';

export const metadata: Metadata = { title: '푸시' };

const LIMIT = 20;
type SearchParams = Record<string, string | string[] | undefined>;

async function PushContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = pageParam(params.page);
  const [history, notices] = await Promise.all([
    adminApi<Schemas['PushCampaignListResponseDto']>('/admin/push', {
      query: { page, limit: LIMIT },
    }),
    adminApi<Schemas['AdminNoticeListResponseDto']>('/admin/notices'),
  ]);
  const liveNotices = notices.items
    .filter((notice) => noticeState(notice).text === '게시 중')
    .map(({ id, title }) => ({ id, title }));
  const noticeId = Number(param(params.noticeId)) || undefined;

  return (
    <>
      <PageHeader
        title="푸시"
        description="대상을 확인한 뒤 보내요. 같은 날 같은 내용은 한 번만 나가요."
      />
      <Stack>
        <div style={{ maxWidth: 880 }}>
          <PushComposer notices={liveNotices} initialNoticeId={noticeId} />
        </div>
        <Card title="보낸 이력">
          <PushHistory campaigns={history.items} />
          <Pagination
            page={page}
            limit={LIMIT}
            total={history.total}
            hrefFor={(next) => withQuery('/push', params, { page: next })}
          />
        </Card>
      </Stack>
    </>
  );
}

export default function PushPage(props: { searchParams: Promise<SearchParams> }) {
  return (
    <SuperOnly>
      <PushContent {...props} />
    </SuperOnly>
  );
}
