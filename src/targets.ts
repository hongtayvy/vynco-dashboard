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

// Hostnames marked "unverified" did not answer when this list was last checked (2026-10-01).
// Swap in the real URLs from the Render and Cloudflare dashboards.
//
// Both APIs share one Supabase project (bsbcqmzchyfvnvcebnxh). Supabase does not document what
// counts as activity against its 7-day pause, so each layer is pinged: the APIs open real
// Postgres connections, and the direct calls hit PostgREST and Auth. Confirm by watching that the
// project stays unpaused for a week or two; if it pauses anyway, only Supabase Pro prevents it.
export const targets: Target[] = [
  // Render: the Spring health endpoints check the Supabase connection too, so pinging them
  // keeps both the service and its database warm.
  {
    id: "twofold-business",
    name: "Twofold API",
    provider: "render",
    // Public via the actuator allow-list in SecurityConfig. Everything else needs a Supabase JWT,
    // and a scheduled job has no token, so /actuator/health is the only unauthenticated route.
    url: "https://twofold-business.onrender.com/actuator/health",
    keepAlive: true,
    timeoutMs: 90_000,
  },
  {
    id: "discgolfbagtips-api",
    name: "Disc Golf Bag Tips API",
    provider: "render",
    // Public and unauthenticated. It counts catalog rows and embedding coverage, so every ping
    // runs real queries against Postgres, unlike /actuator/health.
    url: "https://discgolfbagtips-api.onrender.com/api/v1/status", // unverified: Render says no such service
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

  // Supabase: free projects pause after a week without activity.
  {
    id: "supabase-auth",
    name: "Supabase Auth",
    provider: "supabase",
    url: "https://bsbcqmzchyfvnvcebnxh.supabase.co/auth/v1/health",
    apiKeySecret: "SUPABASE_ANON_KEY",
    keepAlive: true,
  },
  {
    id: "supabase-rest",
    name: "Supabase Postgres (REST)",
    provider: "supabase",
    url: "https://bsbcqmzchyfvnvcebnxh.supabase.co/rest/v1/waitlist?select=id&limit=1",
    apiKeySecret: "SUPABASE_ANON_KEY",
    keepAlive: true,
    // RLS may refuse the anon role with 401 or 403, but the request still reached Postgres. A
    // missing table is a 404 and stays down. A wrong key is caught by the Auth target above.
    maxOkStatus: 403,
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
