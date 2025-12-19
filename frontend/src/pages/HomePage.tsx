import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Lock,
  Clock,
  TrendingUp,
  ArrowRight,
  Shield,
  Zap,
  Layers,
  ChevronRight,
  Blocks,
  Coins,
  Users,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { StatCard, StatsGrid } from '@/components/ui/stat-card';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { ParticlesBackground, FloatingOrbs, ParallaxLayer } from '@/components/ui/particles-background';
import { useVault } from '@/contexts/VaultContext';

const howItWorksSteps = [
  {
    icon: Wallet,
    title: 'Connect Wallet',
    description: 'Connect your Hiro or Leather wallet to access the Stacks blockchain.',
  },
  {
    icon: Lock,
    title: 'Create a Vault',
    description: 'Deposit STX and choose your lock duration. Longer locks earn higher interest.',
  },
  {
    icon: Clock,
    title: 'Wait for Unlock',
    description: 'Your STX is secured on-chain. Track your vault\'s progress in real-time.',
  },
  {
    icon: TrendingUp,
    title: 'Claim Rewards',
    description: 'Withdraw your principal plus earned interest when the lock period ends.',
  },
];

const features = [
  {
    icon: Shield,
    title: 'Smart Contract Security',
    description: 'Fully audited Clarity smart contracts on Stacks blockchain.',
  },
  {
    icon: Zap,
    title: 'Instant Withdrawals',
    description: 'Claim your funds immediately when your vault unlocks.',
  },
  {
    icon: Layers,
    title: 'Flexible Durations',
    description: 'Choose from 7 days to 1 year+ lock periods.',
  },
];

const HomePage = () => {
  const { stats, activities, wallet, connectWallet, isLoading } = useVault();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const { scrollY } = useScroll();
  
  // Parallax transforms
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const gridY = useTransform(scrollY, [0, 500], [0, 100]);
  const badgeY = useTransform(scrollY, [0, 300], [0, -30]);
  const headlineY = useTransform(scrollY, [0, 400], [0, 50]);
  const subtitleY = useTransform(scrollY, [0, 400], [0, 70]);
  const ctaY = useTransform(scrollY, [0, 400], [0, 90]);
  const statsY = useTransform(scrollY, [0, 500], [0, 120]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] sm:min-h-[85vh] md:min-h-[80vh] flex items-center overflow-hidden pt-16 sm:pt-0">
        {/* Animated Particles Background */}
        <ParticlesBackground particleCount={60} />
        
        {/* Floating Orbs */}
        <FloatingOrbs />
        
        {/* Background Grid with Parallax */}
        <motion.div 
          style={{ y: gridY }}
          className="absolute inset-0 bg-grid opacity-30" 
        />
        
        {/* Spotlight with Parallax */}
        <ParallaxLayer speed={-0.2} className="absolute inset-0">
          <div className="absolute inset-0 spotlight" />
        </ParallaxLayer>
        
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />

        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center px-2 sm:px-4">
            {/* Badge with Parallax */}
            <motion.div
              style={{ y: badgeY }}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-3 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6 backdrop-blur-sm touch-manipulation"
            >
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-success" 
              />
              <span className="text-sm text-primary font-medium">Live on Stacks Mainnet</span>
            </motion.div>

            {/* Main Headline with Parallax */}
            <motion.div style={{ y: headlineY }}>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-5 leading-tight px-2"
              >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Secure Your STX.
                </motion.span>{' '}
                <motion.span 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-gradient-primary inline-block"
                >
                  Earn Interest.
                </motion.span>
              </motion.h1>
            </motion.div>

            {/* Subtitle with Parallax */}
            <motion.div style={{ y: subtitleY }}>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2 leading-relaxed"
              >
                Time-locked vaults powered by smart contracts on the Stacks blockchain. 
                Deposit your STX, set a lock duration, and earn guaranteed interest.
              </motion.p>
            </motion.div>

            {/* CTA Buttons with Parallax */}
            <motion.div
              style={{ y: ctaY }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto px-4 sm:px-0"
            >
              {wallet.isConnected ? (
                <Link to="/create">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="gap-2 px-8 pulse-glow w-full sm:w-auto min-h-[48px] touch-manipulation text-base">
                      Create Vault
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </Link>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="default"
                    onClick={connectWallet}
                    disabled={isLoading}
                    className="gap-2 px-8 pulse-glow w-full sm:w-auto min-h-[48px] touch-manipulation text-base"
                  >
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </Button>
                </motion.div>
              )}
              <Link to="/vaults">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="lg" className="gap-2 px-8 backdrop-blur-sm bg-background/50 w-full sm:w-auto min-h-[48px] touch-manipulation text-base">
                    View All Vaults
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Live Stats Ticker with Parallax */}
            <motion.div
              style={{ y: statsY }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-3xl mx-auto px-2"
            >
              {[
                { value: stats.totalDeposits, label: 'Total Deposits (STX)', color: 'text-primary' },
                { value: stats.totalVaults, label: 'Active Vaults', color: 'text-foreground' },
                { value: stats.interestRate, label: 'Current APR', color: 'text-success', suffix: '%', decimals: 1 },
                { value: stats.currentBlockHeight, label: 'Block Height', color: 'text-accent' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-background/30 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors touch-manipulation"
                >
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    className={`text-lg sm:text-xl md:text-2xl font-display font-bold ${stat.color}`}
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-tight">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-xs text-muted-foreground">Scroll to explore</span>
            <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-primary"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>


      {/* How It Works Section */}
      <section id="how-it-works" className="py-8 sm:py-12 md:py-16 lg:py-20 relative">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-8 md:mb-10 px-4"
          >
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
              How It Works
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Create a time-locked vault in four simple steps
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
                className="relative group"
              >
                {/* Connection line (not on last item) */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-primary/50 to-transparent z-0" />
                )}

                <div className="relative bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-5 h-full transition-all duration-300 hover:border-primary/50 hover:shadow-glow touch-manipulation">
                  {/* Step number */}
                  <div className="absolute -top-2.5 -left-2.5 w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <motion.div
                    animate={{ scale: hoveredStep === index ? 1.1 : 1 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mb-3"
                  >
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </motion.div>

                  <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1.5">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-background-elevated relative">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-8 px-4"
          >
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-3">
              Platform Statistics
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Real-time metrics from the Vault Stack contract</p>
          </motion.div>

          <StatsGrid>
            <StatCard
              label="Total Deposits"
              value={stats.totalDeposits}
              suffix="STX"
              icon={Coins}
              trend={{ value: 12.5, isPositive: true }}
              delay={0}
            />
            <StatCard
              label="Total Vaults"
              value={stats.totalVaults}
              icon={Layers}
              trend={{ value: 8.2, isPositive: true }}
              delay={0.1}
            />
            <StatCard
              label="Contract Balance"
              value={stats.contractBalance}
              suffix="STX"
              icon={Shield}
              delay={0.2}
            />
            <StatCard
              label="Current Block"
              value={stats.currentBlockHeight}
              icon={Blocks}
              delay={0.3}
            />
          </StatsGrid>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-5">
                Built for Security.{' '}
                <span className="text-gradient-accent">Designed for Trust.</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6 leading-relaxed">
                Vault Stack leverages the security of the Stacks blockchain and Bitcoin's finality 
                to provide trustless, time-locked vaults for your STX tokens.
              </p>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-foreground mb-0.5">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mt-8 lg:mt-0"
            >
              {/* Mock vault card visualization */}
              <div className="relative bg-card border border-border rounded-xl p-4 sm:p-5 shadow-elevated">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-foreground">Your Vault</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">vault-001</p>
                      </div>
                    </div>
                    <span className="badge-locked px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs">Locked</span>
                  </div>

                  <div className="mb-4 sm:mb-5">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Deposited</p>
                    <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">5,000 STX</p>
                    <p className="text-xs sm:text-sm text-success mt-0.5">+142.50 STX earned</p>
                  </div>

                  <div className="mb-4 sm:mb-5">
                    <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mb-1.5">
                      <span>Progress</span>
                      <span>67%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '67%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="h-full progress-gradient rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Unlock in</span>
                    <span className="font-mono text-primary font-semibold">30d 12h 45m</span>
                  </div>
                </div>
              </div>

              {/* Floating decorative elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent/20 rounded-full blur-3xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-background-elevated relative">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8 px-4 sm:px-0 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-1.5">
                Recent Activity
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Latest transactions on the platform</p>
            </motion.div>
            <Link to="/activity">
              <Button variant="outline" size="sm" className="gap-1.5 min-h-[40px] touch-manipulation w-full md:w-auto">
                View All Activity
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <ActivityFeed activities={activities} limit={5} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 spotlight-accent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-5">
              Ready to Start Earning?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Create your first vault today and start earning interest on your STX tokens. 
              No minimum deposit required.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 px-4 sm:px-0">
              {wallet.isConnected ? (
                <Link to="/create" className="w-full sm:w-auto">
                  <Button size="lg" className="gap-2 px-8 pulse-glow w-full min-h-[48px] touch-manipulation text-base">
                    Create Your Vault
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  onClick={connectWallet}
                  disabled={isLoading}
                  className="gap-2 px-8 pulse-glow w-full sm:w-auto min-h-[48px] touch-manipulation text-base"
                >
                  <Wallet className="w-4 h-4" />
                  Get Started
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;