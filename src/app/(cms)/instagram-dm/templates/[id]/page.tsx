import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LinkButton, PageHeader, Row } from '@/components/ui';
import { ActionButton } from '@/components/ui/ActionButton';
import { deleteTemplateAction } from '@/features/instagram-dm/actions';
import { TemplateForm } from '@/features/instagram-dm/TemplateForm';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';

export const metadata: Metadata = { title: 'DM 템플릿 수정' };

export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 단건 API 없이 목록에서 찾는다 (템플릿은 몇 개뿐)
  const { items } = await adminApi<Schemas['AdminInstagramDmTemplateListResponseDto']>(
    '/admin/instagram-dm/templates',
  );
  const template = items.find((item) => String(item.id) === id);
  if (!template) notFound();
  return (
    <div style={{ maxWidth: 880 }}>
      <PageHeader
        title={template.name}
        action={
          <Row>
            <ActionButton
              action={deleteTemplateAction.bind(null, template.id)}
              confirm="이 템플릿을 지울까요? 이미 등록한 게시물은 그대로예요."
              variant="danger"
            >
              삭제
            </ActionButton>
            <LinkButton href="/instagram-dm/templates">목록</LinkButton>
          </Row>
        }
      />
      <TemplateForm template={template} />
    </div>
  );
}
