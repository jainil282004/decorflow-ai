import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Left side: Premium hero panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-[#0a0a0a] p-12 relative overflow-hidden justify-center items-center border-r border-white/5">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/15 animate-gradient-shift"
            style={{ backgroundSize: '300% 300%' }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(176,141,87,0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(110,42,50,0.10),transparent_50%)]" />
        </div>

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-[15%] right-[20%] w-20 h-20 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
          animate={{
            y: [0, -12, 0],
            rotate: [0, 3, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[25%] left-[15%] w-14 h-14 rounded-xl border border-primary/10 bg-primary/[0.03]"
          animate={{
            y: [0, 10, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-[40%] left-[10%] w-8 h-8 rounded-lg border border-white/5 bg-white/[0.02]"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        <div className="relative z-10 text-center max-w-lg">
          {/* Logo */}
          <motion.div
            className="mb-10 flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img src="/logo-mark.png" alt="DecorFlow Logo" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-serif text-white/90 tracking-tight">DecorFlow</span>
          </motion.div>

          <motion.h2
            className="text-4xl lg:text-5xl font-serif leading-[1.1] tracking-tight text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Run every event from one calm command center.
          </motion.h2>
          <motion.p
            className="text-lg text-white/50 font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            Inventory, packing, logistics, quotations, and finance — built for decorators, tent
            houses, and event teams.
          </motion.p>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>

      {/* Right side: Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <img src="/logo-mark.png" alt="DecorFlow Logo" className="h-8 w-8 object-contain" />
            <span className="text-2xl font-serif text-foreground tracking-tight">DecorFlow</span>
          </div>
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};
