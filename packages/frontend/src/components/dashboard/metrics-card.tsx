import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  className?: string;
  loading?: boolean;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-400/10',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  green: {
    bg: 'bg-green-500/10 dark:bg-green-400/10',
    icon: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  yellow: {
    bg: 'bg-yellow-500/10 dark:bg-yellow-400/10',
    icon: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  red: {
    bg: 'bg-red-500/10 dark:bg-red-400/10',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-400/10',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
};

const changeVariants = {
  increase: 'text-green-600 dark:text-green-400',
  decrease: 'text-red-600 dark:text-red-400',
  neutral: 'text-muted-foreground',
};

export function MetricsCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
  className,
  loading = false,
}: MetricsCardProps) {
  const colors = colorVariants[color];

  if (loading) {
    return (
      <div className={cn('glass-effect rounded-xl border p-6', className)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'glass-effect rounded-xl border p-6 backdrop-blur-sm',
        'hover:shadow-lg transition-all duration-300',
        colors.border,
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <motion.div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              colors.bg
            )}
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className={cn('h-5 w-5', colors.icon)} />
          </motion.div>
        </div>

        {/* Value */}
        <motion.div
          className="text-3xl font-bold text-foreground"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {typeof value === 'number' ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={value}
            >
              {value.toLocaleString()}
            </motion.span>
          ) : (
            value
          )}
        </motion.div>

        {/* Change Indicator */}
        {change && (
          <motion.div
            className="flex items-center gap-1 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <span className={changeVariants[change.type]}>
              {change.type === 'increase' && '+'}
              {change.value}%
            </span>
            <span className="text-muted-foreground">
              vs {change.period}
            </span>
          </motion.div>
        )}

        {/* Animated Progress Bar */}
        <motion.div
          className="h-1 w-full rounded-full bg-muted overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <motion.div
            className={cn('h-full rounded-full', colors.bg.replace('/10', '/50'))}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.abs(change?.value || 50), 100)}%` }}
            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
} 