#!/usr/bin/env node

/**
 * SOR Keeper Bot — Runs every 15 minutes
 * 
 * What it does:
 * 1. Checks treasury wallet SOL balance
 * 2. Swaps 80% SOL → $SOR via Jupiter (buyback)
 * 3. Snapshots all $SOR token holders via Helius
 * 4. Calculates proportional $SOR rewards per holder
 * 5. Writes new epoch + holder_rewards to Supabase
 * 
 * Run with: node keeper-bot.mjs
 * Schedule with cron: */15 * * * * node /path/to/keeper-bot.mjs
 * 
 * Required env vars:
 *   HELIUS_API_KEY        - Helius RPC API key
 *   TREASURY_PRIVATE_KEY  - Treasury wallet private key (base58)
 *   SOR_MINT_ADDRESS      - $SOR token mint address
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
const SOR_MINT_ADDRESS = process.env.SOR_MINT_ADDRESS;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const SOL_MINT = "So11111111111111111111111111111111111111112";

// Minimum SOL to keep in treasury for rent/fees (20%)
const MIN_SOL_RESERVE = 0.05;

// ─── Validate env ─────────────────────────────────────────────────────────────
function validateEnv() {
  const required = {
    HELIUS_API_KEY,
    TREASURY_PRIVATE_KEY,
    SOR_MINT_ADDRESS,
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

// ─── Step 2: Swap 80% SOL → $SOR via Jupiter (buyback) ───────────────────────
async function swapSolToSor(connection, treasuryKeypair, solAmount) {
  const lamports = Math.floor(solAmount * 1e9);

  console.log(`🔄 Swapping ${solAmount.toFixed(6)} SOL → $SOR via Jupiter (buyback)...`);

  // Get quote: SOL → SOR
  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${SOR_MINT_ADDRESS}&amount=${lamports}&slippageBps=50`;
  const quoteRes = await fetch(quoteUrl);
  const quoteData = await quoteRes.json();

  if (!quoteData || quoteData.error) {
    throw new Error(`Jupiter quote failed: ${JSON.stringify(quoteData)}`);
  }

  const sorOut = Number(quoteData.outAmount);
  console.log(`📊 Quote: ${solAmount.toFixed(6)} SOL → ${sorOut} $SOR`);

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
  console.log(`✅ Swap confirmed. Received ${sorOut} $SOR`);

  return { solSwapped: solAmount, sorReceived: sorOut };
}

// ─── Step 3: Snapshot all $SOR holders via Helius ─────────────────────────────
async function snapshotHolders() {
  console.log("📸 Snapshotting $SOR holders via Helius...");

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
            mint: SOR_MINT_ADDRESS,
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

  console.log(`📊 Found ${allHolders.length} $SOR holders`);

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
async function createEpoch(supabase, { solSwapped, sorReceived, holders, totalSupply }) {
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
      total_rewards_usdc: sorReceived, // storing SOR amount in this column
      total_supply_snapshot: totalSupply,
      holders_count: holders.length,
      sol_swapped: solSwapped,
      usdc_received: sorReceived,
    })
    .select()
    .single();

  if (epochError) throw epochError;

  // Each holder's proportional $SOR share
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
  return epoch;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🛢️  SOR Keeper Bot starting...");
  console.log(`⏰ ${new Date().toISOString()}`);

  const { connection, treasuryKeypair, supabase } = init();

  // 1. Check balance
  const solBalance = await getTreasuryBalance(connection, treasuryKeypair);
  
  // Keep 20% SOL for fees, swap 80%
  const swappableAmount = (solBalance - MIN_SOL_RESERVE) * 0.8;

  if (swappableAmount <= 0.001) {
    console.log("⚠️  Not enough SOL to swap. Skipping this epoch.");
    return;
  }

  // 2. Swap SOL → $SOR (buyback)
  const { solSwapped, sorReceived } = await swapSolToSor(
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
  await createEpoch(supabase, { solSwapped, sorReceived, holders, totalSupply });

  console.log("🛢️  Keeper bot finished successfully.");
}

main().catch((err) => {
  console.error("❌ Keeper bot error:", err);
  process.exit(1);
});
