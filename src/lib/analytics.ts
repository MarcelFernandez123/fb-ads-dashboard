// Advanced Analytics Engine for Facebook Ads Dashboard

import { DailyMetrics, AccountData, AccountMetrics, isEcommerceMetrics, isGymMetrics } from '@/types/metrics';

// =============================================================================
// TREND ANALYSIS
// =============================================================================

export interface TrendResult {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  isSignificant: boolean;
  confidence: number;
}

export interface TrendData {
  metric: string;
  current: number;
  previous: number;
  trend: TrendResult;
}

// Calculate trend between two periods
export function calculateTrend(
  current: number,
  previous: number,
  significanceThreshold: number = 5
): TrendResult {
  if (previous === 0) {
    return {
      direction: current > 0 ? 'up' : 'stable',
      percentage: current > 0 ? 100 : 0,
      isSignificant: current > 0,
      confidence: current > 0 ? 1 : 0,
    };
  }

  const percentageChange = ((current - previous) / previous) * 100;
  const isSignificant = Math.abs(percentageChange) >= significanceThreshold;

  return {
    direction: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'stable',
    percentage: percentageChange,
    isSignificant,
    confidence: Math.min(Math.abs(percentageChange) / 100, 1),
  };
}

// Calculate WoW (Week over Week) trends
export function calculateWoWTrends(dailyData: DailyMetrics[]): Record<string, TrendResult> {
  if (dailyData.length < 14) {
    return {};
  }

  const thisWeek = dailyData.slice(-7);
  const lastWeek = dailyData.slice(-14, -7);

  const sumMetrics = (data: DailyMetrics[], key: keyof DailyMetrics) => {
    return data.reduce((sum, d) => sum + (typeof d[key] === 'number' ? d[key] as number : 0), 0);
  };

  const avgMetrics = (data: DailyMetrics[], key: keyof DailyMetrics) => {
    const sum = sumMetrics(data, key);
    return sum / data.length;
  };

  return {
    spend: calculateTrend(sumMetrics(thisWeek, 'spend'), sumMetrics(lastWeek, 'spend')),
    results: calculateTrend(sumMetrics(thisWeek, 'results'), sumMetrics(lastWeek, 'results')),
    impressions: calculateTrend(sumMetrics(thisWeek, 'impressions'), sumMetrics(lastWeek, 'impressions')),
    clicks: calculateTrend(sumMetrics(thisWeek, 'clicks'), sumMetrics(lastWeek, 'clicks')),
  };
}

// =============================================================================
// PREDICTIVE MODELING
// =============================================================================

export interface Prediction {
  value: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface ForecastData {
  date: string;
  actual?: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

// Simple Moving Average for forecasting
function simpleMovingAverage(data: number[], window: number): number {
  if (data.length === 0) return 0;
  const slice = data.slice(-window);
  return slice.reduce((sum, val) => sum + val, 0) / slice.length;
}

// Exponential Moving Average for more recent weighting
function exponentialMovingAverage(data: number[], alpha: number = 0.3): number {
  if (data.length === 0) return 0;
  let ema = data[0];
  for (let i = 1; i < data.length; i++) {
    ema = alpha * data[i] + (1 - alpha) * ema;
  }
  return ema;
}

// Calculate standard deviation for confidence intervals
function standardDeviation(data: number[]): number {
  if (data.length === 0) return 0;
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length);
}

// Linear regression for trend-based predictions
function linearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  const xSum = (n * (n - 1)) / 2;
  const ySum = data.reduce((sum, val) => sum + val, 0);
  const xySum = data.reduce((sum, val, i) => sum + val * i, 0);
  const x2Sum = data.reduce((sum, _, i) => sum + i * i, 0);

  const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;

  return { slope, intercept };
}

// Generate forecast for next N days
export function forecastSpend(dailyData: DailyMetrics[], daysAhead: number = 7): ForecastData[] {
  const spendData = dailyData.map(d => d.spend);

  if (spendData.length < 7) {
    return [];
  }

  const { slope, intercept } = linearRegression(spendData);
  const stdDev = standardDeviation(spendData);
  const ema = exponentialMovingAverage(spendData);

  const forecasts: ForecastData[] = [];
  const lastDate = new Date(dailyData[dailyData.length - 1].date);

  for (let i = 1; i <= daysAhead; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);

    // Blend linear regression with EMA for more stable predictions
    const linearPrediction = intercept + slope * (spendData.length + i - 1);
    const blendedPrediction = (linearPrediction + ema) / 2;

    // Confidence interval widens as we predict further ahead
    const confidenceMultiplier = 1 + (i * 0.1);

    forecasts.push({
      date: futureDate.toISOString().split('T')[0],
      predicted: Math.max(0, blendedPrediction),
      lowerBound: Math.max(0, blendedPrediction - stdDev * confidenceMultiplier * 1.96),
      upperBound: blendedPrediction + stdDev * confidenceMultiplier * 1.96,
    });
  }

  return forecasts;
}

// Predict end of month results
export function predictMonthEndResults(dailyData: DailyMetrics[]): Prediction {
  const resultsData = dailyData.map(d => d.results);

  if (resultsData.length < 7) {
    return { value: 0, lowerBound: 0, upperBound: 0, confidence: 0 };
  }

  const avgDailyResults = resultsData.reduce((sum, val) => sum + val, 0) / resultsData.length;
  const stdDev = standardDeviation(resultsData);

  // Days remaining in month
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = lastDayOfMonth.getDate() - today.getDate();
  const daysPassed = today.getDate();

  const currentResults = resultsData.reduce((sum, val) => sum + val, 0);
  const predictedAdditional = avgDailyResults * daysRemaining;
  const totalPredicted = currentResults + predictedAdditional;

  // Confidence decreases with more days to predict
  const confidence = Math.max(0.5, 1 - (daysRemaining / lastDayOfMonth.getDate()) * 0.5);

  return {
    value: Math.round(totalPredicted),
    lowerBound: Math.round(totalPredicted - stdDev * daysRemaining * 0.5),
    upperBound: Math.round(totalPredicted + stdDev * daysRemaining * 0.5),
    confidence,
  };
}

// =============================================================================
// PERFORMANCE SCORING
// =============================================================================

export interface HealthScore {
  overall: number;
  efficiency: number;
  growth: number;
  consistency: number;
  risk: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: HealthFactor[];
}

export interface HealthFactor {
  name: string;
  score: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

// Calculate account health score
export function calculateHealthScore(account: AccountData): HealthScore {
  const factors: HealthFactor[] = [];
  let efficiencyScore = 50;
  let growthScore = 50;
  let consistencyScore = 50;
  let riskScore = 50;

  const { metrics, dailyData, config } = account;

  // CTR Scoring (0-100)
  const ctrScore = Math.min(100, metrics.ctr * 30);
  factors.push({
    name: 'Click-Through Rate',
    score: ctrScore,
    impact: ctrScore >= 70 ? 'positive' : ctrScore >= 40 ? 'neutral' : 'negative',
    description: `CTR of ${metrics.ctr.toFixed(2)}% ${ctrScore >= 70 ? 'is excellent' : ctrScore >= 40 ? 'is average' : 'needs improvement'}`,
  });
  efficiencyScore = (efficiencyScore + ctrScore) / 2;

  // Cost Efficiency Scoring
  const avgCostPerResult = metrics.costPerResult;
  let costScore = 50;
  if (config.type === 'ecommerce' && isEcommerceMetrics(metrics)) {
    costScore = metrics.roas >= 5 ? 90 : metrics.roas >= 3 ? 70 : metrics.roas >= 2 ? 50 : 30;
    factors.push({
      name: 'ROAS',
      score: costScore,
      impact: costScore >= 70 ? 'positive' : costScore >= 50 ? 'neutral' : 'negative',
      description: `ROAS of ${metrics.roas.toFixed(2)}x ${costScore >= 70 ? 'exceeds targets' : costScore >= 50 ? 'meets targets' : 'is below targets'}`,
    });
  } else if (config.type === 'leadgen-gym' && isGymMetrics(metrics)) {
    costScore = metrics.costPerSubscription <= 50 ? 90 : metrics.costPerSubscription <= 80 ? 70 : metrics.costPerSubscription <= 100 ? 50 : 30;
    factors.push({
      name: 'Cost Per Subscription',
      score: costScore,
      impact: costScore >= 70 ? 'positive' : costScore >= 50 ? 'neutral' : 'negative',
      description: `Cost of $${metrics.costPerSubscription.toFixed(2)} per subscription ${costScore >= 70 ? 'is efficient' : costScore >= 50 ? 'is acceptable' : 'needs optimization'}`,
    });
  } else {
    costScore = avgCostPerResult <= 30 ? 90 : avgCostPerResult <= 50 ? 70 : avgCostPerResult <= 80 ? 50 : 30;
    factors.push({
      name: 'Cost Per Result',
      score: costScore,
      impact: costScore >= 70 ? 'positive' : costScore >= 50 ? 'neutral' : 'negative',
      description: `Cost of $${avgCostPerResult.toFixed(2)} per result ${costScore >= 70 ? 'is efficient' : costScore >= 50 ? 'is acceptable' : 'needs optimization'}`,
    });
  }
  efficiencyScore = (efficiencyScore + costScore) / 2;

  // Growth Analysis
  if (dailyData.length >= 7) {
    const recentResults = dailyData.slice(-3).reduce((sum, d) => sum + d.results, 0);
    const earlierResults = dailyData.slice(-7, -3).reduce((sum, d) => sum + d.results, 0);
    const growthRate = earlierResults > 0 ? ((recentResults - earlierResults) / earlierResults) * 100 : 0;

    growthScore = growthRate > 20 ? 90 : growthRate > 10 ? 75 : growthRate > 0 ? 60 : growthRate > -10 ? 45 : 30;
    factors.push({
      name: 'Results Growth',
      score: growthScore,
      impact: growthScore >= 60 ? 'positive' : growthScore >= 45 ? 'neutral' : 'negative',
      description: `Results ${growthRate > 0 ? 'growing' : 'declining'} at ${Math.abs(growthRate).toFixed(1)}% week-over-week`,
    });
  }

  // Consistency Analysis (lower variance = better)
  if (dailyData.length >= 7) {
    const spendData = dailyData.map(d => d.spend);
    const avgSpend = spendData.reduce((sum, v) => sum + v, 0) / spendData.length;
    const variance = spendData.reduce((sum, v) => sum + Math.pow(v - avgSpend, 2), 0) / spendData.length;
    const coefficientOfVariation = avgSpend > 0 ? (Math.sqrt(variance) / avgSpend) * 100 : 0;

    consistencyScore = coefficientOfVariation <= 10 ? 90 : coefficientOfVariation <= 25 ? 70 : coefficientOfVariation <= 40 ? 50 : 30;
    factors.push({
      name: 'Spend Consistency',
      score: consistencyScore,
      impact: consistencyScore >= 70 ? 'positive' : consistencyScore >= 50 ? 'neutral' : 'negative',
      description: `Daily spend variance of ${coefficientOfVariation.toFixed(1)}% ${consistencyScore >= 70 ? 'is stable' : consistencyScore >= 50 ? 'is moderate' : 'is volatile'}`,
    });
  }

  // Risk Assessment
  const hasLowCTR = metrics.ctr < 1;
  const hasNoRecentResults = dailyData.length > 0 && dailyData[dailyData.length - 1].results === 0;
  const riskFactors = [hasLowCTR, hasNoRecentResults].filter(Boolean).length;

  riskScore = riskFactors === 0 ? 90 : riskFactors === 1 ? 60 : 30;
  factors.push({
    name: 'Risk Level',
    score: riskScore,
    impact: riskScore >= 70 ? 'positive' : riskScore >= 50 ? 'neutral' : 'negative',
    description: `${riskFactors === 0 ? 'No significant risks detected' : riskFactors === 1 ? 'Minor risk factors present' : 'Multiple risk factors detected'}`,
  });

  // Calculate overall score
  const overall = Math.round(
    (efficiencyScore * 0.35) +
    (growthScore * 0.25) +
    (consistencyScore * 0.2) +
    (riskScore * 0.2)
  );

  // Determine grade
  let grade: HealthScore['grade'];
  if (overall >= 85) grade = 'A';
  else if (overall >= 70) grade = 'B';
  else if (overall >= 55) grade = 'C';
  else if (overall >= 40) grade = 'D';
  else grade = 'F';

  return {
    overall,
    efficiency: Math.round(efficiencyScore),
    growth: Math.round(growthScore),
    consistency: Math.round(consistencyScore),
    risk: Math.round(riskScore),
    grade,
    factors,
  };
}

// =============================================================================
// ANOMALY DETECTION
// =============================================================================

export interface Anomaly {
  id: string;
  metric: string;
  date: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  type: 'spike' | 'drop' | 'unusual';
  description: string;
}

// Detect anomalies in daily data using Z-score method
export function detectAnomalies(dailyData: DailyMetrics[]): Anomaly[] {
  if (dailyData.length < 7) return [];

  const anomalies: Anomaly[] = [];
  const metrics: (keyof DailyMetrics)[] = ['spend', 'results', 'clicks', 'impressions'];

  metrics.forEach(metric => {
    const values = dailyData.map(d => typeof d[metric] === 'number' ? d[metric] as number : 0);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const stdDev = standardDeviation(values);

    if (stdDev === 0) return;

    // Check last 3 days for anomalies
    dailyData.slice(-3).forEach((day, idx) => {
      const value = typeof day[metric] === 'number' ? day[metric] as number : 0;
      const zScore = (value - mean) / stdDev;

      if (Math.abs(zScore) > 2) {
        const severity: Anomaly['severity'] = Math.abs(zScore) > 3 ? 'high' : Math.abs(zScore) > 2.5 ? 'medium' : 'low';
        const type: Anomaly['type'] = zScore > 0 ? 'spike' : 'drop';

        anomalies.push({
          id: `${day.date}-${metric}`,
          metric: metric as string,
          date: day.date,
          value,
          expected: mean,
          deviation: zScore,
          severity,
          type,
          description: `${metric.charAt(0).toUpperCase() + metric.slice(1)} ${type === 'spike' ? 'spiked' : 'dropped'} to ${value.toLocaleString()} (expected ~${Math.round(mean).toLocaleString()})`,
        });
      }
    });
  });

  return anomalies.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

// =============================================================================
// AI-POWERED INSIGHTS
// =============================================================================

export interface Insight {
  id: string;
  type: 'optimization' | 'warning' | 'opportunity' | 'achievement';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: boolean;
  action?: string;
  impact?: string;
}

// Generate automated insights based on account data
export function generateInsights(account: AccountData): Insight[] {
  const insights: Insight[] = [];
  const { metrics, dailyData, config, campaigns } = account;
  const healthScore = calculateHealthScore(account);

  // Budget Pacing Insight
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const expectedPacing = dayOfMonth / daysInMonth;
  const totalSpend = dailyData.reduce((sum, d) => sum + d.spend, 0);

  // Achievement Insights
  if (healthScore.grade === 'A') {
    insights.push({
      id: 'achievement-grade-a',
      type: 'achievement',
      priority: 'low',
      title: 'Top Performer',
      description: `This account is performing in the top tier with a health score of ${healthScore.overall}%`,
      actionable: false,
    });
  }

  // E-commerce specific insights
  if (config.type === 'ecommerce' && isEcommerceMetrics(metrics)) {
    if (metrics.roas >= 5) {
      insights.push({
        id: 'ecom-high-roas',
        type: 'opportunity',
        priority: 'high',
        title: 'Scale Opportunity',
        description: `ROAS of ${metrics.roas.toFixed(2)}x suggests room for budget scaling`,
        actionable: true,
        action: 'Consider increasing daily budget by 20-30% incrementally',
        impact: 'Potential to increase revenue while maintaining efficiency',
      });
    } else if (metrics.roas < 3) {
      insights.push({
        id: 'ecom-low-roas',
        type: 'warning',
        priority: 'high',
        title: 'ROAS Below Target',
        description: `ROAS of ${metrics.roas.toFixed(2)}x is below the 3x minimum threshold`,
        actionable: true,
        action: 'Review audience targeting and creative performance',
        impact: 'Improving ROAS could significantly increase profitability',
      });
    }
  }

  // Gym account specific insights
  if (config.type === 'leadgen-gym' && isGymMetrics(metrics)) {
    const conversionRate = metrics.subscriptions / metrics.submitApplication * 100;
    if (conversionRate < 30) {
      insights.push({
        id: 'gym-low-conversion',
        type: 'optimization',
        priority: 'medium',
        title: 'Improve Lead-to-Subscription Rate',
        description: `Only ${conversionRate.toFixed(1)}% of applications convert to subscriptions`,
        actionable: true,
        action: 'Review follow-up process and trial experience',
        impact: 'Improving conversion by 10% could add 20+ subscriptions per month',
      });
    }
  }

  // CTR Insights
  if (metrics.ctr < 1) {
    insights.push({
      id: 'low-ctr',
      type: 'optimization',
      priority: 'medium',
      title: 'Improve Ad Engagement',
      description: `CTR of ${metrics.ctr.toFixed(2)}% is below the 1% benchmark`,
      actionable: true,
      action: 'Test new ad creatives and headlines to improve engagement',
      impact: 'Higher CTR typically leads to lower CPCs and better results',
    });
  } else if (metrics.ctr > 3) {
    insights.push({
      id: 'high-ctr',
      type: 'achievement',
      priority: 'low',
      title: 'Excellent Engagement',
      description: `CTR of ${metrics.ctr.toFixed(2)}% indicates highly engaging ads`,
      actionable: false,
    });
  }

  // Campaign distribution insight
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');
  const topCampaign = activeCampaigns.sort((a, b) => b.metrics.amountSpent - a.metrics.amountSpent)[0];
  if (topCampaign && activeCampaigns.length > 1) {
    const topSpendShare = (topCampaign.metrics.amountSpent / totalSpend) * 100;
    if (topSpendShare > 70) {
      insights.push({
        id: 'concentrated-spend',
        type: 'warning',
        priority: 'low',
        title: 'Concentrated Ad Spend',
        description: `${topSpendShare.toFixed(0)}% of spend is in a single campaign`,
        actionable: true,
        action: 'Consider diversifying spend across multiple campaigns for risk mitigation',
      });
    }
  }

  // Anomaly-based insights
  const anomalies = detectAnomalies(dailyData);
  const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
  if (highSeverityAnomalies.length > 0) {
    insights.push({
      id: 'anomalies-detected',
      type: 'warning',
      priority: 'high',
      title: 'Unusual Activity Detected',
      description: `${highSeverityAnomalies.length} significant anomaly(ies) found in recent data`,
      actionable: true,
      action: 'Review recent changes and verify data accuracy',
    });
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// =============================================================================
// BENCHMARK CALCULATIONS
// =============================================================================

export interface Benchmark {
  metric: string;
  value: number;
  industryAvg: number;
  percentile: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

// Industry benchmarks (can be customized)
const INDUSTRY_BENCHMARKS = {
  ecommerce: {
    ctr: 1.0,
    cpc: 1.5,
    roas: 4.0,
    conversionRate: 2.5,
  },
  leadgen: {
    ctr: 1.2,
    cpc: 2.0,
    costPerLead: 50,
    conversionRate: 10,
  },
  'leadgen-gym': {
    ctr: 1.5,
    cpc: 1.8,
    costPerSubscription: 70,
    conversionRate: 30,
  },
};

export function calculateBenchmarks(account: AccountData): Benchmark[] {
  const { metrics, config } = account;
  const benchmarks: Benchmark[] = [];
  const industryBenchmark = INDUSTRY_BENCHMARKS[config.type] || INDUSTRY_BENCHMARKS.leadgen;

  // CTR Benchmark
  const ctrPercentile = Math.min(100, (metrics.ctr / industryBenchmark.ctr) * 50);
  benchmarks.push({
    metric: 'CTR',
    value: metrics.ctr,
    industryAvg: industryBenchmark.ctr,
    percentile: ctrPercentile,
    status: ctrPercentile >= 75 ? 'excellent' : ctrPercentile >= 50 ? 'good' : ctrPercentile >= 25 ? 'average' : 'poor',
  });

  // CPC Benchmark (lower is better)
  const cpcPercentile = Math.min(100, (industryBenchmark.cpc / Math.max(metrics.cpc, 0.01)) * 50);
  benchmarks.push({
    metric: 'CPC',
    value: metrics.cpc,
    industryAvg: industryBenchmark.cpc,
    percentile: cpcPercentile,
    status: cpcPercentile >= 75 ? 'excellent' : cpcPercentile >= 50 ? 'good' : cpcPercentile >= 25 ? 'average' : 'poor',
  });

  // Type-specific benchmarks
  if (config.type === 'ecommerce' && isEcommerceMetrics(metrics)) {
    const roasBenchmark = INDUSTRY_BENCHMARKS.ecommerce;
    const roasPercentile = Math.min(100, (metrics.roas / roasBenchmark.roas) * 50);
    benchmarks.push({
      metric: 'ROAS',
      value: metrics.roas,
      industryAvg: roasBenchmark.roas,
      percentile: roasPercentile,
      status: roasPercentile >= 75 ? 'excellent' : roasPercentile >= 50 ? 'good' : roasPercentile >= 25 ? 'average' : 'poor',
    });
  }

  if (config.type === 'leadgen-gym' && isGymMetrics(metrics)) {
    const gymBenchmark = INDUSTRY_BENCHMARKS['leadgen-gym'];
    const cpsPercentile = Math.min(100, (gymBenchmark.costPerSubscription / Math.max(metrics.costPerSubscription, 1)) * 50);
    benchmarks.push({
      metric: 'Cost Per Sub',
      value: metrics.costPerSubscription,
      industryAvg: gymBenchmark.costPerSubscription,
      percentile: cpsPercentile,
      status: cpsPercentile >= 75 ? 'excellent' : cpsPercentile >= 50 ? 'good' : cpsPercentile >= 25 ? 'average' : 'poor',
    });
  }

  return benchmarks;
}
