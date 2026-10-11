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

const HISTORY_KEY = "runs";
// ~2 days at one run every 14 minutes. The whole history is one KV value, so each run costs a
// single write and stays far inside the free tier's 1,000 writes a day.
const MAX_RUNS = 200;
const MANUAL_COOLDOWN_MS = 60_000;

async function check(target: Target, env: Env): Promise<Sample> {
  const headers: Record<string, string> = { "user-agent": "vynco-dashboard/1.0" };
  if (target.apiKeySecret) {
    // Pasted keys often arrive with a trailing newline or wrapping quotes.
    const raw = env[target.apiKeySecret];
    const key = typeof raw === "string" ? raw.trim().replace(/^["']|["']$/g, "") : raw;
    // Supabase answers 401 to a keyless request, which would read as a healthy 4xx on some
    // targets. Fail loudly instead of sending it.
    if (typeof key !== "string" || !key) return [0, 0, 0, `secret ${target.apiKeySecret} is not set`];
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
    return up ? [1, ms, res.status] : [0, ms, res.status, body.slice(0, 140)];
  } catch (e) {
    return [0, Date.now() - started, 0, e instanceof Error ? e.name : "error"];
  }
}

async function loadRuns(env: Env): Promise<Run[]> {
  return (await env.STATUS.get<Run[]>(HISTORY_KEY, "json")) ?? [];
}

async function runChecks(env: Env): Promise<Run[]> {
  const samples = await Promise.all(targets.map((t) => check(t, env)));
  const run: Run = { t: Date.now(), r: Object.fromEntries(targets.map((t, i) => [t.id, samples[i]])) };
  const runs = [...(await loadRuns(env)), run].slice(-MAX_RUNS);
  await env.STATUS.put(HISTORY_KEY, JSON.stringify(runs));
  return runs;
}

function statusPayload(runs: Run[]) {
  return {
    targets: targets.map(({ id, name, provider, url, keepAlive }) => ({
      id,
      name,
      provider,
      host: new URL(url).host,
      keepAlive: !!keepAlive,
    })),
    runs,
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
    return Response.json(statusPayload(await loadRuns(env)), {
      headers: { "cache-control": "no-store" },
    });
  }

  if (pathname === "/api/check" && req.method === "POST") {
    // The endpoint is public, so a cooldown stops anyone from burning the KV write quota.
    const runs = await loadRuns(env);
    const last = runs.at(-1);
    const fresh = last && Date.now() - last.t < MANUAL_COOLDOWN_MS;
    return Response.json(statusPayload(fresh ? runs : await runChecks(env)));
  }

  if (pathname === "/" && req.method === "GET") {
    return new Response(dashboard, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  return new Response("Not found", { status: 404 });
}
