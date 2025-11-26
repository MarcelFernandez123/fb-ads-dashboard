'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AccountData } from '@/types/metrics';
import { generateInsights, Insight } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Trophy,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface InsightsPanelProps {
  account: AccountData;
  maxInsights?: number;
}

export function InsightsPanel({ account, maxInsights = 5 }: InsightsPanelProps) {
  const insights = useMemo(() => generateInsights(account), [account]);
  const displayedInsights = insights.slice(0, maxInsights);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'optimization':
        return <Lightbulb className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'opportunity':
        return <TrendingUp className="w-5 h-5" />;
      case 'achievement':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getInsightColors = (type: Insight['type'], priority: Insight['priority']) => {
    const colors: Record<Insight['type'], { bg: string; icon: string; border: string }> = {
      optimization: {
        bg: 'bg-blue-500/10',
        icon: 'text-blue-500',
        border: 'border-blue-500/30',
      },
      warning: {
        bg: 'bg-amber-500/10',
        icon: 'text-amber-500',
        border: 'border-amber-500/30',
      },
      opportunity: {
        bg: 'bg-green-500/10',
        icon: 'text-green-500',
        border: 'border-green-500/30',
      },
      achievement: {
        bg: 'bg-purple-500/10',
        icon: 'text-purple-500',
        border: 'border-purple-500/30',
      },
    };
    return colors[type] || colors.optimization;
  };

  const getPriorityBadge = (priority: Insight['priority']) => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="destructive" className="text-xs">
            High Priority
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="secondary" className="text-xs">
            Medium
          </Badge>
        );
      default:
        return null;
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No insights available yet.</p>
            <p className="text-sm">Check back as more data is collected.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Powered Insights
          </div>
          <Badge variant="outline">{insights.length} insights</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedInsights.map((insight) => {
          const colors = getInsightColors(insight.type, insight.priority);
          return (
            <div
              key={insight.id}
              className={cn(
                'p-4 rounded-lg border transition-colors hover:bg-muted/50',
                colors.bg,
                colors.border
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('mt-0.5', colors.icon)}>
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    {getPriorityBadge(insight.priority)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                  {insight.actionable && insight.action && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">
                        Recommended Action:
                      </p>
                      <p className="text-sm font-medium">{insight.action}</p>
                      {insight.impact && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {insight.impact}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {insights.length > maxInsights && (
          <Button variant="ghost" className="w-full" size="sm">
            View All {insights.length} Insights
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
