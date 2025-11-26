import { AccountConfig } from '@/types/metrics';

export const accountConfigs: AccountConfig[] = [
  {
    id: 'cale-henderson',
    name: 'Cale Henderson',
    slug: 'cale-henderson',
    type: 'leadgen',
    primaryKPI: 'costPerResult',
    metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'results', 'costPerResult', 'amountSpent'],
  },
  {
    id: 'charlie-ralph-melb',
    name: 'Charlie Ralph Melbourne',
    slug: 'charlie-ralph-melbourne',
    type: 'ecommerce',
    primaryKPI: 'roas',
    metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'results', 'costPerResult', 'roas', 'conversionValue', 'purchases', 'costPerPurchase', 'amountSpent'],
    thresholds: {
      roas: { green: 5, yellow: 3 }
    }
  },
  {
    id: 'charlie-ralph-gc',
    name: 'Charlie Ralph Gold Coast',
    slug: 'charlie-ralph-gold-coast',
    type: 'ecommerce',
    primaryKPI: 'roas',
    metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'results', 'costPerResult', 'roas', 'conversionValue', 'purchases', 'costPerPurchase', 'amountSpent'],
    thresholds: {
      roas: { green: 5, yellow: 3 }
    }
  },
  {
    id: 'roar-mma-rockingham',
    name: 'ROAR MMA Rockingham',
    slug: 'roar-mma-rockingham',
    type: 'leadgen-gym',
    primaryKPI: 'costPerSubscription',
    metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'results', 'costPerResult', 'submitApplication', 'startTrial', 'subscriptions', 'costPerSubscription', 'amountSpent'],
    thresholds: {
      costPerSubscription: { green: 50, yellow: 80 }
    }
  },
  {
    id: 'blank-kanvas',
    name: 'Blank Kanvas',
    slug: 'blank-kanvas',
    type: 'leadgen',
    primaryKPI: 'costPerResult',
    metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'results', 'costPerResult', 'amountSpent'],
  },
  {
    id: 'chiropractichub',
    name: 'ChiropracticHUB',
    slug: 'chiropractichub',
    type: 'leadgen',
    primaryKPI: 'costPerResult',
    metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'results', 'costPerResult', 'amountSpent'],
  }
];

export const getAccountConfig = (id: string): AccountConfig | undefined => {
  return accountConfigs.find(config => config.id === id || config.slug === id);
};

export const getAccountsByType = (type: 'ecommerce' | 'leadgen-gym' | 'leadgen' | 'all'): AccountConfig[] => {
  if (type === 'all') return accountConfigs;
  return accountConfigs.filter(config => config.type === type);
};

// Metric display configuration
export const metricLabels: Record<string, string> = {
  impressions: 'Impressions',
  clicks: 'Clicks',
  ctr: 'CTR',
  cpc: 'CPC',
  results: 'Results',
  costPerResult: 'Cost Per Result',
  amountSpent: 'Amount Spent',
  roas: 'ROAS',
  conversionValue: 'Conversion Value',
  purchases: 'Purchases',
  costPerPurchase: 'Cost Per Purchase',
  submitApplication: 'Applications',
  startTrial: 'Trials Started',
  subscriptions: 'Subscriptions',
  costPerSubscription: 'Cost Per Sub'
};

export const metricFormats: Record<string, 'number' | 'currency' | 'percentage' | 'multiplier'> = {
  impressions: 'number',
  clicks: 'number',
  ctr: 'percentage',
  cpc: 'currency',
  results: 'number',
  costPerResult: 'currency',
  amountSpent: 'currency',
  roas: 'multiplier',
  conversionValue: 'currency',
  purchases: 'number',
  costPerPurchase: 'currency',
  submitApplication: 'number',
  startTrial: 'number',
  subscriptions: 'number',
  costPerSubscription: 'currency'
};
