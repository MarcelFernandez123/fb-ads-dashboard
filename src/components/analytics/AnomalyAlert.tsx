'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DailyMetrics } from '@/types/metrics';
import { detectAnomalies, Anomaly } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface AnomalyAlertProps {
  dailyData: DailyMetrics[];
  onDismiss?: (id: string) => void;
}

export function AnomalyAlert({ dailyData, onDismiss }: AnomalyAlertProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const anomalies = useMemo(() => detectAnomalies(dailyData), [dailyData]);

  const visibleAnomalies = anomalies.filter((a) => !dismissedIds.has(a.id));

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    onDismiss?.(id);
  };

  const getSeverityColors = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: 'text-red-500',
          badge: 'destructive',
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          icon: 'text-amber-500',
          badge: 'secondary',
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          icon: 'text-blue-500',
          badge: 'outline',
        };
    }
  };

  const getTypeIcon = (type: Anomaly['type']) => {
    switch (type) {
      case 'spike':
        return <TrendingUp className="w-4 h-4" />;
      case 'drop':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (visibleAnomalies.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Anomaly Detection
          </div>
          <Badge variant="outline" className="font-normal">
            {visibleAnomalies.length} detected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {visibleAnomalies.slice(0, 5).map((anomaly) => {
          const colors = getSeverityColors(anomaly.severity);
          return (
            <div
              key={anomaly.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-all',
                colors.bg,
                colors.border
              )}
            >
              <div className={cn('mt-0.5', colors.icon)}>
                {getTypeIcon(anomaly.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm capitalize">
                    {anomaly.metric} {anomaly.type}
                  </span>
                  <Badge
                    variant={colors.badge as 'destructive' | 'secondary' | 'outline'}
                    className="text-xs"
                  >
                    {anomaly.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {anomaly.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(anomaly.date).toLocaleDateString('en-AU', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => handleDismiss(anomaly.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        {visibleAnomalies.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{visibleAnomalies.length - 5} more anomalies
          </p>
        )}
      </CardContent>
    </Card>
  );
}
