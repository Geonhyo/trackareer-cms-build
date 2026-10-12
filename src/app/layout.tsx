import type { Metadata } from 'next';
import { pretendard } from './font';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '트래커리어 CMS',
    template: '%s | 트래커리어 CMS',
  },
  // 내부 운영 도구 — 검색에 노출하지 않는다
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={pretendard.variable}>{children}</body>
    </html>
  );
}
