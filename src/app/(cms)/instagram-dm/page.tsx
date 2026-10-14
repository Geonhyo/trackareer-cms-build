import type { Metadata } from 'next';
import { LinkButton, Notice, PageHeader, Stack } from '@/components/ui';
import { InstagramDmTable } from '@/features/instagram-dm/InstagramDmTable';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';

export const metadata: Metadata = { title: '인스타 DM' };

export default async function InstagramDmPage() {
  const result = await adminApi<Schemas['AdminInstagramDmPostListResponseDto']>(
    '/admin/instagram-dm/posts',
  );
  return (
    <>
      <PageHeader
        title="인스타 DM"
        description="등록한 게시물에 댓글이 달리면 DM으로 링크를 보내요. 팔로워에게만 링크가 가요."
        action={
          <LinkButton href="/instagram-dm/new" variant="primary">
            게시물 등록
          </LinkButton>
        }
      />
      <Stack>
        {!result.configured && (
          <Notice tone="critical">
            서버에 인스타 연결 정보(INSTAGRAM_USER_ID · INSTAGRAM_ACCESS_TOKEN ·
            INSTAGRAM_APP_SECRET)가 없어 지금은 DM이 나가지 않아요.
          </Notice>
        )}
        <InstagramDmTable posts={result.items} />
      </Stack>
    </>
  );
}
