import type { components } from './openapi';

/** 서버 응답 스키마 (pnpm gen:api로 만든 openapi.d.ts에서) */
export type Schemas = components['schemas'];

export type AdminSummary = Schemas['AdminSummaryDto'];
export type AdminLoginResponse = Schemas['AdminLoginResponseDto'];
