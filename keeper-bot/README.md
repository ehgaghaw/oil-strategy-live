# SOR Keeper Bot

Automated reward distribution bot for **Strategic Oil Reserve ($SOR)**. Runs every 15 minutes to collect SOL creator fees, buy back $SOR via Jupiter, and distribute proportionally to all holders.

---

## How It Works

1. **Check treasury** — Reads SOL balance of the treasury wallet via Helius
2. **Buyback $SOR** — Swaps 80% of available SOL → $SOR via Jupiter V6 (keeps 20% for tx fees)
3. **Snapshot holders** — Gets all $SOR token holders via Helius `getTokenAccounts`
4. **Calculate shares** — `(holder_balance / total_supply) * sor_bought`
5. **Write to database** — Creates an epoch record + individual holder rewards in Supabase
6. **Users claim** — Holders claim their $SOR via the frontend

---

## Deploy to Railway

### 1. Create a Railway project

1. Go to [railway.app](https://railway.app) and create a new project
2. Choose **"Deploy from GitHub Repo"** or **"Empty Project → Add Service"**
3. If using GitHub, push the `keeper-bot/` folder as its own repo (or use a monorepo with root directory set to `keeper-bot`)

### 2. Set environment variables

In Railway dashboard → your service → **Variables**, add:

| Variable | Description |
|---|---|
| `HELIUS_API_KEY` | Your Helius API key |
| `TREASURY_PRIVATE_KEY` | Treasury wallet private key (base58 encoded) |
| `SOR_MINT_ADDRESS` | $SOR token mint address from pump.fun |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |

### 3. Configure the cron schedule

In Railway dashboard → your service → **Settings**:

- Set **Start Command** to: `node keeper-bot.mjs`
- Set **Cron Schedule** to: `*/15 * * * *`
- Set **Region** to your preferred region

> **Note:** Railway's cron will spin up the service every 15 minutes, run the script, then shut it down. This keeps costs minimal.

### 4. Deploy

Railway will auto-deploy when you push. To deploy manually:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Deploy
railway up
```

---

## Run Locally

```bash
cd keeper-bot
npm install

# Set env vars
export HELIUS_API_KEY="58da4135-d19a-41da-a610-e53720fd0c54"
export TREASURY_PRIVATE_KEY="your-base58-private-key"
export SOR_MINT_ADDRESS="your-sor-mint-address"
export SUPABASE_URL="https://exerqscusdhgmeborrhi.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"

# Run once
npm start
```

---

## File Structure

```
keeper-bot/
├── keeper-bot.mjs    # Main bot script
├── package.json      # Dependencies
└── README.md         # This file
```

---

## Security Notes

- **NEVER** commit your `TREASURY_PRIVATE_KEY` to version control
- Use Railway's encrypted environment variables for all secrets
- The treasury private key controls the wallet that holds and distributes funds
- Consider using a dedicated hot wallet with limited funds rather than your main wallet
