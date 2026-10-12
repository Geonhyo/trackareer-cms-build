'use client';

import { useState } from 'react';
import { Button, Input, Row } from '@/components/ui';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

/** 비밀번호 칸 + 만들기 버튼 (만든 값은 보이게 둬서 복사할 수 있게) */
export function PasswordInput({
  required,
  placeholder,
}: {
  required?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const generate = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    setValue(Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join(''));
    setVisible(true);
  };
  return (
    <Row>
      <div style={{ flex: '1 1 200px' }}>
        <Input
          name="password"
          type={visible ? 'text' : 'password'}
          minLength={12}
          required={required}
          autoComplete="new-password"
          placeholder={placeholder ?? '12자 이상'}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <Button size="sm" onClick={generate}>
        만들기
      </Button>
    </Row>
  );
}
