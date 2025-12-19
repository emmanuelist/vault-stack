import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { Vault } from '@/contexts/VaultContext';
import { StatusBadge } from '@/components/ui/status-badge';
import { CountdownTicker } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';

interface VaultCardProps {
  vault: Vault;
  currentBlock: number;
  index?: number;
}

export const VaultCard = ({ vault, currentBlock, index = 0 }: VaultCardProps) => {
  const progressPercent = Math.min(
    100,
    ((currentBlock - vault.depositBlock) / (vault.unlockBlock - vault.depositBlock)) * 100
  );

  const totalValue = vault.principal + vault.interestEarned;

  const cardVariants = {
    locked: 'vault-card-locked hover:shadow-glow',
    unlocked: 'vault-card-unlocked hover:shadow-glow-accent',
    withdrawn: 'vault-card-withdrawn',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={cn(
        'group relative bg-card rounded-xl border border-border overflow-hidden transition-all duration-300',
        cardVariants[vault.status]
      )}
    >
      {/* Gradient overlay for locked vaults */}
      {vault.status === 'locked' && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      <div className="relative card-padding-sm">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-sm text-muted-foreground">{vault.id}</span>
              <StatusBadge status={vault.status} size="sm" />
            </div>
            <p className="text-xs text-muted-foreground">
              Created {vault.createdAt.toLocaleDateString()}
            </p>
          </div>
          <Link to={`/vault/${vault.id}`}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.div>
          </Link>
        </div>

        {/* Value Display */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
              {vault.principal.toLocaleString()}
            </span>
            <span className="text-base text-muted-foreground">STX</span>
          </div>
          {vault.status !== 'withdrawn' && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-sm text-success font-medium">
                +{vault.interestEarned.toLocaleString()} STX
              </span>
              <span className="text-xs text-muted-foreground">
                ({vault.interestRate}% APR)
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar (for locked vaults) */}
        {vault.status === 'locked' && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress</span>
              <span>{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full progress-gradient rounded-full"
              />
            </div>
          </div>
        )}

        {/* Countdown / Status Info */}
        {vault.status === 'locked' && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Time until unlock</span>
            </div>
            <CountdownTicker
              targetBlock={vault.unlockBlock}
              currentBlock={currentBlock}
              className="justify-center"
            />
          </div>
        )}

        {vault.status === 'unlocked' && (
          <div className="pt-3 border-t border-border">
            <div className="bg-accent/10 rounded-lg p-3 text-center">
              <p className="text-accent font-medium text-sm mb-0.5">Ready to Withdraw!</p>
              <p className="text-xl font-display font-semibold text-foreground">
                {totalValue.toLocaleString()} STX
              </p>
            </div>
          </div>
        )}

        {vault.status === 'withdrawn' && vault.withdrawnAt && (
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Withdrawn on {vault.withdrawnAt.toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Block Info */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1 justify-start sm:justify-start">
            <span>Deposit:</span>
            <span className="font-mono text-foreground">{vault.depositBlock.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 justify-start sm:justify-end">
            <span>Unlock:</span>
            <span className="font-mono text-foreground">{vault.unlockBlock.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};