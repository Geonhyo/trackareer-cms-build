// 화면에 보여 줄 값 (모두 KST)
const KST = 'Asia/Seoul';

const dateTimeFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: KST,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: KST,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 2026. 10. 12. 14:05 */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return dateTimeFormat.format(new Date(value));
}

/** 2026. 10. 12. (시각이든 YYYY-MM-DD든) */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-');
    return `${y}. ${m}. ${d}.`;
  }
  return dateFormat.format(new Date(value));
}

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : value.toLocaleString('ko-KR');
}

/** 금액 → ₩1,200 (통화는 서버가 준 값, 없으면 숫자만) */
export function formatCurrency(value: number | null | undefined, currency: string | null): string {
  if (value === null || value === undefined) return '—';
  if (!currency) return formatNumber(value);
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency }).format(value);
}

/** 0~1 비율 → 12.3% */
export function formatPercent(ratio: number | null | undefined, digits = 1): string {
  if (ratio === null || ratio === undefined) return '—';
  return `${(ratio * 100).toFixed(digits)}%`;
}

/** 지금 기준 '3분 전' · '2일 전' */
export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return '방금';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.round(hours / 24)}일 전`;
}

/** 오늘 KST YYYY-MM-DD */
export function todayKst(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}

/** ISO 시각 → <input type="datetime-local"> 값 (KST, YYYY-MM-DDTHH:mm) */
export function toKstInputValue(value: string | Date | null | undefined): string {
  if (!value) return '';
  return new Date(new Date(value).getTime() + 9 * 3600_000).toISOString().slice(0, 16);
}

/** <input type="datetime-local"> 값(KST) → 시간대를 붙인 ISO. 비었으면 null */
export function fromKstInputValue(value: FormDataEntryValue | null): string | null {
  const text = typeof value === 'string' ? value.trim() : '';
  return text ? `${text}:00+09:00` : null;
}
