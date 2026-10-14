import 'server-only';
import { cache } from 'react';
import { adminApi } from '@/shared/api/admin-api';
import type { Schemas } from '@/shared/api/types';

/**
 * 이상 징후 (메뉴 숫자 · 대시보드 · 상태 화면 공통). 실패해도 화면은 그린다.
 * 한 화면 요청 안에서는 한 번만 부른다 (레이아웃과 본문이 같이 쓴다)
 */
export const loadAlerts = cache(async (): Promise<Schemas['AdminAlertDto'][] | null> => {
  try {
    return (await adminApi<Schemas['AdminAlertListResponseDto']>('/admin/alerts')).items;
  } catch {
    return null;
  }
});
