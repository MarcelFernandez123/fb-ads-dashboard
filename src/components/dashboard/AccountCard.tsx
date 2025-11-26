'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SparkLine } from '@/components/charts/SparkLine';
import { AccountData, isEcommerceMetrics, isGymMetrics } from '@/types/metrics';
import { formatCurrency, formatNumber, formatMultiplier } from '@/lib/utils';
import { getPrimaryKPIColor, thresholdColorClasses } from '@/lib/thresholds';
import { cn } from '@/lib/utils';

interface AccountCardProps {
  account: AccountData;
}

export function AccountCard({ account }: AccountCardProps) {
  const { config, metrics, todaySpend, sevenDaySpend, sparklineData, status } = account;

  // Get primary KPI display
  let primaryKPILabel = 'Cost/Result';
  let primaryKPIValue = metrics.costPerResult;
  let primaryKPIFormatted = formatCurrency(metrics.costPerResult);

  if (config.primaryKPI === 'roas' && isEcommerceMetrics(metrics)) {
    primaryKPILabel = 'ROAS';
    primaryKPIValue = metrics.roas;
    primaryKPIFormatted = formatMultiplier(metrics.roas);
  } else if (config.primaryKPI === 'costPerSubscription' && isGymMetrics(metrics)) {
    primaryKPILabel = 'Cost/Sub';
    primaryKPIValue = metrics.costPerSubscription;
    primaryKPIFormatted = formatCurrency(metrics.costPerSubscription);
  }

  const kpiColor = getPrimaryKPIColor(config, metrics);
  const colorClasses = thresholdColorClasses[kpiColor];

  // Get account type badge
  const typeBadge = {
    ecommerce: { label: 'E-commerce', variant: 'default' as const },
    'leadgen-gym': { label: 'Lead Gen', variant: 'secondary' as const },
    leadgen: { label: 'Lead Gen', variant: 'secondary' as const },
  }[config.type];

  return (
    <Link href={`/accounts/${config.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {config.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={typeBadge.variant} className="text-xs">
                  {typeBadge.label}
                </Badge>
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  )}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary KPI */}
          <div
            className={cn(
              'p-3 rounded-lg',
              colorClasses.bg,
              colorClasses.border,
              'border'
            )}
          >
            <p className="text-xs text-muted-foreground">{primaryKPILabel}</p>
            <p className={cn('text-2xl font-bold', colorClasses.text)}>
              {primaryKPIFormatted}
            </p>
          </div>

          {/* Spend metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="text-sm font-semibold">{formatCurrency(todaySpend)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">7-Day</p>
              <p className="text-sm font-semibold">{formatCurrency(sevenDaySpend)}</p>
            </div>
          </div>

          {/* Results */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Results</p>
              <p className="text-sm font-semibold">{formatNumber(metrics.results)}</p>
            </div>
            <div className="w-24 h-10">
              <SparkLine
                data={sparklineData}
                color={kpiColor === 'red' ? '#ef4444' : '#3b82f6'}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
