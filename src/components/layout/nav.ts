export type NavItem = { href: string; label: string; superOnly?: boolean };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    label: '지표',
    items: [{ href: '/', label: '대시보드' }],
  },
  {
    label: '운영',
    items: [
      { href: '/users', label: '회원' },
      { href: '/inquiries', label: '문의' },
      { href: '/notices', label: '공지' },
      { href: '/push', label: '푸시', superOnly: true },
    ],
  },
  {
    label: '앱',
    items: [
      { href: '/app-settings', label: '앱 버전' },
      { href: '/test-accounts', label: '테스트 · 심사 계정', superOnly: true },
    ],
  },
  {
    label: '시스템',
    items: [
      { href: '/status', label: '상태' },
      { href: '/extraction', label: '공고 추출' },
    ],
  },
];
