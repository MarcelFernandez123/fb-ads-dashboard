'use client';

import { useState } from 'react';
import { useAllAccounts, useAlerts } from '@/hooks/useFBData';
import { AccountCard } from '@/components/dashboard/AccountCard';
import { AlertsBanner } from '@/components/dashboard/AlertsBanner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, formatCurrency } from '@/lib/utils';
import { AccountData } from '@/types/metrics';

type FilterType = 'all' | 'ecommerce' | 'leadgen' | 'leadgen-gym';

export default function DashboardPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const { data: accounts, isLoading, error } = useAllAccounts();
  const { data: alerts } = useAlerts();

  const filteredAccounts = accounts?.filter((account: AccountData) => {
    if (filter === 'all') return true;
    if (filter === 'leadgen' && account.config.type === 'leadgen-gym') return true;
    return account.config.type === filter;
  });

  // Calculate totals
  const totalSpend = accounts?.reduce((sum: number, a: AccountData) => sum + a.sevenDaySpend, 0) || 0;
  const totalResults = accounts?.reduce((sum: number, a: AccountData) => sum + a.metrics.results, 0) || 0;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">Failed to load accounts data</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Overview</h1>
          <p className="text-muted-foreground">
            {accounts ? (
              <>
                Last updated {formatRelativeTime(accounts[0]?.lastUpdated || new Date())}
              </>
            ) : (
              'Loading...'
            )}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">7-Day Spend</p>
            <p className="text-xl font-bold">{formatCurrency(totalSpend)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Results</p>
            <p className="text-xl font-bold">{totalResults.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <AlertsBanner alerts={alerts} />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
          <Badge variant="secondary" className="ml-2">
            {accounts?.length || 0}
          </Badge>
        </Button>
        <Button
          variant={filter === 'ecommerce' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('ecommerce')}
        >
          E-commerce
          <Badge variant="secondary" className="ml-2">
            {accounts?.filter((a: AccountData) => a.config.type === 'ecommerce').length || 0}
          </Badge>
        </Button>
        <Button
          variant={filter === 'leadgen' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('leadgen')}
        >
          Lead Gen
          <Badge variant="secondary" className="ml-2">
            {accounts?.filter((a: AccountData) =>
              a.config.type === 'leadgen' || a.config.type === 'leadgen-gym'
            ).length || 0}
          </Badge>
        </Button>
      </div>

      {/* Account Cards Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3 p-6 border rounded-lg">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAccounts?.map((account: AccountData) => (
            <AccountCard key={account.config.id} account={account} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredAccounts?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No accounts found for this filter</p>
        </div>
      )}
    </div>
  );
}
