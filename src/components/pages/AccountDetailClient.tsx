'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccountData } from '@/hooks/useFBData';
import { useAccountMetrics } from '@/hooks/useAccountMetrics';
import { MetricsRow } from '@/components/dashboard/MetricsRow';
import { CampaignTable } from '@/components/tables/CampaignTable';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { CampaignBarChart } from '@/components/charts/CampaignBarChart';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { ROASChart } from '@/components/charts/ROASChart';
import {
  HealthScoreCard,
  InsightsPanel,
  ForecastChart,
  AnomalyAlert,
  TrendIndicator,
  BenchmarkChart,
} from '@/components/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRange } from '@/types/metrics';
import { formatRelativeTime } from '@/lib/utils';
import { thresholdColorClasses } from '@/lib/thresholds';
import { cn } from '@/lib/utils';
import { ArrowLeft, Calendar, TrendingUp, Sparkles, BarChart3 } from 'lucide-react';

interface AccountDetailClientProps {
  slug: string;
}

export function AccountDetailClient({ slug }: AccountDetailClientProps) {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'performance' | 'analytics'>('performance');

  const { data: accountData, isLoading, error } = useAccountData(slug, dateRange);
  const { metrics, primaryKPI, funnelData } = useAccountMetrics(accountData);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">Failed to load account data</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (isLoading || !accountData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const { config, dailyData, campaigns } = accountData;
  const colorClasses = primaryKPI ? thresholdColorClasses[primaryKPI.color] : thresholdColorClasses.green;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Overview
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{config.name}</h1>
            <Badge
              variant={config.type === 'ecommerce' ? 'default' : 'secondary'}
            >
              {config.type === 'ecommerce'
                ? 'E-commerce'
                : config.type === 'leadgen-gym'
                ? 'Gym'
                : 'Lead Gen'}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Last updated {formatRelativeTime(accountData.lastUpdated)}
          </p>
        </div>

        {/* Primary KPI Display */}
        {primaryKPI && (
          <div
            className={cn(
              'p-4 rounded-lg border min-w-[200px]',
              colorClasses.bg,
              colorClasses.border
            )}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className={cn('w-5 h-5', colorClasses.text)} />
              <span className="text-sm font-medium">{primaryKPI.label}</span>
            </div>
            <p className={cn('text-3xl font-bold mt-1', colorClasses.text)}>
              {primaryKPI.formattedValue}
            </p>
          </div>
        )}
      </div>

      {/* Health Score Summary */}
      <HealthScoreCard account={accountData} compact />

      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select
              value={dateRange}
              onValueChange={(value) => setDateRange(value as DateRange)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="14d">Last 14 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant={compareEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCompareEnabled(!compareEnabled)}
          >
            {compareEnabled ? 'Comparison On' : 'Compare Period'}
          </Button>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-lg border p-1 bg-muted/30">
          <Button
            variant={activeTab === 'performance' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('performance')}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Performance
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('analytics')}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Analytics
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <MetricsRow
        metrics={accountData.metrics}
        accountType={config.type}
        comparison={compareEnabled ? {} : undefined}
      />

      {/* Week-over-Week Trends */}
      <TrendIndicator dailyData={dailyData} variant="compact" />

      {activeTab === 'performance' ? (
        <>
          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceChart
                  data={dailyData}
                  showRoas={config.type === 'ecommerce'}
                  showSubscriptions={config.type === 'leadgen-gym'}
                />
              </CardContent>
            </Card>

            {/* Campaign Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <CampaignBarChart campaigns={campaigns} metric="amountSpent" />
              </CardContent>
            </Card>

            {/* Account-specific charts */}
            {config.type === 'ecommerce' && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>ROAS Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ROASChart
                    data={dailyData}
                    greenThreshold={config.thresholds?.roas?.green || 5}
                    yellowThreshold={config.thresholds?.roas?.yellow || 3}
                  />
                </CardContent>
              </Card>
            )}

            {config.type === 'leadgen-gym' && funnelData && (
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <FunnelChart data={funnelData} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Campaign Table */}
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="paused">Paused</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <CampaignTable campaigns={campaigns} accountType={config.type} />
                </TabsContent>
                <TabsContent value="active" className="mt-4">
                  <CampaignTable
                    campaigns={campaigns.filter((c) => c.status === 'ACTIVE')}
                    accountType={config.type}
                  />
                </TabsContent>
                <TabsContent value="paused" className="mt-4">
                  <CampaignTable
                    campaigns={campaigns.filter((c) => c.status === 'PAUSED')}
                    accountType={config.type}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* AI Analytics Tab */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* AI Insights */}
            <InsightsPanel account={accountData} maxInsights={5} />

            {/* Full Health Score */}
            <HealthScoreCard account={accountData} />

            {/* Spend Forecast */}
            <ForecastChart dailyData={dailyData} daysAhead={7} />

            {/* Benchmarks */}
            <BenchmarkChart account={accountData} />

            {/* Anomaly Detection */}
            <AnomalyAlert dailyData={dailyData} />

            {/* Week-over-Week Detailed Trends */}
            <TrendIndicator dailyData={dailyData} variant="detailed" />
          </div>
        </>
      )}
    </div>
  );
}
