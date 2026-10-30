'use client';

import { useActionState } from 'react';
import { Field, Notice, Row, Select, Stack, Textarea } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { MEDIA_PRODUCT_LABEL } from '@/shared/lib/labels';
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
          label="유형"
          hint={
            media.productTypeManual
              ? '인스타 유형과 다르게 고친 값이에요. 성과 수집은 인스타 유형 그대로 해요.'
              : '인스타가 알려 준 유형이에요. 고치면 화면 · 필터 · 비교 · 자동 분류에 써요.'
          }
        >
          <Select name="productType" defaultValue={media.productType}>
            {Object.entries(MEDIA_PRODUCT_LABEL).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </Select>
        </Field>
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
