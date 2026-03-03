# WTI Keeper Bot

Runs every 30 minutes to distribute USDC rewards to $WTI holders.

## Setup

```bash
cd keeper-bot
npm install
```

## Required Environment Variables

```bash
export HELIUS_API_KEY="your-helius-api-key"
export TREASURY_PRIVATE_KEY="your-treasury-wallet-base58-private-key"
export WTI_MINT_ADDRESS="your-wti-token-mint-address"
export SUPABASE_URL="your-supabase-project-url"
export SUPABASE_SERVICE_KEY="your-supabase-service-role-key"
```

## Run manually

```bash
npm start
```

## Schedule with cron (every 30 minutes)

```bash
crontab -e
# Add:
*/30 * * * * cd /path/to/keeper-bot && /usr/bin/node keeper-bot.mjs >> /var/log/wti-keeper.log 2>&1
```

## How it works

1. Checks treasury wallet SOL balance
2. Swaps SOL → USDC via Jupiter Aggregator V6
3. Snapshots all $WTI token holders via Helius `getTokenAccounts`
4. Calculates proportional share: `(holder_balance / total_supply) * reward_pool`
5. Writes epoch + holder_rewards to Supabase database
6. Users claim rewards via the frontend
