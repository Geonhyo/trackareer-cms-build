import { Badge, Card, Grid, type Tone } from '@/components/ui';
import type { Schemas } from '@/shared/api/types';
import { formatNumber } from '@/shared/lib/format';
import styles from './builds.module.css';

type Settings = Schemas['AdminAppSettingsDto'];
type Bucket = Settings['builds'][number];

// 앱이 받는 판정과 같다 (서버 AppConfigService.toUpdate: 빌드 < minimumBuild 강제, < latestBuild 권장)
function verdict(bucket: Bucket, rule: Settings['appUpdate']['ios']): { text: string; tone: Tone } {
  if (bucket.appBuild === null) return { text: '구버전 (판단 안 함)', tone: 'neutral' };
  if (bucket.appBuild < rule.minimumBuild) return { text: '강제 업데이트', tone: 'critical' };
  if (bucket.appBuild < rule.latestBuild) return { text: '권장 업데이트', tone: 'warning' };
  return { text: '최신', tone: 'positive' };
}

function PlatformTable({
  title,
  buckets,
  rule,
}: {
  title: string;
  buckets: Bucket[];
  rule: Settings['appUpdate']['ios'];
}) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.users, 0);
  return (
    <div>
      <p className={styles.platform}>
        {title} <span>· {formatNumber(total)}명</span>
      </p>
      {buckets.length === 0 ? (
        <p className={styles.empty}>최근 30일 활동한 기기가 없어요.</p>
      ) : (
        <table className={styles.table}>
          <tbody>
            {buckets.map((bucket) => {
              const result = verdict(bucket, rule);
              return (
                <tr key={`${bucket.appBuild}-${bucket.appVersion}`}>
                  <td>
                    {bucket.appVersion ?? '—'} <span>({bucket.appBuild ?? '빌드 없음'})</span>
                  </td>
                  <td className="num">{formatNumber(bucket.users)}명</td>
                  <td>
                    <Badge tone={result.tone}>{result.text}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function BuildDistribution({ settings }: { settings: Settings }) {
  const byPlatform = (platform: string) => settings.builds.filter((b) => b.platform === platform);
  return (
    <Card
      title="빌드 분포"
      description="최근 30일 앱을 연 기기 기준 (내부 계정 제외). 지금 설정으로 각 빌드가 받는 안내예요."
    >
      <Grid min={320}>
        <PlatformTable title="iOS" buckets={byPlatform('IOS')} rule={settings.appUpdate.ios} />
        <PlatformTable
          title="Android"
          buckets={byPlatform('ANDROID')}
          rule={settings.appUpdate.android}
        />
      </Grid>
    </Card>
  );
}
