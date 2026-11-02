export const dashboard = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>VYNCO Dashboard</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='9' fill='%2322c55e'/></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    color-scheme: light dark;
    --bg: #f5f5f3; --panel: #ffffff; --line: #e7e7e3; --soft: #f0f0ec; --text: #17171a; --muted: #6b6b74;
    --up: #16a34a; --down: #dc2626; --idle: #dcdcd6;
    --up-text: #15803d; --down-text: #b91c1c; --up-bg: #ecfdf3; --down-bg: #fef2f2;
    --render: #6d56f5; --supabase: #1f9d6b; --cloudflare: #f38020;
    --shadow: 0 1px 2px rgba(20,20,25,.04), 0 1px 1px rgba(20,20,25,.03);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #09090b; --panel: #111114; --line: #222228; --soft: #1a1a1f; --text: #ececef; --muted: #9a9aa4;
      --up: #22c55e; --down: #f05252; --idle: #2a2a31;
      --up-text: #4ade80; --down-text: #f87171; --up-bg: #0e2318; --down-bg: #2b1313;
      --render: #8b7bff; --supabase: #3ecf8e; --cloudflare: #f6923a;
      --shadow: none;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 14px/1.5 Inter, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 32px 16px 72px; }
  .mono { font-family: "JetBrains Mono", ui-monospace, monospace; }
  :focus-visible { outline: 2px solid var(--text); outline-offset: 2px; border-radius: 6px; }

  /* header */
  header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .logo { width: 34px; height: 34px; border-radius: 10px; background: var(--text); color: var(--bg); display: grid; place-items: center; font-weight: 700; font-size: 15px; letter-spacing: -0.03em; flex: none; }
  h1 { margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.01em; line-height: 1.2; }
  h1 span { color: var(--muted); font-weight: 400; }
  .meta { color: var(--muted); font-size: 13px; }

  /* buttons */
  button { font: inherit; font-weight: 500; font-size: 13px; color: var(--text); background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: border-color .15s, background .15s; box-shadow: var(--shadow); }
  button:hover { border-color: var(--muted); }
  button:disabled { opacity: .5; cursor: progress; }
  button.primary { background: var(--text); color: var(--bg); border-color: var(--text); padding: 8px 16px; }
  button.primary:hover { opacity: .88; }
  button.sm { padding: 3px 10px; font-size: 12px; border-radius: 6px; box-shadow: none; background: transparent; }
  button.sm:hover { background: var(--soft); }

  /* status dot */
  .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--idle); flex: none; position: relative; }
  .dot.up { background: var(--up); } .dot.down { background: var(--down); }
  .dot.up::after, .dot.down::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: inherit; animation: ping 2.4s ease-out infinite; }
  @keyframes ping { from { transform: scale(1); opacity: .6; } to { transform: scale(2.8); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .dot::after { animation: none !important; } }

  /* hero + stat strip */
  .hero { display: flex; align-items: center; gap: 14px; padding: 18px 22px; border-radius: 14px; border: 1px solid var(--line); background: var(--panel); box-shadow: var(--shadow); margin-bottom: 12px; }
  .hero.up { background: var(--up-bg); border-color: color-mix(in srgb, var(--up) 30%, var(--line)); }
  .hero.down { background: var(--down-bg); border-color: color-mix(in srgb, var(--down) 35%, var(--line)); }
  .hero .dot { width: 12px; height: 12px; }
  .hero strong { display: block; font-size: 17px; font-weight: 600; letter-spacing: -0.01em; }
  .hero.up strong { color: var(--up-text); } .hero.down strong { color: var(--down-text); }
  .hero small { color: var(--muted); font-size: 13px; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); background: var(--panel); border: 1px solid var(--line); border-radius: 14px; box-shadow: var(--shadow); margin-bottom: 12px; overflow: hidden; }
  .stat { padding: 14px 20px; }
  .stat + .stat { border-left: 1px solid var(--line); }
  .stat .k { color: var(--muted); font-size: 12px; }
  .stat .v { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; margin-top: 2px; font-variant-numeric: tabular-nums; }

  /* render hours */
  .hours { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; box-shadow: var(--shadow); padding: 16px 20px; margin-bottom: 28px; }
  .hours .top { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .hours .k { color: var(--muted); font-size: 12px; }
  .hours .big { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .hours .big small { font-size: 13px; font-weight: 400; color: var(--muted); letter-spacing: 0; }
  .hours .bar { height: 6px; border-radius: 3px; background: var(--soft); margin: 12px 0 10px; overflow: hidden; }
  .hours .bar i { display: block; height: 100%; border-radius: 3px; }
  .hours .note { color: var(--muted); font-size: 13px; }

  /* provider sections */
  section { margin-bottom: 28px; }
  h2 { font-size: 13px; font-weight: 600; color: var(--text); margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
  h2 i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
  h2 .count { color: var(--muted); font-weight: 400; }
  h2 .all { margin-left: auto; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 12px; }

  /* service card */
  .svc { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; box-shadow: var(--shadow); padding: 16px 18px 12px; display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  .svc.down { border-color: color-mix(in srgb, var(--down) 45%, var(--line)); }
  .svc-top { display: flex; align-items: center; gap: 10px; }
  .svc-id { min-width: 0; flex: 1; }
  .svc-id b { display: block; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .host { color: var(--muted); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
  .badge { font-size: 12px; font-weight: 600; padding: 2px 9px; border-radius: 999px; background: var(--soft); color: var(--muted); flex: none; }
  .badge.up { background: var(--up-bg); color: var(--up-text); }
  .badge.down { background: var(--down-bg); color: var(--down-text); }
  .nums { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .nums .k { display: block; color: var(--muted); font-size: 11px; }
  .nums .v { font-size: 14px; font-weight: 500; font-variant-numeric: tabular-nums; }
  .bars { display: flex; gap: 2px; height: 26px; align-items: stretch; }
  .bars span { flex: 1; border-radius: 2px; background: var(--idle); min-width: 2px; opacity: .55; }
  .bars span.up { background: var(--up); opacity: .9; } .bars span.down { background: var(--down); opacity: 1; }
  .bars span:hover { opacity: 1; outline: 1px solid var(--text); }
  .svc.paused .bars span { opacity: .35; }
  .foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; border-top: 1px solid var(--soft); padding-top: 8px; margin: 0 -6px; padding-left: 6px; padding-right: 0; }
  .foot .note { color: var(--muted); font-size: 12px; }
  .acts { display: flex; gap: 2px; margin-left: auto; }
  .tag { font-size: 10px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line); border-radius: 4px; padding: 0 5px; margin-right: 4px; white-space: nowrap; }
  .why { color: var(--down-text); font-size: 12px; margin-top: -6px; overflow-wrap: anywhere; }
  .empty { padding: 56px 20px; text-align: center; color: var(--muted); background: var(--panel); border: 1px dashed var(--line); border-radius: 14px; }

  @media (max-width: 720px) {
    .wrap { padding-top: 20px; }
    .stats { grid-template-columns: repeat(2, 1fr); }
    .stat:nth-child(3) { border-left: 0; }
    .stat:nth-child(n+3) { border-top: 1px solid var(--line); }
    .grid { grid-template-columns: 1fr; }
    header .primary { width: 100%; }
  }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="brand">
      <div class="logo" aria-hidden="true">V</div>
      <div>
        <h1>VYNCO <span>Dashboard</span></h1>
        <div class="meta" id="meta">Loading…</div>
      </div>
    </div>
    <button class="primary" id="check">Check now</button>
  </header>
  <div class="hero" id="banner" role="status" aria-live="polite"><span class="dot"></span><div><strong>Waiting for the first check</strong></div></div>
  <div class="stats" id="tiles"></div>
  <div id="hours"></div>
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

function renderHours() {
  const h = data.hours;
  if (!h) { $("hours").innerHTML = ""; return; }
  const pct = Math.min(100, (h.used / h.limit) * 100);
  const left = Math.max(0, h.limit - h.used);
  const color = pct >= 100 ? "var(--down)" : pct >= 80 ? "var(--cloudflare)" : "var(--up)";
  const note = h.burnPerDay
    ? "Pinging " + (h.burnPerDay / 24) + " Render service" + (h.burnPerDay === 24 ? "" : "s") + " keeps them awake: about " + h.burnPerDay + " h a day, so the " + Math.round(left) + " h left last about " + (left / h.burnPerDay).toFixed(1) + " days."
    : "Every Render service is paused, so hours only build up while one is awake from real visits or a manual Ping.";
  $("hours").innerHTML = '<div class="hours"><div class="top"><div><div class="k">Render free hours · ' + esc(h.month) + '</div>' +
    '<div class="big">' + Math.round(h.used) + ' <small>/ ' + h.limit + ' h shared by all free services</small></div></div>' +
    '<button class="sm" id="sethours">Set from Render Billing</button></div>' +
    '<div class="bar"><i style="width:' + pct.toFixed(1) + '%;background:' + color + '"></i></div>' +
    '<div class="note">' + note + " Resets each billing period. Figure is the last value you set, plus " + h.estAdded.toFixed(1) + " h the Worker has added since.</div></div>";
}

function render() {
  if (!data) return;
  const { targets, runs } = data;
  const pings = data.pings || {};
  renderHours();
  const last = runs.at(-1);
  if (!last) {
    $("groups").innerHTML = '<div class="empty">No checks yet. Press <b>Check now</b>, or wait for the next cron run.</div>';
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
  const live = targets.filter((t) => !t.paused);
  const down = live.filter((t) => stats[t.id].now && !stats[t.id].now[0]);
  const upNow = live.filter((t) => stats[t.id].now && stats[t.id].now[0]);
  const lat = upNow.map((t) => stats[t.id].now[1]);
  const all = runs.flatMap((r) => Object.values(r.r));
  const overall = all.length ? (all.filter((s) => s[0]).length / all.length) * 100 : 0;

  const cls = down.length ? "down" : "up";
  const paused = targets.length - live.length;
  $("banner").className = "hero " + cls;
  $("banner").innerHTML = '<span class="dot ' + cls + '"></span><div><strong>' +
    (down.length ? down.length + " service" + (down.length === 1 ? "" : "s") + " down" : "All systems operational") + "</strong><small>" +
    (down.length ? down.map((t) => esc(t.name)).join(", ") : upNow.length + " of " + live.length + " monitored services responding") +
    (paused ? " · " + paused + " paused" : "") + "</small></div>";
  document.title = (down.length ? "(" + down.length + " down) " : "") + "VYNCO Dashboard";

  const next = Math.max(0, Math.ceil((last.t + CRON_MINUTES * 60e3 - Date.now()) / 60e3));
  $("meta").textContent = "Checked " + ago(last.t) + " · next check in ~" + next + "m · " + runs.length + " runs stored";

  const tiles = [
    ["Up now", upNow.length + " / " + live.length],
    ["Median latency", lat.length ? ms(lat.sort((a, b) => a - b)[Math.floor(lat.length / 2)]) : "–"],
    ["Uptime · " + span(last.t - runs[0].t), overall.toFixed(1) + "%"],
    ["Pinged to stay awake", live.filter((t) => t.keepAlive).length + " services"],
  ];
  $("tiles").innerHTML = tiles.map(([k, v]) => '<div class="stat"><div class="k">' + k + '</div><div class="v">' + v + "</div></div>").join("");

  $("groups").innerHTML = Object.entries(PROVIDERS).map(([p, label]) => {
    const list = targets.filter((t) => t.provider === p);
    if (!list.length) return "";
    const cards = list.map((t) => {
      const s = stats[t.id];
      const manual = pings[t.id];
      // A paused service is not checked on a schedule, so show its last manual ping instead.
      const n = t.paused ? (manual ? manual.s : null) : s.now;
      const state = !n ? "" : n[0] ? "up" : "down";
      const pad = Array(Math.max(0, BARS - s.bars.length)).fill("<span></span>").join("");
      const bars = s.bars.map((b) => {
        const st = !b.s ? "" : b.s[0] ? "up" : "down";
        const tip = new Date(b.t).toLocaleString() + " — " + (!b.s ? "not checked" : (b.s[2] || "no response") + ", " + ms(b.s[1]) + (b.s[3] ? " — " + b.s[3] : ""));
        return '<span class="' + st + '" title="' + esc(tip) + '"></span>';
      }).join("");
      const badge = t.paused ? "Paused" : !n ? "Pending" : n[0] ? "Up" : "Down";
      const tag = t.paused ? "" : (t.keepAlive ? '<span class="tag">keep-alive</span>' : "");
      const note = t.paused ? (manual ? "Last ping " + ago(manual.t) : "Not being pinged") : "";
      const id = esc(t.id);
      return '<article class="svc' + (t.paused ? " paused" : "") + (state === "down" && !t.paused ? " down" : "") + '">' +
        '<div class="svc-top"><span class="dot ' + state + '"></span>' +
          '<div class="svc-id"><b>' + esc(t.name) + '</b><span class="host mono">' + esc(t.host) + "</span></div>" +
          '<span class="badge ' + (t.paused ? "" : state) + '">' + badge + "</span></div>" +
        '<div class="nums">' +
          '<div><span class="k">Latency</span><span class="v mono">' + (n ? ms(n[1]) : "–") + "</span></div>" +
          '<div><span class="k">Status</span><span class="v mono">' + (n ? (n[2] || "no reply") : "–") + "</span></div>" +
          '<div><span class="k">Uptime</span><span class="v mono">' + (t.paused || s.uptime == null ? "–" : s.uptime.toFixed(s.uptime === 100 ? 0 : 1) + "%") + "</span></div></div>" +
        '<div class="bars" aria-hidden="true">' + pad + bars + "</div>" +
        (n && !n[0] && n[3] ? '<div class="why">' + esc(n[3]) + "</div>" : "") +
        '<div class="foot"><span class="note">' + tag + esc(note) + "</span>" +
          '<div class="acts"><button class="sm" data-act="ping" data-id="' + id + '">Ping</button>' +
          '<button class="sm" data-act="pause" data-id="' + id + '">' + (t.paused ? "Resume" : "Pause") + "</button></div></div></article>";
    }).join("");
    const allPaused = list.every((t) => t.paused);
    return '<section><h2><i style="background:var(--' + p + ')"></i>' + label + ' <span class="count">' + list.length + '</span>' +
      '<button class="sm all" data-act="pause-group" data-provider="' + p + '">' + (allPaused ? "Resume all" : "Pause all") + "</button></h2>" +
      '<div class="grid">' + cards + "</div></section>";
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

const send = async (url, body) => {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { alert(await res.text()); return false; }
  data = await res.json(); render();
  return true;
};

document.addEventListener("click", async (e) => {
  const set = e.target.closest("#sethours");
  if (set) {
    const v = prompt("Render free hours used this month. Read it from Render, Workspace Settings, Billing:", Math.round(data.hours.used));
    if (v === null) return;
    const used = Number(v);
    if (!Number.isFinite(used) || used < 0) { alert("Enter a number of hours."); return; }
    await send("/api/hours", { used });
    return;
  }
  const b = e.target.closest("button[data-act]");
  if (!b) return;
  if (b.dataset.act === "pause-group") {
    const p = b.dataset.provider;
    const group = data.targets.filter((x) => x.provider === p);
    const resume = group.every((x) => x.paused);
    if (resume && p === "render") {
      const h = data.hours;
      const burn = h.burnPerDay + 24 * group.length;
      const left = Math.max(0, h.limit - h.used);
      if (!confirm("Resuming all " + group.length + " Render services keeps them awake all day: about " + (24 * group.length) + " free hours a day from a pool of " + h.limit + " shared by every free service. With " + Math.round(left) + " h left, the pool lasts about " + (left / burn).toFixed(1) + " days. Resume all?")) return;
    }
    await send("/api/pause", { provider: p, paused: !resume });
    return;
  }
  const t = data.targets.find((x) => x.id === b.dataset.id);
  if (b.dataset.act === "ping") {
    b.disabled = true; b.textContent = "Pinging…";
    await send("/api/ping", { id: t.id });
    return;
  }
  if (t.paused && t.provider === "render") {
    const h = data.hours;
    const burn = h.burnPerDay + 24;
    const left = Math.max(0, h.limit - h.used);
    const ok = confirm("Resuming pings " + t.name + " every " + CRON_MINUTES + " minutes, which keeps it awake all day: about 24 free hours a day from a pool of " + h.limit + " shared by every free service. With " + Math.round(left) + " h left and this one added, the pool lasts about " + (left / burn).toFixed(1) + " days. Resume?");
    if (!ok) return;
  }
  await send("/api/pause", { id: t.id, paused: !t.paused });
});

load("/api/status");
setInterval(() => load("/api/status"), 60e3);
setInterval(render, 15e3);
</script>
</body>
</html>`;
