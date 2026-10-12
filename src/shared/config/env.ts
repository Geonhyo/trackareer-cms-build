import 'server-only';

/** trackareer-server 주소. 브라우저에 노출하지 않는다 (NEXT_PUBLIC_ 아님) */
export function getAdminApiUrl(): string {
  const url = process.env.ADMIN_API_URL;
  if (!url) {
    throw new Error('ADMIN_API_URL 환경변수가 없어요 (.env.example 참고)');
  }
  return url.replace(/\/$/, '');
}
