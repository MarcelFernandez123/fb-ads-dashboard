'use client';

import { useState } from 'react';
import { useAllAccounts } from '@/hooks/useFBData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AccountData } from '@/types/metrics';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function ComparePage() {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [normalizeBySpend, setNormalizeBySpend] = useState(false);
  const { data: accounts, isLoading } = useAllAccounts();

  const toggleAccount = (accountId: string) => {
    setSelectedAccounts((prev) => {
      if (prev.includes(accountId)) {
        return prev.filter((id) => id !== accountId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), accountId];
      }
      return [...prev, accountId];
    });
  };

  const selectedAccountsData = accounts?.filter((a: AccountData) =>
    selectedAccounts.includes(a.config.id)
  );

  // Calculate totals for selected accounts
  const totals = selectedAccountsData?.reduce(
    (acc: { spend: number; results: number; clicks: number; impressions: number }, a: AccountData) => ({
      spend: acc.spend + a.sevenDaySpend,
      results: acc.results + a.metrics.results,
      clicks: acc.clicks + a.metrics.clicks,
      impressions: acc.impressions + a.metrics.impressions,
    }),
    { spend: 0, results: 0, clicks: 0, impressions: 0 }
  );

  // Calculate averages
  const averages = selectedAccountsData?.length
    ? {
        ctr:
          selectedAccountsData.reduce((sum: number, a: AccountData) => sum + a.metrics.ctr, 0) /
          selectedAccountsData.length,
        cpc:
          selectedAccountsData.reduce((sum: number, a: AccountData) => sum + a.metrics.cpc, 0) /
          selectedAccountsData.length,
        costPerResult:
          selectedAccountsData.reduce(
            (sum: number, a: AccountData) => sum + a.metrics.costPerResult,
            0
          ) / selectedAccountsData.length,
      }
    : { ctr: 0, cpc: 0, costPerResult: 0 };

  // Prepare chart data
  const chartData = selectedAccountsData?.map((a: AccountData) => {
    const normalizer = normalizeBySpend ? a.sevenDaySpend / 1000 : 1;
    return {
      name: a.config.name.split(' ').slice(0, 2).join(' '),
      Spend: a.sevenDaySpend,
      Results: normalizeBySpend ? (a.metrics.results / normalizer) * 100 : a.metrics.results,
      Clicks: normalizeBySpend ? (a.metrics.clicks / normalizer) * 100 : a.metrics.clicks,
    };
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compare Accounts</h1>
        <p className="text-muted-foreground">
          Select up to 3 accounts to compare side-by-side
        </p>
      </div>

      {/* Account Selection */}
      <div className="flex flex-wrap gap-2">
        {accounts?.map((account: AccountData) => {
          const isSelected = selectedAccounts.includes(account.config.id);
          return (
            <Button
              key={account.config.id}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleAccount(account.config.id)}
              className={cn(
                isSelected && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              {account.config.name}
              {isSelected && (
                <Badge variant="secondary" className="ml-2">
                  {selectedAccounts.indexOf(account.config.id) + 1}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {selectedAccounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Select accounts above to start comparing
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Portfolio Totals */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Spend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(totals?.spend || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatNumber(totals?.results || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. CTR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatPercentage(averages.ctr)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Cost/Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(averages.costPerResult)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Options */}
          <div className="flex items-center gap-4">
            <Button
              variant={normalizeBySpend ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNormalizeBySpend(!normalizeBySpend)}
            >
              {normalizeBySpend ? 'Normalized by Spend' : 'Normalize by Spend'}
            </Button>
          </div>

          {/* Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Results" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Clicks" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Side-by-Side Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium">Metric</th>
                      {selectedAccountsData?.map((a: AccountData) => (
                        <th key={a.config.id} className="py-3 px-4 text-right font-medium">
                          {a.config.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Spend (7d)</td>
                      {selectedAccountsData?.map((a: AccountData) => (
                        <td key={a.config.id} className="py-3 px-4 text-right">
                          {formatCurrency(a.sevenDaySpend)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Impressions</td>
                      {selectedAccountsData?.map((a: AccountData) => (
                        <td key={a.config.id} className="py-3 px-4 text-right">
                          {formatNumber(a.metrics.impressions)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Clicks</td>
                      {selectedAccountsData?.map((a: AccountData) => (
                        <td key={a.config.id} className="py-3 px-4 text-right">
                          {formatNumber(a.metrics.clicks)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">CTR</td>
                      {selectedAccountsData?.map((a: AccountData) => (
                        <td key={a.config.id} className="py-3 px-4 text-right">
                          {formatPercentage(a.metrics.ctr)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">CPC</td>
                      {selectedAccountsData?.map((a: AccountData) => (
                        <td key={a.config.id} className="py-3 px-4 text-right">
                          {formatCurrency(a.metrics.cpc)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Results</td>
                      {selectedAccountsData?.map((a: AccountData) => (
                        <td key={a.config.id} className="py-3 px-4 text-right">
                          {formatNumber(a.metrics.results)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Cost/Result</td>
                      {selectedAccountsData?.map((a: AccountData) => (
                        <td key={a.config.id} className="py-3 px-4 text-right">
                          {formatCurrency(a.metrics.costPerResult)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
