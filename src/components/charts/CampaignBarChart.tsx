'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Campaign } from '@/types/metrics';
import { formatCurrency } from '@/lib/utils';

interface CampaignBarChartProps {
  campaigns: Campaign[];
  metric?: 'amountSpent' | 'results' | 'ctr';
}

export function CampaignBarChart({
  campaigns,
  metric = 'amountSpent',
}: CampaignBarChartProps) {
  const data = campaigns.map((c) => ({
    name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
    fullName: c.name,
    value: (c.metrics as unknown as Record<string, number>)[metric] || 0,
    status: c.status,
  }));

  const getBarColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#3b82f6';
      case 'PAUSED':
        return '#94a3b8';
      default:
        return '#ef4444';
    }
  };

  const formatValue = (value: number) => {
    if (metric === 'amountSpent') return formatCurrency(value);
    if (metric === 'ctr') return `${value.toFixed(2)}%`;
    return value.toLocaleString();
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          type="number"
          tick={{ fill: 'currentColor', fontSize: 12 }}
          tickFormatter={formatValue}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: 'currentColor', fontSize: 12 }}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number) => formatValue(value)}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
