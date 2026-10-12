'use client';

import { useActionState } from 'react';
import { Card, Checkbox, Field, Grid, Input, Notice, Row, Stack, Textarea } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { toKstInputValue } from '@/shared/lib/format';
import { saveNoticeAction } from './actions';
import type { Notice as NoticeItem } from './notice-status';

export function NoticeForm({ notice, readOnly }: { notice?: NoticeItem; readOnly?: boolean }) {
  const [state, action] = useActionState(saveNoticeAction.bind(null, notice?.id ?? null), null);
  return (
    <form action={action}>
      <Card title="내용">
        <Stack>
          <Field label="제목" hint="100자까지">
            <Input
              name="title"
              maxLength={100}
              required
              defaultValue={notice?.title}
              disabled={readOnly}
            />
          </Field>
          <Field label="본문" hint="줄바꿈과 **굵게**만 쓸 수 있어요.">
            <Textarea
              name="body"
              rows={12}
              maxLength={10000}
              required
              defaultValue={notice?.body}
              disabled={readOnly}
            />
          </Field>
          <Grid min={240}>
            <Field label="게시 시작 (KST)" hint="비우면 지금">
              <Input
                name="startsAt"
                type="datetime-local"
                defaultValue={toKstInputValue(notice?.startsAt)}
                disabled={readOnly}
              />
            </Field>
            <Field label="게시 종료 (KST)" hint="비우면 계속 보여요">
              <Input
                name="endsAt"
                type="datetime-local"
                defaultValue={toKstInputValue(notice?.endsAt)}
                disabled={readOnly}
              />
            </Field>
          </Grid>
          <Row>
            <Checkbox
              name="isImportant"
              label="중요 (목록 맨 위)"
              defaultChecked={notice?.isImportant}
              disabled={readOnly}
            />
            <Checkbox
              name="showAsModal"
              label="앱을 열 때 모달로 띄우기"
              defaultChecked={notice?.showAsModal}
              disabled={readOnly}
            />
            <Checkbox
              name="allowDismissForever"
              label="모달에 '다시 보지 않기'"
              defaultChecked={notice?.allowDismissForever ?? true}
              disabled={readOnly}
            />
          </Row>
          {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
          {state?.ok && state.message && <Notice tone="positive">{state.message}</Notice>}
          {!readOnly && (
            <Row>
              <SubmitButton pendingText="저장 중…">{notice ? '저장' : '공지 올리기'}</SubmitButton>
            </Row>
          )}
        </Stack>
      </Card>
    </form>
  );
}
