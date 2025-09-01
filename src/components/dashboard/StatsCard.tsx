import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  type?: 'positive' | 'negative' | 'neutral';
}

export function StatsCard({ title, value, change, icon, type = 'neutral' }: StatsCardProps) {
  const getChangeColor = () => {
    if (change === undefined) return '';
    if (change > 0) return type === 'positive' ? 'text-green-600' : 'text-red-600';
    if (change < 0) return type === 'positive' ? 'text-red-600' : 'text-green-600';
    return 'text-gray-500';
  };

  const getChangeIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(value)}</p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', getChangeColor())}>
              {getChangeIcon()}
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-gray-500">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
    </Card>
  );
}