import { motion } from "framer-motion";
import { ArrowUpRight, Zap, ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-32 bg-gradient-to-b from-flame/[0.03] to-transparent animate-scan" />
      </div>

      {/* Status bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex items-center gap-2 px-4 py-2 bg-secondary border border-border mb-12"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
          SYSTEM ONLINE — EPOCH #247 ACTIVE
        </span>
      </motion.div>

      {/* Main heading */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 text-center max-w-4xl"
      >
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight">
          A memecoin
          <br />
          with a{" "}
          <span className="gradient-flame-text">balance sheet</span>
        </h1>
      </motion.div>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative z-10 mt-8 max-w-lg text-center text-muted-foreground text-base leading-relaxed font-display font-light"
      >
        Creator fees flow into a treasury. Every 30 minutes, SOL converts to USDC 
        and distributes pro-rata to every $WTI holder. No staking. No lock-ups.
      </motion.p>

      {/* CTA row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 flex flex-col sm:flex-row gap-3 mt-12"
      >
        <a
          href="#"
          className="group flex items-center gap-2 px-8 py-3.5 bg-flame text-primary-foreground font-display text-sm font-semibold tracking-wide hover:brightness-110 transition-all"
        >
          <Zap className="w-4 h-4" />
          BUY ON PUMP.FUN
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
        <a
          href="#dashboard"
          className="flex items-center justify-center gap-2 px-8 py-3.5 border border-flame/30 text-flame font-display text-sm font-semibold tracking-wide hover:bg-flame/5 transition-colors"
        >
          VIEW ANALYTICS
        </a>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 flex flex-wrap justify-center gap-8 sm:gap-16 mt-20 mb-8"
      >
        {[
          { label: "TREASURY", value: "$2.84M" },
          { label: "HOLDERS", value: "12,847" },
          { label: "BACKING", value: "112.4%" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground">
              {stat.value}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground tracking-[0.2em] mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <span className="font-mono text-[10px] text-muted-foreground tracking-[0.3em]">SCROLL</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground animate-bounce" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
