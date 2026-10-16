import React from 'react';
import { Award, AlertCircle, AlertTriangle } from 'lucide-react';

interface QualityScoreBadgeProps {
  score: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const QualityScoreBadge: React.FC<QualityScoreBadgeProps> = ({
  score,
  showIcon = true,
  size = 'md',
}) => {
  const rounded = Math.round(score);

  let bgClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  let Icon = Award;

  if (rounded < 60) {
    bgClass = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    Icon = AlertCircle;
  } else if (rounded < 80) {
    bgClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    Icon = AlertTriangle;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1',
    md: 'px-2.5 py-1 text-xs font-bold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-extrabold gap-2',
  };

  return (
    <span
      className={`inline-flex items-center border rounded-full font-mono shadow-2xs ${bgClass} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{rounded}/100</span>
    </span>
  );
};
