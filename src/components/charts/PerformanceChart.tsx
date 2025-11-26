'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DailyMetrics } from '@/types/metrics';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface PerformanceChartProps {
  data: DailyMetrics[];
  showRoas?: boolean;
  showSubscriptions?: boolean;
}

export function PerformanceChart({
  data,
  showRoas = false,
  showSubscriptions = false,
}: PerformanceChartProps) {
  const formatXAxis = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fill: 'currentColor', fontSize: 12 }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: 'currentColor', fontSize: 12 }}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: 'currentColor', fontSize: 12 }}
          tickFormatter={(value) => formatNumber(value)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number, name: string) => {
            if (name === 'Spend') return [formatCurrency(value), name];
            if (name === 'ROAS') return [`${value.toFixed(2)}x`, name];
            return [formatNumber(value), name];
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="spend"
          name="Spend"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="results"
          name="Results"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
        />
        {showRoas && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="roas"
            name="ROAS"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
        )}
        {showSubscriptions && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="subscriptions"
            name="Subscriptions"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
