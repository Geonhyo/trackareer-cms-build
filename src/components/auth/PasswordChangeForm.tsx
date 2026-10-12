'use client';

import { useActionState } from 'react';
import { changePasswordAction } from '@/shared/auth/actions';
import { Field, Input, Notice } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import styles from './auth.module.css';

export function PasswordChangeForm() {
  const [state, action] = useActionState(changePasswordAction, null);
  return (
    <form action={action} className={styles.form}>
      <Field label="현재 비밀번호">
        <Input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
        />
      </Field>
      <Field label="새 비밀번호" hint="이메일 · 현재 비밀번호와 다르게">
        <Input name="newPassword" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="새 비밀번호 확인">
        <Input name="confirmPassword" type="password" autoComplete="new-password" required />
      </Field>
      {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
      <SubmitButton pendingText="바꾸는 중…">비밀번호 바꾸기</SubmitButton>
    </form>
  );
}
