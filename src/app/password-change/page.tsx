import type { Metadata } from 'next';
import { AuthPanel } from '@/components/auth/AuthPanel';
import { PasswordChangeForm } from '@/components/auth/PasswordChangeForm';
import { getSessionAdmin } from '@/shared/auth/session';

export const metadata: Metadata = { title: '비밀번호 변경' };

export default async function PasswordChangePage() {
  const admin = await getSessionAdmin();
  return (
    <AuthPanel
      title="비밀번호 변경"
      description={
        admin?.mustChangePassword
          ? '임시 비밀번호로 들어왔어요. 계속하려면 비밀번호를 바꿔 주세요.'
          : '새 비밀번호로 바꾸면 다른 기기의 로그인은 끊겨요.'
      }
    >
      <PasswordChangeForm />
    </AuthPanel>
  );
}
