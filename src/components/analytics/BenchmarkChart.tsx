'use client';

import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AccountData } from '@/types/metrics';
import { calculateBenchmarks, Benchmark } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';

interface BenchmarkChartProps {
  account: AccountData;
}

export function BenchmarkChart({ account }: BenchmarkChartProps) {
  const benchmarks = useMemo(() => calculateBenchmarks(account), [account]);

  const chartData = benchmarks.map((b) => ({
    metric: b.metric,
    percentile: b.percentile,
    fullMark: 100,
  }));

  const getStatusColor = (status: Benchmark['status']) => {
    switch (status) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'average':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: Benchmark['status']) => {
    const colors: Record<Benchmark['status'], string> = {
      excellent: 'bg-green-500/10 text-green-600 border-green-500/30',
      good: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
      average: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
      poor: 'bg-red-500/10 text-red-600 border-red-500/30',
    };
    return colors[status] || colors.average;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Industry Benchmarks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid
                stroke="currentColor"
                className="text-border"
                strokeOpacity={0.3}
              />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-muted-foreground"
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: 'currentColor', fontSize: 10 }}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value.toFixed(0)}th percentile`, 'Performance']}
              />
              <Radar
                name="Performance"
                dataKey="percentile"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Benchmark Details */}
        <div className="space-y-3">
          {benchmarks.map((benchmark) => (
            <div
              key={benchmark.metric}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{benchmark.metric}</span>
                  <Badge
                    variant="outline"
                    className={cn('text-xs capitalize', getStatusBadge(benchmark.status))}
                  >
                    {benchmark.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Your value:{' '}
                  <span className="font-medium text-foreground">
                    {benchmark.metric === 'ROAS'
                      ? `${benchmark.value.toFixed(2)}x`
                      : benchmark.metric.includes('Cost')
                      ? `$${benchmark.value.toFixed(2)}`
                      : benchmark.metric === 'CTR'
                      ? `${benchmark.value.toFixed(2)}%`
                      : `$${benchmark.value.toFixed(2)}`}
                  </span>
                  <span className="mx-2">|</span>
                  Industry avg:{' '}
                  <span className="font-medium">
                    {benchmark.metric === 'ROAS'
                      ? `${benchmark.industryAvg.toFixed(2)}x`
                      : benchmark.metric.includes('Cost')
                      ? `$${benchmark.industryAvg.toFixed(2)}`
                      : benchmark.metric === 'CTR'
                      ? `${benchmark.industryAvg.toFixed(2)}%`
                      : `$${benchmark.industryAvg.toFixed(2)}`}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={cn('text-2xl font-bold', getStatusColor(benchmark.status))}>
                  {benchmark.percentile.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">percentile</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
