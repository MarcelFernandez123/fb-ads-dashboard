import { NextResponse } from 'next/server';
import { getAllAccountsData, generateAlerts } from '@/lib/mcp-client';
import { AccountData, AccountType, PrimaryKPI, Campaign } from '@/types/metrics';

// In-memory cache for demo/development
let cachedData: {
  accounts: AccountData[] | null;
  lastUpdated: string | null;
} = {
  accounts: null,
  lastUpdated: null,
};

// Demo data for development without MCP connection
function generateDemoData(): AccountData[] {
  const now = new Date();
  const generateSparkline = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        value: Math.random() * 500 + 100,
      };
    });
  };

  const generateDailyData = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        impressions: Math.floor(Math.random() * 50000) + 10000,
        clicks: Math.floor(Math.random() * 2000) + 500,
        spend: Math.random() * 500 + 100,
        results: Math.floor(Math.random() * 50) + 10,
      };
    });
  };

  const generateCampaigns = (count: number): Campaign[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `campaign-${i + 1}`,
      name: `Campaign ${i + 1}`,
      status: (i === 0 ? 'ACTIVE' : Math.random() > 0.3 ? 'ACTIVE' : 'PAUSED') as Campaign['status'],
      objective: ['CONVERSIONS', 'LEAD_GENERATION', 'TRAFFIC'][Math.floor(Math.random() * 3)],
      metrics: {
        impressions: Math.floor(Math.random() * 20000) + 5000,
        clicks: Math.floor(Math.random() * 800) + 200,
        ctr: Math.random() * 3 + 0.5,
        cpc: Math.random() * 2 + 0.5,
        results: Math.floor(Math.random() * 30) + 5,
        costPerResult: Math.random() * 50 + 10,
        amountSpent: Math.random() * 300 + 50,
      },
    }));
  };

  return [
    {
      config: {
        id: 'cale-henderson',
        name: 'Cale Henderson',
        slug: 'cale-henderson',
        type: 'leadgen' as AccountType,
        primaryKPI: 'costPerResult' as PrimaryKPI,
        metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'results', 'costPerResult', 'amountSpent'],
      },
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
      campaigns: generateCampaigns(4),
      dailyData: generateDailyData(),
      lastUpdated: now.toISOString(),
      status: 'active' as const,
    },
    {
      config: {
        id: 'charlie-ralph-melb',
        name: 'Charlie Ralph Melbourne',
        slug: 'charlie-ralph-melbourne',
        type: 'ecommerce' as AccountType,
        primaryKPI: 'roas' as PrimaryKPI,
        metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'results', 'costPerResult', 'roas', 'conversionValue', 'purchases', 'costPerPurchase', 'amountSpent'],
        thresholds: { roas: { green: 5, yellow: 3 } },
      },
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
      campaigns: generateCampaigns(6),
      dailyData: generateDailyData().map(d => ({ ...d, roas: Math.random() * 4 + 4 })),
      lastUpdated: now.toISOString(),
      status: 'active' as const,
    },
    {
      config: {
        id: 'charlie-ralph-gc',
        name: 'Charlie Ralph Gold Coast',
        slug: 'charlie-ralph-gold-coast',
        type: 'ecommerce' as AccountType,
        primaryKPI: 'roas' as PrimaryKPI,
        metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'results', 'costPerResult', 'roas', 'conversionValue', 'purchases', 'costPerPurchase', 'amountSpent'],
        thresholds: { roas: { green: 5, yellow: 3 } },
      },
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
      campaigns: generateCampaigns(5),
      dailyData: generateDailyData().map(d => ({ ...d, roas: Math.random() * 2 + 3 })),
      lastUpdated: now.toISOString(),
      status: 'active' as const,
    },
    {
      config: {
        id: 'roar-mma-rockingham',
        name: 'ROAR MMA Rockingham',
        slug: 'roar-mma-rockingham',
        type: 'leadgen-gym' as AccountType,
        primaryKPI: 'costPerSubscription' as PrimaryKPI,
        metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'results', 'costPerResult', 'submitApplication', 'startTrial', 'subscriptions', 'costPerSubscription', 'amountSpent'],
        thresholds: { costPerSubscription: { green: 50, yellow: 80 } },
      },
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
      campaigns: generateCampaigns(3),
      dailyData: generateDailyData().map(d => ({ ...d, subscriptions: Math.floor(Math.random() * 8) + 2 })),
      lastUpdated: now.toISOString(),
      status: 'active' as const,
    },
    {
      config: {
        id: 'blank-kanvas',
        name: 'Blank Kanvas',
        slug: 'blank-kanvas',
        type: 'leadgen' as AccountType,
        primaryKPI: 'costPerResult' as PrimaryKPI,
        metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'results', 'costPerResult', 'amountSpent'],
      },
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
      campaigns: generateCampaigns(3),
      dailyData: generateDailyData(),
      lastUpdated: now.toISOString(),
      status: 'active' as const,
    },
    {
      config: {
        id: 'chiropractichub',
        name: 'ChiropracticHUB',
        slug: 'chiropractichub',
        type: 'leadgen' as AccountType,
        primaryKPI: 'costPerResult' as PrimaryKPI,
        metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'results', 'costPerResult', 'amountSpent'],
      },
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
      campaigns: generateCampaigns(2),
      dailyData: generateDailyData(),
      lastUpdated: now.toISOString(),
      status: 'active' as const,
    },
  ];
}

export async function GET() {
  try {
    // Check if we should use real MCP data
    const useMCP = process.env.MCP_ENDPOINT && process.env.MCP_AUTH_TOKEN;

    let accounts;
    if (useMCP) {
      // Use cached data if available and fresh (< 5 minutes)
      const cacheAge = cachedData.lastUpdated
        ? Date.now() - new Date(cachedData.lastUpdated).getTime()
        : Infinity;

      if (cachedData.accounts && cacheAge < 5 * 60 * 1000) {
        accounts = cachedData.accounts;
      } else {
        accounts = await getAllAccountsData();
        cachedData = {
          accounts,
          lastUpdated: new Date().toISOString(),
        };
      }
    } else {
      // Use demo data for development
      accounts = generateDemoData();
    }

    const alerts = generateAlerts(accounts);

    return NextResponse.json({
      success: true,
      data: accounts,
      alerts,
      lastUpdated: cachedData.lastUpdated || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching FB data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        alerts: [],
      },
      { status: 500 }
    );
  }
}
