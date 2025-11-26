'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { MetricDataPoint } from '@/types/metrics';

interface SparkLineProps {
  data: MetricDataPoint[];
  color?: string;
  height?: number;
}

export function SparkLine({ data, color = '#3b82f6', height = 40 }: SparkLineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
