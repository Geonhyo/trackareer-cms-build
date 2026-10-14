import type { Metadata } from 'next';
import { LinkButton, PageHeader, Row } from '@/components/ui';
import { TemplatesTable } from '@/features/instagram-dm/TemplatesTable';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';

export const metadata: Metadata = { title: 'DM 템플릿' };

export default async function TemplatesPage() {
  const { items } = await adminApi<Schemas['AdminInstagramDmTemplateListResponseDto']>(
    '/admin/instagram-dm/templates',
  );
  return (
    <>
      <PageHeader
        title="DM 템플릿"
        description="게시물을 등록할 때 '템플릿 불러오기'로 DM 문구 · 링크 · 버튼 글자를 채워요. 템플릿을 고쳐도 이미 등록한 게시물은 그대로예요."
        action={
          <Row>
            <LinkButton href="/instagram-dm">인스타 DM</LinkButton>
            <LinkButton href="/instagram-dm/templates/new" variant="primary">
              템플릿 추가
            </LinkButton>
          </Row>
        }
      />
      <TemplatesTable templates={items} />
    </>
  );
}
