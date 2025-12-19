import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, LogOut, ExternalLink, Menu, X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVault } from '@/contexts/VaultContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'My Vaults', path: '/vaults' },
  { label: 'Create Vault', path: '/create' },
  { label: 'Activity', path: '/activity' },
  { label: 'Admin', path: '/admin' },
];

export const Header = () => {
  const location = useLocation();
  const { wallet, connectWallet, disconnectWallet, isLoading } = useVault();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (wallet.address) {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-3 lg:px-5">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow"
            >
              <span className="font-display text-lg font-bold text-primary-foreground">V</span>
            </motion.div>
            <span className="font-display text-lg font-semibold text-foreground hidden sm:block">
              Vault Stack
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Wallet & Actions */}
          <div className="flex items-center gap-2">
            {/* Network Badge */}
            {wallet.isConnected && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium text-success capitalize">{wallet.network}</span>
              </motion.div>
            )}

            {/* Wallet Connection */}
            {wallet.isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 bg-secondary/50 border-border hover:bg-secondary"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Wallet className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-xs font-mono text-muted-foreground leading-tight">
                        {truncateAddress(wallet.address!)}
                      </span>
                      <span className="text-xs font-semibold text-foreground leading-tight">
                        {wallet.balance.toLocaleString()} STX
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-0">
                  {/* Wallet Header */}
                  <div className="px-4 py-3 border-b border-border bg-secondary/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <Wallet className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Connected Wallet</p>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                            <span className="text-xs font-medium text-success capitalize">{wallet.network}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Balance Display */}
                    <div className="bg-card rounded-lg p-2.5 mb-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Balance</p>
                      <p className="font-display text-xl font-bold text-foreground">
                        {wallet.balance.toLocaleString()} <span className="text-sm text-muted-foreground">STX</span>
                      </p>
                    </div>

                    {/* Address with Copy */}
                    <div 
                      onClick={copyAddress}
                      className="group bg-card hover:bg-secondary/50 rounded-lg p-2.5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Address</p>
                          <p className="font-mono text-xs text-foreground truncate">
                            {wallet.address}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {copied ? (
                            <div className="flex items-center gap-1 text-success">
                              <Check className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">Copied!</span>
                            </div>
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5">
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer rounded-md py-2.5"
                      onClick={() => {
                        const explorerUrl = wallet.network === 'mainnet' 
                          ? `https://explorer.hiro.so/address/${wallet.address}`
                          : `https://explorer.hiro.so/address/${wallet.address}?chain=testnet`;
                        window.open(explorerUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View on Explorer</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer rounded-md py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={disconnectWallet}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Disconnect Wallet</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="sm"
                  onClick={connectWallet}
                  disabled={isLoading}
                  className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground pulse-glow"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </Button>
              </motion.div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-8 h-8"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <nav className="container mx-auto px-3 py-3 flex flex-col gap-1.5">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};