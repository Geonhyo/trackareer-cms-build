'use client';

import { useActionState, useState } from 'react';
import { ActionButton } from '@/components/ui/ActionButton';
import { Badge, Button, Notice, Row, Select } from '@/components/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
import type { Schemas } from '@/shared/api/types';
import { formatDate } from '@/shared/lib/format';
import { ACCOUNT_TYPE_LABEL, PROVIDER_LABEL, label } from '@/shared/lib/labels';
import { reseedPostingsAction, updateTestAccountAction } from './actions';
import { PasswordInput } from './PasswordInput';
import styles from './accounts.module.css';

type Account = Schemas['AdminTestAccountDto'];

export function AccountRow({ account }: { account: Account }) {
  const [editing, setEditing] = useState(false);
  const [state, action] = useActionState(updateTestAccountAction.bind(null, account.id), null);

  return (
    <div className={styles.row}>
      <div className={styles.summary}>
        <div>
          <Row>
            <strong>{account.email}</strong>
            <Badge tone="brand">{label(ACCOUNT_TYPE_LABEL, account.accountType)}</Badge>
            {!account.hasPassword && <Badge tone="warning">비밀번호 없음</Badge>}
          </Row>
          <p className={styles.meta}>
            {account.nickname} · {label(PROVIDER_LABEL, account.provider)} · 공고{' '}
            {account.postingCount}개 · 최근 접속 {formatDate(account.lastActiveDate)} · 만든 날{' '}
            {formatDate(account.createdAt)}
          </p>
        </div>
        <Row>
          <ActionButton
            size="sm"
            action={reseedPostingsAction.bind(null, account.id)}
            confirm="이 계정의 공고 · 전형을 지우고 오늘 기준 목업으로 다시 채울까요?"
          >
            목업 공고 다시 채우기
          </ActionButton>
          <Button size="sm" variant="ghost" onClick={() => setEditing((value) => !value)}>
            {editing ? '닫기' : '바꾸기'}
          </Button>
        </Row>
      </div>
      {editing && (
        <form action={action} className={styles.edit}>
          <Row>
            <Select name="accountType" defaultValue={account.accountType} style={{ width: 200 }}>
              <option value="REVIEW">심사</option>
              <option value="TEST">테스트</option>
              <option value="NORMAL">일반으로 되돌리기</option>
            </Select>
            <div style={{ flex: '1 1 320px' }}>
              <PasswordInput placeholder="새 비밀번호 (비워 두면 그대로)" />
            </div>
            <SubmitButton size="sm" pendingText="저장 중…">
              저장
            </SubmitButton>
          </Row>
          {state && !state.ok && <Notice tone="critical">{state.error}</Notice>}
          {state?.ok && <Notice tone="positive">{state.message}</Notice>}
        </form>
      )}
    </div>
  );
}
