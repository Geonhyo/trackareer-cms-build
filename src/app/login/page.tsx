import type { Metadata } from 'next';
import { AuthPanel } from '@/components/auth/AuthPanel';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: '로그인' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <AuthPanel title="로그인" description="관리자 계정으로 들어가요.">
      <LoginForm next={next} />
    </AuthPanel>
  );
}
