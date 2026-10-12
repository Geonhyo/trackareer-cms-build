'use client';

import { useActionState } from 'react';
import { Card, Checkbox, Field, Grid, Input, Notice, Row, Select, Stack } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { convertAccountAction, createTestAccountAction } from './actions';
import { PasswordInput } from './PasswordInput';

function TypeSelect({ includeNormal }: { includeNormal?: boolean }) {
  return (
    <Select name="accountType" defaultValue="REVIEW">
      <option value="REVIEW">심사 (스토어 심사용)</option>
      <option value="TEST">테스트 (개발자 모드 열림)</option>
      {includeNormal && <option value="NORMAL">일반으로 되돌리기</option>}
    </Select>
  );
}

export function CreateAccountForm() {
  const [state, action] = useActionState(createTestAccountAction, null);
  return (
    <Card title="새 계정 만들기" description="비밀번호로 들어가는 계정이고, 통계에서 빠져요.">
      <form action={action}>
        <Stack>
          <Grid min={220}>
            <Field label="이메일">
              <Input name="email" type="email" required placeholder="review@trackareer.com" />
            </Field>
            <Field label="종류">
              <TypeSelect />
            </Field>
          </Grid>
          <Field label="비밀번호">
            <PasswordInput required />
          </Field>
          {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
          {state?.ok && <Notice tone="positive">{state.message}</Notice>}
          <Row>
            <SubmitButton pendingText="만드는 중…">만들기</SubmitButton>
          </Row>
        </Stack>
      </form>
    </Card>
  );
}

export function ConvertAccountForm({ initialEmail }: { initialEmail?: string }) {
  const [state, action] = useActionState(convertAccountAction, null);
  return (
    <Card
      title="기존 회원 바꾸기"
      description="가입한 회원을 이메일로 찾아 테스트 · 심사 계정으로 바꾸거나 일반으로 되돌려요."
    >
      <form action={action}>
        <Stack>
          <Grid min={220}>
            <Field label="회원 이메일">
              <Input name="email" type="email" required defaultValue={initialEmail} />
            </Field>
            <Field label="바꿀 종류">
              <TypeSelect includeNormal />
            </Field>
          </Grid>
          <Field
            label="비밀번호 (선택)"
            hint="주면 비밀번호로도 들어갈 수 있어요. 일반으로 되돌리면 지워져요."
          >
            <PasswordInput placeholder="비워 두면 그대로" />
          </Field>
          <Checkbox
            name="confirmSocial"
            label="카카오 · 애플 계정이어도 바꿔요 (실사용자가 아닌지 확인했어요)"
          />
          {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
          {state?.ok && <Notice tone="positive">{state.message}</Notice>}
          <Row>
            <SubmitButton pendingText="바꾸는 중…">바꾸기</SubmitButton>
          </Row>
        </Stack>
      </form>
    </Card>
  );
}
