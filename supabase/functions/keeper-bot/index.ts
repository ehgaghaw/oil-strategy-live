import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SOL_MINT = "So11111111111111111111111111111111111111112";
const MIN_SOL_RESERVE = 0.05;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HELIUS_API_KEY = Deno.env.get("HELIUS_API_KEY")!;
    const TREASURY_PRIVATE_KEY = Deno.env.get("TREASURY_PRIVATE_KEY")!;
    const SOR_MINT_ADDRESS = Deno.env.get("SOR_MINT_ADDRESS")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const heliusRpc = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

    console.log("🛢️ SOR Keeper Bot starting...");
    console.log(`⏰ ${new Date().toISOString()}`);

    // ── Step 1: Check treasury SOL balance ──
    const balanceRes = await fetch(heliusRpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "get-balance",
        method: "getBalance",
        params: [treasuryPublicKeyFromPrivate(TREASURY_PRIVATE_KEY)],
      }),
    });
    const balanceData = await balanceRes.json();
    const solBalance = (balanceData.result?.value ?? 0) / 1e9;
    console.log(`💰 Treasury SOL balance: ${solBalance.toFixed(6)} SOL`);

    const swappableAmount = (solBalance - MIN_SOL_RESERVE) * 0.8;

    if (swappableAmount <= 0.001) {
      console.log("⚠️ Not enough SOL to swap. Skipping this epoch.");
      return new Response(
        JSON.stringify({ status: "skipped", reason: "insufficient SOL", solBalance }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Step 2: Swap SOL → $SOR via Jupiter ──
    const lamports = Math.floor(swappableAmount * 1e9);
    console.log(`🔄 Swapping ${swappableAmount.toFixed(6)} SOL → $SOR...`);

    const quoteRes = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${SOR_MINT_ADDRESS}&amount=${lamports}&slippageBps=50`
    );
    const quoteData = await quoteRes.json();

    if (!quoteData || quoteData.error) {
      throw new Error(`Jupiter quote failed: ${JSON.stringify(quoteData)}`);
    }

    const sorReceived = Number(quoteData.outAmount);
    console.log(`📊 Quote: ${swappableAmount.toFixed(6)} SOL → ${sorReceived} $SOR`);

    // Get swap transaction
    const swapRes = await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse: quoteData,
        userPublicKey: treasuryPublicKeyFromPrivate(TREASURY_PRIVATE_KEY),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
      }),
    });
    const swapData = await swapRes.json();

    if (!swapData.swapTransaction) {
      throw new Error(`Jupiter swap failed: ${JSON.stringify(swapData)}`);
    }

    // Sign and send transaction
    const txBuf = base64ToUint8Array(swapData.swapTransaction);
    const signedTx = await signTransaction(txBuf, TREASURY_PRIVATE_KEY);

    const sendRes = await fetch(heliusRpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "send-tx",
        method: "sendTransaction",
        params: [uint8ArrayToBase64(signedTx), { skipPreflight: true, maxRetries: 3 }],
      }),
    });
    const sendData = await sendRes.json();
    const txid = sendData.result;
    console.log(`✅ Swap tx sent: ${txid}`);

    // ── Step 3: Snapshot holders ──
    console.log("📸 Snapshotting $SOR holders...");
    let page = 1;
    let allHolders: Array<{ owner: string; amount: string }> = [];
    let hasMore = true;

    while (hasMore) {
      const res = await fetch(heliusRpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: `holder-snapshot-${page}`,
          method: "getTokenAccounts",
          params: { mint: SOR_MINT_ADDRESS, page, limit: 1000 },
        }),
      });
      const data = await res.json();
      const accounts = data.result?.token_accounts || [];
      allHolders = allHolders.concat(accounts);
      hasMore = accounts.length >= 1000;
      page++;
    }

    const holders = allHolders
      .map((acc) => ({ wallet: acc.owner, balance: Number(acc.amount) }))
      .filter((h) => h.balance > 0);

    const totalSupply = holders.reduce((sum, h) => sum + h.balance, 0);
    console.log(`📊 Found ${holders.length} $SOR holders, total supply: ${totalSupply}`);

    if (holders.length === 0) {
      console.log("⚠️ No holders found. Skipping epoch creation.");
      return new Response(
        JSON.stringify({ status: "skipped", reason: "no holders" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Step 4: Create epoch & distribute ──
    const { data: lastEpoch } = await supabase
      .from("epochs")
      .select("epoch_number")
      .order("epoch_number", { ascending: false })
      .limit(1)
      .single();

    const epochNumber = (lastEpoch?.epoch_number ?? 0) + 1;
    console.log(`📝 Creating epoch #${epochNumber}...`);

    const { data: epoch, error: epochError } = await supabase
      .from("epochs")
      .insert({
        epoch_number: epochNumber,
        total_rewards_usdc: sorReceived,
        total_supply_snapshot: totalSupply,
        holders_count: holders.length,
        sol_swapped: swappableAmount,
        usdc_received: sorReceived,
      })
      .select()
      .single();

    if (epochError) throw epochError;

    // Insert holder rewards in chunks
    const rewardRows = holders.map((h) => ({
      epoch_id: epoch.id,
      wallet_address: h.wallet,
      token_balance: h.balance,
      claimable_usdc: (h.balance / totalSupply) * sorReceived,
    }));

    for (let i = 0; i < rewardRows.length; i += 500) {
      const chunk = rewardRows.slice(i, i + 500);
      const { error: insertError } = await supabase
        .from("holder_rewards")
        .insert(chunk);
      if (insertError) throw insertError;
      console.log(`  Inserted rewards ${i + 1} - ${Math.min(i + 500, rewardRows.length)}`);
    }

    console.log(`✅ Epoch #${epochNumber} created: ${sorReceived} $SOR → ${holders.length} holders`);

    return new Response(
      JSON.stringify({
        status: "success",
        epoch_number: epochNumber,
        sol_swapped: swappableAmount,
        sor_received: sorReceived,
        holders_count: holders.length,
        txid,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("❌ Keeper bot error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ── Crypto helpers (pure Deno, no npm deps) ──

function base58Decode(str: string): Uint8Array {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const bytes: number[] = [];
  for (const char of str) {
    const idx = ALPHABET.indexOf(char);
    if (idx === -1) throw new Error(`Invalid base58 character: ${char}`);
    let carry = idx;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (const char of str) {
    if (char !== "1") break;
    bytes.push(0);
  }
  return new Uint8Array(bytes.reverse());
}

function base64ToUint8Array(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function uint8ArrayToBase64(arr: Uint8Array): string {
  let bin = "";
  for (const byte of arr) bin += String.fromCharCode(byte);
  return btoa(bin);
}

function treasuryPublicKeyFromPrivate(privateKeyBase58: string): string {
  // Ed25519 secret key is 64 bytes: first 32 are seed, last 32 are public key
  const secretKey = base58Decode(privateKeyBase58);
  const publicKeyBytes = secretKey.slice(32, 64);
  return base58Encode(publicKeyBytes);
}

function base58Encode(bytes: Uint8Array): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let result = "";
  for (const byte of bytes) {
    if (byte !== 0) break;
    result += "1";
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    result += ALPHABET[digits[i]];
  }
  return result;
}

async function signTransaction(txBytes: Uint8Array, privateKeyBase58: string): Promise<Uint8Array> {
  const secretKey = base58Decode(privateKeyBase58);

  // Import the Ed25519 key for signing
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    secretKey.slice(0, 32),
    { name: "Ed25519" },
    false,
    ["sign"]
  );

  // Versioned transaction: first byte is version prefix (0x80)
  // The signature placeholder is the first 64 bytes after any version prefix
  // We need to parse the transaction to find the message to sign
  
  // For versioned transactions: byte 0 = num_signatures, then signatures, then message
  const numSignatures = txBytes[0];
  const messageOffset = 1 + numSignatures * 64;
  const message = txBytes.slice(messageOffset);

  const signature = new Uint8Array(
    await crypto.subtle.sign("Ed25519", cryptoKey, message)
  );

  // Replace the first signature slot
  const signed = new Uint8Array(txBytes);
  signed.set(signature, 1); // offset 1 = first signature slot
  return signed;
}
