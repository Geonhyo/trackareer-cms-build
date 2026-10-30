import { AUTO_CATEGORY, type MediaCategory, type MediaItem } from './insights-types';

/** 카테고리 select의 option들. media를 주면 수동 지정된 게시물에 '자동 분류로 되돌리기'를 더한다 */
export function CategoryOptions({
  categories,
  media,
}: {
  categories: MediaCategory[];
  media?: MediaItem;
}) {
  return (
    <>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
      {media?.categorySource === 'MANUAL' && (
        <option value={AUTO_CATEGORY}>자동 분류로 되돌리기</option>
      )}
    </>
  );
}
