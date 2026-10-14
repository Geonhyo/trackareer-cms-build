'use client';

import { Button, Card, Notice, Stack } from '@/components/ui';

// 서버 API가 실패했을 때 (운영 빌드에서는 자세한 문구가 가려진다)
export default function CmsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card title="화면을 불러오지 못했어요">
      <Stack>
        <Notice tone="critical">
          서버 응답이 없거나 오류가 났어요. 잠시 뒤 다시 시도해 주세요.
          {error.digest && (
            <div style={{ marginTop: 4, fontSize: 12 }}>오류 번호 {error.digest}</div>
          )}
        </Notice>
        <div>
          <Button variant="primary" onClick={reset}>
            다시 시도
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
