'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AccountData, Alert, DateRange } from '@/types/metrics';
import { generateAllAccountsData, getAccountData, generateDemoAlerts } from '@/lib/demo-data';

// Check if we're in static export mode
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' || typeof window !== 'undefined';

// Fetch all accounts data
async function fetchAllAccounts(): Promise<AccountData[]> {
  // For static export, use demo data directly
  if (isStaticExport) {
    // Simulate network delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateAllAccountsData();
  }

  const response = await fetch('/api/fb-data');
  if (!response.ok) {
    throw new Error('Failed to fetch accounts data');
  }
  const data = await response.json();
  return data.data;
}

// Fetch single account data
async function fetchAccountData(accountId: string, dateRange: DateRange = '7d'): Promise<AccountData> {
  // For static export, use demo data directly
  if (isStaticExport) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const data = getAccountData(accountId, dateRange);
    if (!data) {
      throw new Error('Account not found');
    }
    return data;
  }

  const response = await fetch(`/api/fb-data/${accountId}?range=${dateRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch account data');
  }
  const data = await response.json();
  return data.data;
}

// Fetch alerts
async function fetchAlerts(): Promise<Alert[]> {
  // For static export, use demo data directly
  if (isStaticExport) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return generateDemoAlerts();
  }

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
    if (!isStaticExport) {
      await fetch('/api/refresh', { method: 'POST' });
    }
    await queryClient.invalidateQueries({ queryKey: ['accounts'] });
    await queryClient.invalidateQueries({ queryKey: ['account'] });
    await queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  const refreshAccount = async (accountId: string) => {
    if (!isStaticExport) {
      await fetch(`/api/refresh/${accountId}`, { method: 'POST' });
    }
    await queryClient.invalidateQueries({ queryKey: ['account', accountId] });
  };

  return { refreshAll, refreshAccount };
}
