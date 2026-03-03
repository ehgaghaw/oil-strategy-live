import { motion } from "framer-motion";
import { Vault, TrendingUp, Shield, Droplets, BarChart3, Layers, Crown } from "lucide-react";
import MetricCard from "./MetricCard";
import { Skeleton } from "./ui/skeleton";
import { useDashboardData } from "@/hooks/useDashboardData";

const MetricSkeleton = () => (
  <div className="relative bg-oil-light border border-border p-5">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="w-8 h-8 rounded-none bg-oil-sheen" />
      <Skeleton className="w-16 h-5 rounded-none bg-oil-sheen" />
    </div>
    <Skeleton className="w-24 h-3 mb-2 rounded-none bg-oil-sheen" />
    <Skeleton className="w-32 h-7 rounded-none bg-oil-sheen" />
  </div>
);

const LeaderboardSkeleton = () => (
  <div className="space-y-0">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center px-5 py-3.5 border-b border-border">
        <Skeleton className="w-8 h-4 rounded-none bg-oil-sheen" />
        <Skeleton className="w-24 h-4 ml-4 rounded-none bg-oil-sheen" />
        <Skeleton className="w-20 h-4 ml-auto rounded-none bg-oil-sheen" />
      </div>
    ))}
  </div>
);

const truncateAddress = (addr: string) =>
  `${addr.slice(0, 4)}...${addr.slice(-4)}`;

const Dashboard = () => {
  const { data, loading } = useDashboardData();

  const fmt = (n: number, decimals = 0) =>
    n.toLocaleString(undefined, { maximumFractionDigits: decimals });

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
        {loading ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : data ? (
          <>
            <MetricCard
              label="Treasury Value"
              value={`$${fmt(data.treasuryValue)}`}
              change={`${fmt(data.solBalance, 2)} SOL`}
              positive
              icon={Vault}
              delay={0}
            />
            <MetricCard
              label="Net Asset Value"
              value={data.tokenMintConfigured ? `$${fmt(data.nav, 5)}` : "—"}
              change={data.tokenMintConfigured ? undefined : "MINT NOT SET"}
              icon={TrendingUp}
              delay={0.05}
            />
            <MetricCard
              label="Backing Ratio"
              value={data.tokenMintConfigured ? `${fmt(data.backingRatio, 1)}%` : "—"}
              change={data.isOverBacked ? "OVER-BACKED" : undefined}
              positive={data.isOverBacked}
              icon={Shield}
              delay={0.1}
            />
            <MetricCard
              label="Oil Reserves"
              value={`${fmt(data.oilReserves)} bbl`}
              change={`Crude $${fmt(data.wtiPrice, 2)}/bbl`}
              positive
              icon={Droplets}
              delay={0.15}
            />
            <MetricCard
              label="Total Supply"
              value={data.tokenMintConfigured ? fmt(data.circulatingSupply) : "—"}
              icon={Layers}
              delay={0.2}
            />
            <MetricCard
              label="Holders"
              value={data.tokenMintConfigured ? fmt(data.holdersCount) : "—"}
              icon={BarChart3}
              delay={0.25}
            />
          </>
        ) : (
          <>
            <MetricCard label="Treasury Value" value="ERR" icon={Vault} delay={0} />
            <MetricCard label="Net Asset Value" value="ERR" icon={TrendingUp} delay={0.05} />
            <MetricCard label="Backing Ratio" value="ERR" icon={Shield} delay={0.1} />
            <MetricCard label="Oil Reserves" value="ERR" icon={Droplets} delay={0.15} />
            <MetricCard label="Total Supply" value="ERR" icon={Layers} delay={0.2} />
            <MetricCard label="Holders" value="ERR" icon={BarChart3} delay={0.25} />
          </>
        )}
      </div>

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="font-mono text-[10px] text-gold tracking-[0.3em] uppercase block mb-2">
              // TOP HOLDERS
            </span>
            <h3 className="font-display text-2xl font-bold tracking-tight">
              Leaderboard
            </h3>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {loading ? "..." : data ? `${fmt(data.holdersCount)} TOTAL` : "—"}
          </span>
        </div>

        <div className="border border-gold-muted">
          <div className="flex items-center px-5 py-3 bg-oil-sheen border-b border-gold-muted font-mono text-[10px] text-gold-muted tracking-[0.2em] uppercase">
            <span className="w-12">RANK</span>
            <span className="flex-1">ADDRESS</span>
            <span className="text-right">BARRELS</span>
          </div>

          {loading ? (
            <LeaderboardSkeleton />
          ) : data && data.leaderboard.length > 0 ? (
            data.leaderboard.map((holder, i) => {
              const rank = i + 1;
              return (
                <div
                  key={holder.address}
                  className={`flex items-center px-5 py-3.5 border-b border-border hover:bg-oil-sheen/50 transition-colors group ${
                    rank === 1 ? "bg-gold/[0.03]" : ""
                  }`}
                >
                  <span className="w-12 font-mono text-sm">
                    {rank <= 3 ? (
                      <span className="inline-flex items-center gap-1">
                        <Crown className={`w-3 h-3 ${rank === 1 ? "text-gold" : "text-gold-muted"}`} />
                        <span className={rank === 1 ? "text-gold font-bold" : "text-foreground"}>{rank}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{rank}</span>
                    )}
                  </span>
                  <span className="flex-1 font-mono text-sm text-foreground group-hover:text-gold-light transition-colors">
                    {truncateAddress(holder.address)}
                  </span>
                  <span className="font-mono text-sm text-gold tabular-nums">
                    {holder.barrels.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} bbl
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center py-12">
              <span className="font-mono text-xs text-muted-foreground">
                {data?.tokenMintConfigured === false ? "Token mint not configured" : "No holders found"}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default Dashboard;
