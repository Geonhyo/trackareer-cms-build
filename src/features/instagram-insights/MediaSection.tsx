import {
  Button,
  Checkbox,
  Field,
  LinkButton,
  Pagination,
  Select,
  Stack,
  Tabs,
} from '@/components/ui';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { MEDIA_PRODUCT_LABEL } from '@/shared/lib/labels';
import { pageParam, param, withQuery } from '@/shared/lib/url';
import { listCategories } from './categories';
import { CategoryOptions } from './CategoryOptions';
import { MediaTable } from './MediaTable';
import { VERDICT_FILTERS, VERDICT_LABEL } from './verdict';
import styles from './insights.module.css';

type SearchParams = Record<string, string | string[] | undefined>;

const SORTS = {
  posted: '최근 게시',
  verdict: '성적 좋은 순',
  follows: '팔로우 많은 순',
  reach: '도달 많은 순',
} as const;

const VIEWS = [
  { key: 'glance', label: '한눈에' },
  { key: 'numbers', label: '숫자로' },
] as const;

/** 게시물 목록: 기본은 성적 · 이유만, '숫자로'를 고르면 지표 표 */
export async function MediaSection({ params }: { params: SearchParams }) {
  const page = pageParam(params.page);
  const view = param(params.view) === 'numbers' ? 'numbers' : 'glance';
  const query = {
    page,
    categoryId: param(params.categoryId),
    type: param(params.type),
    verdict: param(params.verdict),
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
        <input type="hidden" name="view" value={view} />
        <Field label="성적">
          <Select name="verdict" defaultValue={query.verdict ?? ''}>
            <option value="">전체</option>
            {VERDICT_FILTERS.map((level) => (
              <option key={level} value={level}>
                {VERDICT_LABEL[level]}
              </option>
            ))}
          </Select>
        </Field>
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
            href={withQuery('/instagram-insights', {}, { tab: 'media', view })}
            variant="ghost"
          >
            초기화
          </LinkButton>
        </div>
      </form>
      <Tabs
        active={view}
        items={VIEWS.map((item) => ({
          ...item,
          href: withQuery('/instagram-insights', params, { view: item.key, page: undefined }),
        }))}
      />
      <MediaTable items={result.items} view={view} rules={result.rules} />
      <Pagination
        page={page}
        limit={result.limit}
        total={result.total}
        hrefFor={(next) => withQuery('/instagram-insights', params, { page: next })}
      />
    </Stack>
  );
}
