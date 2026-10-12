'use client';

import { useActionState } from 'react';
import { Field, Grid, Input, Notice, Row, Stack } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { blockDomainAction } from './actions';

export function BlockForm() {
  const [state, action] = useActionState(blockDomainAction, null);
  return (
    <form action={action}>
      <Stack>
        <Grid min={220}>
          <Field label="도메인" hint="링크를 넣어도 돼요. 하위 도메인까지 막혀요.">
            <Input name="domain" required placeholder="example.com" />
          </Field>
          <Field label="이유 (선택)">
            <Input name="reason" maxLength={255} placeholder="로그인해야 보이는 페이지" />
          </Field>
        </Grid>
        {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
        {state?.ok && <Notice tone="positive">{state.message}</Notice>}
        <Row>
          <SubmitButton pendingText="막는 중…">막기</SubmitButton>
        </Row>
      </Stack>
    </form>
  );
}
