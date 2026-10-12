import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ActionButton } from '@/components/ui/ActionButton';
import { Badge, Card, DefinitionList, LinkButton, PageHeader, Row, Stat } from '@/components/ui';
import { ActivityStrip } from '@/features/users/ActivityStrip';
import { restoreUserAction, setUserInternalAction } from '@/features/users/actions';
import styles from '@/features/users/detail.module.css';
import { PostingsTable } from '@/features/users/PostingsTable';
import { adminApi } from '@/shared/api/admin-api';
import { ApiError } from '@/shared/api/errors';
import type { Schemas } from '@/shared/api/types';
import { getSessionAdmin, isSuperAdmin } from '@/shared/auth/session';
import { formatDate, formatDateTime, formatPercent } from '@/shared/lib/format';
import {
  ACCOUNT_TYPE_LABEL,
  CONSENT_SOURCE_LABEL,
  CONSENT_TYPE_LABEL,
  INQUIRY_CATEGORY_LABEL,
  INQUIRY_STATUS_LABEL,
  INQUIRY_STATUS_TONE,
  PLATFORM_LABEL,
  PROVIDER_LABEL,
  USER_STATUS_LABEL,
  USER_STATUS_TONE,
  WITHDRAWAL_REASON_LABEL,
  label,
} from '@/shared/lib/labels';

type User = Schemas['AdminUserDetailDto'];

export const metadata: Metadata = { title: '회원 상세' };

async function loadUser(id: string): Promise<User> {
  if (!/^\d+$/.test(id)) notFound();
  try {
    return (await adminApi<Schemas['AdminUserDetailResponseDto']>(`/admin/users/${id}`)).item;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

const consent = (value: boolean, changedAt?: string | null) =>
  `${value ? '동의' : '미동의'}${changedAt ? ` · ${formatDateTime(changedAt)}` : ''}`;

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, admin] = await Promise.all([loadUser(id), getSessionAdmin()]);
  const isSuper = isSuperAdmin(admin);

  return (
    <>
      <PageHeader
        title={
          <Row>
            {user.nickname}
            <Badge tone={USER_STATUS_TONE[user.status]}>
              {label(USER_STATUS_LABEL, user.status)}
            </Badge>
            {user.accountType !== 'NORMAL' && (
              <Badge tone="brand">{label(ACCOUNT_TYPE_LABEL, user.accountType)} 계정</Badge>
            )}
            {user.isInternal && <Badge>내부 · 통계 제외</Badge>}
          </Row>
        }
        description={`${user.email} · 회원 ${user.id}`}
        action={<LinkButton href="/users">목록</LinkButton>}
      />
      <div className={styles.layout}>
        <Card title="기본 정보">
          <DefinitionList
            items={[
              { label: '가입 유형', value: label(PROVIDER_LABEL, user.provider) },
              { label: '가입일', value: formatDateTime(user.createdAt) },
              { label: '계정 종류', value: label(ACCOUNT_TYPE_LABEL, user.accountType) },
              {
                label: '탈퇴 요청',
                value: user.deletionRequestedAt ? formatDateTime(user.deletionRequestedAt) : '—',
              },
              {
                label: '기기',
                value: user.devices.length
                  ? user.devices.map((device, index) => (
                      <div key={index}>
                        {label(PLATFORM_LABEL, device.platform)} {device.appVersion ?? '구버전'}
                        {device.appBuild ? ` (${device.appBuild})` : ''}
                        <span className={styles.muted}>
                          {' '}
                          · {formatDateTime(device.lastActiveAt)}
                        </span>
                      </div>
                    ))
                  : '—',
              },
            ]}
          />
        </Card>
        <Card title="동의">
          <DefinitionList
            items={[
              {
                label: '마케팅 푸시',
                value: consent(user.marketingNotiConsent, user.marketingNotiConsentChangedAt),
              },
              {
                label: '개인정보 마케팅 활용',
                value: consent(user.privacyMarketingConsent, user.privacyMarketingConsentChangedAt),
              },
              {
                label: '가입 때 약관',
                value: user.terms
                  ? `${user.terms.termsVersion ? `v${user.terms.termsVersion}` : '버전 기록 없음'} · ${formatDateTime(user.terms.agreedAt)}`
                  : '기록 없음',
              },
            ]}
          />
          {user.marketingConsentHistory.items.length > 0 && (
            <div className={styles.list} style={{ marginTop: 16 }}>
              {user.marketingConsentHistory.items.map((item, index) => (
                <div key={index} className={styles.listItem}>
                  <span>
                    {label(CONSENT_TYPE_LABEL, item.consentType)} {item.consented ? '동의' : '철회'}
                    <span className={styles.muted}>
                      {' '}
                      · {label(CONSENT_SOURCE_LABEL, item.source)}
                    </span>
                  </span>
                  <span className={styles.muted}>{formatDateTime(item.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="접속" className={styles.wide}>
          <Row>
            <div style={{ minWidth: 160 }}>
              <Stat label="최근 접속" value={formatDate(user.activity.lastActiveDate)} />
            </div>
            <div style={{ minWidth: 160 }}>
              <Stat
                label="30일 접속률"
                value={formatPercent(user.activity.activeRate30, 0)}
                sub={`최근 30일 중 ${user.activity.activeDays30}일`}
              />
            </div>
          </Row>
          <ActivityStrip activeDates={user.activeDates30} />
          <div className={styles.stripLegend}>
            <span>30일 전</span>
            <span>오늘</span>
          </div>
        </Card>
        <Card
          title={`공고 ${user.postings.total}개`}
          description={
            user.postings.total > user.postings.items.length ? '최근 100개만 보여요.' : undefined
          }
          className={styles.wide}
        >
          <PostingsTable postings={user.postings.items} />
        </Card>
        <Card title={`문의 ${user.inquiries.total}개`}>
          {user.inquiries.items.length === 0 ? (
            <p className={styles.muted}>문의가 없어요.</p>
          ) : (
            <div className={styles.list}>
              {user.inquiries.items.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  href={`/inquiries/${inquiry.id}`}
                  className={styles.listItem}
                >
                  <span>
                    <Badge tone={INQUIRY_STATUS_TONE[inquiry.status]}>
                      {label(INQUIRY_STATUS_LABEL, inquiry.status)}
                    </Badge>{' '}
                    {inquiry.title}
                    <span className={styles.muted}>
                      {' '}
                      · {label(INQUIRY_CATEGORY_LABEL, inquiry.category)}
                    </span>
                  </span>
                  <span className={styles.muted}>{formatDate(inquiry.createdAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>
        <Card title="관리">
          <div className={styles.list}>
            {user.withdrawalReasons.map((reason) => (
              <div key={reason.id} className={styles.listItem}>
                <span>
                  탈퇴 사유:{' '}
                  {reason.reasonTypes
                    .map((type) => label(WITHDRAWAL_REASON_LABEL, type))
                    .join(', ')}
                  {reason.etcText ? ` — ${reason.etcText}` : ''}
                </span>
                <span className={styles.muted}>{formatDate(reason.createdAt)}</span>
              </div>
            ))}
          </div>
          <Row>
            {user.status === 'PENDING_DELETION' && (
              <ActionButton
                action={restoreUserAction.bind(null, user.id)}
                confirm="탈퇴 대기를 취소하고 계정을 되살릴까요?"
                variant="primary"
              >
                탈퇴 취소(복구)
              </ActionButton>
            )}
            {isSuper && (
              <ActionButton
                action={setUserInternalAction.bind(null, user.id, !user.isInternal)}
                confirm={
                  user.isInternal
                    ? '통계에 다시 넣을까요? 이전 일별 통계에는 반영되지 않아요.'
                    : '내부 계정(팀원 · QA)으로 표시해 통계에서 뺄까요?'
                }
              >
                {user.isInternal ? '통계에 다시 넣기' : '내부 계정으로 표시'}
              </ActionButton>
            )}
            {isSuper && user.accountType === 'NORMAL' && (
              <LinkButton href={`/test-accounts?convert=${encodeURIComponent(user.email)}`}>
                테스트 · 심사 계정으로
              </LinkButton>
            )}
          </Row>
        </Card>
      </div>
    </>
  );
}
