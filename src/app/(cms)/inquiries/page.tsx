import type { Metadata } from 'next';
import {
  Button,
  Field,
  Input,
  LinkButton,
  PageHeader,
  Pagination,
  Select,
  Tabs,
} from '@/components/ui';
import { InquiriesTable } from '@/features/inquiries/InquiriesTable';
import styles from '@/features/users/filters.module.css';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { INQUIRY_CATEGORY_LABEL } from '@/shared/lib/labels';
import { pageParam, param, withQuery } from '@/shared/lib/url';

export const metadata: Metadata = { title: '문의' };

const LIMIT = 30;
type SearchParams = Record<string, string | string[] | undefined>;

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = pageParam(params.page);
  // 기본은 답변 대기만, 오래 기다린 것부터
  const status = param(params.status) ?? 'PENDING';
  const query = {
    page,
    limit: LIMIT,
    status: status === 'ALL' ? undefined : status,
    category: param(params.category),
    q: param(params.q),
    sort: 'lastMessageAt',
    order: status === 'PENDING' ? 'asc' : 'desc',
  };
  const result = await adminApi<Schemas['AdminInquiryListResponseDto']>('/admin/inquiries', {
    query,
  });

  return (
    <>
      <PageHeader title="문의" description="사용자가 이어서 쓰면 다시 답변 대기로 올라와요." />
      <Tabs
        active={status}
        items={[
          {
            key: 'PENDING',
            label: '답변 대기',
            href: withQuery('/inquiries', {}, { status: 'PENDING' }),
          },
          {
            key: 'ANSWERED',
            label: '답변 완료',
            href: withQuery('/inquiries', {}, { status: 'ANSWERED' }),
          },
          { key: 'ALL', label: '전체', href: withQuery('/inquiries', {}, { status: 'ALL' }) },
        ]}
      />
      <form className={styles.filters}>
        <input type="hidden" name="status" value={status} />
        <Field label="검색">
          <Input name="q" defaultValue={query.q} placeholder="제목 · 내용" />
        </Field>
        <Field label="유형">
          <Select name="category" defaultValue={query.category ?? ''}>
            <option value="">전체</option>
            {Object.entries(INQUIRY_CATEGORY_LABEL).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </Select>
        </Field>
        <div className={styles.actions}>
          <Button type="submit" variant="primary">
            찾기
          </Button>
          <LinkButton href={withQuery('/inquiries', {}, { status })} variant="ghost">
            초기화
          </LinkButton>
        </div>
      </form>
      <InquiriesTable inquiries={result.items} />
      <Pagination
        page={page}
        limit={LIMIT}
        total={result.total}
        hrefFor={(next) => withQuery('/inquiries', params, { page: next })}
      />
    </>
  );
}
