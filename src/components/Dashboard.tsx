import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Vault, TrendingUp, Shield, Droplets, BarChart3, Layers, Crown } from "lucide-react";
import MetricCard from "./MetricCard";

const MOCK_OPERATORS = [
  { rank: 1, address: "Fm7b...hFyt", reserves: 396635938.34572 },
  { rank: 2, address: "FGp9...cSzE", reserves: 21601792.87938 },
  { rank: 3, address: "3rLB...5tXT", reserves: 20500758.10070 },
  { rank: 4, address: "EJsG...kyT6", reserves: 20488432.64849 },
  { rank: 5, address: "FKUz...zkRW", reserves: 18936929.60448 },
  { rank: 6, address: "474h...agvi", reserves: 18352069.08308 },
  { rank: 7, address: "fJzo...UL6E", reserves: 17760000.00000 },
  { rank: 8, address: "dMoF...CF5A", reserves: 16433879.37872 },
  { rank: 9, address: "3keb...yP2V", reserves: 16396584.82934 },
  { rank: 10, address: "5dbK...JfHS", reserves: 15596254.01528 },
];

const Dashboard = () => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const jitter = (base: number) => base * (1 + Math.sin(tick * 0.3) * 0.002);

  return (
    <section id="dashboard" className="container px-6 py-24">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-8"
      >
        <div>
          <span className="font-mono text-[10px] text-gold tracking-[0.3em] uppercase block mb-2">
            // COMMAND CENTER
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Reserve Analytics
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-gold-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          LIVE
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border mb-16">
        <MetricCard label="Treasury Value" value={`$${jitter(2847293).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} change="+4.2%" positive icon={Vault} delay={0} />
        <MetricCard label="Net Asset Value" value={`$${jitter(0.00847).toFixed(5)}`} change="+1.8%" positive icon={TrendingUp} delay={0.05} />
        <MetricCard label="Backing Ratio" value={`${jitter(112.4).toFixed(1)}%`} change="OVER-BACKED" positive icon={Shield} delay={0.1} />
        <MetricCard label="Oil Reserves" value={`${jitter(41250).toLocaleString(undefined, { maximumFractionDigits: 0 })} bbl`} change="+320 bbl" positive icon={Droplets} delay={0.15} />
        <MetricCard label="Total Supply" value="1,000,000,000" icon={Layers} delay={0.2} />
        <MetricCard label="Holders" value="12,847" change="+238" positive icon={BarChart3} delay={0.25} />
      </div>

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="font-mono text-[10px] text-gold tracking-[0.3em] uppercase block mb-2">
              // TOP OPERATORS
            </span>
            <h3 className="font-display text-2xl font-bold tracking-tight">
              Leaderboard
            </h3>
          </div>
          <span className="font-mono text-xs text-muted-foreground">134 TOTAL</span>
        </div>

        <div className="border border-gold-muted">
          <div className="flex items-center px-5 py-3 bg-oil-sheen border-b border-gold-muted font-mono text-[10px] text-gold-muted tracking-[0.2em] uppercase">
            <span className="w-12">RANK</span>
            <span className="flex-1">ADDRESS</span>
            <span className="text-right">RESERVES</span>
          </div>

          {MOCK_OPERATORS.map((op, i) => (
            <div
              key={op.rank}
              className={`flex items-center px-5 py-3.5 border-b border-border hover:bg-oil-sheen/50 transition-colors group ${
                i === 0 ? "bg-gold/[0.03]" : ""
              }`}
            >
              <span className="w-12 font-mono text-sm">
                {op.rank <= 3 ? (
                  <span className="inline-flex items-center gap-1">
                    <Crown className={`w-3 h-3 ${op.rank === 1 ? "text-gold" : "text-gold-muted"}`} />
                    <span className={op.rank === 1 ? "text-gold font-bold" : "text-foreground"}>{op.rank}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">{op.rank}</span>
                )}
              </span>
              <span className="flex-1 font-mono text-sm text-foreground group-hover:text-gold-light transition-colors">
                {op.address}
              </span>
              <span className="font-mono text-sm text-gold tabular-nums">
                {op.reserves.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Dashboard;
