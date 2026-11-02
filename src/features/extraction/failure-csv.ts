import type { Schemas } from '@/shared/api/types';

type Failure = Schemas['AdminExtractionFailureDto'];

// 서버 posting_extraction_request.status
const STATUS_LABEL: Record<string, string> = {
  PARTIAL: '부분',
  FAILED: '실패',
  BLOCKED: '차단 도메인',
  UNAVAILABLE: '스크래퍼 장애',
  NOT_POSTING: '공고 아님',
};

// 스크래퍼 meta.failure (fetch-page FetchFailure + empty) · 서버가 붙이는 것
const FAILURE_LABEL: Record<string, string> = {
  unsafe_url: '열 수 없는 주소',
  not_found: '페이지 없음 (마감 · 삭제)',
  blocked: '사이트가 막음',
  timeout: '시간 초과',
  not_html: '웹 페이지 아님',
  too_large: '페이지가 너무 큼',
  fetch_failed: '받기 실패',
  empty: '내용을 못 찾음',
  blocked_domain: '차단 도메인',
  scraper_unavailable: '스크래퍼 장애',
};

const kstFormat = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const COLUMNS: Array<[string, (row: Failure) => string | number | null]> = [
  ['요청 시각 (KST)', (row) => kstFormat.format(new Date(row.requestedAt))],
  ['상태', (row) => STATUS_LABEL[row.status] ?? row.status],
  ['실패 원인', (row) => (row.failure ? (FAILURE_LABEL[row.failure] ?? row.failure) : null)],
  ['사이트', (row) => row.siteName],
  ['도메인', (row) => row.domain],
  ['링크', (row) => row.url],
  ['받은 방법', (row) => row.fetchMethod],
  ['추출 방법', (row) => row.extractMethod],
  ['LLM 토큰', (row) => row.llmTokens],
  ['기업', (row) => row.company],
  ['공고명', (row) => row.position],
  ['마감일', (row) => row.deadlineDate],
  [
    '마감 여부',
    (row) => (row.hasDeadline === null ? '모름' : row.hasDeadline ? '있음' : '없음 (상시 등)'),
  ],
  ['걸린 시간 (ms)', (row) => row.elapsedMs],
  ['캐시', (row) => (row.cached ? 'Y' : '')],
  ['키 규칙', (row) => row.keyRule],
  ['상태 코드', (row) => row.status],
  ['원인 코드', (row) => row.failure],
];

/** 쉼표 · 따옴표 · 줄바꿈이 있으면 따옴표로 감싼다 */
const cell = (value: string | number | null) => {
  const text = value === null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** 실패 로그 CSV (엑셀이 한글을 깨지 않게 BOM을 붙인다) */
export function toFailureCsv(rows: Failure[]): string {
  const lines = [
    COLUMNS.map(([header]) => header).join(','),
    ...rows.map((row) => COLUMNS.map(([, value]) => cell(value(row))).join(',')),
  ];
  return `﻿${lines.join('\r\n')}\r\n`;
}
