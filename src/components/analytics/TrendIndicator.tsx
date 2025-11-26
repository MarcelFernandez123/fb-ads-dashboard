'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DailyMetrics } from '@/types/metrics';
import { calculateWoWTrends, TrendResult } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Target,
  Eye,
  MousePointerClick,
} from 'lucide-react';

interface TrendIndicatorProps {
  dailyData: DailyMetrics[];
  variant?: 'compact' | 'detailed';
}

export function TrendIndicator({ dailyData, variant = 'detailed' }: TrendIndicatorProps) {
  const trends = useMemo(() => calculateWoWTrends(dailyData), [dailyData]);

  const getTrendIcon = (trend: TrendResult) => {
    if (!trend) return <Minus className="w-4 h-4" />;
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: TrendResult, invertColors: boolean = false) => {
    if (!trend) return 'text-muted-foreground';
    const isPositive = trend.direction === 'up';
    // For metrics where lower is better (like spend), invert the colors
    const showAsPositive = invertColors ? !isPositive : isPositive;

    if (!trend.isSignificant) return 'text-muted-foreground';
    return showAsPositive ? 'text-green-500' : 'text-red-500';
  };

  const trendMetrics = [
    {
      key: 'spend',
      label: 'Spend',
      icon: DollarSign,
      invertColors: true, // Lower spend is good
    },
    {
      key: 'results',
      label: 'Results',
      icon: Target,
      invertColors: false,
    },
    {
      key: 'impressions',
      label: 'Impressions',
      icon: Eye,
      invertColors: false,
    },
    {
      key: 'clicks',
      label: 'Clicks',
      icon: MousePointerClick,
      invertColors: false,
    },
  ];

  if (Object.keys(trends).length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          <p>Not enough data for trend analysis</p>
          <p className="text-sm">Need at least 14 days of data</p>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-4">
        {trendMetrics.map(({ key, label, icon: Icon, invertColors }) => {
          const trend = trends[key];
          if (!trend) return null;

          return (
            <div
              key={key}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50"
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className={cn('flex items-center gap-1', getTrendColor(trend, invertColors))}>
                {getTrendIcon(trend)}
                <span className="text-sm font-medium">
                  {trend.percentage > 0 ? '+' : ''}
                  {trend.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Week-over-Week Trends</span>
          <Badge variant="outline" className="font-normal">
            Last 7 days vs previous
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trendMetrics.map(({ key, label, icon: Icon, invertColors }) => {
            const trend = trends[key];
            if (!trend) return null;

            return (
              <div
                key={key}
                className="p-4 rounded-lg bg-muted/30 space-y-2"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <div className={cn('flex items-center gap-2', getTrendColor(trend, invertColors))}>
                  {getTrendIcon(trend)}
                  <span className="text-2xl font-bold">
                    {trend.percentage > 0 ? '+' : ''}
                    {trend.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {trend.isSignificant ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        getTrendColor(trend, invertColors).replace('text-', 'border-')
                      )}
                    >
                      Significant
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Normal
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
