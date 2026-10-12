// 서버 enum → 한국어. 없는 값은 원래 코드를 보여 준다 (label(MAP, code))
import type { Tone } from '@/components/ui';

export const label = (map: Record<string, string>, code: string | null | undefined): string =>
  code ? (map[code] ?? code) : '—';

export const PROVIDER_LABEL: Record<string, string> = {
  KAKAO: '카카오',
  APPLE: '애플',
  PASSWORD: '비밀번호',
};

export const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  NORMAL: '일반',
  TEST: '테스트',
  REVIEW: '심사',
};

export const USER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '활성',
  PENDING_DELETION: '탈퇴 대기',
  DELETED: '탈퇴',
};
export const USER_STATUS_TONE: Record<string, Tone> = {
  ACTIVE: 'positive',
  PENDING_DELETION: 'warning',
  DELETED: 'neutral',
};

export const PLATFORM_LABEL: Record<string, string> = { ANDROID: 'Android', IOS: 'iOS' };

// 앱 공고 목록 칩과 같은 말 (trackareer-mobile PostingListScreen)
export const POSTING_STATUS_LABEL: Record<string, string> = {
  BEFORE_APPLY: '지원 전',
  SCHEDULED: '진행 예정',
  WAITING_RESULT: '결과 대기',
  RECORD_NEEDED: '기록 필요',
  FINAL_PASS: '최종 합격',
  FAIL: '불합격',
  WITHDRAWN: '지원 중단',
};
export const POSTING_STATUS_TONE: Record<string, Tone> = {
  BEFORE_APPLY: 'neutral',
  SCHEDULED: 'brand',
  WAITING_RESULT: 'brand',
  RECORD_NEEDED: 'warning',
  FINAL_PASS: 'positive',
  FAIL: 'critical',
  WITHDRAWN: 'neutral',
};

export const STAGE_RESULT_LABEL: Record<string, string> = {
  PASS: '합격',
  FAIL: '불합격',
  FINAL_PASS: '최종 합격',
};

export const POSTING_SOURCE_LABEL: Record<string, string> = {
  SCRAPED: '링크 추출',
  MANUAL: '직접 입력',
};

// 앱 문의 작성 화면과 같은 말 (trackareer-mobile inquiryTypes)
export const INQUIRY_CATEGORY_LABEL: Record<string, string> = {
  BUG_REPORT: '오류 제보',
  FEATURE_REQUEST: '기능 제안',
  HELP: '도움 요청',
  ETC: '기타',
};
export const INQUIRY_STATUS_LABEL: Record<string, string> = {
  PENDING: '답변 대기',
  ANSWERED: '답변 완료',
};
export const INQUIRY_STATUS_TONE: Record<string, Tone> = {
  PENDING: 'critical',
  ANSWERED: 'neutral',
};

export const WITHDRAWAL_REASON_LABEL: Record<string, string> = {
  JOB_SUCCESS: '취업 성공',
  FEATURES_LACKING: '기능 부족',
  COMPLEX_OR_INCONVENIENT: '복잡 · 불편',
  NOT_HELPFUL: '도움 안 됨',
  STAGE_MISMATCH: '단계 불일치',
  NOTIFICATION_BURDEN: '알림 부담',
  USING_OTHER_SERVICE: '다른 서비스 이용',
  ETC: '기타',
};

export const CONSENT_TYPE_LABEL: Record<string, string> = {
  PRIVACY_MARKETING: '개인정보 마케팅 활용',
  MARKETING_NOTIFICATION: '마케팅 푸시',
};
export const CONSENT_SOURCE_LABEL: Record<string, string> = {
  SIGNUP: '가입할 때',
  NOTIFICATION_SETTING: '알림 설정',
  ADMIN: '관리자',
};
