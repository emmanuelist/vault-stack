import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
  decimals?: number;
}

export const StatCard = ({
  label,
  value,
  suffix,
  prefix,
  icon: Icon,
  trend,
  className,
  delay = 0,
  decimals = 0,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        'relative bg-card border border-border rounded-xl p-4 sm:p-5 overflow-hidden group transition-all duration-300 hover:border-primary/30',
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Header with icon */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-primary" />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          <AnimatedCounter
            value={value}
            prefix={prefix}
            decimals={decimals}
            className="text-xl sm:text-2xl font-display font-semibold text-foreground"
          />
          {suffix && (
            <span className="text-base text-muted-foreground ml-0.5">{suffix}</span>
          )}
        </div>

        {/* Trend indicator */}
        {trend && (
          <div className="mt-1.5 flex items-center gap-1">
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export const StatsGrid = ({ children, className }: StatsGridProps) => {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-3', className)}>
      {children}
    </div>
  );
};