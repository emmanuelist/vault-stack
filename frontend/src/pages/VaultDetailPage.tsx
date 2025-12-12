import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { CountdownTicker } from '@/components/ui/animated-counter';
import { WithdrawModal } from '@/components/vault/WithdrawModal';
import { useVault } from '@/contexts/VaultContext';
import { useToast } from '@/hooks/use-toast';

const VaultDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getVaultById, stats, withdrawVault, emergencyWithdraw, isLoading } = useVault();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const vault = getVaultById(id || '');

  if (!vault) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-xl font-bold text-foreground mb-3">Vault Not Found</h1>
            <Link to="/vaults">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Vaults
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const progressPercent = Math.min(
    100,
    ((stats.currentBlockHeight - vault.depositBlock) / (vault.unlockBlock - vault.depositBlock)) * 100
  );
  const totalValue = vault.principal + vault.interestEarned;

  const handleWithdrawComplete = async (vaultId: string) => {
    await withdrawVault(vaultId);
    toast({ title: 'Withdrawal Successful!', description: `${totalValue.toLocaleString()} STX sent to your wallet.` });
    setTimeout(() => navigate('/vaults'), 2000);
  };

  const handleEmergencyWithdraw = async () => {
    setIsWithdrawing(true);
    await emergencyWithdraw(vault.id);
    toast({ title: 'Emergency Withdrawal Complete', description: 'A 5% penalty was applied.', variant: 'destructive' });
    setIsWithdrawing(false);
    navigate('/vaults');
  };

  // Transform vault for modal
  const modalVault = vault ? {
    id: vault.id,
    principal: vault.principal,
    interest: vault.interestEarned,
    status: vault.status,
  } : null;

  return (
    <Layout>
      <div className="container mx-auto px-3 lg:px-5 py-6 lg:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <Link to="/vaults" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vaults
          </Link>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-0.5">
                  <span className="font-mono text-foreground">{vault.id}</span>
                  <StatusBadge status={vault.status} />
                </div>
                <p className="text-sm text-muted-foreground">Created {vault.createdAt.toLocaleDateString()}</p>
              </div>
            </div>

            <div className="p-5 border-b border-border">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Principal</p>
                  <p className="font-display text-3xl font-bold text-foreground">{vault.principal.toLocaleString()} STX</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Interest Earned</p>
                  <p className="font-display text-3xl font-bold text-success">+{vault.interestEarned.toLocaleString()} STX</p>
                  <p className="text-sm text-muted-foreground">{vault.interestRate}% APR</p>
                </div>
              </div>
            </div>

            {vault.status === 'locked' && (
              <div className="p-5 border-b border-border">
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Time Remaining</span>
                </div>
                <CountdownTicker targetBlock={vault.unlockBlock} currentBlock={stats.currentBlockHeight} className="justify-center mb-3" />
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1 }} className="h-full progress-gradient rounded-full" />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-1.5">{progressPercent.toFixed(1)}% complete</p>
              </div>
            )}

            <div className="p-5 bg-background-elevated">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground">Total Value</span>
                <span className="text-xl font-display font-bold text-primary">{totalValue.toLocaleString()} STX</span>
              </div>

              {vault.status === 'unlocked' && (
                <Button 
                  className="w-full h-10 gap-1.5" 
                  onClick={() => setShowWithdrawModal(true)} 
                  disabled={isWithdrawing}
                >
                  <Wallet className="w-4 h-4" />
                  Withdraw Now
                </Button>
              )}

              {vault.status === 'locked' && (
                <Button variant="outline" className="w-full h-10 gap-1.5 text-destructive hover:text-destructive" onClick={handleEmergencyWithdraw} disabled={isWithdrawing}>
                  {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                  {isWithdrawing ? 'Processing...' : 'Emergency Withdraw (5% penalty)'}
                </Button>
              )}

              {vault.status === 'withdrawn' && (
                <div className="text-center py-3">
                  <CheckCircle2 className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-sm text-muted-foreground">This vault has been withdrawn</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <WithdrawModal
        vault={modalVault}
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={handleWithdrawComplete}
      />
    </Layout>
  );
};

export default VaultDetailPage;