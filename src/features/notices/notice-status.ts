import type { Tone } from '@/components/ui';
import type { Schemas } from '@/shared/api/types';

export type Notice = Schemas['AdminNoticeDto'];

/** 게시 예정 · 게시 중 · 내려감 (서버와 같은 기준: 시작 ≤ 지금 < 종료) */
export function noticeState(notice: Notice, now = Date.now()): { text: string; tone: Tone } {
  if (new Date(notice.startsAt).getTime() > now) return { text: '게시 예정', tone: 'brand' };
  if (notice.endsAt && new Date(notice.endsAt).getTime() <= now) {
    return { text: '내려감', tone: 'neutral' };
  }
  return { text: '게시 중', tone: 'positive' };
}
