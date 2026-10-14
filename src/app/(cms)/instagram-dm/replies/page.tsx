import type { Metadata } from 'next';
import { Badge, Card, LinkButton, Notice, PageHeader, Row, Stack } from '@/components/ui';
import { ActionButton } from '@/components/ui/ActionButton';
import { deleteReplyTextAction, setReplyTextActiveAction } from '@/features/instagram-dm/actions';
import { ReplyTextForm } from '@/features/instagram-dm/ReplyTextForm';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';

export const metadata: Metadata = { title: '댓글 답글 문구' };

export default async function ReplyTextsPage() {
  const { items } = await adminApi<Schemas['AdminInstagramReplyTextListResponseDto']>(
    '/admin/instagram-dm/reply-texts',
  );
  const activeCount = items.filter((item) => item.isActive).length;
  return (
    <div style={{ maxWidth: 880 }}>
      <PageHeader
        title="댓글 답글 문구"
        description="첫 DM을 보내면 그 댓글에 켜 둔 문구 중 하나를 골라 공개 답글을 달아요. 여러 개를 두면 매번 다른 문구가 달려요."
        action={<LinkButton href="/instagram-dm">인스타 DM</LinkButton>}
      />
      <Stack>
        {activeCount === 0 && (
          <Notice tone="warning">켜 둔 문구가 없어 지금은 댓글에 답글을 달지 않아요.</Notice>
        )}
        <Card title="문구">
          <Stack>
            {items.map((item) => (
              <Row key={item.id}>
                {item.isActive ? <Badge tone="positive">켜짐</Badge> : <Badge>꺼짐</Badge>}
                <span style={{ flex: 1 }}>{item.text}</span>
                <ActionButton
                  size="sm"
                  action={setReplyTextActiveAction.bind(null, item.id, !item.isActive)}
                >
                  {item.isActive ? '끄기' : '켜기'}
                </ActionButton>
                <ActionButton
                  size="sm"
                  variant="danger"
                  confirm="이 문구를 지울까요?"
                  action={deleteReplyTextAction.bind(null, item.id)}
                >
                  삭제
                </ActionButton>
              </Row>
            ))}
            <ReplyTextForm />
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}
