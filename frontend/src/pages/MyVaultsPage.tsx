import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus,
  Filter,
  SortAsc,
  SortDesc,
  Wallet,
  Layers,
  TrendingUp,
  Clock,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout/Layout';
import { VaultCard } from '@/components/vault/VaultCard';
import { StatCard, StatsGrid } from '@/components/ui/stat-card';
import { useVault, VaultStatus } from '@/contexts/VaultContext';
import { cn } from '@/lib/utils';

type SortOption = 'newest' | 'oldest' | 'amount-high' | 'amount-low' | 'unlock-soon';
type FilterTab = 'all' | VaultStatus;

const filterTabs: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All Vaults' },
  { value: 'locked', label: 'Locked' },
  { value: 'unlocked', label: 'Unlocked' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amount-high', label: 'Highest Amount' },
  { value: 'amount-low', label: 'Lowest Amount' },
  { value: 'unlock-soon', label: 'Unlocking Soon' },
];

const MyVaultsPage = () => {
  const { userVaults, stats, wallet, connectWallet, isLoading } = useVault();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Calculate user stats
  const userStats = useMemo(() => {
    const totalDeposited = userVaults.reduce((sum, v) => sum + v.principal, 0);
    const totalInterest = userVaults.reduce((sum, v) => sum + v.interestEarned, 0);
    const activeVaults = userVaults.filter((v) => v.status !== 'withdrawn').length;
    const readyToWithdraw = userVaults.filter((v) => v.status === 'unlocked').length;
    return { totalDeposited, totalInterest, activeVaults, readyToWithdraw };
  }, [userVaults]);

  // Filter and sort vaults
  const filteredVaults = useMemo(() => {
    let result = [...userVaults];

    // Apply filter
    if (activeFilter !== 'all') {
      result = result.filter((v) => v.status === activeFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((v) => v.id.toLowerCase().includes(query));
    }

    // Apply sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'amount-high':
        result.sort((a, b) => b.principal - a.principal);
        break;
      case 'amount-low':
        result.sort((a, b) => a.principal - b.principal);
        break;
      case 'unlock-soon':
        result.sort((a, b) => a.unlockBlock - b.unlockBlock);
        break;
    }

    return result;
  }, [userVaults, activeFilter, sortBy, searchQuery]);

  // Count by status
  const statusCounts = useMemo(() => {
    return {
      all: userVaults.length,
      locked: userVaults.filter((v) => v.status === 'locked').length,
      unlocked: userVaults.filter((v) => v.status === 'unlocked').length,
      withdrawn: userVaults.filter((v) => v.status === 'withdrawn').length,
    };
  }, [userVaults]);

  if (!wallet.isConnected) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">
              Connect Your Wallet
            </h1>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to view and manage your vaults.
            </p>
            <Button
              size="default"
              onClick={connectWallet}
              disabled={isLoading}
              className="gap-2 pulse-glow"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-3 lg:px-5 py-6 lg:py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-1">
              My Vaults
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your STX time-locked vaults
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/create">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Create New Vault
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <StatsGrid>
            <StatCard
              label="Total Deposited"
              value={userStats.totalDeposited}
              suffix="STX"
              icon={Layers}
              delay={0}
            />
            <StatCard
              label="Interest Earned"
              value={userStats.totalInterest}
              suffix="STX"
              icon={TrendingUp}
              delay={0.05}
            />
            <StatCard
              label="Active Vaults"
              value={userStats.activeVaults}
              icon={Clock}
              delay={0.1}
            />
            <StatCard
              label="Ready to Withdraw"
              value={userStats.readyToWithdraw}
              icon={Wallet}
              delay={0.15}
            />
          </StatsGrid>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-5"
        >
          {/* Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                    activeFilter === tab.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {tab.label}
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-background/20 text-xs">
                    {statusCounts[tab.value]}
                  </span>
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search vaults..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="shrink-0 w-9 h-9"
                >
                  {sortBy.includes('high') || sortBy === 'newest' ? (
                    <SortDesc className="w-3.5 h-3.5" />
                  ) : (
                    <SortAsc className="w-3.5 h-3.5" />
                  )}
                </Button>

                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-44 bg-popover border border-border rounded-xl shadow-elevated z-20 overflow-hidden"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortMenu(false);
                          }}
                          className={cn(
                            'w-full px-3 py-2 text-left text-sm transition-colors',
                            sortBy === option.value
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground hover:bg-secondary'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vaults Grid */}
        {filteredVaults.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVaults.map((vault, index) => (
              <VaultCard
                key={vault.id}
                vault={vault}
                currentBlock={stats.currentBlockHeight}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5">No Vaults Found</h3>
            <p className="text-sm text-muted-foreground mb-5">
              {searchQuery
                ? 'No vaults match your search criteria.'
                : activeFilter !== 'all'
                ? `You don't have any ${activeFilter} vaults.`
                : "You haven't created any vaults yet."}
            </p>
            {activeFilter === 'all' && !searchQuery && (
              <Link to="/create">
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Create Your First Vault
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default MyVaultsPage;