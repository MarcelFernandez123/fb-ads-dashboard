'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DailyMetrics } from '@/types/metrics';
import { forecastSpend, ForecastData } from '@/lib/analytics';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface ForecastChartProps {
  dailyData: DailyMetrics[];
  daysAhead?: number;
}

export function ForecastChart({ dailyData, daysAhead = 7 }: ForecastChartProps) {
  const { chartData, totalForecast } = useMemo(() => {
    const forecast = forecastSpend(dailyData, daysAhead);

    // Combine historical and forecast data
    const historicalData = dailyData.slice(-14).map((d) => ({
      date: d.date,
      actual: d.spend,
      predicted: null as number | null,
      lowerBound: null as number | null,
      upperBound: null as number | null,
      isForecast: false,
    }));

    const forecastData = forecast.map((f) => ({
      date: f.date,
      actual: null as number | null,
      predicted: f.predicted,
      lowerBound: f.lowerBound,
      upperBound: f.upperBound,
      isForecast: true,
    }));

    // Add connection point
    if (historicalData.length > 0 && forecastData.length > 0) {
      const lastActual = historicalData[historicalData.length - 1];
      forecastData[0] = {
        ...forecastData[0],
        actual: lastActual.actual,
      };
    }

    const combined = [...historicalData, ...forecastData];
    const total = forecast.reduce((sum, f) => sum + f.predicted, 0);

    return { chartData: combined, totalForecast: total };
  }, [dailyData, daysAhead]);

  const formatXAxis = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Spend Forecast
          </div>
          <Badge variant="outline" className="text-sm">
            Next {daysAhead} days: {formatCurrency(totalForecast)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              tick={{ fill: 'currentColor', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value, name) => {
                if (value === null || value === undefined) return ['-', String(name)];
                const numValue = typeof value === 'number' ? value : Number(value);
                return [formatCurrency(numValue), String(name)];
              }}
              labelFormatter={(label) => {
                const d = new Date(label);
                return d.toLocaleDateString('en-AU', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ReferenceLine
              x={today}
              stroke="#666"
              strokeDasharray="5 5"
              label={{
                value: 'Today',
                fill: '#666',
                fontSize: 12,
                position: 'top',
              }}
            />
            {/* Confidence interval (lower and upper bounds) */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="transparent"
              fill="url(#confidenceGradient)"
              name="Upper Bound"
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="transparent"
              fill="hsl(var(--background))"
              name="Lower Bound"
            />
            {/* Actual spend */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#actualGradient)"
              name="Actual"
              connectNulls={false}
            />
            {/* Predicted spend */}
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#forecastGradient)"
              name="Forecast"
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Historical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">Forecast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500/20" />
            <span className="text-muted-foreground">Confidence Range</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
