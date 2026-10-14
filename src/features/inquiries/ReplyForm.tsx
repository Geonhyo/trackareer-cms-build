'use client';

import { useActionState } from 'react';
import { Field, Notice, Row, Textarea } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { replyInquiryAction } from './actions';
import styles from './thread.module.css';

export function ReplyForm({ inquiryId }: { inquiryId: number }) {
  const [state, action] = useActionState(replyInquiryAction.bind(null, inquiryId), null);
  return (
    <form action={action} className={styles.replyForm}>
      <Field label="답변" hint="보내면 앱 알림 · 푸시로 전해지고 고칠 수 없어요.">
        <Textarea name="content" maxLength={10000} required />
      </Field>
      {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
      <Row>
        <SubmitButton pendingText="보내는 중…">답변 보내기</SubmitButton>
      </Row>
    </form>
  );
}
