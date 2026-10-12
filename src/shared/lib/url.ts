type Params = Record<string, string | string[] | undefined>;

/** 지금 검색 조건(searchParams)에 일부만 바꾼 주소. 빈 값은 뺀다 */
export function withQuery(
  pathname: string,
  current: Params,
  changes: Record<string, string | number | undefined | null>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (typeof value === 'string' && value !== '') params.set(key, value);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === null || value === '') params.delete(key);
    else params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** searchParams 값 하나 (배열이면 첫 값) */
export const param = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export const pageParam = (value: string | string[] | undefined): number => {
  const page = Number(param(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
};
