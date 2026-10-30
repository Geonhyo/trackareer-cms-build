'use client';

import { useActionState } from 'react';
import { Field, Notice, Row, Select, Stack, Textarea } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { updateMediaAction } from './actions';
import { CategoryOptions } from './CategoryOptions';
import type { MediaCategory, MediaItem } from './insights-types';

export function MediaEditForm({
  media,
  categories,
}: {
  media: MediaItem;
  categories: MediaCategory[];
}) {
  const [state, action] = useActionState(updateMediaAction.bind(null, media.id), null);
  return (
    <form action={action}>
      <Stack>
        <Field
          label="카테고리"
          hint={
            media.categorySource === 'MANUAL'
              ? '직접 고른 값이라 자동 분류가 바꾸지 않아요.'
              : '캡션 규칙으로 자동 분류했어요. 틀렸으면 고쳐 주세요.'
          }
        >
          <Select name="categoryId" defaultValue={media.categoryId}>
            <CategoryOptions categories={categories} media={media} />
          </Select>
        </Field>
        <Field label="메모" hint="500자까지">
          <Textarea name="memo" rows={3} maxLength={500} defaultValue={media.memo ?? ''} />
        </Field>
        {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
        {state?.ok && state.message && <Notice tone="positive">{state.message}</Notice>}
        <Row>
          <SubmitButton pendingText="저장 중…">저장</SubmitButton>
        </Row>
      </Stack>
    </form>
  );
}
