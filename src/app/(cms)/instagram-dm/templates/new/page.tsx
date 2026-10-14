import type { Metadata } from 'next';
import { LinkButton, PageHeader } from '@/components/ui';
import { TemplateForm } from '@/features/instagram-dm/TemplateForm';

export const metadata: Metadata = { title: 'DM 템플릿 추가' };

export default function NewTemplatePage() {
  return (
    <div style={{ maxWidth: 880 }}>
      <PageHeader
        title="DM 템플릿 추가"
        action={<LinkButton href="/instagram-dm/templates">목록</LinkButton>}
      />
      <TemplateForm />
    </div>
  );
}
