import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ActionButton } from '@/components/ui/ActionButton';
import { Badge, LinkButton, PageHeader, Row } from '@/components/ui';
import { endNoticeAction } from '@/features/notices/actions';
import { NoticeForm } from '@/features/notices/NoticeForm';
import { noticeState } from '@/features/notices/notice-status';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { formatDateTime } from '@/shared/lib/format';

export const metadata: Metadata = { title: '공지 수정' };

export default async function NoticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 단건 API가 없어 목록(최근 200개)에서 찾는다
  const { items } = await adminApi<Schemas['AdminNoticeListResponseDto']>('/admin/notices');
  const notice = items.find((item) => String(item.id) === id);
  if (!notice) notFound();
  const state = noticeState(notice);

  return (
    <div style={{ maxWidth: 880 }}>
      <PageHeader
        title={
          <Row>
            공지 수정 <Badge tone={state.tone}>{state.text}</Badge>
          </Row>
        }
        description={`처음 올린 시각 ${formatDateTime(notice.createdAt)} · 마지막 수정 ${formatDateTime(notice.updatedAt)}`}
        action={
          <Row>
            <LinkButton href={`/push?noticeId=${notice.id}`}>이 공지로 푸시</LinkButton>
            {state.text === '게시 중' && (
              <ActionButton
                action={endNoticeAction.bind(null, notice.id)}
                confirm="지금 내릴까요? 앱 공지 목록과 모달에서 빠져요."
                variant="danger"
              >
                지금 내리기
              </ActionButton>
            )}
            <LinkButton href="/notices">목록</LinkButton>
          </Row>
        }
      />
      <NoticeForm notice={notice} />
    </div>
  );
}
