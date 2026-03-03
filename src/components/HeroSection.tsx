import { motion } from "framer-motion";
import { Flame, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 pt-20 overflow-hidden">
      {/* Vertical oil drip lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[15, 30, 45, 55, 70, 85].map((left) => (
          <div
            key={left}
            className="absolute top-0 bottom-0 w-px oil-drip"
            style={{ left: `${left}%` }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 border border-gold/30 rounded-full mb-8"
      >
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
          Active Operations
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] tracking-wide max-w-5xl"
      >
        HOLD THE TOKEN
        <br />
        <span className="gradient-gold-text">EARN CRUDE OIL</span>
        <br />
        EVERY 30 MINUTES
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-4 my-10"
      >
        <div className="w-16 h-px bg-border" />
        <Flame className="w-5 h-5 text-gold" />
        <div className="w-16 h-px bg-border" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-muted-foreground text-sm sm:text-base max-w-xl leading-relaxed mb-10"
      >
        Pump.fun creator fees are automatically swapped into oil-backed tokens.
        Rewards accrue every 30 minutes — connect your wallet and claim anytime.
        No staking, no lock-ups.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <a
          href="#"
          className="flex items-center justify-center gap-2 px-8 py-3 gradient-gold rounded font-semibold text-sm tracking-wider uppercase text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Flame className="w-4 h-4" />
          Buy on Pump.fun
          <ArrowRight className="w-4 h-4" />
        </a>
        <a
          href="#dashboard"
          className="flex items-center justify-center gap-2 px-8 py-3 border border-gold/40 rounded font-semibold text-sm tracking-wider uppercase text-gold hover:bg-gold/10 transition-colors"
        >
          View Dashboard
        </a>
      </motion.div>
    </section>
  );
};

export default HeroSection;
