import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Wallet, ArrowRight, History, Droplets } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// WTI crude oil spot price approximation (USD per barrel)
const OIL_PRICE_USD = 68.5;

interface PendingReward {
  id: string;
  claimable_usdc: number;
  epoch_id: string;
  epochs: { epoch_number: number } | null;
}

interface ClaimHistory {
  claimable_usdc: number;
  claimed_at: string;
  epochs: { epoch_number: number } | null;
}

const ClaimRewards = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [pendingUsdc, setPendingUsdc] = useState(0);
  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([]);
  const [claimHistory, setClaimHistory] = useState<ClaimHistory[]>([]);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    try {
      const solana = (window as any).solana;
      if (!solana?.isPhantom) {
        window.open("https://phantom.app/", "_blank");
        return;
      }
      const resp = await solana.connect();
      setWalletAddress(resp.publicKey.toString());
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    const solana = (window as any).solana;
    solana?.disconnect();
    setWalletAddress(null);
    setPendingUsdc(0);
    setPendingRewards([]);
    setClaimHistory([]);
  }, []);

  const fetchRewards = useCallback(async (wallet: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("claim-rewards", {
        body: { wallet_address: wallet },
      });

      if (error) throw error;

      setPendingUsdc(data.pending_usdc || 0);
      setPendingRewards(data.pending_rewards || []);
      setClaimHistory(data.claim_history || []);
    } catch (err) {
      console.error("Failed to fetch rewards:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const claimRewards = useCallback(async () => {
    if (!walletAddress || pendingUsdc <= 0) return;
    setClaiming(true);
    setClaimResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("claim-rewards", {
        body: { wallet_address: walletAddress, action: "claim" },
      });

      if (error) throw error;

      setClaimResult(data.message);
      // Refresh
      await fetchRewards(walletAddress);
    } catch (err) {
      console.error("Claim failed:", err);
      setClaimResult("Claim failed. Please try again.");
    } finally {
      setClaiming(false);
    }
  }, [walletAddress, pendingUsdc, fetchRewards]);

  useEffect(() => {
    if (walletAddress) {
      fetchRewards(walletAddress);
    }
  }, [walletAddress, fetchRewards]);

  const barrelsEquivalent = pendingUsdc / OIL_PRICE_USD;

  return (
    <section className="container px-4 py-16">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="font-display text-4xl sm:text-5xl tracking-wider">
          CLAIM REWARDS
        </h2>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="w-20 h-px bg-border" />
          <Droplets className="w-4 h-4 text-gold" />
          <div className="w-20 h-px bg-border" />
        </div>
      </motion.div>

      <div className="max-w-lg mx-auto">
        {!walletAddress ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Flame className="w-8 h-8 text-gold" />
            </div>
            <h3 className="font-display text-2xl tracking-wider mb-2">
              ACCESS REQUIRED
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Connect your Solana wallet to view and claim your crude oil reserves.
            </p>
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 gradient-gold rounded font-semibold text-sm tracking-wider uppercase text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              {connecting ? "Connecting..." : "Connect Operations"}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Connected wallet */}
            <div className="bg-card border border-border rounded p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase block">
                  Connected Wallet
                </span>
                <span className="font-mono text-sm text-foreground">
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </span>
              </div>
              <button
                onClick={disconnectWallet}
                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                Disconnect
              </button>
            </div>

            {/* Pending rewards */}
            <div className="bg-card border border-gold/30 rounded p-6 text-center glow-gold">
              {loading ? (
                <div className="animate-pulse text-muted-foreground font-mono text-sm">
                  Loading reserves...
                </div>
              ) : (
                <>
                  <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase block mb-2">
                    Pending Rewards
                  </span>
                  <div className="font-mono text-3xl font-bold text-gold mb-1">
                    ${pendingUsdc.toFixed(6)}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    ≈ {barrelsEquivalent.toFixed(6)} barrels of crude oil
                  </div>

                  <button
                    onClick={claimRewards}
                    disabled={claiming || pendingUsdc <= 0}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 gradient-gold rounded font-semibold text-sm tracking-wider uppercase text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Flame className="w-4 h-4" />
                    {claiming ? "Claiming..." : "Claim Rewards"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Claim result */}
            <AnimatePresence>
              {claimResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-secondary border border-border rounded p-4 text-center"
                >
                  <p className="text-sm font-mono text-foreground">{claimResult}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Claim history */}
            {claimHistory.length > 0 && (
              <div className="bg-card border border-border rounded overflow-hidden">
                <div className="flex items-center gap-2 p-4 border-b border-border">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-mono tracking-wider uppercase text-muted-foreground">
                    Claim History
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {claimHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs font-mono text-muted-foreground">
                        Epoch #{h.epochs?.epoch_number ?? "?"}
                      </span>
                      <span className="text-sm font-mono text-gold">
                        +${Number(h.claimable_usdc).toFixed(6)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ClaimRewards;
