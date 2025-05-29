
"use client";

import type { FC } from 'react';
import React from 'react'; // Import React for React.memo
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface StatItemProps {
  label: React.ReactNode; // Changed from string to React.ReactNode
  value: string | number | undefined | null;
  unit?: string;
  isPercentage?: boolean;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
}

const StatItemComponent: FC<StatItemProps> = ({ label, value, unit, isPercentage, className, valueClassName, labelClassName }) => {
  const displayValue = useMemo(() => {
    if (value === null || typeof value === 'undefined' || value === '') return 'N/A';
    if (typeof value === 'number') {
      if (isPercentage) return `${value.toFixed(2)}%`;
      return unit === '$' ? `${unit}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: value > 1 ? 2 : 8 })}` : `${value.toLocaleString()} ${unit || ''}`.trim();
    }
    return value;
  }, [value, unit, isPercentage]);

  const defaultValueColor = isPercentage && typeof value === 'number' ? (value >= 0 ? 'text-green-400' : 'text-red-400') : 'text-foreground';

  return (
    <div className={cn("flex justify-between py-1.5 px-3 sm:px-4 border-b border-muted/30 last:border-b-0 items-center", className)}>
      <span className={cn("text-xs sm:text-sm text-muted-foreground", labelClassName)}>{label}</span>
      <span className={cn("text-xs sm:text-sm font-semibold", valueClassName || defaultValueColor)}>{displayValue}</span>
    </div>
  );
};

export const StatItem = React.memo(StatItemComponent);
