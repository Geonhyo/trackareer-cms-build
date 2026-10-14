// 차트 색 (dataviz 검증 통과: 두 계열 #3259ab · #eb6834, 흰 바탕 3:1 이상, CVD ΔE 24.8)
export const SERIES = {
  primary: '#3259ab', // 브랜드 파랑 — 계열 하나짜리 차트
  secondary: '#eb6834', // 두 번째 계열
} as const;

// 가입 유형 고정 색 (순위 · 필터가 바뀌어도 같은 유형은 같은 색)
export const PROVIDER_COLOR: Record<string, string> = {
  KAKAO: SERIES.primary,
  APPLE: SERIES.secondary,
};

export const AXIS = {
  stroke: '#dddee3',
  tick: { fill: '#8e8e8e', fontSize: 12 },
  grid: '#efefef',
};

/** 2026-10-05 → 10/5 */
export const shortDate = (key: string) => {
  const [, month, day] = key.split('-');
  return `${Number(month)}/${Number(day)}`;
};
