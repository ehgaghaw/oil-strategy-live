import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Vault, TrendingUp, Shield, Droplets, BarChart3, Layers } from "lucide-react";
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

  // Simulated slight fluctuation
  const jitter = (base: number) => base * (1 + (Math.sin(tick * 0.3) * 0.002));

  return (
    <section id="dashboard" className="container px-4 py-20">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="font-display text-4xl sm:text-5xl tracking-wider">
          COMMAND CENTER
        </h2>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="w-20 h-px bg-border" />
          <Droplets className="w-4 h-4 text-gold" />
          <div className="w-20 h-px bg-border" />
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        <MetricCard
          label="Treasury Value"
          value={`$${jitter(2847293).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          change="+4.2% (24h)"
          positive
          icon={Vault}
          delay={0}
        />
        <MetricCard
          label="Net Asset Value"
          value={`$${jitter(0.00847).toFixed(5)}`}
          change="+1.8% (24h)"
          positive
          icon={TrendingUp}
          delay={0.1}
        />
        <MetricCard
          label="Backing Ratio"
          value={`${jitter(112.4).toFixed(1)}%`}
          change="Over-collateralized"
          positive
          icon={Shield}
          delay={0.2}
        />
        <MetricCard
          label="Oil Reserves (bbl)"
          value={jitter(41250).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          change="+320 bbl (7d)"
          positive
          icon={Droplets}
          delay={0.3}
        />
        <MetricCard
          label="Total Supply"
          value="1,000,000,000"
          icon={Layers}
          delay={0.4}
        />
        <MetricCard
          label="Holders"
          value="12,847"
          change="+238 (7d)"
          positive
          icon={BarChart3}
          delay={0.5}
        />
      </div>

      {/* Top Operators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card border border-border rounded overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold" />
            <span className="font-display text-xl tracking-widest">TOP OPERATORS</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground tracking-wider">
            134 TOTAL
          </span>
        </div>

        <div className="divide-y divide-border">
          {MOCK_OPERATORS.map((op) => (
            <div
              key={op.rank}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-crude-light/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`font-display text-lg w-8 ${
                    op.rank <= 3 ? "text-gold" : "text-muted-foreground"
                  }`}
                >
                  #{op.rank}
                </span>
                <span className="font-mono text-sm text-foreground">{op.address}</span>
              </div>
              <span className="font-mono text-sm text-gold">
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
