import { dashboard } from "./dashboard";
import { targets, type Target } from "./targets";

export interface Env {
  STATUS: KVNamespace;
  [secret: string]: unknown;
}

/**
 * [up ? 1 : 0, latency ms, HTTP status or 0 when the request never completed, and for failures
 * only, the first characters of the response body or the error name]
 */
type Sample = [0 | 1, number, number] | [0 | 1, number, number, string];
interface Run {
  t: number;
  r: Record<string, Sample>;
}

/** Render's free tier: one pool of instance-hours shared by every free service in the workspace. */
interface Hours {
  month: string; // YYYY-MM, UTC. The pool resets each billing period.
  base: number; // hours used, as last read off Render's Billing page
  baseAt: number;
  estAdded: number; // hours the Worker's own pings have kept services awake since baseAt
}

/** Last manual "Ping" per target, kept apart from the scheduled history so it cannot skew it. */
type Pings = Record<string, { t: number; s: Sample }>;
type PauseOverrides = Record<string, boolean>;

const FREE_HOURS_LIMIT = 750;
// A ping wakes a free service, and Render keeps it awake for about 15 minutes after the last request.
const PING_HOURS = 0.25;
const PING_COOLDOWN_MS = 20_000;
const PAUSED_KEY = "paused";
const PINGS_KEY = "pings";
const HISTORY_KEY = "runs";
const HOURS_KEY = "hours";
// ~2 days at one run every 14 minutes. The whole history is one KV value, so each run costs a
// single write and stays far inside the free tier's 1,000 writes a day.
const MAX_RUNS = 200;
const MANUAL_COOLDOWN_MS = 60_000;

async function check(target: Target, env: Env): Promise<Sample> {
  const headers: Record<string, string> = { "user-agent": "vynco-dashboard/1.0" };
  let shape = "";
  if (target.apiKeySecret) {
    // Pasted keys often arrive with whitespace, wrapping quotes or the "NAME=" of a .env line.
    const raw = env[target.apiKeySecret];
    const key =
      typeof raw === "string"
        ? raw.replace(/\s+/g, "").replace(/^["']|["']$/g, "").replace(/^[A-Za-z_]+=/, "")
        : "";
    // Supabase answers 401 to a keyless request, which would read as a healthy 4xx on some
    // targets. Fail loudly instead of sending it.
    if (!key) return [0, 0, 0, `secret ${target.apiKeySecret} is not set`];
    // Length and first characters only, so a failing check says what shape of key it holds.
    shape = ` [key: ${key.length} chars, starts "${key.slice(0, 3)}"]`;
    headers.apikey = key;
    // Legacy anon keys are JWTs and are also sent as a bearer token. The newer sb_publishable_
    // keys are opaque and go in the apikey header alone.
    if (key.startsWith("eyJ")) headers.authorization = `Bearer ${key}`;
  }
  const started = Date.now();
  try {
    const res = await fetch(target.url, {
      headers,
      redirect: "follow",
      signal: AbortSignal.timeout(target.timeoutMs ?? 30_000),
    });
    // Reading the body also makes the timing cover the full response and frees the connection.
    const body = await res.text();
    const up =
      res.status <= (target.maxOkStatus ?? 399) &&
      !(target.failIfBodyIncludes && body.includes(target.failIfBodyIncludes));
    const ms = Date.now() - started;
    // An HTML error page is summarised by its title, such as "Service Suspended".
    const note = (body.match(/<title>([^<]*)<\/title>/i)?.[1] ?? body).trim().slice(0, 140);
    return up ? [1, ms, res.status] : [0, ms, res.status, note + shape];
  } catch (e) {
    return [0, Date.now() - started, 0, e instanceof Error ? e.name : "error"];
  }
}

async function loadRuns(env: Env): Promise<Run[]> {
  return (await env.STATUS.get<Run[]>(HISTORY_KEY, "json")) ?? [];
}

const monthKey = (t: number) => new Date(t).toISOString().slice(0, 7);

async function loadHours(env: Env): Promise<Hours> {
  const month = monthKey(Date.now());
  const saved = await env.STATUS.get<Hours>(HOURS_KEY, "json");
  return saved && saved.month === month ? saved : { month, base: 0, baseAt: Date.now(), estAdded: 0 };
}

const loadPaused = async (env: Env) => (await env.STATUS.get<PauseOverrides>(PAUSED_KEY, "json")) ?? {};
const loadPings = async (env: Env) => (await env.STATUS.get<Pings>(PINGS_KEY, "json")) ?? {};
/** The button's choice wins; targets.ts only supplies the default. */
const isPaused = (t: Target, overrides: PauseOverrides) => overrides[t.id] ?? !!t.paused;
/** Every active Render target is requested each run, so each one is kept awake and spends hours. */
const activeRender = (overrides: PauseOverrides) =>
  targets.filter((t) => t.provider === "render" && !isPaused(t, overrides));

async function runChecks(env: Env): Promise<Run[]> {
  const overrides = await loadPaused(env);
  const active = targets.filter((t) => !isPaused(t, overrides));
  const samples = await Promise.all(active.map((t) => check(t, env)));
  const run: Run = { t: Date.now(), r: Object.fromEntries(active.map((t, i) => [t.id, samples[i]])) };
  const prior = await loadRuns(env);
  const runs = [...prior, run].slice(-MAX_RUNS);
  await env.STATUS.put(HISTORY_KEY, JSON.stringify(runs));

  // A kept-alive service that answered was awake for the whole gap since the previous run.
  const awake = activeRender(overrides).filter((t) => run.r[t.id]?.[0] === 1).length;
  if (awake > 0) {
    const gap = Math.min(run.t - (prior.at(-1)?.t ?? run.t - 14 * 60_000), 20 * 60_000);
    const hours = await loadHours(env);
    hours.estAdded += (awake * gap) / 3_600_000;
    await env.STATUS.put(HOURS_KEY, JSON.stringify(hours));
  }
  return runs;
}

async function statusPayload(runs: Run[], env: Env) {
  const [hours, overrides, pings] = await Promise.all([loadHours(env), loadPaused(env), loadPings(env)]);
  return {
    targets: targets.map((t) => ({
      id: t.id,
      name: t.name,
      provider: t.provider,
      host: new URL(t.url).host,
      keepAlive: !!t.keepAlive,
      paused: isPaused(t, overrides),
    })),
    runs,
    pings,
    hours: {
      month: hours.month,
      limit: FREE_HOURS_LIMIT,
      used: hours.base + hours.estAdded,
      base: hours.base,
      estAdded: hours.estAdded,
      // What the current keep-alive list would spend per day if it were all awake.
      burnPerDay: activeRender(overrides).length * 24,
    },
  };
}

export default {
  async fetch(req, env): Promise<Response> {
    const res = await route(req, env);
    const out = new Response(res.body, res);
    // Internal tool: keep it out of search results even if the Access rule is ever removed.
    out.headers.set("x-robots-tag", "noindex, nofollow");
    return out;
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(runChecks(env));
  },
} satisfies ExportedHandler<Env>;

async function route(req: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(req.url);

  if (pathname === "/api/status" && req.method === "GET") {
    return Response.json(await statusPayload(await loadRuns(env), env), {
      headers: { "cache-control": "no-store" },
    });
  }

  if (pathname === "/api/check" && req.method === "POST") {
    // The endpoint is public, so a cooldown stops anyone from burning the KV write quota.
    const runs = await loadRuns(env);
    const last = runs.at(-1);
    const fresh = last && Date.now() - last.t < MANUAL_COOLDOWN_MS;
    return Response.json(await statusPayload(fresh ? runs : await runChecks(env), env));
  }

  if (req.method === "POST" && ["/api/hours", "/api/pause", "/api/ping"].includes(pathname)) {
    // Requiring a JSON body forces a CORS preflight, so another site cannot post here blindly.
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return new Response("Expected JSON", { status: 415 });
    }
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    return mutate(pathname, body, env);
  }

  if (pathname === "/" && req.method === "GET") {
    return new Response(dashboard, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  return new Response("Not found", { status: 404 });
}

async function mutate(pathname: string, body: Record<string, unknown>, env: Env): Promise<Response> {
  const target = targets.find((t) => t.id === body.id);

  if (pathname === "/api/pause") {
    // One target by id, or every target of a provider for the section's "Pause all" button.
    const group =
      typeof body.provider === "string" ? targets.filter((t) => t.provider === body.provider) : target ? [target] : [];
    if (!group.length || typeof body.paused !== "boolean") {
      return new Response("id or provider, and paused, required", { status: 400 });
    }
    const overrides = await loadPaused(env);
    for (const t of group) overrides[t.id] = body.paused;
    await env.STATUS.put(PAUSED_KEY, JSON.stringify(overrides));
    return Response.json(await statusPayload(await loadRuns(env), env));
  }

  if (pathname === "/api/ping") {
    if (!target) return new Response("unknown id", { status: 400 });
    const pings = await loadPings(env);
    if (Date.now() - (pings[target.id]?.t ?? 0) < PING_COOLDOWN_MS) {
      return new Response("Pinged a moment ago, try again shortly", { status: 429 });
    }
    const sample = await check(target, env);
    pings[target.id] = { t: Date.now(), s: sample };
    await env.STATUS.put(PINGS_KEY, JSON.stringify(pings));
    if (target.provider === "render" && sample[0] === 1) {
      const hours = await loadHours(env);
      hours.estAdded += PING_HOURS;
      await env.STATUS.put(HOURS_KEY, JSON.stringify(hours));
    }
    return Response.json(await statusPayload(await loadRuns(env), env));
  }

  // /api/hours: the real figure from Render's Billing page becomes the new baseline.
  const { used } = body as { used?: unknown };
  if (typeof used !== "number" || !Number.isFinite(used) || used < 0 || used > 10_000) {
    return new Response("used must be a number of hours", { status: 400 });
  }
  const hours: Hours = { month: monthKey(Date.now()), base: used, baseAt: Date.now(), estAdded: 0 };
  await env.STATUS.put(HOURS_KEY, JSON.stringify(hours));
  return Response.json(await statusPayload(await loadRuns(env), env));
}
