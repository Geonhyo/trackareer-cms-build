'use client';

import { useActionState, useState } from 'react';
import { loginAction } from '@/shared/auth/actions';
import { Field, Input, Notice } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import styles from './auth.module.css';

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, null);
  // 실패해도 입력한 이메일은 남긴다 (폼 액션은 끝나면 입력을 비운다)
  const [email, setEmail] = useState('');
  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="next" value={next ?? '/'} />
      <Field label="이메일">
        <Input
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      <Field label="비밀번호">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
      <SubmitButton pendingText="로그인 중…">로그인</SubmitButton>
    </form>
  );
}
