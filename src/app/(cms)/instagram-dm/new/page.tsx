import type { Metadata } from 'next';
import { LinkButton, PageHeader } from '@/components/ui';
import { InstagramDmForm } from '@/features/instagram-dm/InstagramDmForm';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';

export const metadata: Metadata = { title: '인스타 DM 게시물 등록' };

export default async function NewInstagramDmPage() {
  const { items: templates } = await adminApi<Schemas['AdminInstagramDmTemplateListResponseDto']>(
    '/admin/instagram-dm/templates',
  );
  return (
    <div style={{ maxWidth: 880 }}>
      <PageHeader
        title="게시물 등록"
        description="인스타에 게시물을 먼저 올린 뒤 주소를 넣어 주세요."
        action={<LinkButton href="/instagram-dm">목록</LinkButton>}
      />
      <InstagramDmForm templates={templates} />
    </div>
  );
}
