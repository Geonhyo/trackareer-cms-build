import type { Metadata } from 'next';
import { Badge, Card, LinkButton, PageHeader, Stack } from '@/components/ui';
import { ActionButton } from '@/components/ui/ActionButton';
import { deleteCategoryAction } from '@/features/instagram-insights/actions';
import { listCategories } from '@/features/instagram-insights/categories';
import { CategoryNameForm } from '@/features/instagram-insights/CategoryNameForm';
import styles from '@/features/instagram-insights/insights.module.css';
import { formatNumber } from '@/shared/lib/format';

export const metadata: Metadata = { title: '인스타 카테고리 관리' };

export default async function InstagramCategoriesPage() {
  const categories = await listCategories();
  return (
    <div style={{ maxWidth: 880 }}>
      <PageHeader
        title="카테고리 관리"
        description="기본 카테고리는 새 게시물을 캡션 규칙으로 자동 분류할 때 써요. 추가한 카테고리는 게시물 표나 상세에서 직접 골라 지정해요."
        action={<LinkButton href="/instagram-insights?tab=media">인스타 성과</LinkButton>}
      />
      <Stack>
        <Card title="카테고리" description="기본 · 추가한 순, 기타는 맨 뒤">
          <Stack>
            {categories.map((category) => (
              <div key={category.id} className={styles.categoryRow}>
                {category.builtIn ? <Badge tone="brand">기본</Badge> : <Badge>추가</Badge>}
                <CategoryNameForm key={category.name} category={category} />
                <span className={styles.muted}>게시물 {formatNumber(category.mediaCount)}개</span>
                {!category.builtIn && (
                  <ActionButton
                    size="sm"
                    variant="danger"
                    confirm={`'${category.name}'을 지울까요? 이 카테고리의 게시물 ${category.mediaCount}개는 자동 분류로 돌아가요.`}
                    action={deleteCategoryAction.bind(null, category.id)}
                  >
                    삭제
                  </ActionButton>
                )}
              </div>
            ))}
          </Stack>
        </Card>
        <Card
          title="추가"
          description="이름만 정하면 돼요. 자동 분류는 이 카테고리를 고르지 않아요."
        >
          <CategoryNameForm />
        </Card>
      </Stack>
    </div>
  );
}
