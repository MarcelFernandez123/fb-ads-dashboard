import { AccountConfig, AccountMetrics, isEcommerceMetrics, isGymMetrics } from '@/types/metrics';

export type ThresholdColor = 'green' | 'yellow' | 'red';

// Get color based on threshold configuration
export function getThresholdColor(
  value: number,
  thresholds: { green: number; yellow: number },
  higherIsBetter: boolean = true
): ThresholdColor {
  if (higherIsBetter) {
    // For metrics like ROAS where higher is better
    if (value >= thresholds.green) return 'green';
    if (value >= thresholds.yellow) return 'yellow';
    return 'red';
  } else {
    // For metrics like Cost Per Sub where lower is better
    if (value <= thresholds.green) return 'green';
    if (value <= thresholds.yellow) return 'yellow';
    return 'red';
  }
}

// Get primary KPI color for an account
export function getPrimaryKPIColor(config: AccountConfig, metrics: AccountMetrics): ThresholdColor {
  if (!config.thresholds) return 'green'; // No thresholds defined

  switch (config.primaryKPI) {
    case 'roas':
      if (isEcommerceMetrics(metrics) && config.thresholds.roas) {
        return getThresholdColor(metrics.roas, config.thresholds.roas, true);
      }
      break;
    case 'costPerSubscription':
      if (isGymMetrics(metrics) && config.thresholds.costPerSubscription) {
        return getThresholdColor(metrics.costPerSubscription, config.thresholds.costPerSubscription, false);
      }
      break;
    case 'costPerResult':
      // No specific thresholds for generic lead gen accounts
      return 'green';
  }

  return 'green';
}

// Tailwind color classes for thresholds
export const thresholdColorClasses: Record<ThresholdColor, {
  bg: string;
  text: string;
  border: string;
  badge: string;
}> = {
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-500/30',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-500/30',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/30',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
};

// CTR threshold (universal)
export const CTR_THRESHOLDS = {
  green: 1.5,
  yellow: 1.0
};

// Check if CTR is below threshold for alerts
export function isCTRLow(ctr: number): boolean {
  return ctr < CTR_THRESHOLDS.yellow;
}

// Default ROAS thresholds for Charlie Ralph accounts
export const ROAS_THRESHOLDS = {
  green: 5,
  yellow: 3
};

// Default Cost Per Subscription thresholds for ROAR
export const COST_PER_SUB_THRESHOLDS = {
  green: 50,
  yellow: 80
};
