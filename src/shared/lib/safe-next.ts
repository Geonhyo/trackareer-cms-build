/** 로그인 후 돌아갈 경로. 외부 도메인으로 튕기지 않도록 내부 경로만 허용한다 */
export const toSafeNext = (value: unknown): string =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';
