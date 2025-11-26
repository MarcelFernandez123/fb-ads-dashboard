'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Campaign, AccountMetrics, isEcommerceMetrics, isGymMetrics } from '@/types/metrics';
import { formatCurrency, formatNumber, formatPercentage, formatMultiplier } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, ArrowUpDown } from 'lucide-react';

interface CampaignTableProps {
  campaigns: Campaign[];
  accountType: 'ecommerce' | 'leadgen-gym' | 'leadgen';
}

type SortField = 'name' | 'status' | 'impressions' | 'clicks' | 'ctr' | 'cpc' | 'results' | 'costPerResult' | 'amountSpent' | 'roas' | 'costPerSubscription';
type SortDirection = 'asc' | 'desc';

export function CampaignTable({ campaigns, accountType }: CampaignTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('amountSpent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    if (sortField === 'name') {
      aValue = a.name;
      bValue = b.name;
    } else if (sortField === 'status') {
      aValue = a.status;
      bValue = b.status;
    } else {
      aValue = (a.metrics as unknown as Record<string, number>)[sortField] || 0;
      bValue = (b.metrics as unknown as Record<string, number>)[sortField] || 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case 'PAUSED':
        return <Badge variant="secondary">Paused</Badge>;
      default:
        return <Badge variant="destructive">{status}</Badge>;
    }
  };

  // Find best and worst performers
  const spendValues = campaigns.map((c) => c.metrics.amountSpent);
  const maxSpend = Math.max(...spendValues);
  const minSpend = Math.min(...spendValues);

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead><SortableHeader field="name">Campaign</SortableHeader></TableHead>
            <TableHead><SortableHeader field="status">Status</SortableHeader></TableHead>
            <TableHead className="text-right"><SortableHeader field="impressions">Impr.</SortableHeader></TableHead>
            <TableHead className="text-right"><SortableHeader field="clicks">Clicks</SortableHeader></TableHead>
            <TableHead className="text-right"><SortableHeader field="ctr">CTR</SortableHeader></TableHead>
            <TableHead className="text-right"><SortableHeader field="cpc">CPC</SortableHeader></TableHead>
            <TableHead className="text-right"><SortableHeader field="results">Results</SortableHeader></TableHead>
            <TableHead className="text-right"><SortableHeader field="costPerResult">Cost/Result</SortableHeader></TableHead>
            {accountType === 'ecommerce' && (
              <TableHead className="text-right"><SortableHeader field="roas">ROAS</SortableHeader></TableHead>
            )}
            {accountType === 'leadgen-gym' && (
              <TableHead className="text-right"><SortableHeader field="costPerSubscription">Cost/Sub</SortableHeader></TableHead>
            )}
            <TableHead className="text-right"><SortableHeader field="amountSpent">Spend</SortableHeader></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCampaigns.map((campaign) => {
            const isExpanded = expandedRows.has(campaign.id);
            const isBestPerformer = campaign.metrics.amountSpent === maxSpend;
            const isWorstPerformer = campaign.metrics.amountSpent === minSpend && campaigns.length > 1;

            return (
              <>
                <TableRow
                  key={campaign.id}
                  className={cn(
                    isBestPerformer && 'bg-green-500/5',
                    isWorstPerformer && 'bg-red-500/5'
                  )}
                >
                  <TableCell>
                    {campaign.adSets && campaign.adSets.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-6 w-6"
                        onClick={() => toggleRow(campaign.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {campaign.name}
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell className="text-right">{formatNumber(campaign.metrics.impressions)}</TableCell>
                  <TableCell className="text-right">{formatNumber(campaign.metrics.clicks)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(campaign.metrics.ctr)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(campaign.metrics.cpc)}</TableCell>
                  <TableCell className="text-right">{formatNumber(campaign.metrics.results)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(campaign.metrics.costPerResult)}</TableCell>
                  {accountType === 'ecommerce' && isEcommerceMetrics(campaign.metrics) && (
                    <TableCell className="text-right">{formatMultiplier(campaign.metrics.roas)}</TableCell>
                  )}
                  {accountType === 'leadgen-gym' && isGymMetrics(campaign.metrics) && (
                    <TableCell className="text-right">{formatCurrency(campaign.metrics.costPerSubscription)}</TableCell>
                  )}
                  <TableCell className="text-right font-semibold">{formatCurrency(campaign.metrics.amountSpent)}</TableCell>
                </TableRow>

                {/* Expanded Ad Sets */}
                {isExpanded &&
                  campaign.adSets?.map((adSet) => (
                    <TableRow key={adSet.id} className="bg-muted/30">
                      <TableCell></TableCell>
                      <TableCell className="pl-8 text-sm text-muted-foreground">
                        └ {adSet.name}
                      </TableCell>
                      <TableCell>{getStatusBadge(adSet.status)}</TableCell>
                      <TableCell className="text-right text-sm">{formatNumber(adSet.metrics.impressions)}</TableCell>
                      <TableCell className="text-right text-sm">{formatNumber(adSet.metrics.clicks)}</TableCell>
                      <TableCell className="text-right text-sm">{formatPercentage(adSet.metrics.ctr)}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(adSet.metrics.cpc)}</TableCell>
                      <TableCell className="text-right text-sm">{formatNumber(adSet.metrics.results)}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(adSet.metrics.costPerResult)}</TableCell>
                      {accountType === 'ecommerce' && <TableCell></TableCell>}
                      {accountType === 'leadgen-gym' && <TableCell></TableCell>}
                      <TableCell className="text-right text-sm">{formatCurrency(adSet.metrics.amountSpent)}</TableCell>
                    </TableRow>
                  ))}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
