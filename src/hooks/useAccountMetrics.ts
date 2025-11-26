'use client';

import { useMemo } from 'react';
import { AccountData, AccountMetrics, isEcommerceMetrics, isGymMetrics } from '@/types/metrics';
import { metricLabels, metricFormats } from '@/lib/metrics-config';
import { getPrimaryKPIColor, ThresholdColor } from '@/lib/thresholds';
import { formatMetricValue } from '@/lib/utils';

interface MetricDisplay {
  key: string;
  label: string;
  value: number;
  formattedValue: string;
  format: 'number' | 'currency' | 'percentage' | 'multiplier';
}

interface PrimaryKPIDisplay {
  label: string;
  value: number;
  formattedValue: string;
  color: ThresholdColor;
}

export function useAccountMetrics(accountData: AccountData | undefined) {
  const metrics = useMemo(() => {
    if (!accountData) return [];

    const { config, metrics: accountMetrics } = accountData;

    return config.metrics
      .filter((key) => key in accountMetrics)
      .map((key): MetricDisplay => {
        const value = (accountMetrics as unknown as Record<string, number>)[key] || 0;
        const format = metricFormats[key] || 'number';
        return {
          key,
          label: metricLabels[key] || key,
          value,
          formattedValue: formatMetricValue(value, format),
          format,
        };
      });
  }, [accountData]);

  const primaryKPI = useMemo((): PrimaryKPIDisplay | null => {
    if (!accountData) return null;

    const { config, metrics: accountMetrics } = accountData;
    let value = 0;
    let label = '';

    switch (config.primaryKPI) {
      case 'roas':
        if (isEcommerceMetrics(accountMetrics)) {
          value = accountMetrics.roas;
          label = 'ROAS';
        }
        break;
      case 'costPerSubscription':
        if (isGymMetrics(accountMetrics)) {
          value = accountMetrics.costPerSubscription;
          label = 'Cost Per Subscription';
        }
        break;
      case 'costPerResult':
        value = accountMetrics.costPerResult;
        label = 'Cost Per Result';
        break;
    }

    const format = metricFormats[config.primaryKPI] || 'currency';
    const color = getPrimaryKPIColor(config, accountMetrics);

    return {
      label,
      value,
      formattedValue: formatMetricValue(value, format),
      color,
    };
  }, [accountData]);

  const funnelData = useMemo(() => {
    if (!accountData || accountData.config.type !== 'leadgen-gym') return null;

    const metrics = accountData.metrics;
    if (!isGymMetrics(metrics)) return null;

    const stages = [
      { name: 'Applications', value: metrics.submitApplication },
      { name: 'Trials', value: metrics.startTrial },
      { name: 'Subscriptions', value: metrics.subscriptions },
    ];

    // Calculate conversion rates between stages
    return stages.map((stage, index) => {
      if (index === 0) return { ...stage, conversionRate: 100 };
      const previousValue = stages[index - 1].value;
      const conversionRate = previousValue > 0 ? (stage.value / previousValue) * 100 : 0;
      return { ...stage, conversionRate };
    });
  }, [accountData]);

  return { metrics, primaryKPI, funnelData };
}

// Hook for comparing metrics between periods
export function useMetricsComparison(
  currentMetrics: AccountMetrics | undefined,
  previousMetrics: AccountMetrics | undefined
) {
  return useMemo(() => {
    if (!currentMetrics || !previousMetrics) return {};

    const changes: Record<string, number> = {};

    Object.keys(currentMetrics).forEach((key) => {
      const current = (currentMetrics as unknown as Record<string, number>)[key];
      const previous = (previousMetrics as unknown as Record<string, number>)[key];

      if (typeof current === 'number' && typeof previous === 'number' && previous !== 0) {
        changes[key] = ((current - previous) / previous) * 100;
      }
    });

    return changes;
  }, [currentMetrics, previousMetrics]);
}
