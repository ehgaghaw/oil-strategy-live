
-- Epochs table: stores each 30-minute reward distribution round
CREATE TABLE public.epochs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  epoch_number INTEGER NOT NULL UNIQUE,
  total_rewards_usdc NUMERIC NOT NULL DEFAULT 0,
  total_supply_snapshot NUMERIC NOT NULL DEFAULT 0,
  holders_count INTEGER NOT NULL DEFAULT 0,
  sol_swapped NUMERIC DEFAULT 0,
  usdc_received NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Holder rewards: per-wallet claimable amounts per epoch
CREATE TABLE public.holder_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  epoch_id UUID NOT NULL REFERENCES public.epochs(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  token_balance NUMERIC NOT NULL DEFAULT 0,
  claimable_usdc NUMERIC NOT NULL DEFAULT 0,
  claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(epoch_id, wallet_address)
);

-- Index for fast wallet lookups
CREATE INDEX idx_holder_rewards_wallet ON public.holder_rewards(wallet_address);
CREATE INDEX idx_holder_rewards_unclaimed ON public.holder_rewards(wallet_address, claimed) WHERE claimed = false;

-- Enable RLS
ALTER TABLE public.epochs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holder_rewards ENABLE ROW LEVEL SECURITY;

-- Epochs are publicly readable (analytics dashboard)
CREATE POLICY "Epochs are publicly readable"
  ON public.epochs FOR SELECT
  USING (true);

-- Holder rewards are publicly readable (users query by wallet address)
CREATE POLICY "Holder rewards are publicly readable"
  ON public.holder_rewards FOR SELECT
  USING (true);

-- Only service role can insert/update (keeper bot + edge functions)
-- No INSERT/UPDATE/DELETE policies for anon — all writes go through service role
