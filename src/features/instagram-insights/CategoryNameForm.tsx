'use client';

import { useActionState } from 'react';
import { Input, Notice, Row } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { saveCategoryAction } from './actions';
import type { MediaCategory } from './insights-types';

/** 카테고리 이름 한 줄 — category가 없으면 추가, 있으면 이름 변경 */
export function CategoryNameForm({ category }: { category?: MediaCategory }) {
  const [state, action] = useActionState(saveCategoryAction.bind(null, category?.id ?? null), null);
  return (
    <form action={action}>
      <Row>
        <Input
          name="name"
          maxLength={30}
          required
          defaultValue={category?.name}
          placeholder={category ? undefined : '새 카테고리 이름 (예: 면접 후기 캐러셀)'}
          aria-label="카테고리 이름"
          style={{ flex: 1 }}
        />
        <SubmitButton pendingText={category ? '저장 중…' : '추가 중…'}>
          {category ? '이름 저장' : '추가'}
        </SubmitButton>
      </Row>
      {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
    </form>
  );
}
