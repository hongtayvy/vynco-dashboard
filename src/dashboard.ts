export const dashboard = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VYNCO Dashboard</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='9' fill='%2322c55e'/></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #f7f7f5; --panel: #ffffff; --line: #e6e6e1; --text: #18181b; --muted: #71717a;
    --up: #16a34a; --down: #dc2626; --idle: #d4d4d8;
    --render: #6d56f5; --supabase: #1f9d6b; --cloudflare: #f38020;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0b0b0d; --panel: #141417; --line: #232328; --text: #ececef; --muted: #8b8b94;
      --up: #22c55e; --down: #f05252; --idle: #2e2e35;
      --render: #8b7bff; --supabase: #3ecf8e; --cloudflare: #f6923a;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 14px/1.5 Inter, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 1040px; margin: 0 auto; padding: 40px 16px 64px; }
  .mono { font-family: "JetBrains Mono", ui-monospace, monospace; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 28px; }
  h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; display: flex; align-items: center; gap: 10px; }
  h1 .sub { font-weight: 400; color: var(--muted); margin-left: -4px; }
  .meta { color: var(--muted); font-size: 13px; }
  button { font: inherit; font-weight: 500; color: var(--text); background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 7px 14px; cursor: pointer; transition: border-color .15s; }
  button:hover { border-color: var(--muted); }
  button:disabled { opacity: .5; cursor: progress; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--idle); flex: none; position: relative; }
  .dot.up { background: var(--up); } .dot.down { background: var(--down); }
  .dot.up::after, .dot.down::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: inherit; animation: ping 2.4s ease-out infinite; }
  @keyframes ping { from { transform: scale(1); opacity: .6; } to { transform: scale(2.8); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .dot::after { animation: none !important; } }
  .banner { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-radius: 12px; background: var(--panel); border: 1px solid var(--line); margin-bottom: 16px; font-weight: 500; }
  .tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
  .tile { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; }
  .tile .k { color: var(--muted); font-size: 12px; }
  .tile .v { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; margin-top: 2px; font-variant-numeric: tabular-nums; }
  section { margin-bottom: 28px; }
  h2 { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
  h2 i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
  .list { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
  .row { display: grid; grid-template-columns: minmax(0, 1.3fr) 76px 64px minmax(0, 1.6fr); align-items: center; gap: 16px; padding: 14px 18px; }
  .row + .row { border-top: 1px solid var(--line); }
  .name { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .title { display: flex; align-items: center; gap: 6px; min-width: 0; }
  .name b { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .host { color: var(--muted); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tag { font-size: 10px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line); border-radius: 4px; padding: 0 5px; white-space: nowrap; flex: none; }
  .num { text-align: right; font-variant-numeric: tabular-nums; font-size: 13px; }
  .num small { display: block; color: var(--muted); font-size: 11px; }
  .bars { display: flex; gap: 2px; height: 28px; align-items: stretch; }
  .bars span { flex: 1; border-radius: 2px; background: var(--idle); min-width: 2px; }
  .bars span.up { background: var(--up); opacity: .85; } .bars span.down { background: var(--down); }
  .bars span:hover { opacity: 1; outline: 1px solid var(--text); }
  .empty { padding: 48px 20px; text-align: center; color: var(--muted); }
  @media (max-width: 720px) {
    .wrap { padding-top: 24px; }
    .tiles { grid-template-columns: repeat(2, 1fr); }
    .row { grid-template-columns: minmax(0, 1fr) auto auto; row-gap: 10px; }
    .bars { grid-column: 1 / -1; height: 22px; }
  }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div>
      <h1><span class="dot" id="hdot"></span>VYNCO<span class="sub">Dashboard</span></h1>
      <div class="meta" id="meta">Loading…</div>
    </div>
    <button id="check">Check now</button>
  </header>
  <div class="banner" id="banner"><span class="dot"></span><span>Waiting for the first check</span></div>
  <div class="tiles" id="tiles"></div>
  <div id="groups"></div>
</div>
<script>
const PROVIDERS = { render: "Render", supabase: "Supabase", cloudflare: "Cloudflare" };
const CRON_MINUTES = 14;
const BARS = 60;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ago = (t) => {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.round(s / 60) + "m ago";
  return Math.round(s / 3600) + "h ago";
};
const span = (d) => d < 3600e3 ? Math.max(1, Math.round(d / 60e3)) + "m" : Math.round(d / 3600e3) + "h";
const ms = (n) => n >= 1000 ? (n / 1000).toFixed(1) + "s" : n + "ms";
let data = null;

function render() {
  if (!data) return;
  const { targets, runs } = data;
  const last = runs.at(-1);
  if (!last) {
    $("groups").innerHTML = '<div class="list empty">No checks yet. Press <b>Check now</b>, or wait for the next cron run.</div>';
    $("meta").textContent = targets.length + " services";
    return;
  }

  const stat = (id) => {
    const samples = runs.map((r) => r.r[id]).filter(Boolean);
    const upCount = samples.filter((s) => s[0]).length;
    return {
      now: last.r[id],
      uptime: samples.length ? (upCount / samples.length) * 100 : null,
      bars: runs.slice(-BARS).map((r) => ({ t: r.t, s: r.r[id] })),
    };
  };
  const stats = Object.fromEntries(targets.map((t) => [t.id, stat(t.id)]));
  const down = targets.filter((t) => stats[t.id].now && !stats[t.id].now[0]);
  const upNow = targets.filter((t) => stats[t.id].now && stats[t.id].now[0]);
  const lat = upNow.map((t) => stats[t.id].now[1]);
  const all = runs.flatMap((r) => Object.values(r.r));
  const overall = all.length ? (all.filter((s) => s[0]).length / all.length) * 100 : 0;

  const cls = down.length ? "down" : "up";
  $("hdot").className = "dot " + cls;
  $("banner").innerHTML = '<span class="dot ' + cls + '"></span><span>' +
    (down.length ? down.length + " down: " + down.map((t) => esc(t.name)).join(", ") : "All systems operational") + "</span>";
  document.title = (down.length ? "(" + down.length + " down) " : "") + "VYNCO Dashboard";

  const next = Math.max(0, Math.ceil((last.t + CRON_MINUTES * 60e3 - Date.now()) / 60e3));
  $("meta").textContent = "Checked " + ago(last.t) + " · next keep-alive in ~" + next + "m · " + runs.length + " runs stored";

  const tiles = [
    ["Up now", upNow.length + " / " + targets.length],
    ["Median latency", lat.length ? ms(lat.sort((a, b) => a - b)[Math.floor(lat.length / 2)]) : "–"],
    ["Uptime · " + span(last.t - runs[0].t), overall.toFixed(1) + "%"],
    ["Kept awake", targets.filter((t) => t.keepAlive).length + " services"],
  ];
  $("tiles").innerHTML = tiles.map(([k, v]) => '<div class="tile"><div class="k">' + k + '</div><div class="v">' + v + "</div></div>").join("");

  $("groups").innerHTML = Object.entries(PROVIDERS).map(([p, label]) => {
    const list = targets.filter((t) => t.provider === p);
    if (!list.length) return "";
    const rows = list.map((t) => {
      const s = stats[t.id];
      const n = s.now;
      const state = !n ? "" : n[0] ? "up" : "down";
      const pad = Array(Math.max(0, BARS - s.bars.length)).fill("<span></span>").join("");
      const bars = s.bars.map((b) => {
        const st = !b.s ? "" : b.s[0] ? "up" : "down";
        const tip = new Date(b.t).toLocaleString() + " — " + (!b.s ? "not checked" : (b.s[2] || "no response") + ", " + ms(b.s[1]));
        return '<span class="' + st + '" title="' + esc(tip) + '"></span>';
      }).join("");
      return '<div class="row">' +
        '<div class="name"><span class="dot ' + state + '"></span><div style="min-width:0"><div class="title"><b>' + esc(t.name) + "</b>" +
          (t.keepAlive ? '<span class="tag">keep-alive</span>' : "") + "</div>" +
          '<div class="host mono">' + esc(t.host) + "</div></div></div>" +
        '<div class="num mono">' + (n ? ms(n[1]) : "–") + "<small>" + (n ? (n[2] || "no reply") : "") + "</small></div>" +
        '<div class="num mono">' + (s.uptime == null ? "–" : s.uptime.toFixed(s.uptime === 100 ? 0 : 1) + "%") + "<small>uptime</small></div>" +
        '<div class="bars">' + pad + bars + "</div></div>";
    }).join("");
    return '<section><h2><i style="background:var(--' + p + ')"></i>' + label + '</h2><div class="list">' + rows + "</div></section>";
  }).join("");
}

async function load(url, opts) {
  try {
    const res = await fetch(url, opts);
    data = await res.json();
    render();
  } catch (e) {
    $("meta").textContent = "Could not reach the status API";
  }
}

$("check").onclick = async () => {
  const b = $("check");
  b.disabled = true; b.textContent = "Checking…";
  await load("/api/check", { method: "POST" });
  b.disabled = false; b.textContent = "Check now";
};

load("/api/status");
setInterval(() => load("/api/status"), 60e3);
setInterval(render, 15e3);
</script>
</body>
</html>`;
