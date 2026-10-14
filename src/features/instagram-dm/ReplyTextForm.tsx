'use client';

import { useActionState } from 'react';
import { Input, Notice, Row } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { addReplyTextAction } from './actions';

export function ReplyTextForm() {
  const [state, action] = useActionState(addReplyTextAction, null);
  return (
    <form action={action}>
      <Row>
        <Input
          name="text"
          maxLength={300}
          required
          placeholder="DM으로 보내드렸어요! 안 보이면 메시지 요청함을 확인해 주세요 📩"
          style={{ flex: 1 }}
        />
        <SubmitButton pendingText="추가 중…">추가</SubmitButton>
      </Row>
      {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
    </form>
  );
}
