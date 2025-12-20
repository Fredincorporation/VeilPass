# Direct Supabase Settle Script

This document explains the `scripts/settle_auctions_direct.js` script which runs auction settlement logic directly against Supabase using a service role key. This is the recommended approach for production scheduling when you don't want to depend on the Next.js server being up.

Install dependency

```bash
npm install @supabase/supabase-js
```

Environment

Set these environment variables in your scheduler or systemd unit (do not expose these in public):

```bash
export SUPABASE_URL='https://<your-project>.supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'
```

Make the script executable and run from cron

```bash
chmod +x ./scripts/settle_auctions_direct.js
# example cron line: run every 5 minutes
*/5 * * * * SUPABASE_URL='https://<your-project>.supabase.co' SUPABASE_SERVICE_ROLE_KEY='${SUPABASE_SERVICE_ROLE_KEY}' /usr/bin/node /path/to/repo/scripts/settle_auctions_direct.js >> /var/log/veilpass/settle.log 2>&1
```

Notes
- The script uses the Supabase service role key — keep it secret and only run the script on trusted infrastructure.
- It performs the same logic as the HTTP settle endpoint: for each auction with revealed bids it selects the highest revealed bid and inserts a row into `auction_results` (unless already present).
