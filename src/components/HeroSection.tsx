import { motion } from "framer-motion";
import { ArrowUpRight, Droplets, ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
      {/* Oil texture background */}
      <div className="absolute inset-0 oil-texture pointer-events-none" />

      {/* Oil drip lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[12, 28, 44, 62, 78, 90].map((left, i) => (
          <div
            key={left}
            className="absolute top-0 w-px h-full oil-drip opacity-30"
            style={{
              left: `${left}%`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-oil opacity-20 pointer-events-none" />

      {/* Status badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex items-center gap-2 px-4 py-2 bg-oil-light border border-gold-muted mb-12"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
        </span>
        <span className="font-mono text-xs text-gold-muted tracking-widest uppercase">
          ACTIVE OPERATIONS
        </span>
      </motion.div>

      {/* Main heading */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative z-10 text-center max-w-5xl"
      >
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-bold leading-[1.05] tracking-tight text-foreground">
          HOLD THE TOKEN
          <br />
          <span className="gradient-gold-text">EARN CRUDE OIL</span>
          <br />
          EVERY 15 MINUTES
        </h1>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 flex items-center gap-4 my-10"
      >
        <div className="w-16 h-px bg-gold-muted" />
        <Droplets className="w-5 h-5 text-gold" />
        <div className="w-16 h-px bg-gold-muted" />
      </motion.div>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 max-w-lg text-center text-muted-foreground text-base leading-relaxed font-display font-light"
      >
        Pump.fun creator fees are automatically swapped into oil-backed tokens.
        Rewards accrue every 15 minutes — connect your wallet and claim anytime.
        No staking, no lock-ups.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 flex flex-col sm:flex-row gap-3 mt-12"
      >
        <a
          href="#"
          className="group flex items-center gap-2 px-8 py-3.5 gradient-gold text-primary-foreground font-display text-sm font-semibold tracking-wide hover:brightness-110 transition-all"
        >
          <Droplets className="w-4 h-4" />
          BUY ON PUMP.FUN
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
        <a
          href="#dashboard"
          className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gold/30 text-gold font-display text-sm font-semibold tracking-wide hover:bg-gold/5 transition-colors"
        >
          CLAIM REWARDS
        </a>
      </motion.div>

      {/* Scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <span className="font-mono text-[10px] text-gold-muted tracking-[0.3em]">SCROLL</span>
        <ChevronDown className="w-4 h-4 text-gold-muted animate-bounce" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
