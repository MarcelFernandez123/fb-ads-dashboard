'use client';

import { Card, CardContent } from '@/components/ui/card';
import { AccountMetrics, isEcommerceMetrics, isGymMetrics } from '@/types/metrics';
import { formatCurrency, formatNumber, formatPercentage, formatMultiplier } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  MousePointerClick,
  Eye,
  Target,
  DollarSign,
  ShoppingCart,
  Users,
} from 'lucide-react';

interface MetricsRowProps {
  metrics: AccountMetrics;
  accountType: 'ecommerce' | 'leadgen-gym' | 'leadgen';
  comparison?: Record<string, number>;
}

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
}

function MetricCard({ label, value, change, icon }: MetricCardProps) {
  const hasPositiveChange = change !== undefined && change > 0;
  const hasNegativeChange = change !== undefined && change < 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <p className="text-xl font-bold mt-1">{value}</p>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center text-xs mt-1',
              hasPositiveChange && 'text-green-600',
              hasNegativeChange && 'text-red-600',
              !hasPositiveChange && !hasNegativeChange && 'text-muted-foreground'
            )}
          >
            {hasPositiveChange && <TrendingUp className="w-3 h-3 mr-1" />}
            {hasNegativeChange && <TrendingDown className="w-3 h-3 mr-1" />}
            <span>{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MetricsRow({ metrics, accountType, comparison }: MetricsRowProps) {
  const baseMetrics = [
    {
      label: 'Impressions',
      value: formatNumber(metrics.impressions),
      change: comparison?.impressions,
      icon: <Eye className="w-4 h-4" />,
    },
    {
      label: 'Clicks',
      value: formatNumber(metrics.clicks),
      change: comparison?.clicks,
      icon: <MousePointerClick className="w-4 h-4" />,
    },
    {
      label: 'CTR',
      value: formatPercentage(metrics.ctr),
      change: comparison?.ctr,
    },
    {
      label: 'CPC',
      value: formatCurrency(metrics.cpc),
      change: comparison?.cpc,
    },
    {
      label: 'Results',
      value: formatNumber(metrics.results),
      change: comparison?.results,
      icon: <Target className="w-4 h-4" />,
    },
    {
      label: 'Cost/Result',
      value: formatCurrency(metrics.costPerResult),
      change: comparison?.costPerResult,
    },
  ];

  // Add e-commerce specific metrics
  if (accountType === 'ecommerce' && isEcommerceMetrics(metrics)) {
    baseMetrics.push(
      {
        label: 'ROAS',
        value: formatMultiplier(metrics.roas),
        change: comparison?.roas,
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        label: 'Conv. Value',
        value: formatCurrency(metrics.conversionValue),
        change: comparison?.conversionValue,
        icon: <DollarSign className="w-4 h-4" />,
      },
      {
        label: 'Purchases',
        value: formatNumber(metrics.purchases),
        change: comparison?.purchases,
        icon: <ShoppingCart className="w-4 h-4" />,
      }
    );
  }

  // Add gym specific metrics
  if (accountType === 'leadgen-gym' && isGymMetrics(metrics)) {
    baseMetrics.push(
      {
        label: 'Applications',
        value: formatNumber(metrics.submitApplication),
        change: comparison?.submitApplication,
        icon: <Users className="w-4 h-4" />,
      },
      {
        label: 'Trials',
        value: formatNumber(metrics.startTrial),
        change: comparison?.startTrial,
      },
      {
        label: 'Subscriptions',
        value: formatNumber(metrics.subscriptions),
        change: comparison?.subscriptions,
      },
      {
        label: 'Cost/Sub',
        value: formatCurrency(metrics.costPerSubscription),
        change: comparison?.costPerSubscription,
      }
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {baseMetrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
