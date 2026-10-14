'use client';

import { useActionState } from 'react';
import { Card, Field, Grid, Input, Notice, Row, Stack, Textarea } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import type { Schemas } from '@/shared/api/types';
import { saveTemplateAction } from './actions';

type Template = Schemas['AdminInstagramDmTemplateDto'];

export function TemplateForm({ template }: { template?: Template }) {
  const [state, action] = useActionState(saveTemplateAction.bind(null, template?.id ?? null), null);
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
          <Field label="DM 문구" hint="팔로우 확인 뒤 보낼 문구, 640자까지">
            <Textarea
              name="message"
              rows={5}
              maxLength={640}
              required
              placeholder={'팔로우 감사합니다! 💛\n요청하신 공고 모음이에요 👇'}
              defaultValue={template?.message}
            />
          </Field>
          <Grid min={240}>
            <Field label="링크" hint="비우면 게시물마다 넣어요.">
              <Input
                name="linkUrl"
                type="url"
                maxLength={1000}
                placeholder="https://www.trackareer.com/c/..."
                defaultValue={template?.linkUrl ?? ''}
              />
            </Field>
            <Field label="버튼 글자" hint="20자까지. 비우면 '링크 열기'">
              <Input
                name="buttonLabel"
                maxLength={20}
                placeholder="링크 열기"
                defaultValue={template?.buttonLabel ?? ''}
              />
            </Field>
          </Grid>
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
