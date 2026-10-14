'use client';

import { useActionState } from 'react';
import { Field, Input, Notice, Row, Stack } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { replaceInstagramTokenAction } from './actions';

/** 자동 갱신이 끊겼을 때(비밀번호 변경 · 권한 해제) 새 토큰을 넣는다 */
export function InstagramTokenForm() {
  const [state, action] = useActionState(replaceInstagramTokenAction, null);
  return (
    <form action={action}>
      <Stack>
        <Field
          label="새 액세스 토큰"
          hint="Meta 개발자 앱 → Instagram 로그인이 포함된 API 설정 → 액세스 토큰 생성에서 만든 값. 이 계정의 토큰인지 확인하고 저장해요."
        >
          <Input name="accessToken" type="password" autoComplete="off" required />
        </Field>
        {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
        {state?.ok && state.message && <Notice tone="positive">{state.message}</Notice>}
        <Row>
          <SubmitButton pendingText="확인 중…">토큰 바꾸기</SubmitButton>
        </Row>
      </Stack>
    </form>
  );
}
