'use client';

import { Alert } from '@/types/metrics';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  TrendingDown,
  DollarSign,
  MousePointerClick,
  XCircle,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface AlertsBannerProps {
  alerts: Alert[];
}

export function AlertsBanner({ alerts }: AlertsBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter((alert) => !dismissedIds.has(alert.id));

  if (visibleAlerts.length === 0) return null;

  const dismissAlert = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'declining_roas':
        return <TrendingDown className="w-4 h-4" />;
      case 'high_cost_per_sub':
        return <DollarSign className="w-4 h-4" />;
      case 'low_ctr':
        return <MousePointerClick className="w-4 h-4" />;
      case 'no_results':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityClasses = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10 border-red-500/30',
          text: 'text-red-600 dark:text-red-400',
          icon: 'text-red-500',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10 border-yellow-500/30',
          text: 'text-yellow-600 dark:text-yellow-400',
          icon: 'text-yellow-500',
        };
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/30',
          text: 'text-blue-600 dark:text-blue-400',
          icon: 'text-blue-500',
        };
    }
  };

  return (
    <div className="space-y-2">
      {visibleAlerts.slice(0, 5).map((alert) => {
        const classes = getSeverityClasses(alert.severity);
        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border',
              classes.bg
            )}
          >
            <div className="flex items-center gap-3">
              <div className={classes.icon}>{getIcon(alert.type)}</div>
              <div>
                <p className={cn('text-sm font-medium', classes.text)}>
                  {alert.accountName}
                </p>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </div>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      {visibleAlerts.length > 5 && (
        <p className="text-xs text-muted-foreground text-center">
          +{visibleAlerts.length - 5} more alerts
        </p>
      )}
    </div>
  );
}
