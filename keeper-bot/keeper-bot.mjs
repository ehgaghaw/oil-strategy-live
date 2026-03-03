#!/usr/bin/env node

/**
 * WTI Keeper Bot — Runs every 30 minutes
 * 
 * What it does:
 * 1. Checks treasury wallet SOL balance
 * 2. Swaps SOL → USDC via Jupiter Aggregator
 * 3. Snapshots all $WTI token holders via Helius
 * 4. Calculates proportional rewards per holder
 * 5. Writes new epoch + holder_rewards to Supabase
 * 
 * Run with: node keeper-bot.mjs
 * Schedule with cron: */30 * * * * node /path/to/keeper-bot.mjs
 * 
 * Required env vars:
 *   HELIUS_API_KEY        - Helius RPC API key
 *   TREASURY_PRIVATE_KEY  - Treasury wallet private key (base58)
 *   WTI_MINT_ADDRESS      - $WTI token mint address
 *   SUPABASE_URL          - Supabase project URL
 *   SUPABASE_SERVICE_KEY  - Supabase service role key
 */

import { Connection, Keypair, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";
import bs58 from "bs58";
import fetch from "node-fetch";

// ─── Config ───────────────────────────────────────────────────────────────────
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
const WTI_MINT_ADDRESS = process.env.WTI_MINT_ADDRESS;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// USDC on Solana mainnet
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOL_MINT = "So11111111111111111111111111111111111111112";

// Minimum SOL to keep in treasury for rent/fees
const MIN_SOL_RESERVE = 0.05;

// ─── Validate env ─────────────────────────────────────────────────────────────
function validateEnv() {
  const required = {
    HELIUS_API_KEY,
    TREASURY_PRIVATE_KEY,
    WTI_MINT_ADDRESS,
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
  };
  for (const [key, val] of Object.entries(required)) {
    if (!val) throw new Error(`Missing env var: ${key}`);
  }
}

// ─── Initialize clients ──────────────────────────────────────────────────────
function init() {
  validateEnv();

  const connection = new Connection(
    `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
    "confirmed"
  );

  const treasuryKeypair = Keypair.fromSecretKey(bs58.decode(TREASURY_PRIVATE_KEY));
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  return { connection, treasuryKeypair, supabase };
}

// ─── Step 1: Check treasury SOL balance ───────────────────────────────────────
async function getTreasuryBalance(connection, treasuryKeypair) {
  const balance = await connection.getBalance(treasuryKeypair.publicKey);
  const solBalance = balance / 1e9;
  console.log(`💰 Treasury SOL balance: ${solBalance.toFixed(6)} SOL`);
  return solBalance;
}

// ─── Step 2: Swap SOL → USDC via Jupiter ──────────────────────────────────────
async function swapSolToUsdc(connection, treasuryKeypair, solAmount) {
  const lamports = Math.floor(solAmount * 1e9);

  console.log(`🔄 Swapping ${solAmount.toFixed(6)} SOL → USDC via Jupiter...`);

  // Get quote
  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${USDC_MINT}&amount=${lamports}&slippageBps=50`;
  const quoteRes = await fetch(quoteUrl);
  const quoteData = await quoteRes.json();

  if (!quoteData || quoteData.error) {
    throw new Error(`Jupiter quote failed: ${JSON.stringify(quoteData)}`);
  }

  const usdcOut = Number(quoteData.outAmount) / 1e6;
  console.log(`📊 Quote: ${solAmount.toFixed(6)} SOL → ${usdcOut.toFixed(6)} USDC`);

  // Get swap transaction
  const swapRes = await fetch("https://quote-api.jup.ag/v6/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quoteData,
      userPublicKey: treasuryKeypair.publicKey.toBase58(),
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    }),
  });
  const swapData = await swapRes.json();

  if (!swapData.swapTransaction) {
    throw new Error(`Jupiter swap failed: ${JSON.stringify(swapData)}`);
  }

  // Deserialize, sign, send
  const txBuf = Buffer.from(swapData.swapTransaction, "base64");
  const tx = VersionedTransaction.deserialize(txBuf);
  tx.sign([treasuryKeypair]);

  const txid = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: true,
    maxRetries: 3,
  });

  console.log(`✅ Swap tx sent: ${txid}`);
  await connection.confirmTransaction(txid, "confirmed");
  console.log(`✅ Swap confirmed. Received ~${usdcOut.toFixed(6)} USDC`);

  return { solSwapped: solAmount, usdcReceived: usdcOut };
}

// ─── Step 3: Snapshot all $WTI holders via Helius ─────────────────────────────
async function snapshotHolders() {
  console.log("📸 Snapshotting $WTI holders via Helius...");

  let page = 1;
  let allHolders = [];
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: `holder-snapshot-${page}`,
          method: "getTokenAccounts",
          params: {
            mint: WTI_MINT_ADDRESS,
            page,
            limit: 1000,
          },
        }),
      }
    );

    const data = await res.json();
    const accounts = data.result?.token_accounts || [];
    allHolders = allHolders.concat(accounts);

    if (accounts.length < 1000) {
      hasMore = false;
    } else {
      page++;
    }
  }

  console.log(`📊 Found ${allHolders.length} $WTI holders`);

  // Map to { wallet, balance }
  const holders = allHolders
    .map((acc) => ({
      wallet: acc.owner,
      balance: Number(acc.amount),
    }))
    .filter((h) => h.balance > 0);

  const totalSupply = holders.reduce((sum, h) => sum + h.balance, 0);

  return { holders, totalSupply };
}

// ─── Step 4: Calculate rewards & write to DB ──────────────────────────────────
async function createEpoch(supabase, { solSwapped, usdcReceived, holders, totalSupply }) {
  // Get next epoch number
  const { data: lastEpoch } = await supabase
    .from("epochs")
    .select("epoch_number")
    .order("epoch_number", { ascending: false })
    .limit(1)
    .single();

  const epochNumber = (lastEpoch?.epoch_number ?? 0) + 1;
  console.log(`📝 Creating epoch #${epochNumber}...`);

  // Insert epoch
  const { data: epoch, error: epochError } = await supabase
    .from("epochs")
    .insert({
      epoch_number: epochNumber,
      total_rewards_usdc: usdcReceived,
      total_supply_snapshot: totalSupply,
      holders_count: holders.length,
      sol_swapped: solSwapped,
      usdc_received: usdcReceived,
    })
    .select()
    .single();

  if (epochError) throw epochError;

  // Calculate each holder's share
  const rewardRows = holders.map((h) => ({
    epoch_id: epoch.id,
    wallet_address: h.wallet,
    token_balance: h.balance,
    claimable_usdc: (h.balance / totalSupply) * usdcReceived,
  }));

  // Batch insert (chunks of 500)
  for (let i = 0; i < rewardRows.length; i += 500) {
    const chunk = rewardRows.slice(i, i + 500);
    const { error: insertError } = await supabase
      .from("holder_rewards")
      .insert(chunk);

    if (insertError) throw insertError;
    console.log(`  Inserted rewards ${i + 1} - ${Math.min(i + 500, rewardRows.length)}`);
  }

  console.log(`✅ Epoch #${epochNumber} created: ${usdcReceived.toFixed(6)} USDC → ${holders.length} holders`);
  return epoch;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🛢️  WTI Keeper Bot starting...");
  console.log(`⏰ ${new Date().toISOString()}`);

  const { connection, treasuryKeypair, supabase } = init();

  // 1. Check balance
  const solBalance = await getTreasuryBalance(connection, treasuryKeypair);
  const swappableAmount = solBalance - MIN_SOL_RESERVE;

  if (swappableAmount <= 0.001) {
    console.log("⚠️  Not enough SOL to swap. Skipping this epoch.");
    return;
  }

  // 2. Swap SOL → USDC
  const { solSwapped, usdcReceived } = await swapSolToUsdc(
    connection,
    treasuryKeypair,
    swappableAmount
  );

  // 3. Snapshot holders
  const { holders, totalSupply } = await snapshotHolders();

  if (holders.length === 0) {
    console.log("⚠️  No holders found. Skipping epoch creation.");
    return;
  }

  // 4. Create epoch & distribute
  await createEpoch(supabase, { solSwapped, usdcReceived, holders, totalSupply });

  console.log("🛢️  Keeper bot finished successfully.");
}

main().catch((err) => {
  console.error("❌ Keeper bot error:", err);
  process.exit(1);
});
