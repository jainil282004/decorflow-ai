import { Outlet } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

export const AuthLayout = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

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

        {/* Floating decorative elements with depth */}
        <motion.div
          className="absolute top-[15%] right-[20%] w-24 h-24 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.2)] z-30"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 4, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[25%] left-[15%] w-16 h-16 rounded-xl border border-primary/20 bg-primary/[0.04] backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.15)] z-20"
          animate={{
            y: [0, 12, 0],
            rotate: [0, -6, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-[40%] left-[10%] w-10 h-10 rounded-lg border border-white/5 bg-white/[0.02] backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.1)] z-10"
          animate={{
            y: [0, -6, 0],
            rotate: [0, 2, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        <div className="relative z-10 text-center max-w-lg">
          {/* Logo with continuous floating animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className="mb-10 flex items-center justify-center gap-3"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src="/logo-mark.png"
                alt="DecorFlow Logo"
                className="h-10 w-10 object-contain drop-shadow-md"
              />
              <span className="text-2xl font-serif text-white/90 tracking-tight">DecorFlow</span>
            </motion.div>
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

      {/* Right side: Form Container with 3D Mouse Tracking */}
      <div
        className="flex-1 flex items-center justify-center p-6 lg:p-12 relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            rotateX: rotateXSpring,
            rotateY: rotateYSpring,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Mobile Logo with float */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <motion.img
              src="/logo-mark.png"
              alt="DecorFlow Logo"
              className="h-8 w-8 object-contain drop-shadow-sm"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-2xl font-serif text-foreground tracking-tight">DecorFlow</span>
          </div>

          {/* Subtle gradient border wrapper for the glass panel */}
          <div
            className="relative rounded-2xl p-[1px] bg-gradient-to-b from-primary/10 via-border/40 to-transparent shadow-[0_20px_40px_-15px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.03)]"
            style={{ transform: 'translateZ(20px)' }}
          >
            <div className="bg-card/95 backdrop-blur-xl rounded-2xl p-6 lg:p-10 relative overflow-hidden h-full w-full">
              {/* Inner soft highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none opacity-20 dark:from-white/10" />
              <div className="relative z-10">
                <Outlet />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
