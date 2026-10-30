import { Button, Checkbox, Field, LinkButton, Pagination, Select, Stack } from '@/components/ui';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { MEDIA_PRODUCT_LABEL } from '@/shared/lib/labels';
import { pageParam, param, withQuery } from '@/shared/lib/url';
import { listCategories } from './categories';
import { CategoryOptions } from './CategoryOptions';
import { MediaTable } from './MediaTable';
import styles from './insights.module.css';

type SearchParams = Record<string, string | string[] | undefined>;

const SORTS = {
  posted: '최근 게시',
  reach: '도달',
  follows: '팔로우',
  follow_rate: '팔로우 전환율',
  save_rate: '저장률',
  share_rate: '공유율',
} as const;

export async function MediaSection({ days, params }: { days: string; params: SearchParams }) {
  const page = pageParam(params.page);
  const query = {
    days,
    page,
    categoryId: param(params.categoryId),
    type: param(params.type),
    tracking: param(params.tracking),
    sort: param(params.sort) ?? 'posted',
  };
  const [result, categories] = await Promise.all([
    adminApi<Schemas['AdminInstagramMediaListResponseDto']>('/admin/instagram/media', { query }),
    listCategories(),
  ]);

  return (
    <Stack>
      <form className={styles.filters}>
        <input type="hidden" name="tab" value="media" />
        <input type="hidden" name="days" value={days} />
        <Field label="카테고리">
          <Select name="categoryId" defaultValue={query.categoryId ?? ''}>
            <option value="">전체</option>
            <CategoryOptions categories={categories} />
          </Select>
        </Field>
        <Field label="유형">
          <Select name="type" defaultValue={query.type ?? ''}>
            <option value="">전체</option>
            {Object.entries(MEDIA_PRODUCT_LABEL).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="정렬">
          <Select name="sort" defaultValue={query.sort}>
            {Object.entries(SORTS).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </Select>
        </Field>
        <div className={styles.filterActions}>
          <Checkbox
            name="tracking"
            value="true"
            label="추적 중만 (게시 30일 안)"
            defaultChecked={query.tracking === 'true'}
          />
          <Button type="submit" variant="primary">
            찾기
          </Button>
          <LinkButton
            href={withQuery('/instagram-insights', {}, { tab: 'media', days })}
            variant="ghost"
          >
            초기화
          </LinkButton>
        </div>
      </form>
      <MediaTable items={result.items} />
      <Pagination
        page={page}
        limit={result.limit}
        total={result.total}
        hrefFor={(next) => withQuery('/instagram-insights', params, { page: next })}
      />
    </Stack>
  );
}
