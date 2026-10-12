import type { Metadata } from 'next';
import { SuperOnly } from '@/components/layout/SuperOnly';
import { Card, EmptyState, Grid, PageHeader, Stack } from '@/components/ui';
import { ConvertAccountForm, CreateAccountForm } from '@/features/test-accounts/AccountForms';
import { AccountRow } from '@/features/test-accounts/AccountRow';
import styles from '@/features/test-accounts/accounts.module.css';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { param } from '@/shared/lib/url';

export const metadata: Metadata = { title: '테스트 · 심사 계정' };

async function TestAccounts({ convert }: { convert?: string }) {
  const { items } =
    await adminApi<Schemas['AdminTestAccountListResponseDto']>('/admin/test-accounts');
  return (
    <Stack>
      <Card
        title={`계정 ${items.length}개`}
        description="심사 제출 직전에 '목업 공고 다시 채우기'를 누르면 오늘 기준 일정이 채워져요."
      >
        {items.length === 0 ? (
          <EmptyState>아직 없어요.</EmptyState>
        ) : (
          <div className={styles.list}>
            {items.map((account) => (
              <AccountRow key={account.id} account={account} />
            ))}
          </div>
        )}
      </Card>
      <Grid min={420}>
        <CreateAccountForm />
        <ConvertAccountForm initialEmail={convert} />
      </Grid>
    </Stack>
  );
}

export default async function TestAccountsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const convert = param((await searchParams).convert);
  return (
    <div style={{ maxWidth: 1040 }}>
      <PageHeader
        title="테스트 · 심사 계정"
        description="앱 로고를 5번 눌러 이메일 · 비밀번호로 들어가는 계정이에요. 모두 통계에서 빠져요."
      />
      <SuperOnly>
        <TestAccounts convert={convert} />
      </SuperOnly>
    </div>
  );
}
