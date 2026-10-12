'use client';

import { useState, useTransition, type ReactNode } from 'react';
import type { ActionResult } from '@/shared/api/errors';
import { Button, Notice, Row } from './index';

/** 서버 액션 하나를 부르는 버튼 (확인 창 · 결과 문구). action은 서버에서 bind한 함수 */
export function ActionButton({
  action,
  confirm,
  variant = 'secondary',
  size,
  children,
}: {
  action: () => Promise<ActionResult<unknown>>;
  confirm?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm';
  children: ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<unknown> | null>(null);

  const run = () => {
    if (confirm && !window.confirm(confirm)) return;
    startTransition(async () => {
      setResult(await action());
    });
  };

  return (
    <Row>
      <Button variant={variant} size={size} disabled={pending} onClick={run}>
        {pending ? '처리 중…' : children}
      </Button>
      {result && !result.ok && <Notice tone="critical">{result.error}</Notice>}
      {result?.ok && result.message && <Notice tone="positive">{result.message}</Notice>}
    </Row>
  );
}
