import { Badge, Card, DefinitionList, Stack } from '@/components/ui';
import type { Schemas } from '@/shared/api/types';
import { formatDateTime } from '@/shared/lib/format';
import { InstagramTokenForm } from './InstagramTokenForm';

type Account = Schemas['AdminInstagramAccountDto'];

const TOKEN_SOURCE: Record<Account['tokenSource'], string> = {
  DB: '자동 갱신 중',
  ENV: '환경변수 (첫 자동 갱신 전)',
  NONE: '없음',
};

/** 인스타 계정 연결 · 토큰 상태. 토큰은 매일 자동 갱신돼 60일이 계속 미뤄진다 */
export function InstagramAccountCard({
  account,
  canReplaceToken,
}: {
  account: Account;
  canReplaceToken: boolean;
}) {
  return (
    <Card title="인스타 계정 연결">
      <Stack>
        <DefinitionList
          items={[
            {
              label: '상태',
              value: account.configured ? (
                <Badge tone="positive">연결됨</Badge>
              ) : (
                <Badge tone="critical">미설정 — DM이 나가지 않아요</Badge>
              ),
            },
            { label: '토큰', value: TOKEN_SOURCE[account.tokenSource] },
            {
              label: '토큰 만료',
              value: account.tokenExpiresAt
                ? formatDateTime(account.tokenExpiresAt)
                : '다음 자동 갱신 때 확인',
            },
            {
              label: '마지막 자동 갱신',
              value: account.tokenRefreshedAt
                ? formatDateTime(account.tokenRefreshedAt)
                : '아직 없음',
            },
          ]}
        />
        {canReplaceToken && <InstagramTokenForm />}
      </Stack>
    </Card>
  );
}
