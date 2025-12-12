import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Zap, Unlock } from 'lucide-react';
import { Activity } from '@/contexts/VaultContext';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  activity: Activity;
  index?: number;
}

const activityConfig = {
  deposit: {
    icon: ArrowDownLeft,
    label: 'Deposit',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  withdrawal: {
    icon: ArrowUpRight,
    label: 'Withdrawal',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
  },
  funding: {
    icon: Zap,
    label: 'Contract Funding',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  unlock: {
    icon: Unlock,
    label: 'Vault Unlocked',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
  },
};

export const ActivityItem = ({ activity, index = 0 }: ActivityItemProps) => {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const truncateTxHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200"
    >
      {/* Icon */}
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', config.iconBg)}>
        <Icon className={cn('w-4 h-4', config.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm text-foreground">{config.label}</span>
          {activity.vaultId && (
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
              {activity.vaultId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{truncateAddress(activity.address)}</span>
          <span>•</span>
          <span>Block {activity.blockHeight.toLocaleString()}</span>
        </div>
      </div>

      {/* Amount & Time */}
      <div className="text-right shrink-0">
        <p className="font-mono font-semibold text-sm text-foreground">
          {activity.type === 'withdrawal' ? '-' : '+'}
          {activity.amount.toLocaleString()} STX
        </p>
        <p className="text-xs text-muted-foreground">{timeAgo(activity.timestamp)}</p>
      </div>
    </motion.div>
  );
};

interface ActivityFeedProps {
  activities: Activity[];
  limit?: number;
  className?: string;
}

export const ActivityFeed = ({ activities, limit, className }: ActivityFeedProps) => {
  const displayActivities = limit ? activities.slice(0, limit) : activities;

  return (
    <div className={cn('space-y-2', className)}>
      {displayActivities.map((activity, index) => (
        <ActivityItem key={activity.id} activity={activity} index={index} />
      ))}
    </div>
  );
};