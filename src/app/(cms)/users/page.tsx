import type { Metadata } from 'next';
import {
  Button,
  Checkbox,
  Field,
  Input,
  LinkButton,
  PageHeader,
  Pagination,
  Select,
} from '@/components/ui';
import styles from '@/features/users/filters.module.css';
import { UsersTable } from '@/features/users/UsersTable';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';
import { ACCOUNT_TYPE_LABEL, PROVIDER_LABEL } from '@/shared/lib/labels';
import { pageParam, param, withQuery } from '@/shared/lib/url';

export const metadata: Metadata = { title: '회원' };

const LIMIT = 30;
const SORTS = {
  createdAt: '가입일',
  lastActiveDate: '최근 접속',
  activeDays30: '30일 접속',
  postingCount: '공고 수',
} as const;

type SearchParams = Record<string, string | string[] | undefined>;

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = pageParam(params.page);
  const query = {
    page,
    limit: LIMIT,
    q: param(params.q),
    provider: param(params.provider),
    accountType: param(params.accountType),
    status: param(params.status),
    marketingConsent: param(params.marketingConsent),
    privacyMarketingConsent: param(params.privacyMarketingConsent),
    includeInternal: param(params.includeInternal),
    sort: param(params.sort) ?? 'createdAt',
    order: param(params.order) ?? 'desc',
  };
  const result = await adminApi<Schemas['AdminUserListResponseDto']>('/admin/users', { query });

  return (
    <>
      <PageHeader title="회원" description="이메일 · 닉네임으로 찾고, 눌러서 자세히 봐요." />
      <form className={styles.filters}>
        <Field label="검색">
          <Input name="q" defaultValue={query.q} placeholder="이메일 또는 닉네임" />
        </Field>
        <Field label="가입 유형">
          <Select name="provider" defaultValue={query.provider ?? ''}>
            <option value="">전체</option>
            {Object.entries(PROVIDER_LABEL).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="계정 종류">
          <Select name="accountType" defaultValue={query.accountType ?? ''}>
            <option value="">전체</option>
            {Object.entries(ACCOUNT_TYPE_LABEL).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="상태">
          <Select name="status" defaultValue={query.status ?? ''}>
            <option value="">전체</option>
            <option value="ACTIVE">활성</option>
            <option value="PENDING_DELETION">탈퇴 대기</option>
          </Select>
        </Field>
        <Field label="마케팅 푸시">
          <Select name="marketingConsent" defaultValue={query.marketingConsent ?? ''}>
            <option value="">전체</option>
            <option value="true">동의</option>
            <option value="false">미동의</option>
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
        <div className={styles.actions}>
          <Checkbox
            name="includeInternal"
            value="true"
            label="내부 계정 포함"
            defaultChecked={query.includeInternal === 'true'}
          />
          <Button type="submit" variant="primary">
            찾기
          </Button>
          <LinkButton href="/users" variant="ghost">
            초기화
          </LinkButton>
        </div>
      </form>
      <UsersTable users={result.items} />
      <Pagination
        page={page}
        limit={LIMIT}
        total={result.total}
        hrefFor={(next) => withQuery('/users', params, { page: next })}
      />
    </>
  );
}
