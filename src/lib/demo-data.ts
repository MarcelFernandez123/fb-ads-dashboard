// Demo data generator for static deployment (GitHub Pages)
import { AccountData, AccountType, PrimaryKPI, Campaign, Alert, DailyMetrics, AccountConfig } from '@/types/metrics';
import { accountConfigs, getAccountConfig } from './metrics-config';

// Generate sparkline data
function generateSparkline(days: number = 7) {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toISOString().split('T')[0],
      value: Math.random() * 500 + 100,
    };
  });
}

// Generate daily metrics data
function generateDailyData(days: number = 7, accountType: AccountType): DailyMetrics[] {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    const baseData: DailyMetrics = {
      date: date.toISOString().split('T')[0],
      impressions: Math.floor(Math.random() * 50000) + 10000,
      clicks: Math.floor(Math.random() * 2000) + 500,
      spend: Math.random() * 500 + 100,
      results: Math.floor(Math.random() * 50) + 10,
    };

    if (accountType === 'ecommerce') {
      return { ...baseData, roas: Math.random() * 4 + 3 };
    }
    if (accountType === 'leadgen-gym') {
      return { ...baseData, subscriptions: Math.floor(Math.random() * 8) + 2 };
    }
    return baseData;
  });
}

// Generate campaign data
function generateCampaigns(count: number, accountType: AccountType): Campaign[] {
  return Array.from({ length: count }, (_, i) => {
    const baseMetrics: Record<string, number> = {
      impressions: Math.floor(Math.random() * 20000) + 5000,
      clicks: Math.floor(Math.random() * 800) + 200,
      ctr: Math.random() * 3 + 0.5,
      cpc: Math.random() * 2 + 0.5,
      results: Math.floor(Math.random() * 30) + 5,
      costPerResult: Math.random() * 50 + 10,
      amountSpent: Math.random() * 300 + 50,
    };

    let metrics: Record<string, number> = baseMetrics;
    if (accountType === 'ecommerce') {
      metrics = {
        ...baseMetrics,
        roas: Math.random() * 4 + 3,
        conversionValue: Math.random() * 5000 + 1000,
        purchases: Math.floor(Math.random() * 30) + 5,
        costPerPurchase: Math.random() * 50 + 20,
      };
    } else if (accountType === 'leadgen-gym') {
      metrics = {
        ...baseMetrics,
        submitApplication: Math.floor(Math.random() * 30) + 10,
        startTrial: Math.floor(Math.random() * 15) + 5,
        subscriptions: Math.floor(Math.random() * 10) + 2,
        costPerSubscription: Math.random() * 60 + 30,
      };
    }

    return {
      id: `campaign-${i + 1}`,
      name: `Campaign ${i + 1} - ${['Awareness', 'Conversions', 'Retargeting', 'Lookalike'][i % 4]}`,
      status: (i === 0 ? 'ACTIVE' : Math.random() > 0.3 ? 'ACTIVE' : 'PAUSED') as Campaign['status'],
      objective: ['CONVERSIONS', 'LEAD_GENERATION', 'TRAFFIC'][Math.floor(Math.random() * 3)],
      metrics: metrics as any,
    };
  });
}

// Seeded random for consistent demo data
let seed = 12345;
function seededRandom() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

// Generate demo data for all accounts
export function generateAllAccountsData(): AccountData[] {
  const now = new Date();

  return [
    {
      config: accountConfigs.find(c => c.id === 'cale-henderson')!,
      metrics: {
        impressions: 125840,
        clicks: 3421,
        ctr: 2.72,
        cpc: 1.24,
        results: 89,
        costPerResult: 47.65,
        amountSpent: 4241.85,
      },
      todaySpend: 623.45,
      sevenDaySpend: 4241.85,
      sparklineData: generateSparkline(),
      campaigns: generateCampaigns(4, 'leadgen'),
      dailyData: generateDailyData(14, 'leadgen'),
      lastUpdated: now.toISOString(),
      status: 'active' as const,
    },
    {
      config: accountConfigs.find(c => c.id === 'charlie-ralph-melb')!,
      metrics: {
        impressions: 245000,
        clicks: 6120,
        ctr: 2.50,
        cpc: 0.98,
        results: 156,
        costPerResult: 38.46,
        roas: 6.24,
        conversionValue: 37440,
        purchases: 156,
        costPerPurchase: 38.46,
        amountSpent: 5999.76,
      },
      todaySpend: 892.34,
      sevenDaySpend: 5999.76,
      sparklineData: generateSparkline(),
      campaigns: generateCampaigns(6, 'ecommerce'),
      dailyData: generateDailyData(14, 'ecommerce').map(d => ({ ...d, roas: Math.random() * 4 + 4 })),
      lastUpdated: now.toISOString(),
      status: 'active' as const,
    },
    {
      config: accountConfigs.find(c => c.id === 'charlie-ralph-gc')!,
      metrics: {
        impressions: 189500,
        clicks: 4738,
        ctr: 2.50,
        cpc: 1.12,
        results: 98,
        costPerResult: 54.17,
        roas: 4.21,
        conversionValue: 22344.32,
        purchases: 98,
        costPerPurchase: 54.17,
        amountSpent: 5308.66,
      },
      todaySpend: 756.21,
      sevenDaySpend: 5308.66,
      sparklineData: generateSparkline(),
      campaigns: generateCampaigns(5, 'ecommerce'),
      dailyData: generateDailyData(14, 'ecommerce').map(d => ({ ...d, roas: Math.random() * 2 + 3 })),
      lastUpdated: now.toISOString(),
      status: 'active' as const,
    },
    {
      config: accountConfigs.find(c => c.id === 'roar-mma-rockingham')!,
      metrics: {
        impressions: 98750,
        clicks: 2468,
        ctr: 2.50,
        cpc: 1.45,
        results: 42,
        costPerResult: 85.24,
        submitApplication: 156,
        startTrial: 78,
        subscriptions: 42,
        costPerSubscription: 85.24,
        amountSpent: 3580.08,
      },
      todaySpend: 512.87,
      sevenDaySpend: 3580.08,
      sparklineData: generateSparkline(),
      campaigns: generateCampaigns(3, 'leadgen-gym'),
      dailyData: generateDailyData(14, 'leadgen-gym').map(d => ({ ...d, subscriptions: Math.floor(Math.random() * 8) + 2 })),
      lastUpdated: now.toISOString(),
      status: 'active' as const,
    },
    {
      config: accountConfigs.find(c => c.id === 'blank-kanvas')!,
      metrics: {
        impressions: 76320,
        clicks: 1908,
        ctr: 2.50,
        cpc: 1.31,
        results: 67,
        costPerResult: 37.31,
        amountSpent: 2499.77,
      },
      todaySpend: 357.11,
      sevenDaySpend: 2499.77,
      sparklineData: generateSparkline(),
      campaigns: generateCampaigns(3, 'leadgen'),
      dailyData: generateDailyData(14, 'leadgen'),
      lastUpdated: now.toISOString(),
      status: 'active' as const,
    },
    {
      config: accountConfigs.find(c => c.id === 'chiropractichub')!,
      metrics: {
        impressions: 54210,
        clicks: 1355,
        ctr: 2.50,
        cpc: 1.18,
        results: 48,
        costPerResult: 33.31,
        amountSpent: 1598.88,
      },
      todaySpend: 228.41,
      sevenDaySpend: 1598.88,
      sparklineData: generateSparkline(),
      campaigns: generateCampaigns(2, 'leadgen'),
      dailyData: generateDailyData(14, 'leadgen'),
      lastUpdated: now.toISOString(),
      status: 'active' as const,
    },
  ];
}

// Get single account data
export function getAccountData(accountId: string, dateRange: string = '7d'): AccountData | null {
  const allAccounts = generateAllAccountsData();
  return allAccounts.find(a => a.config.id === accountId || a.config.slug === accountId) || null;
}

// Generate demo alerts
export function generateDemoAlerts(): Alert[] {
  return [
    {
      id: 'alert-1',
      accountId: 'charlie-ralph-gc',
      accountName: 'Charlie Ralph Gold Coast',
      type: 'declining_roas',
      severity: 'warning',
      message: 'ROAS is 4.21x (below 5x target)',
      value: 4.21,
      threshold: 5,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'alert-2',
      accountId: 'roar-mma-rockingham',
      accountName: 'ROAR MMA Rockingham',
      type: 'high_cost_per_sub',
      severity: 'warning',
      message: 'Cost per subscription is $85.24 (above $80 threshold)',
      value: 85.24,
      threshold: 80,
      timestamp: new Date().toISOString(),
    },
  ];
}
