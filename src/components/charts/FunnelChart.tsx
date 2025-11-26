'use client';

import { FunnelStage } from '@/types/metrics';
import { cn } from '@/lib/utils';

interface FunnelChartProps {
  data: FunnelStage[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-4">
      {data.map((stage, index) => {
        const widthPercent = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
        const isFirst = index === 0;
        const previousValue = index > 0 ? data[index - 1].value : stage.value;
        const conversionRate =
          previousValue > 0 ? ((stage.value / previousValue) * 100).toFixed(1) : '0';

        return (
          <div key={stage.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{stage.name}</span>
              <span className="text-muted-foreground">
                {stage.value.toLocaleString()}
                {!isFirst && (
                  <span className="ml-2 text-xs">({conversionRate}%)</span>
                )}
              </span>
            </div>
            <div className="h-8 bg-muted rounded-lg overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-lg transition-all duration-500',
                  index === 0 && 'bg-blue-500',
                  index === 1 && 'bg-amber-500',
                  index === 2 && 'bg-green-500'
                )}
                style={{ width: `${widthPercent}%` }}
              />
            </div>
            {!isFirst && (
              <div className="flex justify-center">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
