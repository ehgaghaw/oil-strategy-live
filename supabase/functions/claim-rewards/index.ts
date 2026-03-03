import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wallet_address, action } = await req.json();

    if (!wallet_address) {
      return new Response(
        JSON.stringify({ error: "wallet_address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === "claim") {
      // Mark all unclaimed rewards as claimed for this wallet
      const { data: unclaimed, error: fetchError } = await supabase
        .from("holder_rewards")
        .select("id, claimable_usdc")
        .eq("wallet_address", wallet_address)
        .eq("claimed", false);

      if (fetchError) throw fetchError;

      if (!unclaimed || unclaimed.length === 0) {
        return new Response(
          JSON.stringify({ success: true, claimed_usdc: 0, message: "No unclaimed rewards" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const totalClaimed = unclaimed.reduce((sum, r) => sum + Number(r.claimable_usdc), 0);
      const ids = unclaimed.map((r) => r.id);

      const { error: updateError } = await supabase
        .from("holder_rewards")
        .update({ claimed: true, claimed_at: new Date().toISOString() })
        .in("id", ids);

      if (updateError) throw updateError;

      // NOTE: In production, this is where you'd trigger an actual USDC transfer
      // from the treasury wallet to the user's wallet via a Solana transaction.
      // For now, we just mark it in the database.

      return new Response(
        JSON.stringify({
          success: true,
          claimed_usdc: totalClaimed,
          rewards_count: unclaimed.length,
          message: `Claimed ${totalClaimed.toFixed(6)} USDC across ${unclaimed.length} epochs`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default: get pending rewards for wallet
    const { data: pending, error: pendingError } = await supabase
      .from("holder_rewards")
      .select("*, epochs(*)")
      .eq("wallet_address", wallet_address)
      .eq("claimed", false)
      .order("created_at", { ascending: false });

    if (pendingError) throw pendingError;

    const totalPending = (pending || []).reduce(
      (sum, r) => sum + Number(r.claimable_usdc),
      0
    );

    // Get claim history
    const { data: history, error: historyError } = await supabase
      .from("holder_rewards")
      .select("claimable_usdc, claimed_at, epochs(epoch_number)")
      .eq("wallet_address", wallet_address)
      .eq("claimed", true)
      .order("claimed_at", { ascending: false })
      .limit(10);

    if (historyError) throw historyError;

    // Get latest epoch info
    const { data: latestEpoch } = await supabase
      .from("epochs")
      .select("*")
      .order("epoch_number", { ascending: false })
      .limit(1)
      .single();

    return new Response(
      JSON.stringify({
        wallet_address,
        pending_usdc: totalPending,
        pending_rewards: pending || [],
        claim_history: history || [],
        latest_epoch: latestEpoch,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in claim-rewards:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
