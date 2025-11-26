'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AccountData, Alert, DateRange } from '@/types/metrics';

// Fetch all accounts data
async function fetchAllAccounts(): Promise<AccountData[]> {
  const response = await fetch('/api/fb-data');
  if (!response.ok) {
    throw new Error('Failed to fetch accounts data');
  }
  const data = await response.json();
  return data.data;
}

// Fetch single account data
async function fetchAccountData(accountId: string, dateRange: DateRange = '7d'): Promise<AccountData> {
  const response = await fetch(`/api/fb-data/${accountId}?range=${dateRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch account data');
  }
  const data = await response.json();
  return data.data;
}

// Fetch alerts
async function fetchAlerts(): Promise<Alert[]> {
  const response = await fetch('/api/fb-data/alerts');
  if (!response.ok) {
    throw new Error('Failed to fetch alerts');
  }
  const data = await response.json();
  return data.data;
}

// Hook to fetch all accounts
export function useAllAccounts() {
  return useQuery({
    queryKey: ['accounts', 'all'],
    queryFn: fetchAllAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes auto-refresh
  });
}

// Hook to fetch single account
export function useAccountData(accountId: string, dateRange: DateRange = '7d') {
  return useQuery({
    queryKey: ['account', accountId, dateRange],
    queryFn: () => fetchAccountData(accountId, dateRange),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    enabled: !!accountId,
  });
}

// Hook to fetch alerts
export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for manual refresh
export function useRefreshData() {
  const queryClient = useQueryClient();

  const refreshAll = async () => {
    await fetch('/api/refresh', { method: 'POST' });
    await queryClient.invalidateQueries({ queryKey: ['accounts'] });
    await queryClient.invalidateQueries({ queryKey: ['account'] });
    await queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  const refreshAccount = async (accountId: string) => {
    await fetch(`/api/refresh/${accountId}`, { method: 'POST' });
    await queryClient.invalidateQueries({ queryKey: ['account', accountId] });
  };

  return { refreshAll, refreshAccount };
}
