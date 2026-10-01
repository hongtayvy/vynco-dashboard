import { dashboard } from "./dashboard";
import { targets, type Target } from "./targets";

export interface Env {
  STATUS: KVNamespace;
  [secret: string]: unknown;
}

/** [up ? 1 : 0, latency ms, HTTP status or 0 when the request never completed] */
type Sample = [0 | 1, number, number];
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
    const key = env[target.apiKeySecret];
    // Supabase answers 401 to a keyless request, which would read as a healthy 4xx on some
    // targets. Fail loudly instead of sending it.
    if (typeof key !== "string" || !key) return [0, 0, 0];
    headers.apikey = key;
    headers.authorization = `Bearer ${key}`;
  }
  const started = Date.now();
  try {
    const res = await fetch(target.url, {
      headers,
      redirect: "follow",
      signal: AbortSignal.timeout(target.timeoutMs ?? 30_000),
    });
    // Drain the body so the timing covers the full response, and so the connection is released.
    await res.arrayBuffer();
    const up = res.status <= (target.maxOkStatus ?? 399);
    return [up ? 1 : 0, Date.now() - started, res.status];
  } catch {
    return [0, Date.now() - started, 0];
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
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(runChecks(env));
  },
} satisfies ExportedHandler<Env>;
