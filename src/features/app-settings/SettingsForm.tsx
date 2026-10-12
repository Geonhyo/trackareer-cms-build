'use client';

import { useActionState, type ReactNode } from 'react';
import { Notice, Row, Stack } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import type { ActionResult } from '@/shared/api/errors';

/** 설정 한 묶음 저장 폼. 최고관리자가 아니면 fieldset째 막는다 */
export function SettingsForm({
  action,
  readOnly,
  confirm,
  children,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  readOnly: boolean;
  confirm?: string;
  children: ReactNode;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
    >
      <fieldset disabled={readOnly} style={{ border: 0, minWidth: 0 }}>
        <Stack>
          {children}
          {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
          {state?.ok && state.message && <Notice tone="positive">{state.message}</Notice>}
          {!readOnly && (
            <Row>
              <SubmitButton pendingText="저장 중…">저장</SubmitButton>
            </Row>
          )}
        </Stack>
      </fieldset>
    </form>
  );
}
