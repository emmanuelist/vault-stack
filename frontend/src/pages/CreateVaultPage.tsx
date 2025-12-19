import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/layout/Layout';
import { useVault } from '@/contexts/VaultContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const durationPresets = [
  { label: '7 Days', blocks: 1008, days: 7 },
  { label: '30 Days', blocks: 4320, days: 30 },
  { label: '90 Days', blocks: 12960, days: 90 },
  { label: '1 Year', blocks: 52560, days: 365 },
];

const CreateVaultPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { wallet, stats, createVault, connectWallet, isLoading } = useVault();

  const [amount, setAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1); // Default to 30 days
  const [customDays, setCustomDays] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdVaultId, setCreatedVaultId] = useState<string | null>(null);

  const durationBlocks = useMemo(() => {
    if (selectedPreset !== null) {
      return durationPresets[selectedPreset].blocks;
    }
    const days = parseInt(customDays) || 0;
    return Math.round(days * 144); // ~144 blocks per day
  }, [selectedPreset, customDays]);

  const durationDays = useMemo(() => {
    if (selectedPreset !== null) {
      return durationPresets[selectedPreset].days;
    }
    return parseInt(customDays) || 0;
  }, [selectedPreset, customDays]);

  const estimatedInterest = useMemo(() => {
    const principal = parseFloat(amount) || 0;
    const apr = stats.interestRate / 100;
    const yearFraction = durationDays / 365;
    return principal * apr * yearFraction;
  }, [amount, durationDays, stats.interestRate]);

  const unlockDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + durationDays);
    return date;
  }, [durationDays]);

  const unlockBlock = stats.currentBlockHeight + durationBlocks;

  const isValidAmount = parseFloat(amount) > 0 && parseFloat(amount) <= wallet.balance;
  const isValidDuration = durationBlocks >= 1008; // Minimum 7 days (1008 blocks)
  const minDurationDays = 7;
  const canCreateVault = wallet.isConnected && isValidAmount && isValidDuration;

  const handleMaxClick = () => {
    setAmount(wallet.balance.toString());
  };

  const handlePresetClick = (index: number) => {
    setSelectedPreset(index);
    setCustomDays('');
  };

  const handleCustomDaysChange = (value: string) => {
    setCustomDays(value);
    setSelectedPreset(null);
  };

  const handleCreateVault = async () => {
    if (!canCreateVault) return;

    setIsCreating(true);
    try {
      // Pass durationBlocks to contract (contract expects blocks, not seconds)
      const vault = await createVault(parseFloat(amount), durationBlocks);
      setCreatedVaultId(vault.id);
      setShowReview(false);
      setShowSuccess(true);
      toast({
        title: 'Vault Created Successfully!',
        description: `Your vault ${vault.id} has been created.`,
      });
    } catch (error) {
      // Show the actual error message from validation or contract
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred. Please try again.';
      toast({
        title: 'Error Creating Vault',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Vault creation error:', error);
    } finally {
      setIsCreating(false);
    }
  };

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
              Connect your wallet to create a new vault.
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

  if (showSuccess) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle2 className="w-10 h-10 text-success" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">
              Vault Created!
            </h1>
            <p className="text-muted-foreground mb-1.5">
              Your STX has been locked successfully.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Vault ID: <span className="font-mono text-primary">{createdVaultId}</span>
            </p>

            <div className="bg-card border border-border rounded-xl p-5 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount Locked</span>
                  <span className="font-semibold text-foreground">
                    {parseFloat(amount).toLocaleString()} STX
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lock Duration</span>
                  <span className="font-semibold text-foreground">{durationDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expected Interest</span>
                  <span className="font-semibold text-success">
                    +{estimatedInterest.toFixed(2)} STX
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unlock Date</span>
                  <span className="font-semibold text-foreground">
                    {unlockDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="sm" onClick={() => navigate(`/vault/${createdVaultId}`)} className="gap-1.5">
                View Vault
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/vaults')}>
                Go to My Vaults
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-3 lg:px-5 py-6 lg:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-1.5">
              Create a Vault
            </h1>
            <p className="text-sm text-muted-foreground">
              Lock your STX and earn interest over time
            </p>
          </motion.div>

          {/* Main Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            {/* Amount Section */}
            <div className="p-5 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-medium">Amount to Lock</Label>
                <span className="text-sm text-muted-foreground">
                  Balance:{' '}
                  <span className="font-mono text-foreground">
                    {wallet.balance.toLocaleString()} STX
                  </span>
                </span>
              </div>

              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-xl font-mono h-12 pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxClick}
                    className="text-primary hover:text-primary h-7 px-2"
                  >
                    MAX
                  </Button>
                  <span className="text-muted-foreground font-medium text-sm">STX</span>
                </div>
              </div>

              {parseFloat(amount) > wallet.balance && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive mt-1.5 flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Insufficient balance
                </motion.p>
              )}
            </div>

            {/* Duration Section */}
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-1.5 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label className="font-medium">Lock Duration</Label>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {durationPresets.map((preset, index) => (
                  <motion.button
                    key={preset.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePresetClick(index)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                      selectedPreset === index
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-secondary-foreground border-border hover:border-primary/50'
                    )}
                  >
                    {preset.label}
                  </motion.button>
                ))}
              </div>

              {/* Custom Duration */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">or</span>
                <div className="relative flex-1">
                  <Input
                    type="number"
                    placeholder="Custom days"
                    value={customDays}
                    onChange={(e) => handleCustomDaysChange(e.target.value)}
                    className="pr-14 h-9"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    days
                  </span>
                </div>
              </div>

              {/* Block Info */}
              {durationBlocks > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Info className="w-3.5 h-3.5" />
                  <span>
                    ≈ {durationBlocks.toLocaleString()} blocks (unlock at block{' '}
                    <span className="font-mono text-foreground">{unlockBlock.toLocaleString()}</span>)
                  </span>
                </div>
              )}

              {/* Validation Warning for Duration */}
              {durationDays > 0 && durationDays < minDurationDays && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Minimum Duration Required</p>
                      <p className="text-xs text-destructive/80 mt-0.5">
                        Vaults must be locked for at least {minDurationDays} days. You selected {durationDays} day{durationDays !== 1 ? 's' : ''}.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Interest Preview */}
            <div className="p-5 bg-background-elevated">
              <div className="flex items-center gap-1.5 mb-3">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="font-medium text-sm">Estimated Returns</span>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Interest Rate</p>
                  <p className="text-xl font-display font-bold text-success">
                    {stats.interestRate}% APR
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Estimated Interest</p>
                  <p className="text-xl font-display font-bold text-foreground">
                    +{estimatedInterest.toFixed(2)} STX
                  </p>
                </div>
              </div>

              {isValidAmount && isValidDuration && (
                <div className="mt-3 p-3 bg-card rounded-lg border border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total at Unlock</span>
                    <span className="text-lg font-display font-bold text-primary">
                      {(parseFloat(amount) + estimatedInterest).toFixed(2)} STX
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-sm text-muted-foreground">Unlock Date</span>
                    <span className="font-medium text-sm text-foreground">
                      {unlockDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="p-5">
              <Button
                className="w-full h-10 gap-1.5"
                disabled={!canCreateVault || isCreating}
                onClick={() => setShowReview(true)}
              >
                Review Vault
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 p-3 bg-primary/5 border border-primary/20 rounded-lg"
          >
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="mb-1.5">
                  <strong className="text-foreground">Time-locked vaults</strong> ensure your STX
                  remains secure until the unlock block is reached.
                </p>
                <p>
                  Early withdrawal is possible but incurs a 5% penalty on your principal.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => !isCreating && setShowReview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card border border-border rounded-xl shadow-elevated overflow-hidden"
            >
              <div className="p-5 border-b border-border">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Review Your Vault
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Please confirm the details below
                </p>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex justify-between py-2.5 border-b border-border">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-semibold font-mono text-foreground">
                    {parseFloat(amount).toLocaleString()} STX
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-border">
                  <span className="text-sm text-muted-foreground">Lock Duration</span>
                  <span className="font-semibold text-foreground">
                    {durationDays} days ({durationBlocks.toLocaleString()} blocks)
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-border">
                  <span className="text-sm text-muted-foreground">Interest Rate</span>
                  <span className="font-semibold text-success">{stats.interestRate}% APR</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-border">
                  <span className="text-sm text-muted-foreground">Expected Interest</span>
                  <span className="font-semibold text-success">
                    +{estimatedInterest.toFixed(2)} STX
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-border">
                  <span className="text-sm text-muted-foreground">Unlock Block</span>
                  <span className="font-semibold font-mono text-foreground">
                    {unlockBlock.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-sm text-muted-foreground">Unlock Date</span>
                  <span className="font-semibold text-foreground">
                    {unlockDate.toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-3 bg-primary/5 rounded-lg p-3 -mx-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Total at Unlock</span>
                    <span className="text-xl font-display font-bold text-primary">
                      {(parseFloat(amount) + estimatedInterest).toFixed(2)} STX
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-background-elevated flex gap-2.5">
                <Button
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => setShowReview(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-10 gap-1.5"
                  onClick={handleCreateVault}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Vault
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default CreateVaultPage;