import type { Metadata } from 'next';
import { Badge, Card, DefinitionList, Grid, Notice, PageHeader, Stack } from '@/components/ui';
import { AlertList } from '@/features/status/AlertList';
import { BatchTable } from '@/features/status/BatchTable';
import { loadAlerts } from '@/features/status/load-alerts';
import { ResponseTimeChart } from '@/features/status/ResponseTimeChart';
import styles from '@/features/status/status.module.css';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { formatDateTime } from '@/shared/lib/format';

export const metadata: Metadata = { title: '상태' };

const MONITOR_STATUS: Record<string, { text: string; tone: 'positive' | 'critical' | 'neutral' }> =
  {
    UP: { text: '정상', tone: 'positive' },
    DOWN: { text: '장애', tone: 'critical' },
    PAUSED: { text: '일시 중지', tone: 'neutral' },
    PENDING: { text: '확인 중', tone: 'neutral' },
  };

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return days ? `${days}일 ${hours}시간` : hours ? `${hours}시간 ${minutes}분` : `${minutes}분`;
}

export default async function StatusPage() {
  const [system, batches, alerts] = await Promise.all([
    adminApi<Schemas['AdminSystemStatusResponseDto']>('/admin/system-status'),
    adminApi<Schemas['AdminBatchJobSummaryResponseDto']>('/admin/batch-runs/summary'),
    loadAlerts(),
  ]);
  const { server, database, monitor } = system.item;
  const monitorStatus = monitor.status ? MONITOR_STATUS[monitor.status] : null;

  return (
    <>
      <PageHeader
        title="상태"
        description={`서버 · DB · 배치 · 외부 감시. ${formatDateTime(system.item.checkedAt)} 기준`}
      />
      <Stack>
        <Card title="이상 징후">
          {alerts ? (
            <AlertList alerts={alerts} />
          ) : (
            <Notice tone="critical">이상 징후를 불러오지 못했어요.</Notice>
          )}
        </Card>
        <Grid min={320}>
          <Card title="서버 · DB">
            <DefinitionList
              items={[
                {
                  label: 'DB',
                  value:
                    database.status === 'ok' ? (
                      <>
                        <Badge tone="positive">정상</Badge> SELECT 1 · {database.latencyMs}ms
                      </>
                    ) : (
                      <Badge tone="critical">응답 없음</Badge>
                    ),
                },
                { label: '환경', value: server.environment },
                { label: '리비전', value: server.revision ?? '— (로컬)' },
                { label: '릴리스', value: server.release ?? '—' },
                { label: '이 인스턴스', value: `${formatUptime(server.uptimeSeconds)}째 실행 중` },
              ]}
            />
          </Card>
          <Card title="외부 감시 (UptimeRobot)" description="밖에서 5분마다 /ping을 불러 본 기록">
            {monitor.state === 'NOT_CONFIGURED' ? (
              <Notice>
                서버에 UPTIMEROBOT_API_KEY가 없어 보여 줄 수 없어요. 서버 · DB 상태는 왼쪽에서 봐요.
              </Notice>
            ) : monitor.state === 'ERROR' ? (
              <Notice tone="critical">UptimeRobot API를 부르지 못했어요.</Notice>
            ) : (
              <DefinitionList
                items={[
                  {
                    label: '지금',
                    value: monitorStatus ? (
                      <Badge tone={monitorStatus.tone}>{monitorStatus.text}</Badge>
                    ) : (
                      '—'
                    ),
                  },
                  {
                    label: '가동률',
                    value: monitor.uptimeRatio
                      ? `24시간 ${monitor.uptimeRatio.last1d}% · 7일 ${monitor.uptimeRatio.last7d}% · 30일 ${monitor.uptimeRatio.last30d}%`
                      : '—',
                  },
                  {
                    label: '평균 응답',
                    value: monitor.averageResponseMs ? `${monitor.averageResponseMs}ms` : '—',
                  },
                  {
                    label: '확인 간격',
                    value: monitor.intervalSeconds ? `${monitor.intervalSeconds / 60}분` : '—',
                  },
                ]}
              />
            )}
          </Card>
        </Grid>
        {monitor.state === 'OK' && (
          <Grid min={360}>
            <Card title="응답 시간 (최근 24시간)">
              <ResponseTimeChart points={monitor.responseTimes} />
            </Card>
            <Card title="장애 기록">
              {monitor.incidents.length === 0 ? (
                <p className={styles.muted}>장애 기록이 없어요.</p>
              ) : (
                <ul className={styles.incidents}>
                  {monitor.incidents.map((incident) => (
                    <li key={incident.at}>
                      <span>
                        {incident.ongoing && <Badge tone="critical">진행 중</Badge>}{' '}
                        {formatDateTime(incident.at)}
                        <span className={styles.muted}> · {incident.reason ?? '원인 모름'}</span>
                      </span>
                      <span className="num">{Math.round(incident.durationSeconds / 60)}분</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </Grid>
        )}
        <Card
          title="배치"
          description="cron-job.org가 부르는 하루 한 번 배치. 26시간 안에 성공이 없으면 늦음, 30분 넘게 끝나지 않으면 멈춤"
        >
          <BatchTable jobs={batches.items} />
        </Card>
      </Stack>
    </>
  );
}
