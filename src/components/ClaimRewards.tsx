import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Wallet, ArrowRight, History, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// WTI price fetched live; fallback
const OIL_PRICE_USD_FALLBACK = 68.5;

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
      if (!solana?.isPhantom) { window.open("https://phantom.app/", "_blank"); return; }
      const resp = await solana.connect();
      setWalletAddress(resp.publicKey.toString());
    } catch (err) { console.error("Wallet connection failed:", err); }
    finally { setConnecting(false); }
  }, []);

  const disconnectWallet = useCallback(() => {
    (window as any).solana?.disconnect();
    setWalletAddress(null); setPendingUsdc(0); setPendingRewards([]); setClaimHistory([]);
  }, []);

  const fetchRewards = useCallback(async (wallet: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("claim-rewards", { body: { wallet_address: wallet } });
      if (error) throw error;
      setPendingUsdc(data.pending_usdc || 0);
      setPendingRewards(data.pending_rewards || []);
      setClaimHistory(data.claim_history || []);
    } catch (err) { console.error("Failed to fetch rewards:", err); }
    finally { setLoading(false); }
  }, []);

  const claimRewards = useCallback(async () => {
    if (!walletAddress || pendingUsdc <= 0) return;
    setClaiming(true); setClaimResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("claim-rewards", { body: { wallet_address: walletAddress, action: "claim" } });
      if (error) throw error;
      setClaimResult(data.message);
      await fetchRewards(walletAddress);
    } catch (err) { console.error("Claim failed:", err); setClaimResult("Claim failed. Please try again."); }
    finally { setClaiming(false); }
  }, [walletAddress, pendingUsdc, fetchRewards]);

  useEffect(() => { if (walletAddress) fetchRewards(walletAddress); }, [walletAddress, fetchRewards]);

  const barrelsEquivalent = pendingUsdc / OIL_PRICE_USD_FALLBACK;

  return (
    <section className="container px-6 py-24">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-8">
        <span className="font-display text-[11px] text-gold tracking-[0.3em] uppercase block mb-2 font-light italic">
          BUYBACK &amp; REDISTRIBUTE
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Claim Your $SOR
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {!walletAddress ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-oil-light border border-gold-muted p-10 flex flex-col items-center text-center h-full justify-center">
              <div className="w-16 h-16 bg-oil-sheen border border-gold-muted flex items-center justify-center mb-6">
                <Lock className="w-7 h-7 text-gold-muted" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 tracking-tight">Access Required</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                Connect your Solana wallet to view and claim your $SOR rewards.
              </p>
              <button onClick={connectWallet} disabled={connecting}
                className="w-full max-w-xs flex items-center justify-center gap-2 px-6 py-3.5 gradient-gold text-primary-foreground font-display text-sm font-semibold tracking-wide hover:brightness-110 transition-all disabled:opacity-50">
                <Wallet className="w-4 h-4" />
                {connecting ? "CONNECTING..." : "CONNECT OPERATIONS"}
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="bg-oil-light border border-border p-4 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-gold-muted tracking-[0.2em] uppercase block">CONNECTED</span>
                  <span className="font-mono text-sm text-foreground">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                </div>
                <button onClick={disconnectWallet} className="font-mono text-xs text-gold-muted hover:text-gold transition-colors border border-border px-3 py-1">
                  DISCONNECT
                </button>
              </div>

              <div className="bg-oil-light border border-gold/20 p-8 text-center glow-gold">
                {loading ? (
                  <div className="font-mono text-sm text-muted-foreground animate-pulse">Loading reserves...</div>
                ) : (
                  <>
                    <span className="font-mono text-[10px] text-gold-muted tracking-[0.2em] uppercase block mb-3">CLAIMABLE $SOR</span>
                    <div className="font-mono text-4xl font-bold text-gold mb-1">{pendingUsdc.toFixed(6)} SOR</div>
                    <div className="font-mono text-xs text-muted-foreground">≈ {barrelsEquivalent.toFixed(4)} barrels crude equivalent</div>
                    <button onClick={claimRewards} disabled={claiming || pendingUsdc <= 0}
                      className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-3.5 gradient-gold text-primary-foreground font-display text-sm font-semibold tracking-wide hover:brightness-110 transition-all disabled:opacity-50">
                      <Droplets className="w-4 h-4" />
                      {claiming ? "CLAIMING..." : "CLAIM $SOR"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              <AnimatePresence>
                {claimResult && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="bg-gold/10 border border-gold/20 p-4 text-center">
                    <p className="font-mono text-sm text-gold">{claimResult}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <div className="bg-oil-light border border-gold-muted">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gold-muted">
            <History className="w-4 h-4 text-gold-muted" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-gold-muted">CLAIM HISTORY</span>
          </div>
          {claimHistory.length > 0 ? (
            <div className="divide-y divide-border">
              {claimHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <span className="font-mono text-xs text-muted-foreground">EPOCH #{h.epochs?.epoch_number ?? "—"}</span>
                  <span className="font-mono text-sm text-gold">+{Number(h.claimable_usdc).toFixed(6)} SOR</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Droplets className="w-8 h-8 text-gold-muted/30 mb-3" />
              <span className="font-mono text-xs text-muted-foreground">
                {walletAddress ? "No claims yet" : "Connect wallet to view history"}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ClaimRewards;
