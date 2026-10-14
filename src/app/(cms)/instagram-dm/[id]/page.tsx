import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ActionButton } from '@/components/ui/ActionButton';
import { Badge, LinkButton, PageHeader, Row } from '@/components/ui';
import { deleteInstagramDmPostAction } from '@/features/instagram-dm/actions';
import { InstagramDmForm } from '@/features/instagram-dm/InstagramDmForm';
import { adminApi } from '@/shared/api/admin-api';
import { ApiError } from '@/shared/api/errors';
import type { Schemas } from '@/shared/api/types';
import { formatDateTime, formatNumber } from '@/shared/lib/format';

export const metadata: Metadata = { title: '인스타 DM 게시물' };

export default async function InstagramDmPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await adminApi<Schemas['AdminInstagramDmPostResponseDto']>(
    `/admin/instagram-dm/posts/${id}`,
  )
    .then((result) => result.item)
    .catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    });

  return (
    <div style={{ maxWidth: 880 }}>
      <PageHeader
        title={
          <Row>
            {post.title}
            {post.isActive ? <Badge tone="positive">켜짐</Badge> : <Badge>꺼짐</Badge>}
          </Row>
        }
        description={`첫 DM ${formatNumber(post.firstDmCount)}명 · 링크 발송 ${formatNumber(post.linkSentCount)}명 · 재시도 대기 ${formatNumber(post.pendingDmCount)} · 놓침 ${formatNumber(post.missedDmCount)} · 등록 ${formatDateTime(post.createdAt)}`}
        action={
          <Row>
            <LinkButton href={post.postUrl} target="_blank" rel="noreferrer">
              게시물 열기
            </LinkButton>
            <ActionButton
              action={deleteInstagramDmPostAction.bind(null, post.id)}
              confirm="이 게시물을 지울까요? 댓글이 달려도 DM이 나가지 않아요."
              variant="danger"
            >
              삭제
            </ActionButton>
            <LinkButton href="/instagram-dm">목록</LinkButton>
          </Row>
        }
      />
      <InstagramDmForm post={post} />
    </div>
  );
}
