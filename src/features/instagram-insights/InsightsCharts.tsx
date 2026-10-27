'use client';

import { SERIES } from '@/features/dashboard/chart-theme';
import { Bars, TrendLine } from '@/features/dashboard/Charts';
import type { Schemas } from '@/shared/api/types';
import { MEDIA_CATEGORY_LABEL, label } from '@/shared/lib/labels';

type FollowerDay = Schemas['AdminInstagramFollowerDayDto'];
type Snapshot = Schemas['AdminInstagramSnapshotDto'];
type Stat = Schemas['AdminInstagramCategoryStatDto'];
export type SnapshotMetric = 'reach' | 'follows' | 'saved' | 'shares';

const dayLabel = (day: string) => `${day}일`;

export function FollowersChart({ days }: { days: FollowerDay[] }) {
  return (
    <TrendLine
      data={days.map((day) => ({ date: day.date, followers: day.followers }))}
      xKey="date"
      valueKey="followers"
      name="팔로워"
    />
  );
}

export function FollowerChangeChart({ days }: { days: FollowerDay[] }) {
  return (
    <Bars
      data={days.map((day) => ({ date: day.date, change: day.change ?? 0 }))}
      xKey="date"
      series={[{ key: 'change', name: '증감', color: SERIES.primary }]}
    />
  );
}

export function CategoryFollowsChart({ items }: { items: Stat[] }) {
  return (
    <Bars
      data={items.map((item) => ({
        category: label(MEDIA_CATEGORY_LABEL, item.category),
        followsAvg: item.followsAvg ?? 0,
      }))}
      xKey="category"
      xLabel={(value) => value}
      series={[{ key: 'followsAvg', name: '팔로우 평균', color: SERIES.primary }]}
    />
  );
}

/** 게시 후 경과일별 누적값 */
export function CumulativeChart({
  snapshots,
  metric,
  name,
}: {
  snapshots: Snapshot[];
  metric: SnapshotMetric;
  name: string;
}) {
  return (
    <TrendLine
      data={snapshots.map((snapshot) => ({
        day: String(snapshot.dayIndex),
        value: snapshot.metrics[metric] ?? 0,
      }))}
      xKey="day"
      valueKey="value"
      name={name}
      xLabel={dayLabel}
    />
  );
}

/** 앞 수집 대비 증가 (첫 수집은 빠진다) */
export function IncreaseChart({
  snapshots,
  metric,
  name,
}: {
  snapshots: Snapshot[];
  metric: SnapshotMetric;
  name: string;
}) {
  return (
    <Bars
      data={snapshots
        .filter((snapshot) => snapshot.increase)
        .map((snapshot) => ({
          day: String(snapshot.dayIndex),
          value: snapshot.increase?.[metric] ?? 0,
        }))}
      xKey="day"
      xLabel={dayLabel}
      series={[{ key: 'value', name, color: SERIES.secondary }]}
    />
  );
}
