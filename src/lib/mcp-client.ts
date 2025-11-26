import { AccountData, AccountMetrics, BaseMetrics, EcommerceMetrics, GymMetrics, Campaign, DailyMetrics, Alert } from '@/types/metrics';
import { accountConfigs, getAccountConfig } from './metrics-config';

// MCP Server configuration
const MCP_ENDPOINT = process.env.MCP_ENDPOINT || 'http://localhost:3001';
const MCP_AUTH_TOKEN = process.env.MCP_AUTH_TOKEN || '';

// Facebook Ad Account IDs mapping
const FB_ACCOUNT_IDS: Record<string, string> = {
  'cale-henderson': process.env.FB_CALE_HENDERSON_ID || '',
  'charlie-ralph-melb': process.env.FB_CHARLIE_RALPH_MELB_ID || '',
  'charlie-ralph-gc': process.env.FB_CHARLIE_RALPH_GC_ID || '',
  'roar-mma-rockingham': process.env.FB_ROAR_MMA_ID || '',
  'blank-kanvas': process.env.FB_BLANK_KANVAS_ID || '',
  'chiropractichub': process.env.FB_CHIROPRACTICHUB_ID || '',
};

interface MCPRequest {
  method: string;
  params: Record<string, unknown>;
}

interface MCPResponse<T> {
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

// Make request to MCP server
async function mcpRequest<T>(request: MCPRequest): Promise<T> {
  const response = await fetch(`${MCP_ENDPOINT}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MCP_AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      ...request,
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP request failed: ${response.statusText}`);
  }

  const data: MCPResponse<T> = await response.json();

  if (data.error) {
    throw new Error(`MCP error: ${data.error.message}`);
  }

  return data.result as T;
}

// Get account insights from Facebook via MCP
export async function getAccountInsights(
  accountId: string,
  datePreset: string = 'last_7d'
): Promise<AccountMetrics> {
  const fbAccountId = FB_ACCOUNT_IDS[accountId];
  const config = getAccountConfig(accountId);

  if (!fbAccountId || !config) {
    throw new Error(`Account not found: ${accountId}`);
  }

  // Define fields based on account type
  let fields = [
    'impressions',
    'clicks',
    'ctr',
    'cpc',
    'spend',
    'actions',
    'cost_per_action_type',
  ];

  if (config.type === 'ecommerce') {
    fields = [...fields, 'purchase_roas', 'action_values'];
  }

  const result = await mcpRequest<{
    data: Array<{
      impressions: string;
      clicks: string;
      ctr: string;
      cpc: string;
      spend: string;
      actions?: Array<{ action_type: string; value: string }>;
      cost_per_action_type?: Array<{ action_type: string; value: string }>;
      purchase_roas?: Array<{ action_type: string; value: string }>;
      action_values?: Array<{ action_type: string; value: string }>;
    }>;
  }>({
    method: 'tools/call',
    params: {
      name: 'facebook_ads_insights',
      arguments: {
        account_id: fbAccountId,
        fields: fields.join(','),
        date_preset: datePreset,
        level: 'account',
      },
    },
  });

  const data = result.data[0] || {};

  // Parse base metrics
  const baseMetrics: BaseMetrics = {
    impressions: parseInt(data.impressions || '0'),
    clicks: parseInt(data.clicks || '0'),
    ctr: parseFloat(data.ctr || '0'),
    cpc: parseFloat(data.cpc || '0'),
    results: getActionValue(data.actions, getResultActionType(config.type)),
    costPerResult: getActionCost(data.cost_per_action_type, getResultActionType(config.type)),
    amountSpent: parseFloat(data.spend || '0'),
  };

  // Add type-specific metrics
  if (config.type === 'ecommerce') {
    const ecommerceMetrics: EcommerceMetrics = {
      ...baseMetrics,
      roas: getRoasValue(data.purchase_roas),
      conversionValue: getActionValueAmount(data.action_values, 'purchase'),
      purchases: getActionValue(data.actions, 'purchase'),
      costPerPurchase: getActionCost(data.cost_per_action_type, 'purchase'),
    };
    return ecommerceMetrics;
  }

  if (config.type === 'leadgen-gym') {
    const gymMetrics: GymMetrics = {
      ...baseMetrics,
      submitApplication: getActionValue(data.actions, 'lead'),
      startTrial: getActionValue(data.actions, 'start_trial'),
      subscriptions: getActionValue(data.actions, 'subscribe'),
      costPerSubscription: getActionCost(data.cost_per_action_type, 'subscribe'),
    };
    return gymMetrics;
  }

  return baseMetrics;
}

// Get campaigns for an account
export async function getAccountCampaigns(
  accountId: string,
  datePreset: string = 'last_7d'
): Promise<Campaign[]> {
  const fbAccountId = FB_ACCOUNT_IDS[accountId];
  const config = getAccountConfig(accountId);

  if (!fbAccountId || !config) {
    throw new Error(`Account not found: ${accountId}`);
  }

  const result = await mcpRequest<{
    data: Array<{
      id: string;
      name: string;
      status: string;
      objective: string;
      insights?: {
        data: Array<{
          impressions: string;
          clicks: string;
          ctr: string;
          cpc: string;
          spend: string;
          actions?: Array<{ action_type: string; value: string }>;
          cost_per_action_type?: Array<{ action_type: string; value: string }>;
          purchase_roas?: Array<{ action_type: string; value: string }>;
          action_values?: Array<{ action_type: string; value: string }>;
        }>;
      };
    }>;
  }>({
    method: 'tools/call',
    params: {
      name: 'facebook_ads_campaigns',
      arguments: {
        account_id: fbAccountId,
        fields: 'id,name,status,objective,insights{impressions,clicks,ctr,cpc,spend,actions,cost_per_action_type,purchase_roas,action_values}',
        date_preset: datePreset,
      },
    },
  });

  return result.data.map((campaign) => {
    const insightsData = campaign.insights?.data[0] ?? {
      impressions: '0',
      clicks: '0',
      ctr: '0',
      cpc: '0',
      spend: '0',
      actions: undefined,
      cost_per_action_type: undefined,
      purchase_roas: undefined,
      action_values: undefined,
    };

    const baseMetrics: BaseMetrics = {
      impressions: parseInt(insightsData.impressions || '0'),
      clicks: parseInt(insightsData.clicks || '0'),
      ctr: parseFloat(insightsData.ctr || '0'),
      cpc: parseFloat(insightsData.cpc || '0'),
      results: getActionValue(insightsData.actions, getResultActionType(config.type)),
      costPerResult: getActionCost(insightsData.cost_per_action_type, getResultActionType(config.type)),
      amountSpent: parseFloat(insightsData.spend || '0'),
    };

    let metrics: AccountMetrics = baseMetrics;

    if (config.type === 'ecommerce') {
      metrics = {
        ...baseMetrics,
        roas: getRoasValue(insightsData.purchase_roas),
        conversionValue: getActionValueAmount(insightsData.action_values, 'purchase'),
        purchases: getActionValue(insightsData.actions, 'purchase'),
        costPerPurchase: getActionCost(insightsData.cost_per_action_type, 'purchase'),
      } as EcommerceMetrics;
    } else if (config.type === 'leadgen-gym') {
      metrics = {
        ...baseMetrics,
        submitApplication: getActionValue(insightsData.actions, 'lead'),
        startTrial: getActionValue(insightsData.actions, 'start_trial'),
        subscriptions: getActionValue(insightsData.actions, 'subscribe'),
        costPerSubscription: getActionCost(insightsData.cost_per_action_type, 'subscribe'),
      } as GymMetrics;
    }

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status as Campaign['status'],
      objective: campaign.objective,
      metrics,
    };
  });
}

// Get daily breakdown for charts
export async function getDailyInsights(
  accountId: string,
  datePreset: string = 'last_7d'
): Promise<DailyMetrics[]> {
  const fbAccountId = FB_ACCOUNT_IDS[accountId];
  const config = getAccountConfig(accountId);

  if (!fbAccountId || !config) {
    throw new Error(`Account not found: ${accountId}`);
  }

  const result = await mcpRequest<{
    data: Array<{
      date_start: string;
      impressions: string;
      clicks: string;
      spend: string;
      actions?: Array<{ action_type: string; value: string }>;
      purchase_roas?: Array<{ action_type: string; value: string }>;
    }>;
  }>({
    method: 'tools/call',
    params: {
      name: 'facebook_ads_insights',
      arguments: {
        account_id: fbAccountId,
        fields: 'date_start,impressions,clicks,spend,actions,purchase_roas',
        date_preset: datePreset,
        time_increment: '1',
        level: 'account',
      },
    },
  });

  return result.data.map((day) => ({
    date: day.date_start,
    impressions: parseInt(day.impressions || '0'),
    clicks: parseInt(day.clicks || '0'),
    spend: parseFloat(day.spend || '0'),
    results: getActionValue(day.actions, getResultActionType(config.type)),
    ...(config.type === 'ecommerce' && {
      roas: getRoasValue(day.purchase_roas),
    }),
    ...(config.type === 'leadgen-gym' && {
      subscriptions: getActionValue(day.actions, 'subscribe'),
    }),
  }));
}

// Get full account data
export async function getFullAccountData(accountId: string): Promise<AccountData> {
  const config = getAccountConfig(accountId);

  if (!config) {
    throw new Error(`Account config not found: ${accountId}`);
  }

  const [metrics, campaigns, dailyData, todayMetrics] = await Promise.all([
    getAccountInsights(accountId, 'last_7d'),
    getAccountCampaigns(accountId, 'last_7d'),
    getDailyInsights(accountId, 'last_7d'),
    getAccountInsights(accountId, 'today'),
  ]);

  // Create sparkline data from daily metrics
  const sparklineData = dailyData.map((day) => ({
    date: day.date,
    value: day.spend,
  }));

  return {
    config,
    metrics,
    todaySpend: (todayMetrics as BaseMetrics).amountSpent,
    sevenDaySpend: (metrics as BaseMetrics).amountSpent,
    sparklineData,
    campaigns,
    dailyData,
    lastUpdated: new Date().toISOString(),
    status: 'active',
  };
}

// Get all accounts data
export async function getAllAccountsData(): Promise<AccountData[]> {
  const results = await Promise.allSettled(
    accountConfigs.map((config) => getFullAccountData(config.id))
  );

  return results
    .filter((result): result is PromiseFulfilledResult<AccountData> =>
      result.status === 'fulfilled'
    )
    .map((result) => result.value);
}

// Generate alerts based on account data
export function generateAlerts(accounts: AccountData[]): Alert[] {
  const alerts: Alert[] = [];

  accounts.forEach((account) => {
    const { config, metrics } = account;

    // Check ROAS for e-commerce accounts
    if (config.type === 'ecommerce' && 'roas' in metrics) {
      if (metrics.roas < 3) {
        alerts.push({
          id: `${config.id}-roas-${Date.now()}`,
          accountId: config.id,
          accountName: config.name,
          type: 'declining_roas',
          severity: metrics.roas < 2 ? 'critical' : 'warning',
          message: `ROAS is ${metrics.roas.toFixed(2)}x (below 3x threshold)`,
          value: metrics.roas,
          threshold: 3,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Check Cost Per Subscription for gym accounts
    if (config.type === 'leadgen-gym' && 'costPerSubscription' in metrics) {
      if (metrics.costPerSubscription > 80) {
        alerts.push({
          id: `${config.id}-cps-${Date.now()}`,
          accountId: config.id,
          accountName: config.name,
          type: 'high_cost_per_sub',
          severity: metrics.costPerSubscription > 100 ? 'critical' : 'warning',
          message: `Cost per subscription is $${metrics.costPerSubscription.toFixed(2)} (above $80 threshold)`,
          value: metrics.costPerSubscription,
          threshold: 80,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Check CTR for all accounts
    if (metrics.ctr < 1) {
      alerts.push({
        id: `${config.id}-ctr-${Date.now()}`,
        accountId: config.id,
        accountName: config.name,
        type: 'low_ctr',
        severity: 'warning',
        message: `CTR is ${metrics.ctr.toFixed(2)}% (below 1% threshold)`,
        value: metrics.ctr,
        threshold: 1,
        timestamp: new Date().toISOString(),
      });
    }

    // Check for no results in past 24 hours
    if (account.dailyData.length > 0) {
      const latestDay = account.dailyData[account.dailyData.length - 1];
      if (latestDay.results === 0 && latestDay.spend > 0) {
        alerts.push({
          id: `${config.id}-no-results-${Date.now()}`,
          accountId: config.id,
          accountName: config.name,
          type: 'no_results',
          severity: 'critical',
          message: `No results in the last 24 hours with $${latestDay.spend.toFixed(2)} spent`,
          value: 0,
          timestamp: new Date().toISOString(),
        });
      }
    }
  });

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

// Helper functions
function getActionValue(
  actions: Array<{ action_type: string; value: string }> | undefined,
  actionType: string
): number {
  if (!actions) return 0;
  const action = actions.find((a) => a.action_type === actionType);
  return action ? parseInt(action.value) : 0;
}

function getActionCost(
  costs: Array<{ action_type: string; value: string }> | undefined,
  actionType: string
): number {
  if (!costs) return 0;
  const cost = costs.find((c) => c.action_type === actionType);
  return cost ? parseFloat(cost.value) : 0;
}

function getActionValueAmount(
  values: Array<{ action_type: string; value: string }> | undefined,
  actionType: string
): number {
  if (!values) return 0;
  const value = values.find((v) => v.action_type === actionType);
  return value ? parseFloat(value.value) : 0;
}

function getRoasValue(
  roas: Array<{ action_type: string; value: string }> | undefined
): number {
  if (!roas || roas.length === 0) return 0;
  // Get omni_purchase or purchase ROAS
  const purchaseRoas = roas.find(
    (r) => r.action_type === 'omni_purchase' || r.action_type === 'purchase'
  );
  return purchaseRoas ? parseFloat(purchaseRoas.value) : 0;
}

function getResultActionType(accountType: string): string {
  switch (accountType) {
    case 'ecommerce':
      return 'purchase';
    case 'leadgen-gym':
      return 'subscribe';
    default:
      return 'lead';
  }
}
