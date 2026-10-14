'use client';

import { useActionState } from 'react';
import { Field, Input, Notice, Row, Stack } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { replaceInstagramTokenAction } from './actions';

/** 토큰을 넣는다 — 처음 한 번, 그리고 자동 갱신이 실패했을 때(비밀번호 변경 · 권한 해제) */
export function InstagramTokenForm() {
  const [state, action] = useActionState(replaceInstagramTokenAction, null);
  return (
    <form action={action}>
      <Stack>
        <Field
          label="액세스 토큰 넣기"
          hint="Meta 개발자 앱 → Instagram 로그인이 포함된 API 설정 → 액세스 토큰 생성에서 만든 값. 처음 한 번 넣으면 매주 자동으로 갱신돼요. 갱신이 실패했을 때만 새로 만들어 다시 넣으면 돼요."
        >
          <Input name="accessToken" type="password" autoComplete="off" required />
        </Field>
        {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
        {state?.ok && state.message && <Notice tone="positive">{state.message}</Notice>}
        <Row>
          <SubmitButton pendingText="확인 중…">저장</SubmitButton>
        </Row>
      </Stack>
    </form>
  );
}
