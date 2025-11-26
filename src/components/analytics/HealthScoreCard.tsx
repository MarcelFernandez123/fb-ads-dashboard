'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AccountData } from '@/types/metrics';
import { calculateHealthScore, HealthScore, HealthFactor } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Zap,
  Activity,
  AlertTriangle,
} from 'lucide-react';

interface HealthScoreCardProps {
  account: AccountData;
  compact?: boolean;
}

export function HealthScoreCard({ account, compact = false }: HealthScoreCardProps) {
  const healthScore = useMemo(() => calculateHealthScore(account), [account]);

  const gradeColors: Record<HealthScore['grade'], string> = {
    A: 'text-green-500',
    B: 'text-blue-500',
    C: 'text-yellow-500',
    D: 'text-orange-500',
    F: 'text-red-500',
  };

  const gradeBgColors: Record<HealthScore['grade'], string> = {
    A: 'bg-green-500/10 border-green-500/30',
    B: 'bg-blue-500/10 border-blue-500/30',
    C: 'bg-yellow-500/10 border-yellow-500/30',
    D: 'bg-orange-500/10 border-orange-500/30',
    F: 'bg-red-500/10 border-red-500/30',
  };

  const getImpactIcon = (impact: HealthFactor['impact']) => {
    switch (impact) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const scoreMetrics = [
    { label: 'Efficiency', value: healthScore.efficiency, icon: Zap },
    { label: 'Growth', value: healthScore.growth, icon: TrendingUp },
    { label: 'Consistency', value: healthScore.consistency, icon: Activity },
    { label: 'Risk', value: healthScore.risk, icon: Shield },
  ];

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-4 p-4 rounded-lg border',
          gradeBgColors[healthScore.grade]
        )}
      >
        <div className="flex flex-col items-center">
          <span className={cn('text-3xl font-bold', gradeColors[healthScore.grade])}>
            {healthScore.grade}
          </span>
          <span className="text-xs text-muted-foreground">Grade</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-semibold">{healthScore.overall}%</span>
            <span className="text-sm text-muted-foreground">Health Score</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn('h-2 rounded-full transition-all', gradeColors[healthScore.grade].replace('text-', 'bg-'))}
              style={{ width: `${healthScore.overall}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Account Health</span>
          <Badge
            variant="outline"
            className={cn(
              'text-lg px-3 py-1 font-bold',
              gradeColors[healthScore.grade],
              gradeBgColors[healthScore.grade]
            )}
          >
            {healthScore.grade}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(healthScore.overall / 100) * 352} 352`}
                className={gradeColors[healthScore.grade]}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-3xl font-bold">{healthScore.overall}%</span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {scoreMetrics.map((metric) => (
            <div
              key={metric.label}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
            >
              <metric.icon className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-sm font-semibold">{metric.value}%</p>
              </div>
            </div>
          ))}
        </div>

        {/* Health Factors */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Key Factors</p>
          {healthScore.factors.map((factor) => (
            <div
              key={factor.name}
              className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
            >
              {getImpactIcon(factor.impact)}
              <div className="flex-1">
                <p className="text-sm font-medium">{factor.name}</p>
                <p className="text-xs text-muted-foreground">{factor.description}</p>
              </div>
              <span className="text-sm font-semibold">{factor.score}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
