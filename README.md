# Pulse

One Cloudflare Worker that does two jobs:

1. **Keep-alive.** Every 14 minutes a cron trigger pings each Render service, which the free tier
   otherwise puts to sleep after 15 idle minutes, and each Supabase project, which the free tier
   pauses after a week without traffic.
2. **Status dashboard.** The same run records status, HTTP code and latency for every project in
   one KV value (about 2 days of history). `GET /` serves the dashboard; `GET /api/status` serves
   the JSON behind it.

## Setup

```sh
npm install
npx wrangler login
npx wrangler kv namespace create STATUS   # paste the id into wrangler.jsonc
npx wrangler secret put TWOFOLD_SUPABASE_ANON_KEY
npm run deploy
```

Edit `src/targets.ts` to add or fix projects. Entries marked `unverified` did not answer when this
was written; replace them with the real URLs from the Render and Supabase dashboards.

## Local

```sh
npm run dev
curl "http://localhost:8787/__scheduled?cron=*/14+*+*+*+*"   # fire the cron by hand
```

## Notes

- The Render targets hit Spring's `/actuator/health`, which also checks the Supabase connection,
  so one ping keeps the service and its database warm.
- `POST /api/check` runs the checks on demand. It is public, so it reuses the last run if that is
  under a minute old, to protect the KV free tier's 1,000 writes a day.
- To make the dashboard private, put the Worker behind Cloudflare Access (Zero Trust, free for up
  to 50 users).
