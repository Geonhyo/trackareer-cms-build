import { Card, Stack, Tabs } from '@/components/ui';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { formatDate, formatNumber } from '@/shared/lib/format';
import { POSTING_ORIGIN_LABEL, POSTING_TYPE_LABEL, label } from '@/shared/lib/labels';
import { BarList } from './BarList';
import styles from './dashboard.module.css';

export const RANKING_DAYS = ['7', '30', '90'] as const;
export type RankingDays = (typeof RANKING_DAYS)[number];

export async function RankingSection({ days }: { days: RankingDays }) {
  const { item } = await adminApi<Schemas['AdminPostingRankingResponseDto']>(
    '/admin/stats/posting-ranking',
    { query: { days } },
  );

  return (
    <Stack>
      <Tabs
        active={days}
        items={RANKING_DAYS.map((value) => ({
          key: value,
          label: `최근 ${value}일`,
          href: `/?tab=ranking&days=${value}`,
        }))}
      />
      <p style={{ color: 'var(--fg-muted)' }}>
        {formatDate(item.from)} ~ {formatDate(item.to)} 등록 공고 {formatNumber(item.totalPostings)}
        개 · 등록한 회원 {formatNumber(item.totalUsers)}명 (내부 계정 제외)
      </p>
      <div className={styles.twoCols}>
        <Card title="많이 담긴 기업" description="그 기업 공고를 담은 회원 수">
          <BarList
            items={item.companies.map((company) => ({
              key: company.company,
              name: company.company,
              value: company.users,
              sub: `${company.postings}건`,
            }))}
          />
        </Card>
        <Card title="많이 담긴 공고" description="같은 링크로 담은 회원 수 (링크로 추출한 공고만)">
          {item.postings.length === 0 ? (
            <p className={styles.note}>데이터가 없어요.</p>
          ) : (
            <table className={styles.rankTable}>
              <tbody>
                {item.postings.map((posting, index) => (
                  <tr key={posting.extractionId}>
                    <td className={styles.rankNo}>{index + 1}</td>
                    <td>
                      <a href={posting.url} target="_blank" rel="noreferrer">
                        <strong>{posting.company ?? '기업 모름'}</strong> {posting.position ?? ''}
                      </a>
                      <p className={styles.rankMeta}>
                        {posting.siteName ?? '기업 채용 페이지'}
                        {posting.deadlineDate ? ` · ${formatDate(posting.deadlineDate)} 마감` : ''}
                      </p>
                    </td>
                    <td className={styles.rankCount}>{posting.users}명</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="어디서 담았나" description="공고를 등록한 방법 · 사이트">
          <BarList
            items={item.sources.map((source) => ({
              key: source.key,
              name: source.siteName ?? label(POSTING_ORIGIN_LABEL, source.key),
              value: source.count,
            }))}
          />
        </Card>
        <Card title="공고 유형" description="한 공고에 여러 유형이 붙을 수 있어요">
          <BarList
            items={item.types.map((type) => ({
              key: type.type,
              name: label(POSTING_TYPE_LABEL, type.type),
              value: type.count,
            }))}
          />
        </Card>
      </div>
    </Stack>
  );
}
