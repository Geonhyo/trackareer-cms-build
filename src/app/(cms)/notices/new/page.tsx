import type { Metadata } from 'next';
import { LinkButton, PageHeader } from '@/components/ui';
import { NoticeForm } from '@/features/notices/NoticeForm';

export const metadata: Metadata = { title: '새 공지' };

export default function NewNoticePage() {
  return (
    <div style={{ maxWidth: 880 }}>
      <PageHeader title="새 공지" action={<LinkButton href="/notices">목록</LinkButton>} />
      <NoticeForm />
    </div>
  );
}
