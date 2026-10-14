import { Badge, Card, DefinitionList, Row, Stack, type Tone } from '@/components/ui';
import type { Schemas } from '@/shared/api/types';
import { formatDateTime } from '@/shared/lib/format';
import { InstagramTokenForm } from './InstagramTokenForm';

type Account = Schemas['AdminInstagramAccountDto'];
type RefreshRun = Account['refreshRuns'][number];

function refreshResult(run: RefreshRun): { text: string; tone: Tone } {
  if (run.status === 'FAILED') return { text: '실패', tone: 'critical' };
  if (run.status === 'RUNNING') return { text: '진행 중', tone: 'brand' };
  return run.result?.refreshed
    ? { text: '갱신됨', tone: 'positive' }
    : { text: '건너뜀 (바꾼 지 하루 안)', tone: 'neutral' };
}

/** 인스타 계정 연결 · 토큰 상태. 토큰은 매주 월요일 자동 갱신돼 60일이 계속 미뤄진다 */
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
            {
              label: '토큰',
              value: account.hasToken ? (
                '넣음 (매주 월요일 자동 갱신)'
              ) : (
                <Badge tone="critical">아직 없음 — 아래에서 넣어 주세요</Badge>
              ),
            },
            {
              label: '토큰 만료',
              value: account.tokenExpiresAt
                ? formatDateTime(account.tokenExpiresAt)
                : account.hasToken
                  ? '다음 자동 갱신 때 확인'
                  : '-',
            },
            {
              label: '마지막 자동 갱신',
              value: account.tokenRefreshedAt
                ? formatDateTime(account.tokenRefreshedAt)
                : '아직 없음',
            },
            {
              label: '자동 갱신 기록',
              value:
                account.refreshRuns.length === 0 ? (
                  '아직 없음 (매주 월요일 00:00)'
                ) : (
                  <Stack>
                    {account.refreshRuns.map((run) => {
                      const result = refreshResult(run);
                      return (
                        <Row key={run.id}>
                          {formatDateTime(run.startedAt)}
                          <Badge tone={result.tone}>{result.text}</Badge>
                          {run.error}
                        </Row>
                      );
                    })}
                  </Stack>
                ),
            },
          ]}
        />
        {canReplaceToken && <InstagramTokenForm />}
      </Stack>
    </Card>
  );
}
