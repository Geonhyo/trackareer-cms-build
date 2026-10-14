import type { Metadata } from 'next';
import { LinkButton, PageHeader, Stack } from '@/components/ui';
import { InstagramAccountCard } from '@/features/instagram-dm/InstagramAccountCard';
import { InstagramDmTable } from '@/features/instagram-dm/InstagramDmTable';
import { AlertList } from '@/features/status/AlertList';
import { loadAlerts } from '@/features/status/load-alerts';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { getSessionAdmin, isSuperAdmin } from '@/shared/auth/session';

export const metadata: Metadata = { title: '인스타 DM' };

export default async function InstagramDmPage() {
  const [result, alerts, admin] = await Promise.all([
    adminApi<Schemas['AdminInstagramDmPostListResponseDto']>('/admin/instagram-dm/posts'),
    loadAlerts(),
    getSessionAdmin(),
  ]);
  const instagramAlerts = alerts?.filter((alert) => alert.source === 'INSTAGRAM') ?? [];
  return (
    <>
      <PageHeader
        title="인스타 DM"
        description="등록한 게시물에 댓글이 달리면 DM으로 링크를 보내요. 팔로워에게만 링크가 가요. 한도에 걸린 첫 DM은 30분마다 다시 보내요(7일 안)."
        action={
          <LinkButton href="/instagram-dm/new" variant="primary">
            게시물 등록
          </LinkButton>
        }
      />
      <Stack>
        {instagramAlerts.length > 0 && <AlertList alerts={instagramAlerts} />}
        <InstagramDmTable posts={result.items} />
        <InstagramAccountCard account={result.account} canReplaceToken={isSuperAdmin(admin)} />
      </Stack>
    </>
  );
}
