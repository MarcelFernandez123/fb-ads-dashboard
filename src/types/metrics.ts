// Account Types
export type AccountType = 'ecommerce' | 'leadgen-gym' | 'leadgen';

export type PrimaryKPI = 'roas' | 'costPerSubscription' | 'costPerResult';

// Base Metrics (all accounts)
export interface BaseMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  results: number;
  costPerResult: number;
  amountSpent: number;
}

// E-commerce specific metrics (Charlie Ralph accounts)
export interface EcommerceMetrics extends BaseMetrics {
  roas: number;
  conversionValue: number;
  purchases: number;
  costPerPurchase: number;
}

// Gym/Lead Gen specific metrics (ROAR MMA)
export interface GymMetrics extends BaseMetrics {
  submitApplication: number;
  startTrial: number;
  subscriptions: number;
  costPerSubscription: number;
}

// Union type for all metrics
export type AccountMetrics = BaseMetrics | EcommerceMetrics | GymMetrics;

// Type guards
export function isEcommerceMetrics(metrics: AccountMetrics): metrics is EcommerceMetrics {
  return 'roas' in metrics;
}

export function isGymMetrics(metrics: AccountMetrics): metrics is GymMetrics {
  return 'subscriptions' in metrics;
}

// Historical data point
export interface MetricDataPoint {
  date: string;
  value: number;
}

// Daily breakdown for charts
export interface DailyMetrics {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  results: number;
  roas?: number;
  subscriptions?: number;
}

// Campaign data
export interface Campaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  objective: string;
  metrics: AccountMetrics;
  adSets?: AdSet[];
}

// Ad Set data
export interface AdSet {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  metrics: AccountMetrics;
  ads?: Ad[];
}

// Ad data
export interface Ad {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  metrics: AccountMetrics;
  previewUrl?: string;
}

// Account configuration
export interface AccountConfig {
  id: string;
  name: string;
  slug: string;
  type: AccountType;
  primaryKPI: PrimaryKPI;
  metrics: string[];
  thresholds?: {
    [key: string]: {
      green: number;
      yellow: number;
    };
  };
  fbAccountId?: string;
}

// Full account data
export interface AccountData {
  config: AccountConfig;
  metrics: AccountMetrics;
  todaySpend: number;
  sevenDaySpend: number;
  sparklineData: MetricDataPoint[];
  campaigns: Campaign[];
  dailyData: DailyMetrics[];
  lastUpdated: string;
  status: 'active' | 'error' | 'paused';
}

// Funnel data for ROAR
export interface FunnelStage {
  name: string;
  value: number;
  conversionRate?: number;
}

// Alert types
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  accountId: string;
  accountName: string;
  type: 'declining_roas' | 'high_cost_per_sub' | 'low_ctr' | 'spend_pacing' | 'no_results';
  severity: AlertSeverity;
  message: string;
  value?: number;
  threshold?: number;
  timestamp: string;
}

// Date range options
export type DateRange = 'today' | '7d' | '14d' | '30d' | 'custom';

export interface DateRangeSelection {
  range: DateRange;
  startDate?: string;
  endDate?: string;
}

// API Response types
export interface APIResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  lastUpdated: string;
}

// Comparison view types
export interface AccountComparison {
  accounts: AccountData[];
  normalizedBySpend: boolean;
}
