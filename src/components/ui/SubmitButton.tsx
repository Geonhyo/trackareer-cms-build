'use client';

import { useFormStatus } from 'react-dom';
import type { ComponentProps } from 'react';
import { Button } from './index';

/** 폼 안에서 제출 중이면 막고 문구를 바꾼다 */
export function SubmitButton({
  pendingText = '처리 중…',
  children,
  ...props
}: ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" {...props} disabled={pending || props.disabled}>
      {pending ? pendingText : children}
    </Button>
  );
}
