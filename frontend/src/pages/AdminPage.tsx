import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVault } from '@/contexts/VaultContext';
import { Shield, Wallet, TrendingUp, AlertTriangle, CheckCircle, Loader2, Database, Activity } from 'lucide-react';
import { toast } from 'sonner';

const AdminPage = () => {
  const { vaults, stats } = useVault();
  const [fundAmount, setFundAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const contractBalance = stats.contractBalance;
  const totalDeposits = stats.totalDeposits;
  const activeVaults = vaults.filter(v => v.status === 'locked' || v.status === 'unlocked').length;
  const requiredReserve = vaults
    .filter(v => v.status === 'locked' || v.status === 'unlocked')
    .reduce((sum, v) => sum + v.principal + v.interestEarned, 0);
  const reserveRatio = requiredReserve > 0 ? (contractBalance / requiredReserve) * 100 : 100;
  const isHealthy = reserveRatio >= 100;

  const handleFundContract = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setIsLoading(true);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    toast.success(`Successfully funded contract with ${fundAmount} STX`);
    setFundAmount('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="min-h-screen py-6 md:py-8">
        <div className="container mx-auto px-3 lg:px-5">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <Shield className="w-7 h-7 text-primary" />
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Admin Panel
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Contract owner controls and system metrics
            </p>
          </motion.div>

          {/* System Health Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-6 p-4 rounded-xl border ${
              isHealthy 
                ? 'bg-primary/5 border-primary/20' 
                : 'bg-warning/5 border-warning/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isHealthy ? (
                <CheckCircle className="w-5 h-5 text-primary" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-warning" />
              )}
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  {isHealthy ? 'System Healthy' : 'Attention Required'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Reserve ratio: {reserveRatio.toFixed(1)}% 
                  {!isHealthy && ' - Contract needs additional funding'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
          >
            <motion.div variants={itemVariants}>
              <StatCard
                label="Contract Balance"
                value={contractBalance}
                suffix=" STX"
                icon={Wallet}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                label="Required Reserve"
                value={requiredReserve}
                suffix=" STX"
                icon={Database}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                label="Total Deposits"
                value={totalDeposits}
                suffix=" STX"
                icon={TrendingUp}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                label="Active Vaults"
                value={activeVaults}
                icon={Activity}
              />
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-5 md:gap-6">
            {/* Fund Contract Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                Fund Contract
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                Add STX to the contract to ensure sufficient reserves for vault payouts.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Amount (STX)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="pr-14 bg-background font-mono h-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      STX
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1.5">
                  {[100, 500, 1000, 5000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setFundAmount(amount.toString())}
                      className="flex-1 h-8"
                    >
                      {amount}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={handleFundContract}
                  disabled={isLoading || !fundAmount}
                  className="w-full bg-primary hover:bg-primary/90 h-10"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Fund Contract'
                  )}
                </Button>
              </div>
            </motion.div>

            {/* System Metrics Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                System Metrics
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Current Block Height</span>
                  <span className="font-mono text-sm text-foreground">{stats.currentBlockHeight.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Total Vaults Created</span>
                  <span className="font-mono text-sm text-foreground">{stats.totalVaults}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Locked Vaults</span>
                  <span className="font-mono text-sm text-foreground">
                    {vaults.filter(v => v.status === 'locked').length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Unlocked Vaults</span>
                  <span className="font-mono text-sm text-foreground">
                    {vaults.filter(v => v.status === 'unlocked').length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Withdrawn Vaults</span>
                  <span className="font-mono text-sm text-foreground">
                    {vaults.filter(v => v.status === 'withdrawn').length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Current APR</span>
                  <span className="font-mono text-sm text-primary">8.5%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-card border border-border rounded-xl p-5"
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">
              Recent Contract Transactions
            </h2>
            
            <div className="space-y-2">
              {[
                { type: 'Fund', amount: 1000, time: '2 hours ago', txId: '0x1a2b...3c4d' },
                { type: 'Withdrawal', amount: 250, time: '5 hours ago', txId: '0x5e6f...7g8h' },
                { type: 'Deposit', amount: 500, time: '1 day ago', txId: '0x9i0j...1k2l' },
              ].map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2.5 px-3 bg-background rounded-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${
                      tx.type === 'Fund' ? 'bg-primary' :
                      tx.type === 'Withdrawal' ? 'bg-warning' : 'bg-accent'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-foreground">
                      {tx.type === 'Withdrawal' ? '-' : '+'}{tx.amount} STX
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{tx.txId}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;