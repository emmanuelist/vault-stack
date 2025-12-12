import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Vault {
  id: string;
  principal: number;
  interest: number;
  status: 'locked' | 'unlocked' | 'withdrawn';
}

interface WithdrawModalProps {
  vault: Vault | null;
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (vaultId: string) => void;
}

export const WithdrawModal = ({ vault, isOpen, onClose, onWithdraw }: WithdrawModalProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#2DD4BF', '#14B8A6', '#F59E0B', '#FBBF24', '#ffffff'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#2DD4BF', '#14B8A6', '#F59E0B', '#FBBF24', '#ffffff'],
      });
    }, 250);
  };

  const handleWithdraw = async () => {
    if (!vault) return;
    
    setIsProcessing(true);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Trigger flip animation
    setIsFlipped(true);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setIsProcessing(false);
    setIsSuccess(true);
    triggerConfetti();
    
    // Call the actual withdraw function
    onWithdraw(vault.id);
  };

  const handleClose = () => {
    setIsFlipped(false);
    setIsProcessing(false);
    setIsSuccess(false);
    onClose();
  };

  if (!vault) return null;

  const totalAmount = vault.principal + vault.interest;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-foreground">
            {isSuccess ? 'Withdrawal Complete!' : 'Withdraw Vault'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4" style={{ perspective: '1000px' }}>
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="front"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                className="relative"
              >
                {/* Card Front */}
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-5">
                  <div className="text-center mb-5">
                    <p className="text-sm text-muted-foreground mb-1.5">Total Withdrawal</p>
                    <p className="font-display text-3xl font-bold text-foreground">
                      {totalAmount.toLocaleString()} <span className="text-lg text-primary">STX</span>
                    </p>
                  </div>

                  <div className="space-y-2.5 mb-5">
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Principal</span>
                      <span className="font-mono text-sm text-foreground">{vault.principal.toLocaleString()} STX</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Interest Earned</span>
                      <span className="font-mono text-sm text-primary">+{vault.interest.toLocaleString()} STX</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleWithdraw}
                    disabled={isProcessing}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Confirm Withdrawal
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-primary" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="font-display text-xl font-bold text-foreground mb-1.5">
                    {totalAmount.toLocaleString()} STX
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Successfully withdrawn to your wallet
                  </p>
                  
                  <Button onClick={handleClose} variant="outline" className="w-full">
                    Close
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};