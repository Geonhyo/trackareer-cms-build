'use client';

import { useState, useTransition } from 'react';
import {
  Button,
  Card,
  Field,
  Grid,
  Input,
  Notice,
  Row,
  Select,
  Stack,
  Textarea,
} from '@/components/ui';
import type { Schemas } from '@/shared/api/types';
import { formatNumber } from '@/shared/lib/format';
import { previewPushAction, sendPushAction, testPushAction, type PushInput } from './actions';

type Preview = Schemas['PushPreviewResponseDto'];
type TestResult = Schemas['SendPushTestResponseDto'];

export function PushComposer({
  notices,
  initialNoticeId,
}: {
  notices: Array<{ id: number; title: string }>;
  initialNoticeId?: number;
}) {
  const initialNotice = notices.find((notice) => notice.id === initialNoticeId);
  const [input, setInput] = useState<PushInput>({
    kind: 'NOTICE',
    title: initialNotice ? '트래커리어 공지' : '',
    body: initialNotice?.title ?? '',
    noticeId: initialNotice?.id,
  });
  const [preview, setPreview] = useState<Preview | null>(null);
  const [message, setMessage] = useState<{ tone: 'critical' | 'positive'; text: string } | null>(
    null,
  );
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [pending, startTransition] = useTransition();

  // 내용이 바뀌면 미리보기는 다시 해야 한다 (멱등키 · 대상이 달라진다)
  const update = (changes: Partial<PushInput>) => {
    setInput((current) => ({ ...current, ...changes }));
    setPreview(null);
  };

  const ready = input.title.trim() !== '' && input.body.trim() !== '';

  const runPreview = () =>
    startTransition(async () => {
      const result = await previewPushAction(input);
      setMessage(result.ok ? null : { tone: 'critical', text: result.error });
      setPreview(result.ok ? result.data : null);
    });

  const runSend = () => {
    if (!preview) return;
    const kindText = input.kind === 'MARKETING' ? '광고' : '공지';
    if (
      !window.confirm(
        `${kindText} 푸시를 ${formatNumber(preview.targetUserCount)}명(기기 ${formatNumber(preview.targetTokenCount)}대)에게 보낼까요? 되돌릴 수 없어요.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await sendPushAction(input);
      setMessage(
        result.ok
          ? { tone: 'positive', text: result.message ?? '보냈어요.' }
          : { tone: 'critical', text: result.error },
      );
      if (result.ok) setPreview(null);
    });
  };

  const runTest = () =>
    startTransition(async () => {
      const result = await testPushAction(input, testEmail);
      setTestResult(result.ok ? result.data : null);
      setMessage(result.ok ? null : { tone: 'critical', text: result.error });
    });

  return (
    <Stack>
      <Card title="보낼 내용">
        <Stack>
          <Grid min={240}>
            <Field label="종류">
              <Select
                value={input.kind}
                onChange={(event) => update({ kind: event.target.value as PushInput['kind'] })}
              >
                <option value="NOTICE">공지 (모든 활성 회원)</option>
                <option value="MARKETING">광고 (마케팅 푸시 동의자만)</option>
              </Select>
            </Field>
            {input.kind === 'NOTICE' && (
              <Field label="연결할 공지" hint="누르면 공지 상세로 가고, 알림 목록에 한 줄 남아요.">
                <Select
                  value={input.noticeId ?? ''}
                  onChange={(event) =>
                    update({
                      noticeId: event.target.value ? Number(event.target.value) : undefined,
                    })
                  }
                >
                  <option value="">연결 안 함</option>
                  {notices.map((notice) => (
                    <option key={notice.id} value={notice.id}>
                      {notice.title}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </Grid>
          {input.kind === 'MARKETING' && (
            <Notice tone="warning">
              광고는 제목 앞에 (광고)가 붙고 본문 끝에 수신 거부 안내가 붙어요. 밤 9시 ~ 아침
              8시에는 보낼 수 없어요.
            </Notice>
          )}
          <Field label="제목" hint="200자까지">
            <Input
              value={input.title}
              maxLength={200}
              onChange={(event) => update({ title: event.target.value })}
            />
          </Field>
          <Field label="본문" hint="1000자까지">
            <Textarea
              value={input.body}
              maxLength={1000}
              rows={4}
              onChange={(event) => update({ body: event.target.value })}
            />
          </Field>
          {message && <Notice tone={message.tone}>{message.text}</Notice>}
          {preview && (
            <Notice tone="brand">
              대상 {formatNumber(preview.targetUserCount)}명 · 기기{' '}
              {formatNumber(preview.targetTokenCount)}대
            </Notice>
          )}
          <Row>
            <Button disabled={!ready || pending} onClick={runPreview}>
              대상 확인
            </Button>
            <Button variant="primary" disabled={!preview || pending} onClick={runSend}>
              보내기
            </Button>
          </Row>
        </Stack>
      </Card>
      <Card
        title="한 명에게 테스트"
        description="위 내용으로 회원 한 명의 기기에만 보내요. 이력에 남지 않고 야간 · 동의 제한도 없어요."
      >
        <Stack>
          <Row>
            <div style={{ flex: '1 1 280px' }}>
              <Input
                type="email"
                placeholder="회원 이메일"
                value={testEmail}
                onChange={(event) => setTestEmail(event.target.value)}
              />
            </div>
            <Button disabled={!ready || !testEmail || pending} onClick={runTest}>
              테스트 보내기
            </Button>
          </Row>
          {testResult && <TestResultView result={testResult} />}
        </Stack>
      </Card>
    </Stack>
  );
}

function TestResultView({ result }: { result: TestResult }) {
  if (!result.userFound) return <Notice tone="critical">그 이메일의 회원이 없어요.</Notice>;
  if (result.tokenCount === 0) {
    return (
      <Notice tone="warning">회원은 있지만 등록된 기기가 없어요 (알림 권한 · 로그인 확인).</Notice>
    );
  }
  return (
    <Stack>
      {result.results.map((token) => (
        <Notice key={token.tokenTail} tone={token.success ? 'positive' : 'critical'}>
          {token.platform} …{token.tokenTail}:{' '}
          {token.disabled
            ? '서버에 FCM 설정이 없어 실제로 보내지 않았어요.'
            : token.success
              ? '전송 접수됨'
              : `실패 — ${token.interpretation ?? token.errorCode ?? '원인 모름'}`}
        </Notice>
      ))}
    </Stack>
  );
}
