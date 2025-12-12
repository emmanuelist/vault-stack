import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VaultStatus } from '@/contexts/VaultContext';

interface StatusBadgeProps {
  status: VaultStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

const statusConfig = {
  locked: {
    label: 'Locked',
    className: 'badge-locked',
    dotColor: 'bg-vault-locked',
  },
  unlocked: {
    label: 'Unlocked',
    className: 'badge-unlocked',
    dotColor: 'bg-vault-unlocked',
  },
  withdrawn: {
    label: 'Withdrawn',
    className: 'badge-withdrawn',
    dotColor: 'bg-vault-withdrawn',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export const StatusBadge = ({
  status,
  size = 'md',
  showDot = true,
  className,
}: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            config.dotColor,
            status === 'locked' && 'animate-pulse'
          )}
        />
      )}
      {config.label}
    </motion.span>
  );
};
