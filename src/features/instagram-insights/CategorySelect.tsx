'use client';

import { useState, useTransition } from 'react';
import { Badge, Select } from '@/components/ui';
import { setMediaCategoryAction } from './actions';
import { CategoryOptions } from './CategoryOptions';
import type { MediaCategory, MediaItem } from './insights-types';
import styles from './insights.module.css';

/** 게시물 표에서 카테고리를 바로 바꾼다 */
export function CategorySelect({
  media,
  categories,
}: {
  media: MediaItem;
  categories: MediaCategory[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const change = (value: string) => {
    setError(null);
    startTransition(async () => {
      const result = await setMediaCategoryAction(media.id, value);
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <span className={styles.title}>
      <Select
        aria-label="카테고리"
        value={media.categoryId}
        disabled={pending}
        onChange={(event) => change(event.target.value)}
        className={styles.inlineSelect}
      >
        <CategoryOptions categories={categories} media={media} />
      </Select>
      {media.categorySource === 'MANUAL' && <Badge tone="brand">수동</Badge>}
      {error && <Badge tone="critical">{error}</Badge>}
    </span>
  );
}
