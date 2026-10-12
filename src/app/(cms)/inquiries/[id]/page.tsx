import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, DefinitionList, LinkButton, Notice, PageHeader, Row } from '@/components/ui';
import { ReplyForm } from '@/features/inquiries/ReplyForm';
import styles from '@/features/inquiries/thread.module.css';
import { adminApi } from '@/shared/api/admin-api';
import { ApiError } from '@/shared/api/errors';
import type { Schemas } from '@/shared/api/types';
import { formatDateTime } from '@/shared/lib/format';
import {
  INQUIRY_CATEGORY_LABEL,
  INQUIRY_STATUS_LABEL,
  INQUIRY_STATUS_TONE,
  label,
} from '@/shared/lib/labels';

export const metadata: Metadata = { title: '문의 상세' };

async function loadInquiry(id: string) {
  if (!/^\d+$/.test(id)) notFound();
  try {
    return (await adminApi<Schemas['AdminInquiryDetailResponseDto']>(`/admin/inquiries/${id}`))
      .item;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await loadInquiry(id);

  return (
    <>
      <PageHeader
        title={inquiry.title}
        description={
          <Row>
            <Badge tone={INQUIRY_STATUS_TONE[inquiry.status]}>
              {label(INQUIRY_STATUS_LABEL, inquiry.status)}
            </Badge>
            {label(INQUIRY_CATEGORY_LABEL, inquiry.category)} · {formatDateTime(inquiry.createdAt)}
          </Row>
        }
        action={<LinkButton href="/inquiries">목록</LinkButton>}
      />
      <div
        style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)', maxWidth: 880 }}
      >
        <Card title="작성자">
          <DefinitionList
            items={[
              {
                label: '회원',
                value: (
                  <Link href={`/users/${inquiry.userId}`} style={{ textDecoration: 'underline' }}>
                    {inquiry.nickname ?? `회원 ${inquiry.userId}`}
                  </Link>
                ),
              },
              ...(inquiry.replyEmail
                ? [{ label: '회신 이메일 (구버전 앱)', value: inquiry.replyEmail }]
                : []),
            ]}
          />
        </Card>
        <Card title="대화">
          <div className={styles.thread}>
            {inquiry.messages.map((message, index) => (
              <div key={index} className={styles.message} data-author={message.author}>
                <div className={styles.bubble}>{message.content}</div>
                <span className={styles.meta}>
                  {message.author === 'ADMIN' ? '운영자' : '사용자'} ·{' '}
                  {formatDateTime(message.createdAt)}
                </span>
              </div>
            ))}
          </div>
          {inquiry.status === 'PENDING' ? (
            <ReplyForm inquiryId={inquiry.id} />
          ) : (
            <div style={{ marginTop: 20 }}>
              <Notice>답변을 보냈어요. 사용자가 이어서 쓰면 다시 답할 수 있어요.</Notice>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
