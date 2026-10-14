'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS, SERIES, shortDate } from './chart-theme';
import { ChartTooltip } from './ChartTooltip';

type Point = Record<string, string | number>;
type Series = { key: string; name: string; color: string };

const HEIGHT = 220;

function axes(xKey: string, xFormatter: (value: string) => string) {
  return [
    <CartesianGrid key="grid" vertical={false} stroke={AXIS.grid} />,
    <XAxis
      key="x"
      dataKey={xKey}
      tickFormatter={xFormatter}
      tick={AXIS.tick}
      stroke={AXIS.stroke}
      tickLine={false}
      interval="preserveStartEnd"
      minTickGap={16}
    />,
    <YAxis
      key="y"
      allowDecimals={false}
      tick={AXIS.tick}
      axisLine={false}
      tickLine={false}
      width={36}
    />,
  ];
}

/** 막대 (계열 하나면 범례 없음, 여럿이면 쌓아서 범례) */
export function Bars({
  data,
  xKey,
  series,
  xLabel = shortDate,
}: {
  data: Point[];
  xKey: string;
  series: Series[];
  xLabel?: (value: string) => string;
}) {
  const stacked = series.length > 1;
  return (
    <ResponsiveContainer width="100%" height={HEIGHT}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
        {axes(xKey, xLabel)}
        <Tooltip
          cursor={{ fill: 'rgba(17,17,17,0.04)' }}
          content={({ active, payload, label }) => (
            <ChartTooltip active={active} payload={payload} label={label} formatLabel={xLabel} />
          )}
        />
        {stacked && (
          // 계열 순서 그대로 (기본은 이름순)
          <Legend iconType="rect" iconSize={10} wrapperStyle={{ fontSize: 12 }} itemSorter={null} />
        )}
        {series.map((item, index) => (
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.name}
            fill={item.color}
            stackId={stacked ? 'stack' : undefined}
            // 위 끝만 둥글게, 쌓인 칸 사이는 2px 바탕색 틈
            radius={!stacked || index === series.length - 1 ? [4, 4, 0, 0] : 0}
            stroke="#ffffff"
            strokeWidth={stacked ? 2 : 0}
            maxBarSize={36}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/** 선 하나 (추이) */
export function TrendLine({
  data,
  xKey,
  valueKey,
  name,
  color = SERIES.primary,
  xLabel = shortDate,
}: {
  data: Point[];
  xKey: string;
  valueKey: string;
  name: string;
  color?: string;
  xLabel?: (value: string) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={HEIGHT}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        {axes(xKey, xLabel)}
        <Tooltip
          cursor={{ stroke: '#8e8e8e', strokeWidth: 1 }}
          content={({ active, payload, label }) => (
            <ChartTooltip active={active} payload={payload} label={label} formatLabel={xLabel} />
          )}
        />
        <Line
          type="linear"
          dataKey={valueKey}
          name={name}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, stroke: '#ffffff', strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
