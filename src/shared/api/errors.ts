/** 서버 에러 응답 { code, message, details? } */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
    message: string,
    readonly body: unknown = null,
  ) {
    super(message);
  }
}

/** 서버 액션이 화면에 돌려주는 결과 */
export type ActionResult<T = undefined> =
  { ok: true; data: T; message?: string } | { ok: false; error: string; code?: string | null };

export function toActionError(error: unknown): { ok: false; error: string; code?: string | null } {
  if (error instanceof ApiError) {
    return { ok: false, error: error.message, code: error.code };
  }
  return { ok: false, error: '요청을 처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.' };
}
