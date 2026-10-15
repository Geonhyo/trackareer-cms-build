'use client';

import { useActionState, useState } from 'react';
import { Card, Field, Input, Notice, Row, Stack } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import type { Schemas } from '@/shared/api/types';
import { saveTemplateAction } from './actions';
import { DmContentEditor, toEditorValue } from './DmContentEditor';

type Template = Schemas['AdminInstagramDmTemplateDto'];

export function TemplateForm({ template }: { template?: Template }) {
  const [state, action] = useActionState(saveTemplateAction.bind(null, template?.id ?? null), null);
  const [dm, setDm] = useState(() => toEditorValue(template));
  return (
    <form action={action}>
      <Card title="템플릿">
        <Stack>
          <Field label="이름" hint="게시물 등록 때 고르는 이름이에요.">
            <Input
              name="name"
              maxLength={100}
              required
              placeholder="주간 인턴 공고 모음"
              defaultValue={template?.name}
            />
          </Field>
          <DmContentEditor value={dm} onChange={setDm} linkRequired={false} />
          {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
          {state?.ok && state.message && <Notice tone="positive">{state.message}</Notice>}
          <Row>
            <SubmitButton pendingText="저장 중…">{template ? '저장' : '추가'}</SubmitButton>
          </Row>
        </Stack>
      </Card>
    </form>
  );
}
