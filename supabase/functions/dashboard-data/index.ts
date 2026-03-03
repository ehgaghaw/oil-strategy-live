import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const HELIUS_API_KEY = Deno.env.get("HELIUS_API_KEY");
  const TWELVE_DATA_API_KEY = Deno.env.get("TWELVE_DATA_API_KEY");

  if (!HELIUS_API_KEY) throw new Error("HELIUS_API_KEY not configured");
  if (!TWELVE_DATA_API_KEY) throw new Error("TWELVE_DATA_API_KEY not configured");

  const TREASURY_WALLET = "AN1CLgdCYnygqGCCiARUpn8xU1NG3uNym4DFhDowZ6dw";
  // TODO: Replace with actual pump.fun mint address
  const TOKEN_MINT = "PLACEHOLDER_MINT_ADDRESS";

  try {
    // 1. Fetch treasury SOL balance from Helius
    const balancesRes = await fetch(
      `https://api.helius.xyz/v0/addresses/${TREASURY_WALLET}/balances?api-key=${HELIUS_API_KEY}`
    );
    const balancesData = await balancesRes.json();
    const solBalanceLamports = balancesData?.nativeBalance ?? 0;
    const solBalance = solBalanceLamports / 1e9;

    // 2. Fetch SOL/USD price from CoinGecko
    const solPriceRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    );
    const solPriceData = await solPriceRes.json();
    const solPrice = solPriceData?.solana?.usd ?? 0;

    const treasuryValue = solBalance * solPrice;

    // 3. Fetch WTI crude oil price from Twelve Data
    const wtiRes = await fetch(
      `https://api.twelvedata.com/price?symbol=CL&apikey=${TWELVE_DATA_API_KEY}`
    );
    const wtiData = await wtiRes.json();
    const wtiPrice = parseFloat(wtiData?.price ?? "0");
    const oilReserves = wtiPrice > 0 ? treasuryValue / wtiPrice : 0;

    // 4. Fetch token supply via Helius RPC (getTokenSupply)
    let circulatingSupply = 0;
    if (TOKEN_MINT !== "PLACEHOLDER_MINT_ADDRESS") {
      const supplyRes = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenSupply",
          params: [TOKEN_MINT],
        }),
      });
      const supplyData = await supplyRes.json();
      circulatingSupply = parseFloat(supplyData?.result?.value?.uiAmountString ?? "0");
    }

    const nav = circulatingSupply > 0 ? treasuryValue / circulatingSupply : 0;

    // 5. Fetch market cap from DexScreener
    let marketCap = 0;
    if (TOKEN_MINT !== "PLACEHOLDER_MINT_ADDRESS") {
      const dexRes = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_MINT}`
      );
      const dexData = await dexRes.json();
      marketCap = dexData?.pairs?.[0]?.marketCap ?? 0;
    }

    const backingRatio = marketCap > 0 ? (treasuryValue / marketCap) * 100 : 0;

    // 6. Fetch holders count via Helius getTokenAccounts
    let holdersCount = 0;
    if (TOKEN_MINT !== "PLACEHOLDER_MINT_ADDRESS") {
      let page = 1;
      let allOwners = new Set<string>();
      let hasMore = true;

      while (hasMore && page <= 10) {
        const holdersRes = await fetch(
          `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getTokenAccounts",
              params: {
                mint: TOKEN_MINT,
                page,
                limit: 1000,
              },
            }),
          }
        );
        const holdersData = await holdersRes.json();
        const accounts = holdersData?.result?.token_accounts ?? [];
        accounts.forEach((a: any) => {
          if (a.owner) allOwners.add(a.owner);
        });
        hasMore = accounts.length === 1000;
        page++;
      }
      holdersCount = allOwners.size;
    }

    const result = {
      treasuryValue,
      solBalance,
      solPrice,
      nav,
      backingRatio,
      isOverBacked: backingRatio >= 100,
      oilReserves,
      wtiPrice,
      circulatingSupply,
      holdersCount,
      marketCap,
      tokenMintConfigured: TOKEN_MINT !== "PLACEHOLDER_MINT_ADDRESS",
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
