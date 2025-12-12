import { motion } from 'framer-motion';
import { Github, Twitter, FileText, ExternalLink } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Create Vault', href: '/create' },
    { label: 'My Vaults', href: '/vaults' },
    { label: 'Activity', href: '/activity' },
  ],
  resources: [
    { label: 'Documentation', href: '#', external: true },
    { label: 'Smart Contract', href: '#', external: true },
    { label: 'Security Audit', href: '#', external: true },
    { label: 'API Reference', href: '#', external: true },
  ],
  community: [
    { label: 'Discord', href: '#', external: true },
    { label: 'Twitter', href: '#', external: true },
    { label: 'GitHub', href: '#', external: true },
    { label: 'Blog', href: '#', external: true },
  ],
};

export const Footer = () => {
  return (
    <footer className="relative border-t border-border bg-background-elevated">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="container mx-auto px-3 lg:px-5 relative">
        {/* Main Footer Content */}
        <div className="py-8 lg:py-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2.5 mb-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow">
                <span className="font-display text-lg font-bold text-primary-foreground">V</span>
              </div>
              <span className="font-display text-lg font-semibold text-foreground">
                Vault Stack
              </span>
            </motion.div>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Secure time-locked vaults for your STX tokens. Earn interest while your assets are
              protected by smart contracts.
            </p>
            <div className="flex items-center gap-2">
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="#"
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="#"
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="#"
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
              </motion.a>
            </div>
          </div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-semibold text-foreground mb-3 text-sm">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-semibold text-foreground mb-3 text-sm">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    {link.external && <ExternalLink className="w-2.5 h-2.5" />}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Community Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-semibold text-foreground mb-3 text-sm">Community</h4>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    {link.external && <ExternalLink className="w-2.5 h-2.5" />}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contract Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h4 className="font-semibold text-foreground mb-3 text-sm">Contract</h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Contract Address</p>
                <code className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  SP2J6Z...V9EJ7
                </code>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Network</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-sm text-foreground">Stacks Mainnet</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="py-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Vault Stack. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};