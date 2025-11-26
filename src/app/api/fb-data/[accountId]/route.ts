import { NextRequest, NextResponse } from 'next/server';
import { getFullAccountData } from '@/lib/mcp-client';
import { getAccountConfig } from '@/lib/metrics-config';

// Demo data generator for individual account
function generateDemoAccountData(accountId: string, dateRange: string) {
  const config = getAccountConfig(accountId);
  if (!config) return null;

  const now = new Date();
  const days = dateRange === 'today' ? 1 : dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30;

  const generateSparkline = () => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split('T')[0],
        value: Math.random() * 500 + 100,
      };
    });
  };

  const generateDailyData = () => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));
      const baseData = {
        date: date.toISOString().split('T')[0],
        impressions: Math.floor(Math.random() * 50000) + 10000,
        clicks: Math.floor(Math.random() * 2000) + 500,
        spend: Math.random() * 500 + 100,
        results: Math.floor(Math.random() * 50) + 10,
      };

      if (config.type === 'ecommerce') {
        return { ...baseData, roas: Math.random() * 4 + 3 };
      }
      if (config.type === 'leadgen-gym') {
        return { ...baseData, subscriptions: Math.floor(Math.random() * 8) + 2 };
      }
      return baseData;
    });
  };

  const generateCampaigns = (count: number) => {
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
      if (config.type === 'ecommerce') {
        metrics = {
          ...baseMetrics,
          roas: Math.random() * 4 + 3,
          conversionValue: Math.random() * 5000 + 1000,
          purchases: Math.floor(Math.random() * 30) + 5,
          costPerPurchase: Math.random() * 50 + 20,
        };
      } else if (config.type === 'leadgen-gym') {
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
        status: i === 0 ? 'ACTIVE' : Math.random() > 0.3 ? 'ACTIVE' : 'PAUSED',
        objective: ['CONVERSIONS', 'LEAD_GENERATION', 'TRAFFIC'][Math.floor(Math.random() * 3)],
        metrics,
        adSets: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
          id: `adset-${i}-${j}`,
          name: `Ad Set ${j + 1}`,
          status: Math.random() > 0.2 ? 'ACTIVE' : 'PAUSED',
          metrics: {
            ...baseMetrics,
            impressions: Math.floor(baseMetrics.impressions / 2),
            clicks: Math.floor(baseMetrics.clicks / 2),
            amountSpent: baseMetrics.amountSpent / 2,
          },
          ads: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, k) => ({
            id: `ad-${i}-${j}-${k}`,
            name: `Ad ${k + 1}`,
            status: Math.random() > 0.2 ? 'ACTIVE' : 'PAUSED',
            metrics: {
              ...baseMetrics,
              impressions: Math.floor(baseMetrics.impressions / 4),
              clicks: Math.floor(baseMetrics.clicks / 4),
              amountSpent: baseMetrics.amountSpent / 4,
            },
          })),
        })),
      };
    });
  };

  let metrics: Record<string, number> = {
    impressions: Math.floor(Math.random() * 150000) + 50000,
    clicks: Math.floor(Math.random() * 5000) + 1000,
    ctr: Math.random() * 2 + 1.5,
    cpc: Math.random() * 1.5 + 0.5,
    results: Math.floor(Math.random() * 100) + 30,
    costPerResult: Math.random() * 40 + 20,
    amountSpent: Math.random() * 5000 + 1500,
  };

  if (config.type === 'ecommerce') {
    const roas = accountId.includes('melb') ? Math.random() * 3 + 5 : Math.random() * 2 + 3;
    metrics = {
      ...metrics,
      roas,
      conversionValue: metrics.amountSpent * roas,
      purchases: Math.floor(Math.random() * 150) + 50,
      costPerPurchase: Math.random() * 40 + 30,
    };
  } else if (config.type === 'leadgen-gym') {
    metrics = {
      ...metrics,
      submitApplication: Math.floor(Math.random() * 150) + 80,
      startTrial: Math.floor(Math.random() * 80) + 40,
      subscriptions: Math.floor(Math.random() * 50) + 20,
      costPerSubscription: Math.random() * 50 + 50,
    };
  }

  return {
    config,
    metrics,
    todaySpend: Math.random() * 800 + 200,
    sevenDaySpend: metrics.amountSpent,
    sparklineData: generateSparkline(),
    campaigns: generateCampaigns(Math.floor(Math.random() * 4) + 2),
    dailyData: generateDailyData(),
    lastUpdated: now.toISOString(),
    status: 'active',
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get('range') || '7d';

    // Check if we should use real MCP data
    const useMCP = process.env.MCP_ENDPOINT && process.env.MCP_AUTH_TOKEN;

    let accountData;
    if (useMCP) {
      accountData = await getFullAccountData(accountId);
    } else {
      // Use demo data for development
      accountData = generateDemoAccountData(accountId, dateRange);
      if (!accountData) {
        return NextResponse.json(
          { success: false, error: 'Account not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: accountData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching account data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
