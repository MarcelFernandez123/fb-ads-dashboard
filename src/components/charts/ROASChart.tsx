'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { DailyMetrics } from '@/types/metrics';

interface ROASChartProps {
  data: DailyMetrics[];
  greenThreshold?: number;
  yellowThreshold?: number;
}

export function ROASChart({
  data,
  greenThreshold = 5,
  yellowThreshold = 3,
}: ROASChartProps) {
  const formatXAxis = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
  };

  // Filter data to only include entries with ROAS
  const roasData = data.filter((d) => d.roas !== undefined);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={roasData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fill: 'currentColor', fontSize: 12 }}
        />
        <YAxis
          domain={[0, 'auto']}
          tick={{ fill: 'currentColor', fontSize: 12 }}
          tickFormatter={(value) => `${value}x`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number) => [`${value.toFixed(2)}x`, 'ROAS']}
        />
        <ReferenceLine
          y={greenThreshold}
          stroke="#22c55e"
          strokeDasharray="5 5"
          label={{
            value: `${greenThreshold}x Target`,
            fill: '#22c55e',
            fontSize: 12,
            position: 'right',
          }}
        />
        <ReferenceLine
          y={yellowThreshold}
          stroke="#eab308"
          strokeDasharray="5 5"
          label={{
            value: `${yellowThreshold}x Min`,
            fill: '#eab308',
            fontSize: 12,
            position: 'right',
          }}
        />
        <Line
          type="monotone"
          dataKey="roas"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
