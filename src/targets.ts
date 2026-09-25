export type Provider = "render" | "supabase" | "cloudflare";

export interface Target {
  id: string;
  name: string;
  provider: Provider;
  url: string;
  /** Pinged on every cron run so the host never idles it out (Render sleeps, Supabase pauses). */
  keepAlive?: boolean;
  /** Highest HTTP status still counted as up. Defaults to 399. */
  maxOkStatus?: number;
  /** Name of a Worker secret sent as the `apikey` header (Supabase anon key). */
  apiKeySecret?: string;
  /** Milliseconds before the check gives up. Render cold starts need close to a minute. */
  timeoutMs?: number;
}

// Hostnames marked "unverified" did not answer when this list was written (2026-09-24):
// the Render services returned Render's "no such service" 404, so they are deployed under a
// different subdomain or not at all, and the Supabase ref no longer resolves. Swap in the real
// URLs from each dashboard.
export const targets: Target[] = [
  // Render: the Spring health endpoints check the Supabase connection too, so pinging them
  // keeps both the service and its database warm.
  {
    id: "twofold-api",
    name: "Twofold API",
    provider: "render",
    url: "https://twofold-api.onrender.com/actuator/health", // unverified
    keepAlive: true,
    timeoutMs: 90_000,
  },
  {
    id: "discgolfbagtips-api",
    name: "Disc Golf Bag Tips API",
    provider: "render",
    url: "https://discgolfbagtips-api.onrender.com/actuator/health/readiness", // unverified
    keepAlive: true,
    timeoutMs: 90_000,
  },
  {
    id: "beyblade-x-api",
    name: "Beyblade X API",
    provider: "render",
    url: "https://beyblade-x-api.onrender.com/api/beyblades",
    keepAlive: true,
    maxOkStatus: 499, // the bare route answers 400, which still proves the service is awake
    timeoutMs: 90_000,
  },

  // Supabase: free projects pause after a week without traffic. A REST read reaches Postgres.
  {
    id: "twofold-db",
    name: "Twofold database",
    provider: "supabase",
    url: "https://bsbcqmzchyfvnvcebnxh.supabase.co/rest/v1/waitlist?select=id&limit=1", // unverified
    apiKeySecret: "TWOFOLD_SUPABASE_ANON_KEY",
    keepAlive: true,
    maxOkStatus: 499, // RLS may refuse the anon role, but Postgres still served the request
  },

  // Cloudflare
  { id: "portfolio", name: "Portfolio", provider: "cloudflare", url: "https://victoryang.xyz" },
  { id: "letter-drop", name: "Letter Drop", provider: "cloudflare", url: "https://letter-drop.com" },
  { id: "super-flawed", name: "Super Flawed", provider: "cloudflare", url: "https://super-flawed.pages.dev" },
  {
    id: "discgolfbagtips-web",
    name: "Disc Golf Bag Tips",
    provider: "cloudflare",
    url: "https://discgolfbagtips.pages.dev", // unverified
  },
];
