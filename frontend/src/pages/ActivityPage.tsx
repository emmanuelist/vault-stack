import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { useVault, Activity } from '@/contexts/VaultContext';
import { cn } from '@/lib/utils';

type ActivityFilter = 'all' | 'deposit' | 'withdrawal' | 'funding' | 'unlock';

const filterOptions: { value: ActivityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'deposit', label: 'Deposits' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'funding', label: 'Funding' },
  { value: 'unlock', label: 'Unlocks' },
];

const ActivityPage = () => {
  const { activities } = useVault();
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const filteredActivities = filter === 'all' ? activities : activities.filter((a) => a.type === filter);

  return (
    <Layout>
      <div className="container mx-auto px-3 lg:px-5 py-6 lg:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-1">Activity</h1>
          <p className="text-sm text-muted-foreground">All transactions on the Vault Stack platform</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                filter === option.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {option.label}
            </button>
          ))}
        </motion.div>

        <ActivityFeed activities={filteredActivities} />
      </div>
    </Layout>
  );
};

export default ActivityPage;