/* Sentinal AI — shared core: icons, sample data, charts, page shell */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Sync CYBI automation settings to the Sentinal backend so the background worker uses the same values. */
async function syncCybiAutomationSettings(profile) {
  if (!profile || typeof profile !== 'object') return false;
  try {
    const response = await fetch('/api/cybi/automation-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(profile)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.status !== 'success') throw new Error(data.detail || data.error || 'Backend rejected automation settings');
    return true;
  } catch (error) {
    console.warn('[Sentinal] Could not sync CYBI automation settings to backend:', error);
    return false;
  }
}

/* ---------- icons (lucide-style, inline) ---------- */
const ICONS = {
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
  memory: '<path d="M6 19v-3M10 19v-3M14 19v-3M18 19v-3M8 11V9M16 11V9M12 11V9M2 15h20"/><path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>',
  disk: '<path d="M22 12H2"/><path d="m5.45 5.11-3.45 6.89v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><path d="M6 16h.01M10 16h.01"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  shieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  shieldAlert: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4M12 16h.01"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  settings: '<path d="M20 7h-9M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  app: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4M2 8h20M6 4v4"/>',
  brain: '<circle cx="12" cy="12" r="3"/><path d="M12 9V4M12 20v-5M9 12H4M20 12h-5M9.9 9.9 6.5 6.5M17.5 17.5l-3.4-3.4M14.1 9.9l3.4-3.4M6.5 17.5l3.4-3.4"/><circle cx="12" cy="3" r="1"/><circle cx="12" cy="21" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="21" cy="12" r="1"/>',
  finger: '<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4M14 13.12c0 2.38 0 6.38-1 8.88M17.29 21.02c.12-.6.43-2.3.5-3.02M2 12a10 10 0 0 1 18-6M2 16h.01M21.8 16c.2-2 .131-5.354 0-6M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2M8.65 22c.21-.66.45-1.32.57-2M9 6.8a6 6 0 0 1 9 5.2v2"/>',
  network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
  fileDown: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M12 18v-6M9 15l3 3 3-3"/>',
  flask: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2M8.5 2h7M7 16h10"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>', chevD: '<path d="m6 9 6 6 6-6"/>',
  arrowR: '<path d="M5 12h14M12 5l7 7-7 7"/>', arrowUR: '<path d="M7 7h10v10M7 17 17 7"/>',
  arrowDL: '<path d="M17 7 7 17M17 17H7V7"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  play: '<path d="M6 3 20 12 6 21z"/>',
  radio: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5M19.1 4.9C23 8.8 23 15.1 19.1 19"/><circle cx="12" cy="12" r="2"/>',
  sliders: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
  circle: '<circle cx="12" cy="12" r="10"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  bot: '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h.01M16 16h.01"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
};
const icon = (n, s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- sample telemetry (ported from the original project) ---------- */
const ranges = ['1 min', '5 min', '1 hour', '24 hours'];
const incidents = [
  { id: 'INC-00041', threat: 'Brute Force', source: '192.168.1.50', target: '/login', app: 'Hanu AI', risk: 92, level: 'HIGH', time: '10:32:09', status: 'INVESTIGATING', events: 12, confidence: 97 },
  { id: 'INC-00042', threat: 'Traffic Anomaly', source: '203.0.113.84', target: '/api/chat', app: 'Hanu AI', risk: 86, level: 'HIGH', time: '10:31:42', status: 'DETECTED', events: 2400, confidence: 94 },
  { id: 'INC-00040', threat: 'Phishing', source: '198.51.100.23', target: '/redirect', app: 'Hanu AI', risk: 68, level: 'MEDIUM', time: '10:28:18', status: 'ACTION RECOMMENDED', events: 8, confidence: 89 },
  { id: 'INC-00039', threat: 'Suspicious Activity', source: '192.168.1.72', target: '/admin', app: 'Hanu AI', risk: 35, level: 'LOW', time: '10:24:06', status: 'DETECTED', events: 4, confidence: 82 }
];
const processes = [
  { name: 'sentinal-agent', pid: 1248, cpu: 18.4, ram: 1240, status: 'Running' },
  { name: 'hanu-connector', pid: 2036, cpu: 12.8, ram: 864, status: 'Running' },
  { name: 'postgres', pid: 956, cpu: 8.2, ram: 2180, status: 'Running' },
  { name: 'nginx', pid: 1102, cpu: 4.6, ram: 328, status: 'Running' },
  { name: 'cybi-worker', pid: 3014, cpu: 3.1, ram: 768, status: 'Running' }
];
function makeSeries(seed = 0, count = 60, interval = 5) {
  return Array.from({ length: count }, (_, i) => {
    const spike = Math.exp(-Math.pow((i - count * .72) / 2.1, 2));
    const wave = Math.sin(i * .62 + seed) * 7 + Math.cos(i * 1.38) * 3;
    const iso = new Date(Date.UTC(2026, 9, 8, 10, 34) - (count - 1 - i) * interval * 1000).toISOString();
    const time = interval >= 1440 ? iso.slice(5, 16).replace('T', ' ') : iso.slice(11, 19);
    return { time, cpu: Math.max(8, 28 + wave + spike * 42), ram: 42 + i * .12 + wave * .2, download: 42 + wave * 1.2 + spike * 95, upload: 12 + wave * .35 + spike * 22, read: 80 + wave * 3 + spike * 110, write: 30 + wave + spike * 25, success: Math.round(20 + wave), failed: Math.round(2 + spike * 12), suspicious: Math.round(spike * 6), requests: Math.round(150 + wave * 3 + spike * 2250), baseline: 150, sessions: Math.round(240 + i * .6 + wave), newSessions: Math.round(15 + wave * .4), ended: Math.round(10 + wave * .2), errors: Math.round(2 + spike * 18), response: Math.round(90 + wave + spike * 60), low: Math.round(9 + wave * .3), medium: Math.round(5 + spike * 6), high: Math.round(2 + spike * 10), critical: Math.round(spike * 3), risk: Math.round(20 + i * .65 + spike * 34) };
  });
}
const lvl = l => l === 'HIGH' ? 'coral' : l === 'MEDIUM' ? 'amber' : 'mint';

/* ---------- phishing URL inspection (structure only — the URL is never visited) ---------- */
const BRANDS = ['paypal', 'apple', 'microsoft', 'google', 'amazon', 'netflix', 'facebook', 'instagram', 'binance', 'bank'];
const KEYWORDS = ['login', 'signin', 'verify', 'secure', 'account', 'update', 'password', 'wallet', 'confirm', 'billing'];
const BAD_TLD = ['.zip', '.xyz', '.top', '.click', '.tk', '.gq', '.work', '.support'];
const CATS = ['Transport', 'Host', 'Domain', 'Keywords', 'Obfuscation'];
function inspectUrl(value) {
  let u;
  try { u = new URL(value.trim()); } catch { return { error: 'Enter a complete http:// or https:// URL.' }; }
  if (!['http:', 'https:'].includes(u.protocol)) return { error: 'Only HTTP and HTTPS URLs can be inspected.' };
  const host = u.hostname.toLowerCase(), parts = host.split('.'), isIp = /^\d+\.\d+\.\d+\.\d+$/.test(host);
  const registered = isIp ? host : parts.slice(-2).join('.');
  const full = (host + u.pathname + u.search).toLowerCase();
  const kw = KEYWORDS.filter(k => full.includes(k));
  const brand = BRANDS.find(b => host.includes(b) && !registered.startsWith(b + '.') && registered !== b + '.com');
  const I = [
    { label: 'Unencrypted HTTP connection', cat: 'Transport', weight: 15, hit: u.protocol === 'http:' },
    { label: 'Non-standard port', cat: 'Transport', weight: 10, hit: !!u.port && !['80', '443'].includes(u.port) },
    { label: 'IP address instead of a domain', cat: 'Host', weight: 25, hit: isIp },
    { label: 'Embedded credentials in URL', cat: 'Host', weight: 25, hit: !!(u.username || u.password) },
    { label: 'Brand name inside an unrelated domain', cat: 'Domain', weight: 25, hit: !!brand },
    { label: 'Internationalized (punycode) hostname', cat: 'Domain', weight: 20, hit: host.includes('xn--') },
    { label: 'Unusually deep subdomain structure', cat: 'Domain', weight: 15, hit: parts.length > 4 },
    { label: 'Frequently abused top-level domain', cat: 'Domain', weight: 10, hit: BAD_TLD.some(t => host.endsWith(t)) },
    { label: 'Many hyphens in hostname', cat: 'Domain', weight: 10, hit: (host.match(/-/g) || []).length >= 3 },
    { label: 'Credential-style keywords' + (kw.length ? ': ' + kw.slice(0, 3).join(', ') : ''), cat: 'Keywords', weight: Math.min(25, 12 * kw.length) || 12, hit: kw.length > 0 },
    { label: 'Redirect parameter in query', cat: 'Obfuscation', weight: 15, hit: /(url|redirect|next|return)=https?/i.test(u.search) },
    { label: 'Heavy percent-encoding', cat: 'Obfuscation', weight: 10, hit: (value.match(/%[0-9a-f]{2}/gi) || []).length > 3 },
    { label: 'Very long URL', cat: 'Obfuscation', weight: 10, hit: value.length > 100 }
  ];
  const score = Math.min(98, I.filter(i => i.hit).reduce((a, i) => a + i.weight, 0));
  const classification = score >= 70 ? 'HIGH RISK · LIKELY PHISHING' : score >= 40 ? 'SUSPICIOUS' : 'LOW RISK';
  const cats = CATS.map(c => Math.min(100, I.filter(i => i.cat === c && i.hit).reduce((a, i) => a + i.weight, 0) / 30 * 100));
  return { score, classification, tone: score >= 70 ? 'coral' : score >= 40 ? 'amber' : 'mint', indicators: I, cats, hostname: host,
    anatomy: [['Protocol', u.protocol.replace(':', '')], ['Hostname', host], ['Registered domain', registered], ['Top-level domain', isIp ? 'n/a' : '.' + parts.at(-1)], ['Subdomain depth', isIp ? 0 : Math.max(0, parts.length - 2)], ['Path', u.pathname], ['Query parameters', [...u.searchParams.keys()].length], ['URL length', value.length + ' chars']] };
}

/* ---------- UI building blocks ---------- */
const panel = ({ title, eyebrow = '', action = '', body = '', cls = '', id = '' }) => `<section class="glass-panel ${cls}"${id ? ` id="${id}"` : ''}><header class="panel-header"><div>${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ''}<h2>${title}</h2></div>${action}</header>${body}</section>`;
const stat = (label, value, suffix = '', trend = '', tone = '', id = '') => `<div class="stat"><span class="eyebrow">${label}</span><div class="stat-value ${tone}"${id ? ` id="${id}"` : ''}>${value}<small>${suffix}</small></div>${trend ? `<span class="stat-trend">${trend}</span>` : ''}</div>`;
const ring = (value, label, tone = 'cyan', size = 100) => `<div class="ring"><svg width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${label}: ${value}%"><circle cx="50" cy="50" r="41" fill="none" stroke="var(--chart-grid)" stroke-width="5"/><circle cx="50" cy="50" r="41" fill="none" stroke="var(--${tone})" stroke-width="5" stroke-dasharray="${value * 2.576} 257.6" transform="rotate(-90 50 50)" stroke-linecap="round"/><text x="50" y="48" text-anchor="middle" fill="var(--foreground)" font-size="23">${value}<tspan font-size="10">%</tspan></text><text x="50" y="63" text-anchor="middle" fill="var(--muted-foreground)" font-size="7">${label}</text></svg></div>`;
const rangeSel = (list, cur, attr = 'data-range') => `<div class="range-selector">${list.map(r => `<button class="btn btn-sm btn-ghost ${r === cur ? 'selected' : ''}" ${attr}="${r}">${r}</button>`).join('')}</div>`;

/* ---------- SVG chart engine (replaces Recharts) ---------- */
const Charts = {
  queue: [], n: 0, els: new Set(),
  add(o) { const id = 'ch' + (++this.n); this.queue.push([id, o]); return `<div class="analytical-chart" id="${id}"></div>`; },
  flush() {
    this.queue.forEach(([id, o]) => { const el = document.getElementById(id); if (!el) return; el._o = o; this.els.add(el); this.ro.observe(el); drawChart(el); });
    this.queue = [];
  },
  ro: new ResizeObserver(es => es.forEach(e => { if (!e.target.isConnected) { Charts.els.delete(e.target); Charts.ro.unobserve(e.target); } else drawChart(e.target); }))
};
function niceStep(x) { const p = Math.pow(10, Math.floor(Math.log10(x))), f = x / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
function monotone(p) {
  const n = p.length; if (n < 3) return p.map((q, i) => (i ? 'L' : 'M') + q[0] + ',' + q[1]).join('');
  const dx = [], m = [], t = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = p[i + 1][0] - p[i][0]; m[i] = (p[i + 1][1] - p[i][1]) / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) { if (m[i] === 0) { t[i] = t[i + 1] = 0; } else { const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; } } }
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < n - 1; i++) d += `C${p[i][0] + dx[i] / 3},${p[i][1] + t[i] * dx[i] / 3} ${p[i + 1][0] - dx[i] / 3},${p[i + 1][1] - t[i + 1] * dx[i] / 3} ${p[i + 1][0]},${p[i + 1][1]}`;
  return d;
}
/* Original chart renderer, kept unchanged for the System page */
function drawChartLegacy(el) {
  const o = el?._o;
  if (!o || !el.isConnected) return;

  // Validate chart dimensions.
  const W = Math.max(
    200,
    Number(el.clientWidth) || 200
  );

  const H = Math.max(
    80,
    Number(o.height) || 150
  );

  const m = {
    t: 10,
    r: 12,
    b: 22,
    l: 38
  };

  // Normalize the data to finite numeric values.
  const sourceData = Array.isArray(o.data)
    ? o.data
    : [];

  const keys = Array.isArray(o.series)
    ? o.series.map(s => s.key)
    : [];

  const data = sourceData.map(d => {
    const point = {
      time: String(d?.time ?? '--:--')
    };

    keys.forEach(key => {
      const value = Number(d?.[key]);

      point[key] = Number.isFinite(value)
        ? Math.max(0, value)
        : 0;
    });

    return point;
  });

  const n = data.length;

  // Render a valid empty chart instead of invalid SVG.
  if (n === 0 || keys.length === 0) {
    el.innerHTML = `
      <div class="chart-legend">
        ${(o.series || []).map(s => `
          <span>
            <i class="legend-dot ${s.color}"></i>
            ${s.name}
          </span>
        `).join('')}
      </div>
      <div style="
        height:${H}px;
        display:flex;
        align-items:center;
        justify-content:center;
        color:var(--muted-foreground);
        font-size:12px;
      ">
        Waiting for telemetry…
      </div>
    `;

    return;
  }

  const pw = Math.max(1, W - m.l - m.r);
  const ph = Math.max(1, H - m.t - m.b);
  const unit = o.unit || '';

  // Calculate a safe vertical scale.
  const threshold = Number(o.threshold);

  const validThreshold = Number.isFinite(threshold)
    ? Math.max(0, threshold)
    : 0;

  const values = data.flatMap(d =>
    keys.map(key => d[key])
  );

  const maxValue = Math.max(
    1,
    validThreshold,
    ...values
  );

  // Choose a finite, positive tick interval.
  const roughStep = maxValue * 1.02 / 4;

  const magnitude = Math.pow(
    10,
    Math.floor(Math.log10(Math.max(roughStep, 0.000001)))
  );

  const candidates = [
    1, 2, 2.5, 5, 10
  ].map(factor => factor * magnitude);

  let step = candidates.find(candidate =>
    Number.isFinite(candidate) &&
    candidate > 0 &&
    Math.ceil(maxValue * 1.02 / candidate) <= 4
  );

  if (!Number.isFinite(step) || step <= 0) {
    step = magnitude;
  }

  if (!Number.isFinite(step) || step <= 0) {
    step = 1;
  }

  const ticks = Math.max(
    2,
    Math.min(10, Math.ceil(maxValue * 1.02 / step))
  );

  const top = step * ticks;

  // Support both one-point and multi-point charts.
  const X = i => n === 1
    ? m.l + pw / 2
    : m.l + i * pw / (n - 1);

  const Y = value => {
    const v = Number.isFinite(Number(value))
      ? Math.max(0, Number(value))
      : 0;

    return m.t + ph - (v / top) * ph;
  };

  const uid = String(
    el.id || `chart-${Math.random().toString(36).slice(2)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  let g = '';

  // Horizontal grid and labels.
  for (let k = 0; k <= ticks; k++) {
    const v = step * k;
    const y = Y(v);

    g += `
      <line
        x1="${m.l}"
        x2="${W - m.r}"
        y1="${y}"
        y2="${y}"
        stroke="var(--chart-grid)"
        stroke-dasharray="2 4"
      />
      <text
        x="${m.l - 8}"
        y="${y + 3}"
        text-anchor="end"
        fill="var(--muted-foreground)"
        font-size="9"
      >${Number.isInteger(v) ? v : v.toFixed(1)}${unit.trim()}</text>
    `;
  }

  // Time labels.
  const cnt = Math.min(
    n,
    Math.max(2, Math.floor(pw / 90))
  );

  for (let k = 0; k < cnt; k++) {
    const i = cnt === 1
      ? 0
      : Math.round(k * (n - 1) / (cnt - 1));

    const label = String(data[i].time).slice(0, 8);

    g += `
      <text
        x="${Math.min(W - 14, Math.max(m.l + 8, X(i)))}"
        y="${H - 6}"
        text-anchor="middle"
        fill="var(--muted-foreground)"
        font-size="9"
      >${label}</text>
    `;
  }

  // Highlight the anomaly window.
  if (o.anomaly && n > 1) {
    const a = X(Math.floor((n - 1) * 0.68));
    const b = X(Math.floor((n - 1) * 0.78));

    g += `
      <rect
        x="${Math.min(a, b)}"
        y="${m.t}"
        width="${Math.max(0, b - a)}"
        height="${ph}"
        fill="var(--coral)"
        fill-opacity=".08"
      />
    `;
  }

  // Threshold line.
  if (validThreshold > 0) {
    const y = Y(validThreshold);

    g += `
      <line
        x1="${m.l}"
        x2="${W - m.r}"
        y1="${y}"
        y2="${y}"
        stroke="var(--coral)"
        stroke-opacity=".5"
        stroke-dasharray="4 5"
      />
    `;
  }

  let defs = '';

  // Draw the actual data series.
  o.series.forEach(s => {
    const pts = data.map((d, i) => [
      X(i),
      Y(d[s.key])
    ]);

    // Guard against invalid coordinates from the curve function.
    const validPoints = pts.every(([x, y]) =>
      Number.isFinite(x) && Number.isFinite(y)
    );

    if (!validPoints) {
      console.warn(
        '[Sentinal] Skipping invalid chart points:',
        s.key
      );
      return;
    }

    let line;

    if (pts.length === 1) {
      line = `M${pts[0][0]},${pts[0][1]}`;
    } else {
      line = monotone(pts);
    }

    if (typeof line !== 'string' || line.includes('NaN')) {
      console.warn(
        '[Sentinal] Invalid curve; using straight lines:',
        s.key
      );

      line = pts.map(([x, y], i) =>
        `${i === 0 ? 'M' : 'L'}${x},${y}`
      ).join(' ');
    }

    if (o.area) {
      defs += `
        <linearGradient
          id="${uid}-${s.key}"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="var(--${s.color})"
            stop-opacity=".25"
          />
          <stop
            offset="100%"
            stop-color="var(--${s.color})"
            stop-opacity="0"
          />
        </linearGradient>
      `;

      const areaPath = pts.length > 1
        ? `${line} L${X(n - 1)},${Y(0)} L${X(0)},${Y(0)} Z`
        : '';

      if (areaPath) {
        g += `
          <path
            d="${areaPath}"
            fill="url(#${uid}-${s.key})"
          />
        `;
      }
    }

    g += `
      <path
        d="${line}"
        fill="none"
        stroke="var(--${s.color})"
        stroke-width="${Number(o.sw) || 1.3}"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `;

    if (o.dot && pts.length) {
      const lp = pts[pts.length - 1];

      g += `
        <circle cx="${lp[0]}" cy="${lp[1]}" r="6" fill="var(--${s.color})" fill-opacity=".16"/>
        <circle cx="${lp[0]}" cy="${lp[1]}" r="2.8" fill="var(--${s.color})"/>
      `;
    }
  });

  const legend = `
    <div class="chart-legend">
      ${o.series.map(s => `
        <span>
          <i class="legend-dot ${s.color}"></i>
          ${s.name}
        </span>
      `).join('')}

      ${validThreshold > 0 ? `
        <span>
          <i class="threshold-key"></i>
          Threshold ${validThreshold}${unit}
        </span>
      ` : ''}
    </div>
  `;

  el.innerHTML = `
    ${legend}

    <svg
      width="${W}"
      height="${H}"
      viewBox="0 0 ${W} ${H}"
      role="img"
      aria-label="Chart: ${o.series.map(s => s.name).join(', ')}"
    >
      <defs>${defs}</defs>
      ${g}

      <line
        class="cx"
        y1="${m.t}"
        y2="${m.t + ph}"
        stroke="var(--silver)"
        stroke-opacity=".4"
        style="display:none"
      />

      <rect
        class="hit"
        x="${m.l}"
        y="${m.t}"
        width="${pw}"
        height="${ph}"
        fill="transparent"
      />
    </svg>

    <div class="chart-tip"></div>
  `;

  // Tooltip interaction.
  const svg = $('svg', el);
  const tip = $('.chart-tip', el);
  const cx = $('.cx', el);

  svg.addEventListener('pointermove', e => {
    const r = svg.getBoundingClientRect();

    const rawIndex = n === 1
      ? 0
      : Math.round(
          (e.clientX - r.left - m.l) / pw * (n - 1)
        );

    const i = Math.max(0, Math.min(n - 1, rawIndex));
    const d = data[i];

    cx.setAttribute('x1', X(i));
    cx.setAttribute('x2', X(i));
    cx.style.display = '';

    tip.innerHTML =
      `<b>${d.time}</b>` +
      o.series.map(s => `
        <div>
          <i class="legend-dot ${s.color}"></i>
          ${s.name}: ${d[s.key].toFixed(1)}${unit}
        </div>
      `).join('');

    tip.style.display = 'block';

    const tw = tip.offsetWidth;

    const left = X(i) + 12 > W - tw
      ? X(i) - tw - 12
      : X(i) + 12;

    tip.style.left =
      Math.min(W - tw - 4, Math.max(4, left)) + 'px';

    tip.style.top = (m.t + 20) + 'px';
  });

  svg.addEventListener('pointerleave', () => {
    tip.style.display = 'none';
    cx.style.display = 'none';
  });
}


/* Shared chart styling: legend values and tooltip card */
function injectChartCss() {
  if (document.getElementById('chartProCss')) return;
  const st = document.createElement('style');
  st.id = 'chartProCss';
  st.textContent = `
  .analytical-chart .chart-legend{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;padding:0 4px 4px;font-size:11px;color:var(--muted-foreground)}
  .analytical-chart .chart-legend>span{display:inline-flex;align-items:center;gap:7px}
  .analytical-chart .chart-legend b{margin-left:2px;font:600 11px var(--font-mono);color:var(--foreground);font-variant-numeric:tabular-nums}
  .analytical-chart .chart-tip{min-width:148px;padding:9px 11px;border-radius:9px;border:1px solid rgba(255,255,255,.12);background:rgba(7,18,24,.94);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 10px 28px rgba(0,0,0,.4);font:500 11px var(--font-mono);pointer-events:none;z-index:5}
  .analytical-chart .chart-tip>b{display:block;margin-bottom:5px;padding-bottom:5px;border-bottom:1px solid var(--chart-grid);color:var(--muted-foreground);font-size:10px;letter-spacing:.08em;font-weight:500}
  .analytical-chart .chart-tip>div{display:flex;align-items:center;gap:8px;line-height:1.75;color:var(--foreground)}
  .analytical-chart .chart-tip>div>span{margin-left:auto;padding-left:14px;font-weight:600;font-variant-numeric:tabular-nums}
  .analytical-chart svg text{font-family:var(--font-mono)}`;
  document.head.appendChild(st);
}

function drawChart(el) {
  const o = el?._o;
  if (!o || !el.isConnected) return;
  if (o.legacy) return drawChartLegacy(el);
  injectChartCss();

  const W = Math.max(200, Number(el.clientWidth) || 200);
  const H = Math.max(80, Number(o.height) || 150);
  const series = Array.isArray(o.series) ? o.series : [];
  const keys = series.map(s => s.key);
  const unit = o.unit || '';

  // Normalise to finite, non-negative numbers.
  const data = (Array.isArray(o.data) ? o.data : []).map(d => {
    const point = { time: String(d?.time ?? '--:--') };
    keys.forEach(key => {
      const v = Number(d?.[key]);
      point[key] = Number.isFinite(v) ? Math.max(0, v) : 0;
    });
    return point;
  });
  const n = data.length;

  const threshold = Number(o.threshold);
  const validThreshold = Number.isFinite(threshold) ? Math.max(0, threshold) : 0;
  const fmtVal = v => Number.isInteger(v) ? v.toLocaleString() : v.toFixed(1);

  const legend = () => `<div class="chart-legend">
    ${series.map(s => `<span><i class="legend-dot ${s.color}"></i>${s.name}${n ? `<b>${fmtVal(data[n - 1][s.key])}${unit}</b>` : ''}</span>`).join('')}
    ${validThreshold > 0 ? `<span><i class="threshold-key"></i>Threshold ${validThreshold}${unit}</span>` : ''}
  </div>`;

  if (n === 0 || keys.length === 0) {
    el.innerHTML = `${legend()}
      <div style="height:${H}px;display:flex;align-items:center;justify-content:center;color:var(--muted-foreground);font-size:12px">Waiting for telemetry…</div>`;
    return;
  }

  /* ---------- vertical scale (whole numbers for counts) ---------- */
  const values = data.flatMap(d => keys.map(k => d[k]));
  const allInt = values.every(Number.isInteger);
  const maxValue = Math.max(1, validThreshold, ...values);
  let step;
  if (allInt) {
    const raw = Math.max(1, Math.ceil(maxValue / 4));
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    step = ([1, 2, 5, 10].find(f => f * p >= raw) || 10) * p;
  } else {
    const rough = maxValue * 1.02 / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(Math.max(rough, 1e-6))));
    step = [1, 2, 2.5, 5, 10].map(f => f * mag).find(c => c > 0 && Math.ceil(maxValue * 1.02 / c) <= 4) || mag || 1;
  }
  const ticks = Math.max(2, Math.min(10, Math.ceil(maxValue * (allInt ? 1 : 1.02) / step)));
  const top = step * ticks;
  const tickText = k => {
    const v = step * k;
    return (Number.isInteger(v) ? v.toLocaleString() : v.toFixed(1)) + unit.trim();
  };

  const labelW = Math.max(...Array.from({ length: ticks + 1 }, (_, k) => tickText(k).length));
  const m = { t: 12, r: 18, b: 26, l: Math.min(84, Math.max(34, labelW * 5.8 + 16)) };
  const pw = Math.max(1, W - m.l - m.r);
  const ph = Math.max(1, H - m.t - m.b);

  const sparse = false;                         // always draw smooth wave curves
  const inset = n > 1 ? 8 : 0;
  const X = i => n === 1 ? m.l + pw / 2 : m.l + inset + i * (pw - 2 * inset) / (n - 1);
  const Y = v => m.t + ph - (Math.max(0, Number(v) || 0) / top) * ph;

  const uid = String(el.id || `chart-${Math.random().toString(36).slice(2)}`).replace(/[^a-zA-Z0-9_-]/g, '');
  const sw = Number(o.sw) || 1.7;

  /* ---------- grid + axes ---------- */
  let grid = '';
  for (let k = 0; k <= ticks; k++) {
    const y = Y(step * k);
    grid += `<line x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}" stroke="color-mix(in oklab, var(--muted-foreground) ${k === 0 ? 55 : 38}%, transparent)" stroke-width="1" ${k === 0 ? '' : 'stroke-dasharray="4 4"'}/>
      <text x="${m.l - 9}" y="${y + 3}" text-anchor="end" fill="var(--muted-foreground)" font-size="9.5">${tickText(k)}</text>`;
  }

  const cnt = Math.max(2, Math.min(n, Math.floor(pw / 96)));
  const idxs = n === 1 ? [0] : [...new Set(Array.from({ length: cnt }, (_, k) => Math.round(k * (n - 1) / (cnt - 1))))];
  let prev = null;
  idxs.forEach((i, k) => {
    const label = String(data[i].time).slice(0, 8);
    if (label === prev) return;
    prev = label;
    const last = idxs.length > 1 && k === idxs.length - 1;
    const first = idxs.length > 1 && k === 0;
    const lx = first ? m.l : last ? W - m.r : X(i);
    grid += `<line x1="${X(i)}" x2="${X(i)}" y1="${m.t}" y2="${m.t + ph + 4}" stroke="color-mix(in oklab, var(--muted-foreground) 24%, transparent)" stroke-dasharray="2 4"/>
      <text x="${lx}" y="${H - 7}" text-anchor="${first ? 'start' : last ? 'end' : 'middle'}" fill="var(--muted-foreground)" font-size="9.5">${label}</text>`;
  });

  if (o.anomaly && n > 1) {
    const a = X(Math.floor((n - 1) * 0.68)), b = X(Math.floor((n - 1) * 0.78));
    grid += `<rect x="${Math.min(a, b)}" y="${m.t}" width="${Math.max(0, b - a)}" height="${ph}" fill="var(--coral)" fill-opacity=".08"/>`;
  }
  if (validThreshold > 0) {
    const y = Y(validThreshold);
    grid += `<line x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}" stroke="var(--coral)" stroke-opacity=".55" stroke-dasharray="4 5"/>`;
  }

  /* ---------- series ---------- */
  let defs = '', areas = '', lines = '', marks = '', hover = '';
  series.forEach(s => {
    const pts = data.map((d, i) => [X(i), Y(d[s.key])]);
    if (!pts.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y))) return;
    const straight = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
    let line = pts.length === 1 ? `M${pts[0][0]},${pts[0][1]}` : (sparse ? straight : monotone(pts));
    if (typeof line !== 'string' || line.includes('NaN')) line = straight;
    const active = data.some(d => d[s.key] > 0);
    const c = `var(--${s.color})`;

    if (o.area && pts.length > 1 && active) {
      defs += `<linearGradient id="${uid}-${s.key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c}" stop-opacity=".22"/><stop offset="100%" stop-color="${c}" stop-opacity="0"/></linearGradient>`;
      areas += `<path d="${line} L${pts[pts.length - 1][0]},${Y(0)} L${pts[0][0]},${Y(0)} Z" fill="url(#${uid}-${s.key})"/>`;
    }
    lines += `<path d="${line}" fill="none" stroke="${c}" stroke-width="${active ? sw : sw * .8}" stroke-opacity="${active ? 1 : .6}" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 4px color-mix(in oklab, ${c} 55%, transparent))"/>`;

    if (n === 1) {
      marks += pts.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${c}" stroke="rgba(6,18,24,.95)" stroke-width="1.4"/>`).join('');
    }
    if (o.dot) {
      const lp = pts[pts.length - 1];
      marks += `<circle cx="${lp[0]}" cy="${lp[1]}" r="7" fill="${c}" fill-opacity=".16"/><circle cx="${lp[0]}" cy="${lp[1]}" r="3.4" fill="${c}" stroke="rgba(6,18,24,.95)" stroke-width="1.4"/>`;
    }
    hover += `<circle class="hv" data-key="${s.key}" r="4.6" fill="${c}" stroke="rgba(6,18,24,.95)" stroke-width="2" style="display:none"/>`;
  });

  el.innerHTML = `
    ${legend()}
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Chart: ${series.map(s => s.name).join(', ')}">
      <defs>${defs}</defs>
      ${grid}${areas}${lines}${marks}
      <line class="cx" y1="${m.t}" y2="${m.t + ph}" stroke="var(--silver)" stroke-opacity=".35" stroke-dasharray="3 3" style="display:none"/>
      ${hover}
      <rect class="hit" x="${m.l}" y="${m.t}" width="${pw}" height="${ph + 6}" fill="transparent"/>
    </svg>
    <div class="chart-tip"></div>`;

  /* ---------- hover: nearest point, crosshair, markers, tooltip ---------- */
  const svg = $('svg', el), tip = $('.chart-tip', el), cx = $('.cx', el), hv = $$('.hv', el);
  const move = e => {
    const r = svg.getBoundingClientRect(), px = e.clientX - r.left;
    let i = 0, best = Infinity;
    for (let k = 0; k < n; k++) { const dist = Math.abs(X(k) - px); if (dist < best) { best = dist; i = k; } }
    const d = data[i];
    cx.setAttribute('x1', X(i)); cx.setAttribute('x2', X(i)); cx.style.display = '';
    hv.forEach(h => { h.setAttribute('cx', X(i)); h.setAttribute('cy', Y(d[h.dataset.key])); h.style.display = ''; });
    tip.innerHTML = `<b>${d.time}</b>` + series.map(s =>
      `<div><i class="legend-dot ${s.color}"></i>${s.name}<span>${fmtVal(d[s.key])}${unit}</span></div>`).join('');
    tip.style.display = 'block';
    const tw = tip.offsetWidth;
    const left = X(i) + 14 > W - tw ? X(i) - tw - 14 : X(i) + 14;
    tip.style.left = Math.min(W - tw - 4, Math.max(4, left)) + 'px';
    tip.style.top = (m.t + 24) + 'px';
  };
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerdown', move);
  svg.addEventListener('pointerleave', () => {
    tip.style.display = 'none'; cx.style.display = 'none';
    hv.forEach(h => { h.style.display = 'none'; });
  });
}

/* ---------- threat relationship graph (shared by Security + CYBI) ---------- */
const GNODES = [['source', '192.168.1.50', 'SOURCE IP', 'globe'], ['user', 'admin', 'TARGET ACCOUNT', 'user'], ['app', 'Hanu AI', 'APPLICATION', 'app'], ['event', '12 failed attempts', 'AUTHENTICATION', 'finger'], ['threat', 'Brute force', 'HIGH RISK · 92', 'shieldAlert']];
// ============================================================
// SENTINAL AI — REAL-TIME THREAT RELATIONSHIP GRAPH
// ============================================================

const SENTINAL_CONNECTOR_URL = ''; // Use the dashboard backend so Connector port discovery stays centralized.

let threatGraphData = {
    sourceIP: 'Waiting for telemetry',
    username: 'Waiting for telemetry',
    application: 'Hanu AI',
    authentication: 'Waiting for events',
    threat: 'No confirmed incident',
    risk: null,
    incidentId: null,
    error: null
};


// Escape API data before inserting it into HTML.
function threatGraphEscape(value) {
    const text = String(value ?? 'Not available');

    return text.replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}


// Retrieve real telemetry from the existing Connector.
async function refreshThreatGraph() {
    try {
        const [eventsResponse, incidentsResponse] = await Promise.all([
            fetch(
                `/api/application/events`,
                { cache: 'no-store' }
            ),
            fetch(
                `/api/incidents`,
                { cache: 'no-store' }
            )
        ]);

        if (!eventsResponse.ok) {
            throw new Error(
                `Events API error: ${eventsResponse.status}`
            );
        }

        if (!incidentsResponse.ok) {
            throw new Error(
                `Incidents API error: ${incidentsResponse.status}`
            );
        }

        const eventsPayload = await eventsResponse.json();
        const incidentsPayload = await incidentsResponse.json();

        const events = Array.isArray(eventsPayload.events)
            ? eventsPayload.events
            : [];

        const incidents = Array.isArray(incidentsPayload.incidents)
            ? incidentsPayload.incidents
            : [];

        // Use only events explicitly associated with Hanu AI.
        const hanuEvents = events.filter(event =>
            String(event.source || event.application || event.application_name || '').trim().toLowerCase().includes('hanu')
        );

        // Sort newest first.
        hanuEvents.sort((a, b) => {
            const timeA = Date.parse(
                a.received_at || a.timestamp || a.event_time || ''
            ) || 0;

            const timeB = Date.parse(
                b.received_at || b.timestamp || b.event_time || ''
            ) || 0;

            return timeB - timeA;
        });

        const latestEvent = hanuEvents[0] || null;

        const failedLogins = hanuEvents.filter(event =>
            String(event.event || '').toLowerCase() === 'login_failed'
        );

        const successfulLogins = hanuEvents.filter(event =>
            String(event.event || '').toLowerCase() === 'login_success'
        );

        // Only display an incident returned by the actual backend.
        const hanuIncidents = incidents.filter(incident =>
            String(incident.source || incident.application || incident.application_name || incident.app || '').trim().toLowerCase().includes('hanu')
        );

        const latestIncident = hanuIncidents.length
            ? [...hanuIncidents].sort((a, b) =>
                (Date.parse(b.detected_at || '') || 0) -
                (Date.parse(a.detected_at || '') || 0)
            )[0]
            : null;

        const rawRisk = latestIncident?.risk_score;
        const parsedRisk = Number(rawRisk);

        threatGraphData = {
            sourceIP: latestIncident?.source_ip || latestEvent?.source_ip || 'Not available',

            username: latestIncident?.username || hanuEvents.find(e => e.username)?.username || 'Not available',

            application: latestEvent?.source || 'Hanu AI',

            authentication: hanuEvents.length
                ? `${successfulLogins.length} successful · ${failedLogins.length} failed`
                : 'No Hanu AI events received',

            threat: latestIncident?.threat || 'No confirmed incident',

            risk:
                rawRisk !== undefined &&
                rawRisk !== null &&
                rawRisk !== '' &&
                Number.isFinite(parsedRisk) &&
                parsedRisk >= 0 &&
                parsedRisk <= 100
                    ? parsedRisk
                    : null,

            incidentId: latestIncident?.incident_id || null,

            error: null
        };

        console.log(
            '[Sentinal] Real threat graph data:',
            threatGraphData
        );

    } catch (error) {
        threatGraphData = {
            ...threatGraphData,
            error: error.message
        };

        console.error(
            '[Sentinal] Threat graph connection failed:',
            error
        );
    }

    updateThreatGraphNodes();
}


// Build node content from actual telemetry.
function getThreatGraphNodes() {
    const d = threatGraphData;

    return [
        ['source', d.sourceIP, 'SOURCE IP', 'globe'],
        ['user', d.username, 'TARGET ACCOUNT', 'user'],
        ['app', d.application, 'APPLICATION', 'app'],
        ['event', d.authentication, 'AUTHENTICATION', 'finger'],
        [
            'threat',
            d.threat,
            d.risk === null
                ? 'RISK UNASSESSED'
                : `RISK SCORE · ${d.risk}`,
            'shieldAlert'
        ]
    ];
}


// Preserve the existing panel and graph structure.
const threatGraph = () => panel({
    title: 'Threat relationship graph',
    eyebrow: 'CORRELATED INTELLIGENCE',
    action: `<span class="muted">${icon('network')}</span>`,
    id: 'tgraph',

    body: `
        <div class="threat-graph">

            <svg
                viewBox="0 0 700 280"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient id="edge" x1="0" x2="1">
                        <stop
                            stop-color="var(--cyan)"
                            stop-opacity=".5"
                        />
                        <stop
                            offset="1"
                            stop-color="var(--coral)"
                            stop-opacity=".5"
                        />
                    </linearGradient>
                </defs>

                ${[
                    'M125 135 C230 135 210 50 340 50',
                    'M125 135 C230 135 210 220 340 220',
                    'M340 50 C450 50 420 135 500 135',
                    'M340 220 C450 220 420 135 500 135',
                    'M500 135 L630 135'
                ].map(d => `
                    <path
                        d="${d}"
                        fill="none"
                        stroke="url(#edge)"
                        stroke-width="1"
                    />
                `).join('')}

                ${Array.from({ length: 18 }, (_, i) => `
                    <path
                        d="M125 135 C${220 + i * 4} ${70 + i * 6} ${370 + i * 4} ${180 - i * 5} 630 135"
                        fill="none"
                        stroke="var(--cyan)"
                        stroke-opacity=".055"
                    />
                `).join('')}
            </svg>

            <div id="threatGraphNodes">
                ${getThreatGraphNodes().map(n => `
                    <button
                        class="btn btn-ghost graph-node node-${n[0]}
                        ${n[0] === 'source' ? 'node-selected' : ''}"
                        data-node="${n[0]}"
                        type="button"
                    >
                        ${icon(n[3], 15)}

                        <span>
                            <small>${threatGraphEscape(n[2])}</small>
                            <b>${threatGraphEscape(n[1])}</b>
                        </span>
                    </button>
                `).join('')}
            </div>
        </div>

        <div class="panel-footer">
            <span>
                <i class="legend-dot cyan"></i>
                <span id="gsel">
                    ${threatGraphEscape(threatGraphData.sourceIP)}
                </span>
            </span>

            <span id="threatGraphRelationships">
                ${threatGraphData.incidentId
                    ? `Incident ${threatGraphEscape(threatGraphData.incidentId)}`
                    : 'Telemetry relationships not yet verified'}
            </span>
        </div>

        <div
            id="threatGraphStatus"
            class="muted"
            style="padding: 0 14px 10px; font-size: 11px;"
        >
            ${threatGraphData.error
                ? 'Connector unavailable'
                : 'Waiting for telemetry'}
        </div>
    `
});


// Update existing nodes without rebuilding the dashboard.
function updateThreatGraphNodes() {
    const root = document.getElementById('tgraph');

    if (!root) return;

    const values = getThreatGraphNodes();

    root.querySelectorAll('[data-node]').forEach(button => {
        const node = values.find(
            item => item[0] === button.dataset.node
        );

        if (!node) return;

        const small = button.querySelector('small');
        const bold = button.querySelector('b');

        if (small) small.textContent = node[2];
        if (bold) bold.textContent = node[1];
    });

    const selected = root.querySelector('#gsel');

    if (selected) {
        selected.textContent = threatGraphData.incidentId
            ? `${threatGraphData.sourceIP} · ${threatGraphData.incidentId}`
            : threatGraphData.sourceIP;
    }

    const relationships = root.querySelector(
        '#threatGraphRelationships'
    );

    if (relationships) {
        relationships.textContent = threatGraphData.incidentId
            ? `Incident ${threatGraphData.incidentId}`
            : 'Telemetry relationships not yet verified';
    }

    const status = root.querySelector('#threatGraphStatus');

    if (status) {
        status.textContent = threatGraphData.error
            ? `Connection error: ${threatGraphData.error}`
            : `Last updated: ${new Date().toLocaleTimeString()}`;
    }
}


// Select a node when clicked.
document.addEventListener('click', event => {
    const button = event.target.closest(
        '#tgraph [data-node]'
    );

    if (!button) return;

    const root = document.getElementById('tgraph');

    if (!root) return;

    root.querySelectorAll('[data-node]').forEach(node => {
        node.classList.toggle(
            'node-selected',
            node === button
        );
    });

    const selectedNode = getThreatGraphNodes().find(
        node => node[0] === button.dataset.node
    );

    const selected = root.querySelector('#gsel');

    if (selected && selectedNode) {
        selected.textContent =
            `${selectedNode[2]} · ${selectedNode[1]}`;
    }
});


// Refresh real telemetry every five seconds.
refreshThreatGraph();

if (window.threatGraphRefreshTimer) {
    clearInterval(window.threatGraphRefreshTimer);
}

window.threatGraphRefreshTimer = setInterval(
    refreshThreatGraph,
    5000
);

/* ---------- page shell: header, popovers, footer ---------- */
const NAV = [['system', '#system', 'System', 'cpu'], ['application', '#application', 'Application', 'app'], ['security', '#security', 'Security', 'shieldCheck'], ['cybi', '#cybi', 'CYBI AI', 'brain']];
const shellState = { online: false, provider: 'unknown', incidents: [] };
function mountShell(active) {
  let pop = '';
  $('#root').innerHTML = `<div class="app-shell" id="shell"><div class="ambient-field" aria-hidden="true"></div>
  <header class="app-header"><a href="#system" class="brand"><div class="brand-mark">${icon('shield', 23)}<i></i><i></i></div><div><b>SENTINAL<span>AI</span></b><small>CYBER GUARD</small></div></a>
  <nav aria-label="Main navigation">${NAV.map(n => `<a class="btn btn-ghost nav-item ${n[0] === active ? 'nav-active' : ''}" href="${n[1]}" ${n[0] === active ? 'aria-current="page"' : ''}>${icon(n[3], 14)}<span>${n[2]}</span>${n[0] === active ? '<i class="live-dot"></i>' : ''}</a>`).join('')}</nav>
  <div class="header-actions"><span class="header-live"><i class="live-dot"></i><span id="engineState">Connecting…</span></span>
  <button class="btn btn-ghost btn-icon" data-pop="help" title="Workspace information" aria-label="Workspace information">${icon('help')}</button>
  <button class="btn btn-ghost btn-icon" data-pop="settings" title="Display settings" aria-label="Display settings">${icon('settings')}</button>
  <button class="btn btn-ghost btn-icon notification-button" data-pop="notifications" title="Notifications" aria-label="Notifications">${icon('bell')}<i></i></button>
  <div class="user-avatar" title="Security analyst">AK</div></div></header>
  <div id="popHost"></div><main class="app-main" id="app"></main>
  <footer class="app-footer"><span>${icon('shieldCheck', 12)}SENTINAL AI <i></i>Powered by CYBI — AI Cybersecurity Analyst</span><span>${icon('radio', 12)}Connecting to backend <i></i>All times UTC <i></i>v.1.4.2</span></footer></div>`;
  try { if (localStorage.getItem('sentinal-compact') === '1') $('#shell').classList.add('compact-mode'); } catch (e) { }
  const draw = () => {
    const titles = { settings: 'Display settings', help: 'Workspace status', notifications: 'Notifications' };
    const bodies = {
      settings: `<label class="flex items-center justify-between py-4">Compact density<input type="checkbox" id="compactToggle" ${$('#shell').classList.contains('compact-mode') ? 'checked' : ''}></label>`,
      help: `<p>Live workspace. Data comes from the Sentinal backend (${shellState.online ? 'online' : 'offline'}). AI provider: ${esc(shellState.provider)}. Response execution is locked (recommend-only).</p>`,
      notifications: shellState.incidents.length
        ? shellState.incidents.slice(0, 6).map(x => `<div class="notification"><i class="legend-dot ${['HIGH','CRITICAL'].includes(String(x.risk_level).toUpperCase()) ? 'coral' : 'amber'}"></i><div><b>${esc(x.threat)} · ${esc(x.incident_id || x.id)}</b><p>${esc(x.source_ip || '—')} · risk ${esc(x.risk_score ?? '—')} · ${esc(x.attempt_count ?? '—')} events</p><a href="#cybi?incident=${encodeURIComponent(x.incident_id || x.id)}">Inspect investigation →</a></div></div>`).join('')
        : '<p class="muted">No incidents yet. Waiting for telemetry.</p>'
    };
    $('#popHost').innerHTML = pop ? `<aside class="header-popover"><div class="flex items-center justify-between"><h3>${titles[pop]}</h3><button class="btn btn-ghost btn-icon" data-pop="" aria-label="Close panel">${icon('x')}</button></div>${bodies[pop]}</aside>` : '';
  };
  $('#shell').addEventListener('click', e => { const b = e.target.closest('[data-pop]'); if (b) { pop = pop === b.dataset.pop ? '' : b.dataset.pop; draw(); } });
  $('#shell').addEventListener('change', e => { if (e.target.id === 'compactToggle') { $('#shell').classList.toggle('compact-mode', e.target.checked); try { localStorage.setItem('sentinal-compact', e.target.checked ? '1' : '0'); } catch (x) { } } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && pop) { pop = ''; draw(); } });
  /* live shell status: engine health + incident notifications (real backend) */
  const pollShell = async () => {
    try {
      const [h, inc] = await Promise.all([fetch('/api/health', { cache: 'no-store' }), fetch('/api/incidents', { cache: 'no-store' })]);
      shellState.online = h.ok;
      if (h.ok) { const hd = await h.json(); shellState.provider = hd.ai_provider === 'anthropic' ? 'Claude (Anthropic)' : 'Local rule engine'; }
      if (inc.ok) { const d = await inc.json(); shellState.incidents = Array.isArray(d.incidents) ? d.incidents : []; }
    } catch (e) { shellState.online = false; }
    const st = $('#engineState'); if (st) st.textContent = shellState.online ? 'Engine online' : 'Engine offline';
    const dot = document.querySelector('.header-live'); if (dot) dot.style.opacity = shellState.online ? '1' : '.55';
    const bell = document.querySelector('.notification-button i'); if (bell) bell.style.display = shellState.incidents.length ? '' : 'none';
    if (pop === 'notifications' || pop === 'help') draw();
  };
  pollShell();
  if (window.__sentinalShellTimer) clearInterval(window.__sentinalShellTimer);
  window.__sentinalShellTimer = setInterval(pollShell, 5000);
}
function downloadText(name, text) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = name; a.click(); URL.revokeObjectURL(a.href); }


/* ===== pages ===== */
const PAGES = {};

/* System monitor page */
/* =========================================================
   SYSTEM MONITOR PAGE — REAL-TIME TELEMETRY
   ========================================================= */

/* =========================================================
   SENTINAL AI — REAL SYSTEM MONITOR
   ========================================================= */

PAGES.system = () => {

  mountShell('system');

  const app = $('#app');

  let live = true;
  let sort = 'cpu';
  let host = '—';

  const MAX_POINTS = 40;
  const POLL_INTERVAL = 2000;

  let history = [];
  let connected = false, lastData = null, lastError = '';

  let previousNetwork = null;
  let previousNetworkTime = null;

  let timer = null;


  /* =====================================================
     HELPERS
     ===================================================== */

  const num = (value, fallback = 0) => {

    const n = Number(value);

    return Number.isFinite(n) ? n : fallback;

  };


  const safeText = v => esc(v ?? '');

  const nowTime = () => {

    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

  };


  /* =====================================================
     NETWORK SPEED
     ===================================================== */

  function calculateNetworkSpeed(data) {

    const now = performance.now();

    const sent = num(data.network_sent);
    const received = num(data.network_received);

    if (
      previousNetwork === null ||
      previousNetworkTime === null
    ) {

      previousNetwork = {
        sent,
        received
      };

      previousNetworkTime = now;

      return {
        upload: 0,
        download: 0
      };

    }


    const elapsed = Math.max(
      (now - previousNetworkTime) / 1000,
      0.001
    );


    const upload =
      Math.max(
        0,
        sent - previousNetwork.sent
      ) / elapsed;


    const download =
      Math.max(
        0,
        received - previousNetwork.received
      ) / elapsed;


    previousNetwork = {
      sent,
      received
    };

    previousNetworkTime = now;


    return {
      upload,
      download
    };

  }


  function formatSpeed(bytes) {

    bytes = num(bytes);

    if (bytes < 1024) {

      return `${bytes.toFixed(0)} B/s`;

    }

    if (bytes < 1024 * 1024) {

      return `${(bytes / 1024).toFixed(1)} KB/s`;

    }

    if (bytes < 1024 * 1024 * 1024) {

      return `${(
        bytes /
        (1024 * 1024)
      ).toFixed(2)} MB/s`;

    }

    return `${(
      bytes /
      (1024 * 1024 * 1024)
    ).toFixed(2)} GB/s`;

  }


  /* =====================================================
     BUILD REAL CHART DATA
     ===================================================== */

  function chartData() {

    return history.map(point => ({

      time: point.time,

      cpu: point.cpu,

      ram: point.ram,

      download: point.downloadMbps,

      upload: point.uploadMbps,

      read: point.read,

      write: point.write

    }));

  }


  /* =====================================================
     PROCESS DATA
     ===================================================== */

  let processes = [];
  let services = [];
  let procSource = '';

  /* Accept several backend shapes (array or {pid: {...}} object, different field names). */
  function normalizeProcesses(raw) {
    let list = raw;
    if (list && !Array.isArray(list) && typeof list === 'object') {
      list = Array.isArray(list.processes) ? list.processes
        : Object.entries(list).map(([k, v]) => (v && typeof v === 'object' ? { pid: k, ...v } : null)).filter(Boolean);
    }
    if (!Array.isArray(list)) return [];
    const totalGb = num(lastData?.ram_total_gb);
    return list.filter(p => p && typeof p === 'object').map(p => {
      const cpu = num(p.cpu ?? p.cpu_percent ?? p.cpu_usage ?? p.cpuPercent);
      let ram = p.ram ?? p.memory_percent ?? p.mem_percent ?? p.ram_percent ?? p.memory_pct;
      if (ram === undefined || ram === null) {
        const mb = p.memory_mb ?? p.ram_mb ?? p.rss_mb;
        const bytes = p.memory ?? p.rss ?? p.memory_bytes;
        if (mb !== undefined && totalGb > 0) ram = num(mb) / (totalGb * 1024) * 100;
        else if (bytes !== undefined && totalGb > 0) ram = num(bytes) / (totalGb * 1024 * 1024 * 1024) * 100;
      }
      return {
        name: String(p.name ?? p.process_name ?? p.process ?? p.cmd ?? '?'),
        pid: p.pid ?? p.id ?? '—',
        cpu,
        ram: Math.min(100, num(ram)),
        status: String(p.status ?? p.state ?? 'RUNNING').toUpperCase()
      };
    });
  }

  function normalizeServices(raw) {
    let list = raw;
    if (list && !Array.isArray(list) && typeof list === 'object') {
      list = Object.entries(list).map(([k, v]) =>
        v && typeof v === 'object' ? { name: k, ...v } : { name: k, healthy: !!v });
    }
    if (!Array.isArray(list)) return [];
    return list.filter(s => s && typeof s === 'object').map(s => {
      const state = String(s.status ?? s.state ?? '').toLowerCase();
      const healthy = s.healthy !== undefined ? !!s.healthy
        : s.running !== undefined ? !!s.running
        : s.ok !== undefined ? !!s.ok
        : ['running', 'online', 'ok', 'healthy', 'active', 'up', 'connected'].includes(state);
      return {
        name: String(s.name ?? s.service ?? '?'),
        detail: String(s.detail ?? s.description ?? s.message ?? s.status ?? (healthy ? 'Running' : 'No recent activity')),
        healthy
      };
    });
  }

  /* Pull data the main /api/system payload may not include. Everything shown comes from the backend. */
  async function getJson(url) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      return r.ok ? await r.json() : null;
    } catch (e) { return null; }
  }

  async function loadExtras(data) {
    /* processes */
    let procs = normalizeProcesses(
      data.processes ?? data.process_list ?? data.top_processes ?? data.active_processes);
    procSource = procs.length ? '/api/system' : '';
    if (!procs.length) {
      for (const url of ['/api/system/processes', '/api/processes']) {
        const j = await getJson(url);
        procs = normalizeProcesses(j && (j.processes ?? j.items ?? j.data ?? j));
        if (procs.length) { procSource = url; break; }
      }
    }
    if (procs.length) processes = procs;

    /* services */
    let svcs = normalizeServices(data.services ?? data.service_health);
    if (!svcs.length) {
      for (const url of ['/api/system/services', '/api/services']) {
        const j = await getJson(url);
        svcs = normalizeServices(j && (j.services ?? j.items ?? j.data ?? j));
        if (svcs.length) break;
      }
    }
    if (!svcs.length) {
      /* derive service health from live endpoints */
      const [health, apps, inc] = await Promise.all([
        getJson('/api/health'), getJson('/api/application/apps'), getJson('/api/incidents')]);
      if (health) {
        svcs.push({ name: 'Sentinal engine', detail: 'Backend API responding', healthy: true });
        if (health.ai_provider) svcs.push({
          name: 'CYBI AI engine',
          detail: health.ai_provider === 'anthropic' ? 'Claude (Anthropic)' : 'Local rule engine',
          healthy: true });
      }
      if (apps) {
        (Array.isArray(apps.applications) ? apps.applications : []).forEach(a => {
          const events = num(a.events ?? a.events_received);
          svcs.push({
            name: String(a.application || a.application_name || a.application_id || 'Application'),
            detail: events > 0 ? `${events.toLocaleString()} events received` : 'Registered · no events yet',
            healthy: events > 0 });
        });
        svcs.push({ name: 'Sentinal connector', detail: 'Application telemetry feed', healthy: true });
      }
      if (inc) svcs.push({
        name: 'Incident detection',
        detail: `${(Array.isArray(inc.incidents) ? inc.incidents : []).length} incidents tracked`,
        healthy: true });
    }
    services = svcs;
  }


  function procRows() {

    if (!processes.length) {
      return `<tr><td colspan="5" class="empty-state" style="padding:18px 16px;text-align:center">
        No process list received. /api/system, /api/system/processes and /api/processes returned no processes.
      </td></tr>`;
    }

    return [...processes]

      .sort((a, b) => {

        if (sort === 'name') {

          return a.name.localeCompare(b.name);

        }

        return b[sort] - a[sort];

      })

      .map(p => `

        <tr>

          <td>
            ${icon('circle', 10)}
            ${safeText(p.name)}
          </td>

          <td class="mono muted">
            ${p.pid}
          </td>

          <td>

            <div class="bar-metric">

              <progress
                value="${p.cpu}"
                max="100">
              </progress>

              <span>
                ${p.cpu.toFixed(1)}%
              </span>

            </div>

          </td>

          <td>

            <div class="bar-metric memory-bar">

              <progress
                value="${p.ram}"
                max="100">
              </progress>

              <span>
                ${p.ram.toFixed(1)}%
              </span>

            </div>

          </td>

          <td>

            <span class="status-label">
              <i></i>
              ${p.status}
            </span>

          </td>

        </tr>

      `)

      .join('');

  }


  /* =====================================================
     RENDER SYSTEM PAGE
     ===================================================== */

  function renderWaiting() {
    const W = m => `<div class="empty-state" style="padding:22px 16px;text-align:center">${m}</div>`;
    app.innerHTML = `
      <div class="page-heading"><div><div class="eyebrow">INFRASTRUCTURE INTELLIGENCE</div>
        <h1>System monitor<span class="online-badge"><i></i>Waiting for telemetry</span></h1>
        <p>Real-time performance and health of your monitored infrastructure.</p></div></div>
      <div class="workspace-grid">${['CPU utilization|PROCESSOR', 'Memory consumption|RAM', 'Network activity|NETWORK TELEMETRY', 'Active processes|PROCESS TELEMETRY', 'Storage capacity|REAL DISK TELEMETRY', 'System services|SERVICE HEALTH']
        .map(t => panel({ title: t.split('|')[0], eyebrow: t.split('|')[1], cls: 'mt-4', body: W('Waiting for telemetry' + (lastError ? ' — ' + esc(lastError) : '')) })).join('')}</div>`;
  }

  function render(data = null) {
    if (!connected) { renderWaiting(); return; }
    data = data || lastData;
    const current = data || {

      timestamp: nowTime(),

      cpu: 0,

      ram: 0,

      ram_used_gb: 0,

      ram_available_gb: 0,

      ram_total_gb: 0,

      disk: 0,

      disk_used_gb: 0,

      disk_free_gb: 0,

      disk_total_gb: 0,

      disk_read_mb_s: 0,

      disk_write_mb_s: 0,

      network_packets_sent: 0,

      network_packets_received: 0

    };


    const d = chartData();


    /* If no telemetry yet, create one real/current point */

    const chart = d.length
      ? d
      : [{

          time: current.timestamp || nowTime(),

          cpu: num(current.cpu),

          ram: num(current.ram),

          download: 0,

          upload: 0,

          read: num(current.disk_read_mb_s),

          write: num(current.disk_write_mb_s)

        }];


    const cpu = num(current.cpu);

    const ram = num(current.ram);

    const disk = num(current.disk);


    app.innerHTML = `

      <div class="page-heading">

        <div>

          <div class="eyebrow">
            INFRASTRUCTURE INTELLIGENCE
          </div>

          <h1>

            System monitor

            <span class="online-badge">
              <i></i>
              ${services.length && services.every(x => x.healthy) ? 'All systems operational' : 'Some services idle'}
            </span>

          </h1>

          <p>
            Real-time performance and health of your monitored infrastructure.
          </p>

        </div>


        <div class="page-tools">

          <select id="host"><option selected>${esc(host)}</option></select>


          <button
            class="btn btn-sm btn-secondary"
            id="liveBtn">

            ${icon(live ? 'pause' : 'play')}

            ${live ? 'Live' : 'Paused'}

            ${live
              ? '<span class="live-dot"></span>'
              : ''}

          </button>

        </div>

      </div>


      <!-- STATUS -->

      <div class="status-strip">

        <span>

          ${icon('server', 13)}

          ${host}

          <small>
            Monitored System
          </small>

        </span>


        <span>

          <i class="live-dot"></i>

          ${live
            ? 'Monitoring active'
            : 'Monitoring paused'}

        </span>


        <span>

          CPU

          <b>
            ${cpu.toFixed(1)}%
          </b>

        </span>


        <span>

          RAM

          <b>
            ${ram.toFixed(1)}%
          </b>

        </span>


        <span>

          Last update

          <b id="lastUp">
            ${current.timestamp || nowTime()}
          </b>

        </span>


        <span class="sample-label">
          REAL TELEMETRY
        </span>

      </div>


      <div class="workspace-grid">

        <div class="system-main">


          <!-- CPU + MEMORY -->

          <div class="resource-grid">


            ${panel({

              title: 'CPU utilization',

              eyebrow: 'PROCESSOR',

              action:
                `<span class="panel-symbol">
                  ${icon('cpu')}
                </span>`,

              body: `

                <div class="metrics-row">

                  ${stat(
                    'CURRENT',
                    cpu.toFixed(1),
                    '%',
                    '',
                    '',
                    'cpuNow'
                  )}

                  ${stat(
                    'AVERAGE',
                    history.length
                      ? (
                          history.reduce(
                            (a, b) => a + b.cpu,
                            0
                          ) /
                          history.length
                        ).toFixed(1)
                      : cpu.toFixed(1),
                    '%'
                  )}

                  ${stat(
                    'PEAK',
                    history.length
                      ? Math.max(
                          ...history.map(x => x.cpu)
                        ).toFixed(1)
                      : cpu.toFixed(1),
                    '%'
                  )}

                </div>


                ${Charts.add({

                  legacy: true,


                  data: chart,

                  series: [

                    {
                      key: 'cpu',
                      name: 'CPU usage',
                      color: 'cyan'
                    }

                  ],

                  threshold: 80,

                  unit: '%',

                  height: 155

                })}


                <div class="panel-footer">

                  <span>
                    Real CPU telemetry
                  </span>

                  <span>
                    Threshold 80%
                  </span>

                </div>

              `

            })}


            ${panel({

              title: 'Memory consumption',

              eyebrow: 'MEMORY',

              action:
                `<span class="panel-symbol">
                  ${icon('memory')}
                </span>`,

              body: `

                <div class="metrics-row">

                  ${stat(
                    'USED MEMORY',
                    num(current.ram_used_gb).toFixed(2),
                    'GB',
                    `${ram.toFixed(1)}% of total capacity`
                  )}

                  ${stat(
                    'AVAILABLE',
                    num(current.ram_available_gb).toFixed(2),
                    'GB'
                  )}

                  ${stat(
                    'TOTAL',
                    num(current.ram_total_gb).toFixed(2),
                    'GB'
                  )}

                </div>


                ${Charts.add({

                  legacy: true,


                  data: chart,

                  series: [

                    {
                      key: 'ram',
                      name: 'Used memory',
                      color: 'mint'
                    }

                  ],

                  area: true,

                  threshold: 85,

                  unit: '%',

                  height: 155

                })}


                <div class="panel-footer">

                  <span>

                    <i class="live-dot"></i>

                    Live memory telemetry

                  </span>

                  <span>
                    ${ram.toFixed(1)}% used
                  </span>

                </div>

              `

            })}

          </div>


          <!-- NETWORK -->

          ${panel({

            title: 'Network activity',

            eyebrow:
              'BANDWIDTH & PACKET ANALYSIS',

            cls: 'network-panel',

            action:
              `<span class="panel-symbol">
                ${icon('network')}
              </span>`,

            body: `

              <div class="metrics-row network-metrics">

                ${stat(
                  'DOWNLOAD',
                  d.length
                    ? d.at(-1).download.toFixed(2)
                    : '0.00',
                  'Mbps',
                  '',
                  '',
                  'downloadNow'
                )}

                ${stat(
                  'UPLOAD',
                  d.length
                    ? d.at(-1).upload.toFixed(2)
                    : '0.00',
                  'Mbps',
                  '',
                  '',
                  'uploadNow'
                )}

                ${stat(
                  'PACKETS RECEIVED',
                  Number(
                    current.network_packets_received || 0
                  ).toLocaleString()
                )}

                ${stat(
                  'PACKETS SENT',
                  Number(
                    current.network_packets_sent || 0
                  ).toLocaleString()
                )}

              </div>


              ${Charts.add({

                  legacy: true,


                data: chart,

                series: [

                  {
                    key: 'download',
                    name: 'Download',
                    color: 'cyan'
                  },

                  {
                    key: 'upload',
                    name: 'Upload',
                    color: 'silver'
                  }

                ],

                area: true,

                unit: ' Mbps',

                height: 185

              })}


              <div class="panel-footer">

                <span>
                  Real network telemetry
                </span>

                <span>
                  Packets monitored
                </span>

              </div>

            `

          })}


          <!-- PROCESSES -->

          ${panel({

            title: 'Active processes',

            eyebrow:
              'PROCESS MONITORING',

            action: `

              <div class="sort-controls">

                ${['cpu', 'ram', 'name']

                  .map(s => `

                    <button
                      class="btn btn-sm btn-ghost
                      ${sort === s ? 'selected' : ''}"
                      data-sort="${s}">

                      ${s.toUpperCase()}

                    </button>

                  `)

                  .join('')}

              </div>

            `,

            body: `

              <div class="table-scroll">

                <table>

                  <thead>

                    <tr>

                      <th>PROCESS</th>

                      <th>PID</th>

                      <th>CPU USAGE</th>

                      <th>MEMORY</th>

                      <th>STATUS</th>

                    </tr>

                  </thead>


                  <tbody id="procBody">

                    ${procRows()}

                  </tbody>

                </table>

              </div>


              <div class="panel-footer">

                <span>
                  Process monitoring
                </span>

                <span>
                  System telemetry active
                </span>

              </div>

            `

          })}


        </div>


        <!-- RIGHT SIDE -->

        <aside class="system-side">


          <!-- STORAGE -->

          ${panel({

            title: 'Storage capacity',

            eyebrow: 'DISK HEALTH',

            action:
              `<span class="panel-symbol">
                ${icon('disk')}
              </span>`,

            body: `

              <div class="disk-ring">

                ${ring(
                  disk,
                  'UTILIZATION',
                  'cyan',
                  150
                )}

                <span class="disk-name">

                  System Disk

                </span>

              </div>


              <div class="storage-details">

                <div>

                  <span>
                    Used storage
                  </span>

                  <b>

                    ${num(
                      current.disk_used_gb
                    ).toFixed(2)}

                    <small>GB</small>

                  </b>

                </div>


                <div>

                  <span>
                    Available
                  </span>

                  <b>

                    ${num(
                      current.disk_free_gb
                    ).toFixed(2)}

                    <small>GB</small>

                  </b>

                </div>


                <div>

                  <span>
                    Total capacity
                  </span>

                  <b>

                    ${num(
                      current.disk_total_gb
                    ).toFixed(2)}

                    <small>GB</small>

                  </b>

                </div>

              </div>


              <div class="subheading">
                DISK I/O ACTIVITY
              </div>


              ${Charts.add({

                  legacy: true,


                data: chart,

                series: [

                  {
                    key: 'read',
                    name: 'Read',
                    color: 'cyan'
                  },

                  {
                    key: 'write',
                    name: 'Write',
                    color: 'mint'
                  }

                ],

                height: 110

              })}


              <div class="io-values">

                <span>

                  Read

                  <b>

                    ${num(
                      current.disk_read_mb_s
                    ).toFixed(2)}

                    MB/s

                  </b>

                </span>


                <span>

                  Write

                  <b>

                    ${num(
                      current.disk_write_mb_s
                    ).toFixed(2)}

                    MB/s

                  </b>

                </span>

              </div>


              <div class="panel-footer">

                <span class="mint">

                  <i class="live-dot"></i>

                  Disk telemetry active

                </span>

                <span>

                  ${disk.toFixed(1)}%

                </span>

              </div>

            `

          })}


          <!-- SERVICES -->

          ${panel({

            title: 'System services',

            eyebrow: 'SERVICE HEALTH',

            action:
              `<span class="panel-symbol">
                ${icon('activity')}
              </span>`,

            body: `

              <div class="services">

                ${services.length ? '' : '<div class="empty-state" style="padding:18px 16px;text-align:center">No service data received yet</div>'}

                ${services.map(x => [safeText(x.name), safeText(x.detail), x.healthy]).map(s => `

                  <div class="service-row">

                    <div class="service-icon">

                      ${icon('server', 15)}

                    </div>


                    <div>

                      <b>${s[0]}</b>

                      <small>${s[1]}</small>

                    </div>


                    <span
                      class="${s[2] ? 'live-dot' : 'legend-dot amber'}" title="${s[2] ? 'Healthy' : 'No recent activity'}">
                    </span>

                  </div>

                `)

                .join('')}

              </div>


              <div class="panel-footer">

                <span>
                  ${services.filter(x => x.healthy).length} / ${services.length} services healthy
                </span>

                ${icon('chevD', 12)}

              </div>

            `

          })}


        </aside>

      </div>


      <!-- BOTTOM -->

      <div class="system-bottom">


        ${panel({

          title: 'Network connections',

          eyebrow: 'NETWORK TELEMETRY',

          action:
            `<span class="panel-symbol">
              ${icon('network')}
            </span>`,

          body: `

            <div class="table-scroll">

              <table>

                <thead>

                  <tr>

                    <th>METRIC</th>

                    <th>VALUE</th>

                  </tr>

                </thead>


                <tbody>

                  <tr>

                    <td>
                      Bytes sent
                    </td>

                    <td class="mono">

                      ${Number(
                        current.network_sent || 0
                      ).toLocaleString()}

                    </td>

                  </tr>


                  <tr>

                    <td>
                      Bytes received
                    </td>

                    <td class="mono">

                      ${Number(
                        current.network_received || 0
                      ).toLocaleString()}

                    </td>

                  </tr>


                  <tr>

                    <td>
                      Packets sent
                    </td>

                    <td class="mono">

                      ${Number(
                        current.network_packets_sent || 0
                      ).toLocaleString()}

                    </td>

                  </tr>


                  <tr>

                    <td>
                      Packets received
                    </td>

                    <td class="mono">

                      ${Number(
                        current.network_packets_received || 0
                      ).toLocaleString()}

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>


            <div class="panel-footer">

              <span class="mint">

                <i class="live-dot"></i>

                Live network telemetry

              </span>

              <span>
                Updated every 2 seconds
              </span>

            </div>

          `

        })}


        ${panel({

          title: 'Storage summary',

          eyebrow: 'REAL DISK TELEMETRY',

          action:
            `<span class="panel-symbol">
              ${icon('disk')}
            </span>`,

          body: `

            <div class="storage-details">

              <div>

                <span>
                  Utilization
                </span>

                <b>

                  ${disk.toFixed(1)}

                  <small>%</small>

                </b>

              </div>


              <div>

                <span>
                  Used
                </span>

                <b>

                  ${num(
                    current.disk_used_gb
                  ).toFixed(2)}

                  <small>GB</small>

                </b>

              </div>


              <div>

                <span>
                  Free
                </span>

                <b>

                  ${num(
                    current.disk_free_gb
                  ).toFixed(2)}

                  <small>GB</small>

                </b>

              </div>


              <div>

                <span>
                  Total
                </span>

                <b>

                  ${num(
                    current.disk_total_gb
                  ).toFixed(2)}

                  <small>GB</small>

                </b>

              </div>

            </div>


            <div class="panel-footer">

              <span>
                Storage monitoring active
              </span>

              <span>
                ${disk.toFixed(1)}% used
              </span>

            </div>

          `

        })}


      </div>


    `;


    Charts.flush();

  }


  /* =====================================================
     FETCH REAL SYSTEM TELEMETRY
     ===================================================== */

  async function fetchSystem() {

    try {

      const response =
        await fetch(
          '/api/system',
          {
            cache: 'no-store'
          }
        );


      if (!response.ok) {

        throw new Error(
          `HTTP ${response.status}`
        );

      }


      const data =
        await response.json();


      const network =
        calculateNetworkSpeed(data);


      const point = {

        time:
          data.timestamp ||
          nowTime(),

        cpu:
          num(data.cpu),

        ram:
          num(data.ram),

        downloadMbps:
          network.download /
          (1024 * 1024) *
          8,

        uploadMbps:
          network.upload /
          (1024 * 1024) *
          8,

        read:
          num(data.disk_read_mb_s),

        write:
          num(data.disk_write_mb_s)

      };


      history.push(point);
      connected = true; lastData = data; lastError = '';
      if (data.hostname) host = data.hostname;

      /* processes + services (with fallbacks when /api/system omits them) */
      await loadExtras(data);


      if (
        history.length >
        MAX_POINTS
      ) {

        history.shift();

      }


      /* Update screen */

      render(data);


      console.log(
        'SENTINAL REAL TELEMETRY:',
        data
      );


    }

    catch (error) {
      connected = false; lastData = null; history = []; previousNetwork = null; previousNetworkTime = null; processes = [];
      services = [];
      lastError = error.message || 'backend unreachable';
      render();
      console.error(
        'Sentinal system telemetry error:',
        error
      );

    }

  }


  /* =====================================================
     BUTTONS
     ===================================================== */

  app.addEventListener(
    'click',
    e => {

      const button =
        e.target.closest('button');


      if (!button) {
        return;
      }


      if (
        button.id === 'liveBtn'
      ) {

        live = !live;


        if (live) {

          startPolling();

        }
        else {

          stopPolling();

        }


        render();

      }


      if (
        button.dataset.sort
      ) {

        sort =
          button.dataset.sort;


        const body =
          $('#procBody');


        if (body) {

          body.innerHTML =
            procRows();

        }

      }

    }
  );


  app.addEventListener(
    'change',
    e => {

      if (
        e.target.id === 'host'
      ) {

        host =
          e.target.value;

        render();

      }

    }
  );


  /* =====================================================
     POLLING
     ===================================================== */

  function startPolling() {

    stopPolling();


    timer =
      setInterval(
        () => {

          if (live) {

            fetchSystem();

          }

        },
        POLL_INTERVAL
      );

  }


  function stopPolling() {

    if (timer) {

      clearInterval(timer);

      timer = null;

    }

  }


  /* =====================================================
     INITIAL LOAD
     ===================================================== */

  render();

  fetchSystem();

  startPolling();

};

/* =========================================================
   SENTINAL AI — KERALA SOURCE IP DOT MAP (Application page)
   - Full-canvas SVG dot field focused on Kollam and Thiruvananthapuram
   - Live GeoIP source markers and subtle animated routes to the web server
   ========================================================= */
const SIP = (() => {
  const VBW = 1200, VBH = 520;
  const GEOJSON_URL = new URL('kerala-districts.geojson', document.currentScript?.src || location.href).href;
  const MAX_SOURCES = 24;
  const motionTime = () => performance.now() / 1000;

  let observer = null;
  let keralaLayerPromise = null;
  let selectedIp = '';
  let lastModel = null;
  let clicksBound = false;

  const fin = v => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));
  const list = v => Array.isArray(v) ? v : [];
  const fmtN = v => Number(v || 0).toLocaleString();

  /* ---------- theme-matched styles (uses the dashboard CSS variables) ---------- */
  function injectCss() {
    if (document.getElementById('sipCss')) return;
    const style = document.createElement('style');
    style.id = 'sipCss';
    style.textContent = `
    .sip-layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(320px,.8fr);gap:16px;align-items:stretch}
    .sip{padding:0;overflow:hidden}
    .sip-map-panel,.sip-source-panel{min-width:0;height:460px;display:flex;flex-direction:column}
    .sip-source-panel{display:flex;flex-direction:column}
    .sip-head{display:flex;align-items:center;gap:20px;flex-wrap:wrap;padding:10px 16px 10px !important;border-bottom:1px solid var(--chart-grid)}
    .sip-source-head{border-bottom:1px solid var(--chart-grid);padding:10px 16px 9px !important}
    .sip-title{flex:1 1 200px;min-width:180px}
    .sip-title h2{margin:0}
    .sip-stats{display:flex;align-items:stretch;flex-wrap:wrap}
    .sip-stat{padding:0 18px;border-left:1px solid var(--chart-grid);min-width:84px}
    .sip-stat:first-child{border-left:0;padding-left:0}
    .sip-stat .stat-value{margin-top:2px}
    .sip-srcs{flex:1;min-height:0;display:flex;flex-direction:column;gap:7px;padding:8px 12px 10px;overflow:auto}
    .sip-src{display:flex;flex-direction:column;gap:6px;padding:7px 10px;border:1px solid var(--chart-grid);border-radius:10px;background:color-mix(in oklab,var(--sip-c) 5%,transparent)}
    .sip-src-top{display:flex;align-items:center;gap:10px;min-width:0}
    .sip-src-dot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--sip-c);box-shadow:0 0 10px color-mix(in oklab,var(--sip-c) 60%,transparent)}
    .sip-src-top b{font-size:12px;font-weight:500;display:block}
    .sip-src-top small{display:block;font-size:10px;color:var(--muted-foreground)}
    .sip-src-pct{margin-left:auto;font-size:11px;color:var(--muted-foreground);white-space:nowrap}
    .sip-src-stats{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:end}
    .sip-src-stat{min-width:0}
    .sip-src-stat b{display:block;font:600 12px var(--font-mono);color:var(--foreground);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .sip-src-stat small{display:block;margin-top:3px;font-size:8px;letter-spacing:1px;color:var(--muted-foreground);text-transform:uppercase}
    .sip-ip-diagram{display:grid;grid-template-columns:auto minmax(80px,1fr) auto;align-items:center;gap:10px}
    .sip-diagram-node{display:inline-flex;align-items:center;gap:6px;font:600 9px var(--font-mono);color:var(--foreground)}
    .sip-diagram-node::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--sip-c);box-shadow:0 0 10px color-mix(in oklab,var(--sip-c) 60%,transparent)}
    .sip-diagram-line{height:2px;border-radius:999px;background:linear-gradient(90deg,var(--sip-c),color-mix(in oklab,var(--sip-c) 24%,transparent));position:relative;overflow:hidden}
    .sip-diagram-line i{position:absolute;inset:0 auto 0 0;width:var(--w);border-radius:inherit;background:linear-gradient(90deg,var(--sip-c),var(--mint))}
    .sip-diagram-count{font:600 11px var(--font-mono);color:var(--mint);white-space:nowrap}
    .sip-plot{flex:1;min-height:90px;display:flex;flex-direction:column;position:relative}
    .sip-plot-svg{flex:1;width:100%;min-height:60px;display:block}
    .sip-plot-grid{stroke:var(--chart-grid);stroke-width:1;stroke-dasharray:2 5;vector-effect:non-scaling-stroke}
    .sip-plot-line{fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
    .sip-plot-max{position:absolute;left:0;top:-2px;font-size:10px;color:var(--muted-foreground);font-variant-numeric:tabular-nums}
    .sip-plot-axis{display:flex;justify-content:space-between;align-items:center;margin-top:4px;font-size:10px;color:var(--muted-foreground);font-variant-numeric:tabular-nums}
    .sip-plot-key{display:inline-flex;align-items:center;gap:5px}
    .sip-plot-key i{width:8px;height:8px;border-radius:2px;display:inline-block;margin-left:8px}
    .sip-plot-key i:first-child{margin-left:0}
    .sip-plot-bars{justify-content:center;gap:10px}
    .sip-plot-row{display:grid;grid-template-columns:52px minmax(0,1fr) 40px;gap:10px;align-items:center;font-size:11px;color:var(--muted-foreground)}
    .sip-plot-track{height:6px;border-radius:999px;background:var(--chart-grid);overflow:hidden}
    .sip-plot-track i{display:block;height:100%;border-radius:999px}
    .sip-plot-row b{font-weight:500;text-align:right;color:inherit}
    .username-activity-chart{padding:4px 16px 8px}.username-chart-summary{display:flex;gap:28px;padding:0 0 8px;border-bottom:1px solid var(--chart-grid)}
    .username-chart-summary span{display:grid;gap:3px}.username-chart-summary b{color:var(--foreground);font:600 18px var(--font-mono)}.username-chart-summary small{color:var(--muted-foreground);font-size:8px;letter-spacing:.1em}
    .username-chart-axis,.username-chart-row{display:grid;grid-template-columns:24px minmax(85px,1fr) minmax(100px,2fr) 46px;gap:9px;align-items:center}
    .username-chart-axis{margin:10px 0 2px;color:var(--muted-foreground);font:500 8px var(--font-mono);letter-spacing:.08em}.username-chart-axis>span:first-child{grid-column:1 / 3}.username-chart-axis>span:last-child{text-align:right}.username-chart-axis>div{position:relative;height:16px;border-bottom:1px solid var(--chart-grid)}
    .username-chart-axis i{position:absolute;bottom:-1px;height:15px;border-left:1px solid var(--chart-grid);font-style:normal}.username-chart-axis i b{position:absolute;top:-12px;left:3px;font:400 8px var(--font-mono);letter-spacing:0}
    .username-chart-rows{display:grid;gap:8px}.username-chart-row{min-height:16px}.username-chart-rank{color:var(--muted-foreground);font:400 8px var(--font-mono)}.username-chart-name{overflow:hidden;color:var(--foreground);font-size:10px;text-overflow:ellipsis;white-space:nowrap}.username-chart-track{height:7px;overflow:hidden;border-radius:999px;background:var(--chart-grid)}.username-chart-track i{display:block;width:var(--bar);height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--cyan),var(--mint));box-shadow:0 0 10px color-mix(in oklab,var(--cyan) 35%,transparent)}.username-chart-value{color:var(--foreground);font-size:10px;text-align:right}.username-chart-foot{margin-top:14px;color:var(--muted-foreground);font-size:9px}
    @media(max-width:560px){.username-chart-axis,.username-chart-row{grid-template-columns:18px minmax(70px,1fr) minmax(70px,1.4fr) 36px;gap:6px}.username-chart-summary{gap:18px}}
    .app-main:has(#sipPanel) .stat-value{font-size:24px;line-height:1.1}
    .app-main:has(#sipPanel) .sip-src .stat-value{font-size:18px}
    .app-main:has(#sipPanel) .mt-4{margin-top:12px}
    .app-main:has(#sipPanel) .resource-grid{gap:12px}
    .app-main:has(#sipPanel) .glass-panel>.panel-header:not(.sip-head){padding-top:12px;padding-bottom:6px}
    .app-main:has(#sipPanel) .metrics-row{padding-top:0;padding-bottom:4px;gap:16px}
    .app-main:has(#sipPanel) .app-health .panel-header>div{display:flex;align-items:baseline;gap:10px}
    .app-main:has(#sipPanel) .app-health .panel-header h2{margin:0}
    .app-main:has(#sipPanel) .app-health .panel-header{padding-bottom:0}
    .app-main:has(#sipPanel) .app-health .metrics-row{padding-top:2px;padding-bottom:8px;gap:12px}
    .app-main:has(#sipPanel) .app-health .stat{gap:2px}
    .app-main:has(#sipPanel) .app-health .stat-value{font-size:20px;line-height:1.1}
    .app-main:has(#sipPanel) .app-health .stat-value.health-text{font-size:15px;letter-spacing:.06em}
    .sip-live{white-space:nowrap}
    #sipMap.sip-map{position:relative;flex:1 1 auto;min-height:0;width:100%;height:auto;overflow:hidden;background:radial-gradient(ellipse at 50% 48%,rgba(25,91,101,.20),transparent 62%),linear-gradient(135deg,#07181d,#08131b);border-radius:0}
    .sip-svg{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
    .sip-map-sea{fill:url(#sip-sea-wave-pattern)}
    .sip-sea-wave{fill:none;stroke:rgba(55,166,193,.24);stroke-width:1.15;vector-effect:non-scaling-stroke}
    .sip-sea-wave.soft{stroke:rgba(55,166,193,.11);stroke-width:2.4}
    .sip-sea-label{fill:rgba(139,189,198,.32);font:500 9px var(--font-mono);letter-spacing:2px}
    .sip-district-outline{stroke-width:1.15;vector-effect:non-scaling-stroke}
    .sip-district-halo{stroke-width:7;opacity:.14;filter:blur(3px);vector-effect:non-scaling-stroke}
    .sip-district-outline.sip-kollam-outline{fill:url(#sip-kollam-fill);stroke:rgba(98,201,220,.72)}
    .sip-district-halo.sip-kollam-halo{stroke:#62c9dc}
    .sip-district-outline.sip-tvm-outline{fill:url(#sip-tvm-fill);stroke:rgba(138,154,240,.72)}
    .sip-district-halo.sip-tvm-halo{stroke:#8a9af0}
    .sip-route{fill:none;stroke-width:1.2;stroke-dasharray:3 8;stroke-linecap:round;opacity:.62;vector-effect:non-scaling-stroke;animation:sipRouteFlow 1.9s linear infinite}
    .sip-route-kollam{stroke:#62c9dc}
    .sip-route-tvm{stroke:#8a9af0}
    .sip-route-glow{fill:none;stroke-width:7;opacity:.08;stroke-linecap:round;vector-effect:non-scaling-stroke}
    .sip-route-glow.sip-route-kollam{stroke:#62c9dc}
    .sip-route-glow.sip-route-tvm{stroke:#8a9af0}
    .sip-packet{fill:#efffff;filter:drop-shadow(0 0 4px currentColor)}
    .sip-packet.sip-route-kollam{color:#62c9dc}.sip-packet.sip-route-tvm{color:#a8b5ff}
    .sip-server{position:absolute;left:0;top:0;z-index:3;transform:translate(-50%,-50%);display:flex;align-items:center;gap:9px;padding:9px 12px;border:1px solid rgba(98,201,220,.48);border-radius:11px;background:linear-gradient(145deg,rgba(10,34,42,.97),rgba(7,20,28,.96));color:var(--foreground);font:600 10px var(--font-mono);white-space:nowrap;box-shadow:0 0 0 5px rgba(55,166,193,.06),0 0 28px rgba(47,172,194,.2)}
    .sip-server>span:last-child{display:grid;gap:3px}.sip-server b{font-size:10px;letter-spacing:.08em}.sip-server small{color:var(--muted-foreground);font-size:8px;letter-spacing:.08em}
    .sip-server-icon{display:grid;gap:3px;padding:5px;border:1px solid rgba(98,201,220,.25);border-radius:6px;background:rgba(98,201,220,.08)}
    .sip-server .sip-server-icon i{display:block;width:13px;height:4px;border:1px solid rgba(98,201,220,.55);border-radius:2px;background:rgba(98,201,220,.12)}
    .sip-server:before{content:"";position:absolute;inset:-7px;border:1px solid rgba(98,201,220,.34);border-radius:12px;animation:sipServerPulse 2.8s ease-out infinite;pointer-events:none}
    @keyframes sipServerPulse{0%{transform:scale(.92);opacity:.65}100%{transform:scale(1.35);opacity:0}}
    .sip-map-legend{position:absolute;z-index:3;left:14px;top:12px;display:flex;gap:13px;padding:7px 10px;border:1px solid rgba(115,163,175,.2);border-radius:8px;background:rgba(5,18,23,.82);backdrop-filter:blur(9px);font-size:9px;color:var(--muted-foreground)}
    .sip-map-legend span{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.sip-map-legend i{width:7px;height:7px;border-radius:50%;display:inline-block}
    .sip-key-kollam{background:#62c9dc;box-shadow:0 0 7px #62c9dc}.sip-key-tvm{background:#8a9af0;box-shadow:0 0 7px #8a9af0}.sip-key-route{height:2px!important;width:13px!important;border-radius:3px!important;background:linear-gradient(90deg,#62c9dc,#a8b5ff)}
    .sip-map-stamp{position:absolute;z-index:3;right:14px;top:12px;display:grid;gap:3px;text-align:right;padding:7px 9px;border:1px solid rgba(115,163,175,.18);border-radius:8px;background:rgba(5,18,23,.76);backdrop-filter:blur(9px)}
    .sip-map-stamp span{color:var(--cyan);font:600 8px var(--font-mono);letter-spacing:.13em}.sip-map-stamp b{color:var(--foreground);font:600 10px var(--font-mono)}.sip-map-stamp small{color:var(--muted-foreground);font-size:8px}
    @keyframes sipRouteFlow{to{stroke-dashoffset:-22}}
    @media(prefers-reduced-motion:reduce){.sip-route,.sip-server:before,.sip-pt{animation:none}.sip-packet{display:none}}
    .tone-cyan{--sip-c:var(--cyan)}.tone-amber{--sip-c:var(--amber)}.tone-coral{--sip-c:var(--coral)}
    .sip-pt{position:absolute;width:var(--d);height:var(--d);margin:calc(var(--d) / -2) 0 0 calc(var(--d) / -2);border:2px solid rgba(238,252,255,.9);border-radius:50%;background:var(--sip-c);box-shadow:0 0 0 5px color-mix(in oklab,var(--sip-c) 18%,transparent),0 0 19px color-mix(in oklab,var(--sip-c) 65%,transparent);animation:sipSourcePulse 2.8s ease-out infinite}
    .sip-pt.sip-region-kollam{--sip-c:#62c9dc}.sip-pt.sip-region-tvm{--sip-c:#8a9af0}
    @keyframes sipSourcePulse{0%,100%{box-shadow:0 0 0 4px color-mix(in oklab,var(--sip-c) 16%,transparent),0 0 14px color-mix(in oklab,var(--sip-c) 45%,transparent)}50%{box-shadow:0 0 0 8px color-mix(in oklab,var(--sip-c) 8%,transparent),0 0 23px color-mix(in oklab,var(--sip-c) 65%,transparent)}}
    .sip-card{position:absolute;left:0;top:0;visibility:hidden;display:flex;align-items:stretch;min-width:140px;border-radius:8px;border:1px solid rgba(255,255,255,.14);background:linear-gradient(135deg,rgba(255,255,255,.12),rgba(255,255,255,.03));backdrop-filter:blur(12px) saturate(140%);-webkit-backdrop-filter:blur(12px) saturate(140%);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 6px 18px rgba(0,0,0,.18);overflow:hidden;white-space:nowrap}
    .sip-card::before{content:"";flex:0 0 3px;background:var(--sip-c)}
    .sip-card-body{flex:1;display:grid;grid-template-columns:1fr auto;column-gap:14px;padding:5px 10px 6px}
    .sip-card b{font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;max-width:150px}
    .sip-card .n{font-size:12px;font-weight:500;text-align:right;font-variant-numeric:tabular-nums}
    .sip-card small{grid-column:1 / -1;margin-top:1px;font-size:10.5px;color:var(--muted-foreground)}
    .sip-compact .sip-card small{display:none}
    .sip-compact .sip-card{min-width:0}
    .sip-narrow .sip-card{min-width:0}
    .sip-narrow .sip-card small{display:none}
    .sip-narrow .sip-card b{display:none}
    .sip-narrow .sip-card-body{grid-template-columns:auto;padding:3px 8px}
    .sip-empty{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);max-width:calc(100% - 24px);padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:linear-gradient(135deg,rgba(255,255,255,.1),rgba(255,255,255,.03));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);font-size:11px;color:var(--muted-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .sip-foot{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:7px 16px 8px;border-top:1px solid var(--chart-grid);font-size:10px;color:var(--muted-foreground)}
    .sip-foot span{display:inline-flex;align-items:center;gap:7px}
    .sip-foot .sip-note{margin-left:auto;text-align:right}
    .sip-foot .legend-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
    @media (max-width:1100px){.sip-layout{grid-template-columns:1fr}.sip-map-panel,.sip-source-panel{height:440px}}
    @media (max-width:1100px){#sipMap.sip-map{flex:1 1 auto;min-height:0}}
    @media (max-width:720px){
      .sip-head{gap:12px}
      .sip-stat{padding:0 12px;min-width:0}
      .sip-map-panel,.sip-source-panel{height:440px}
      .sip-foot{padding:8px 14px 10px;gap:12px}.sip-foot .sip-note{margin-left:0;text-align:left}
    }`;
        document.head.appendChild(style);
  }

  /* ---------- map geometry: South Kerala dot matrix ---------- */
  const LAT0 = 8.27, LAT1 = 9.20, LONC = 76.88, LON_SPAN = 0.84;
  const COS = Math.cos(8.75 * Math.PI / 180);
  let districts = [];
  let dotCache = { key: '', svg: '' };

  function inRing(point, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      const crosses = ((yi > point[1]) !== (yj > point[1]))
        && point[0] < (xj - xi) * (point[1] - yi) / ((yj - yi) || 1e-12) + xi;
      if (crosses) inside = !inside;
    }
    return inside;
  }

  function prepareDistricts(features) {
    return list(features).map(f => {
      const g = f.geometry || {};
      const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
      const bb = { w: 999, e: -999, s: 999, n: -999 };
      polys.forEach(p => (p[0] || []).forEach(([lon, lat]) => {
        bb.w = Math.min(bb.w, lon); bb.e = Math.max(bb.e, lon);
        bb.s = Math.min(bb.s, lat); bb.n = Math.max(bb.n, lat);
      }));
      const name = f.properties?.name;
      return { name, polys, bb, key: name === 'Kollam' ? 'kollam' : name === 'Thiruvananthapuram' ? 'tvm' : '' };
    });
  }

  function inDistrict(f, lon, lat) {
    const b = f.bb;
    if (lon < b.w || lon > b.e || lat < b.s || lat > b.n) return false;
    return f.polys.some(p => inRing([lon, lat], p[0]) && !p.slice(1).some(h => inRing([lon, lat], h)));
  }

  function districtFor(lat, lon, city = '') {
    for (const f of districts) if (f.key && inDistrict(f, lon, lat)) return f.key;
    const place = String(city).toLowerCase();
    if (/kollam/.test(place)) return 'kollam';
    if (/thiruvananthapuram|trivandrum/.test(place)) return 'tvm';
    if (!districts.length && lat >= LAT0 && lat <= LAT1 && lon >= 76.4 && lon <= 77.35) return lat < 8.9 ? 'tvm' : 'kollam';
    return '';
  }

  /* Horizontal map: Kerala is rotated so the coast runs left to right (north = right).
     The longitude window fills the panel height; the width fills with districts further north. */
  const MAP_LAT_START = 8.27, MAP_PAD = 12;
  const DISTRICT_COLORS = {
    Kollam: '#4fa8cf', Thiruvananthapuram: '#8392e6', Pathanamthitta: '#b0a07a', Alappuzha: '#6fb39a',
    Kottayam: '#8a82d0', Idukki: '#4f9fb8', Ernakulam: '#b0a07a', Thrissur: '#8392e6',
    Palakkad: '#6fb39a', Malappuram: '#b0a07a', Kozhikode: '#4f9fb8', Wayanad: '#8a82d0',
    Kannur: '#b0a07a', Kasaragod: '#6fb39a'
  };

  const SOUTH_SPAN = 9.18 - 8.29, SOUTH_SHARE = 0.7;
  /* Zoomed on south Kerala: the map starts just off the coast (so the sea stays in view) and the zoom
     relaxes just enough to keep every plotted IP inside the panel height. */
  function frame(W, H, ips = []) {
    let P = SOUTH_SHARE * (W - MAP_PAD * 2) / SOUTH_SPAN;          // px per degree of latitude
    let lon0 = 76.52;
    if (ips.length) {
      const lons = ips.map(i => i.lon), lo = Math.min(...lons), hi = Math.max(...lons);
      lon0 = Math.min(lon0, lo - 0.1);
      const need = (hi - lon0) + 0.1;                              // degrees of longitude that must be visible
      P = Math.min(P, (H - MAP_PAD * 2) / (need * COS));
    }
    const at = (lat, lon) => ({ x: MAP_PAD + (lat - MAP_LAT_START) * P, y: MAP_PAD + (lon - lon0) * P * COS });
    const inv = (x, y) => ({ lat: MAP_LAT_START + (x - MAP_PAD) / P, lon: lon0 + (y - MAP_PAD) / (P * COS) });
    return { P, at, inv, sig: `${P.toFixed(1)}:${lon0.toFixed(3)}` };
  }

  /* Westernmost land longitude at a latitude (the coastline), from the district outlines */
  function coastLon(lat) {
    let best = null;
    districts.forEach(f => {
      if (lat < f.bb.s || lat > f.bb.n) return;
      f.polys.forEach(poly => {
        const ring = poly[0] || [];
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const [x1, y1] = ring[j], [x2, y2] = ring[i];
          if ((y1 > lat) !== (y2 > lat)) {
            const lon = x1 + (lat - y1) * (x2 - x1) / (y2 - y1);
            if (best === null || lon < best) best = lon;
          }
        }
      });
    });
    return best;
  }

  function dotsSvg(W, H, fr) {
    const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const key = `${W}x${H}:${districts.length}:${calm}:${fr.sig}`;
    if (dotCache.key === key) return dotCache.svg;
    const gap = Math.max(9, Math.min(13, Math.round(H / 36)));

    /* sea = everything west of the coastline (above it on the rotated map) */
    const STEP = 3, cols = Math.ceil(W / STEP) + 1, raw = [];
    const southTip = districts.length ? Math.min(...districts.map(f => f.bb.s)) : 0;
    for (let c = 0; c < cols; c++) {
      const lat = fr.inv(c * STEP, 0).lat;
      const lon = districts.length ? coastLon(lat) : null;
      raw.push(lon !== null ? Math.max(0, Math.min(H, fr.at(lat, lon).y)) : (districts.length && lat < southTip ? H : 0));
    }
    const seaY = raw.map((_, c) => {
      let t = 0, n = 0;
      for (let k = -2; k <= 2; k++) { const v = raw[c + k]; if (v !== undefined) { t += v; n++; } }
      return t / n;
    });
    const seaAt = x => seaY[Math.max(0, Math.min(cols - 1, Math.round(x / STEP)))];

    const faint = [], buckets = new Map(), centre = {};
    for (let y = gap / 2; y < H; y += gap) {
      for (let x = gap / 2; x < W; x += gap) {
        const { lat, lon } = fr.inv(x, y);
        const pt = `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
        const hit = districts.find(f => inDistrict(f, lon, lat));
        if (hit) {
          if (!buckets.has(hit.name)) buckets.set(hit.name, []);
          buckets.get(hit.name).push(pt);
          const c = centre[hit.name] || (centre[hit.name] = { x: 0, y: 0, n: 0 });
          c.x += x; c.y += y; c.n++;
        } else if (y >= seaAt(x)) faint.push(pt);
      }
    }

    const path = (d, c, o, w) => `<path d="${d.join('')}" fill="none" stroke="${c}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round"/>`;
    const hasSea = districts.length && seaY.some(y => y > 4);
    const coast = hasSea ? `M0 ${seaY[0].toFixed(1)}` + seaY.map((y, c) => `L${c * STEP} ${y.toFixed(1)}`).join('') : '';

    let svg = `<defs><filter id="sipBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4"/></filter></defs>`;

    const focusD = [];
    buckets.forEach((d, name) => {
      const focus = name === 'Kollam' || name === 'Thiruvananthapuram';
      svg += path(d, DISTRICT_COLORS[name] || '#7fb4c4', focus ? .42 : .62, focus ? 5 : 4.4);
      if (focus) focusD.push(...d);
    });

    /* district names */
    [['Kollam', 'KOLLAM'], ['Thiruvananthapuram', 'THIRUVANANTHAPURAM']].forEach(([name, label]) => {
      const c = centre[name];
      if (c) svg += `<text class="sip-dlabel" x="${(c.x / c.n).toFixed(1)}" y="${(c.y / c.n).toFixed(1)}" fill="${DISTRICT_COLORS[name]}">${label}</text>`;
    });

    /* coordinate ticks (latitude along the bottom, longitude along the left) and north arrow */
    const la0 = fr.inv(0, 0).lat, la1 = fr.inv(W, 0).lat;
    for (let lat = Math.ceil(la0 * 4) / 4; lat < la1; lat += .25) {
      const x = fr.at(lat, 0).x;
      if (x < 70 || x > W - 70) continue;
      svg += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${H - 13}" y2="${H - 8}" stroke="var(--muted-foreground)" stroke-opacity=".4"/><text class="sip-axis" x="${x.toFixed(1)}" y="${H - 15}" text-anchor="middle">${lat.toFixed(2)}°N</text>`;
    }
    const lo0 = fr.inv(0, 0).lon, lo1 = fr.inv(0, H).lon;
    for (let lon = Math.ceil(lo0 * 4) / 4; lon < lo1; lon += .25) {
      const y = fr.at(0, lon).y;
      if (y < 60 || y > H - 30) continue;
      svg += `<line x1="0" x2="5" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--muted-foreground)" stroke-opacity=".4"/><text class="sip-axis" x="8" y="${(y + 3).toFixed(1)}">${lon.toFixed(2)}°E</text>`;
    }
    svg += `<g transform="translate(${W - 58} 26)" fill="none" stroke="var(--silver)" stroke-opacity=".55" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0H24M18 -5L24 0L18 5"/><text class="sip-axis" x="-10" y="3.5" fill="var(--silver)" stroke="none" style="opacity:.8">N</text></g>`;

    dotCache = { key, svg };
    return svg;
  }

  /* ---------- resolve API data into per-IP records ---------- */
  function resolve(analytics, events, geoList) {
    const a = analytics || {};
    const counts = a.source_ips && typeof a.source_ips === 'object' && !Array.isArray(a.source_ips) ? a.source_ips : {};
    const hasCounts = Object.keys(counts).length > 0;
    const byIp = new Map();
    const get = ip => {
      if (!byIp.has(ip)) byIp.set(ip, { ip, requests: 0, errors: 0, city: '', country: '', lat: null, lon: null, hits: [] });
      return byIp.get(ip);
    };

    Object.entries(counts).forEach(([ip, n]) => { get(ip).requests = Number(n) || 0; });

    list(events).forEach(e => {
      const ip = e && (e.source_ip || e.ip);
      if (!ip) return;
      const r = get(String(ip));
      if (!hasCounts) r.requests += 1;
      const code = Number(e.status_code ?? e.details?.status_code);
      const isErr = (Number.isFinite(code) && code >= 400) || /fail|error|blocked|suspicious/i.test(String(e.event || ''));
      if (isErr) r.errors += 1;
      const hitAt = Date.parse(e.received_at || e.timestamp || e.event_time || e.time || e.created_at || '');
      if (Number.isFinite(hitAt)) r.hits.push({ t: hitAt, e: isErr });
      const lat = e.geo?.lat ?? e.geo?.latitude ?? e.latitude ?? e.lat;
      const lon = e.geo?.lon ?? e.geo?.lng ?? e.geo?.longitude ?? e.longitude ?? e.lon ?? e.lng;
      if (fin(lat) && fin(lon)) { r.lat = Number(lat); r.lon = Number(lon); }
      r.city = r.city || e.city || e.geo?.city || '';
      r.country = r.country || e.country || e.geo?.country || '';
    });

    [].concat(
      list(geoList), list(a.source_ip_locations), list(a.source_locations),
      list(a.geo_sources), list(a.geo && a.geo.sources), list(a.source_geo)
    ).forEach(g => {
      const ip = g && (g.ip || g.source_ip);
      if (!ip) return;
      const r = get(String(ip));
      const lat = g.lat ?? g.latitude, lon = g.lon ?? g.lng ?? g.longitude;
      if (fin(lat) && fin(lon)) { r.lat = Number(lat); r.lon = Number(lon); }
      r.city = g.city || r.city;
      r.country = g.country || g.country_code || r.country;
      const req = g.requests ?? g.count ?? g.events;
      if (!hasCounts && fin(req)) r.requests = Math.max(r.requests, Number(req));
      if (fin(g.errors) && !r.errors) r.errors = Number(g.errors);
    });

    const all = [...byIp.values()];
    const located = all.filter(r => fin(r.lat) && fin(r.lon)).sort((x, y) => y.requests - x.requests);
    const countries = new Set(located.map(r => String(r.country || '').trim().toLowerCase()).filter(Boolean));
    return {
      all, located,
      totals: {
        requests: all.reduce((n, r) => n + r.requests, 0),
        unique: all.length,
        countries: countries.size,
        errors: all.reduce((n, r) => n + r.errors, 0)
      }
    };
  }

  const toneOf = r => {
    const ratio = r.requests > 0 ? r.errors / r.requests : (r.errors > 0 ? 1 : 0);
    return ratio >= .5 ? 'coral' : ratio >= .05 ? 'amber' : 'cyan';
  };

  /* ---------- markup ---------- */
  /* small requests/errors plot for one source IP */
  function plot(r) {
    const hits = list(r.hits).filter(h => Number.isFinite(h.t)).sort((a, b) => a.t - b.t);
    const t0 = hits.length ? hits[0].t : 0, t1 = hits.length ? hits[hits.length - 1].t : 0;
    const clock = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    /* not enough timestamps for a time plot: show ok vs error bars */
    if (hits.length < 2 || t1 - t0 < 1000) {
      const ok = Math.max(0, r.requests - r.errors), max = Math.max(1, ok, r.errors);
      const row = (label, n, c) => `<div class="sip-plot-row"><span>${label}</span><div class="sip-plot-track"><i style="width:${(n / max * 100).toFixed(1)}%;background:var(--${c})"></i></div><b>${fmtN(n)}</b></div>`;
      return `<div class="sip-plot sip-plot-bars">${row('OK', ok, 'cyan')}${row('Errors', r.errors, 'coral')}</div>`;
    }

    const B = 24, W = 300, H = 72, pad = 5;
    const reqs = Array(B).fill(0), errs = Array(B).fill(0);
    hits.forEach(h => {
      const i = Math.min(B - 1, Math.floor((h.t - t0) / (t1 - t0) * B));
      reqs[i] += 1;
      if (h.e) errs[i] += 1;
    });
    const max = Math.max(1, ...reqs);
    const X = i => i / (B - 1) * W;
    const Y = v => H - pad - v / max * (H - pad * 2);
    const line = a => monotone(a.map((v, i) => [X(i), Y(v)]));
    const reqLine = line(reqs), errLine = line(errs);
    const grid = [pad, H / 2, H - pad].map(y => `<line x1="0" x2="${W}" y1="${y}" y2="${y}" class="sip-plot-grid"/>`).join('');

    return `<div class="sip-plot">
      <span class="sip-plot-max">${fmtN(max)}</span>
      <svg class="sip-plot-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Requests and errors over time for ${esc(r.ip)}">
        ${grid}
        <path d="${reqLine} L${W},${H - pad} L0,${H - pad} Z" fill="var(--cyan)" fill-opacity=".14"/>
        <path d="${reqLine}" class="sip-plot-line" stroke="var(--cyan)"/>
        <path d="${errLine}" class="sip-plot-line" stroke="var(--coral)"/>
      </svg>
      <div class="sip-plot-axis"><span>${clock(t0)}</span><span class="sip-plot-key"><i style="background:var(--cyan)"></i>Requests<i style="background:var(--coral)"></i>Errors</span><span>${clock(t1)}</span></div>
    </div>`;
  }

  /* ---------- tap an IP: location and details ---------- */
  function detailHtml() {
    const r = lastModel && selectedIp ? lastModel.all.find(x => x.ip === selectedIp) : null;
    if (!r) return '';
    const tone = toneOf(r);
    const status = tone === 'coral' ? 'Critical' : tone === 'amber' ? 'Degraded' : 'Healthy';
    const ratio = r.requests > 0 ? Math.min(100, r.errors / r.requests * 100) : 0;
    const where = [r.city, r.country].filter(Boolean).join(', ') || 'Unknown location';
    const located = fin(r.lat) && fin(r.lon);
    const dk = located ? districtFor(Number(r.lat), Number(r.lon), r.city) : '';
    const district = dk === 'kollam' ? 'Kollam' : dk === 'tvm' ? 'Thiruvananthapuram' : located ? 'Outside focus region' : '—';
    const coords = located ? `${Number(r.lat).toFixed(3)}°N, ${Number(r.lon).toFixed(3)}°E` : '—';
    const seen = list(r.hits).map(h => h.t).filter(Number.isFinite);
    const last = seen.length ? new Date(Math.max(...seen)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '—';
    const row = (k, v) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`;
    return `<div class="sip-detail-card tone-${tone}">
      <div class="sip-detail-head">
        <div><span class="eyebrow">SOURCE DETAILS</span><div class="sip-detail-ip">${esc(r.ip)}</div></div>
        <button type="button" class="sip-detail-x" data-sip-close aria-label="Close details">${icon('x', 10)}</button>
      </div>
      <span class="sip-chip">${status}</span>
      <dl class="sip-detail-list">
        ${row('Location', where)}${row('District', district)}${row('Coordinates', coords)}
        ${row('Requests', fmtN(r.requests))}${row('Errors', fmtN(r.errors))}${row('Error rate', ratio.toFixed(1) + '%')}${row('Last seen', last)}
      </dl>
    </div>`;
  }

  function refreshSelection() {
    const host = document.getElementById('sipDetail');
    if (host) host.innerHTML = detailHtml();
    document.querySelectorAll('#sipMap [data-ip]').forEach(el => el.classList.toggle('is-selected', el.dataset.ip === selectedIp));
  }

  function bindTaps() {
    if (clicksBound) return;
    clicksBound = true;
    const pick = e => {
      if (e.target.closest('#sipDetail [data-sip-close]')) { selectedIp = ''; refreshSelection(); return; }
      const t = e.target.closest('#sipMap [data-ip]');
      if (!t) return;
      selectedIp = selectedIp === t.dataset.ip ? '' : t.dataset.ip;
      refreshSelection();
    };
    document.addEventListener('click', pick);
    document.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('#sipMap [data-ip]')) { e.preventDefault(); pick(e); }
      else if (e.key === 'Escape' && selectedIp && document.getElementById('sipDetail')) { selectedIp = ''; refreshSelection(); }
    });
  }

  function html(model) {
    const { located, totals, all } = model;
    lastModel = model;
    const inFocus = located.filter(r => districtFor(r.lat, r.lon, r.city));
    const shown = inFocus.slice(0, MAX_SOURCES);
    const maxReq = Math.max(1, ...shown.map(r => r.requests));
    const cityKey = r => `${Number(r.lat).toFixed(2)},${Number(r.lon).toFixed(2)}`;
    const groups = {};
    shown.forEach(r => { (groups[cityKey(r)] = groups[cityKey(r)] || []).push(r); });

    /* every IP gets a marker and a compact tag; tap an IP for its location and details */
    const points = shown.map(r => {
      const tone = toneOf(r), grp = groups[cityKey(r)], slot = grp.indexOf(r);
      const d = Math.round(10 + 8 * Math.sqrt(r.requests / maxReq));
      const sel = r.ip === selectedIp ? ' is-selected' : '';
      const tip = `${r.ip} · tap for location and details`;
      return `<i class="sip-pt${sel}" data-ip="${esc(r.ip)}" data-lat="${r.lat}" data-lon="${r.lon}" data-slot="${slot}" data-tone="${tone}" style="--d:${d}px;--sip-c:var(--${tone})" title="${esc(tip)}"></i>`
        + `<div class="sip-card${sel}" data-ip="${esc(r.ip)}" data-d="${d}" role="button" tabindex="0" style="--sip-c:var(--${tone})" title="${esc(tip)}"><div class="sip-card-body">`
        + `<span class="sip-card-ip">${esc(r.ip)}</span><span class="sip-card-n">${fmtN(r.requests)}</span>`
        + `</div></div>`;
    }).join('');

    const empty = !all.length
      ? 'Waiting for real-time data'
      : !located.length
        ? 'Waiting for GeoIP locations — source IPs are received but have no coordinates yet'
        : '';
    const unlocated = all.length - located.length;

    const sources = [...all]
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 9)
      .map((r, idx) => {
        const where = [r.city, r.country].filter(Boolean).join(', ')
          || (fin(r.lat) && fin(r.lon) ? 'Located' : 'No GeoIP location');
        const tone = toneOf(r);
        const status = tone === 'coral' ? 'Critical' : tone === 'amber' ? 'Degraded' : 'Healthy';
        const ratio = r.requests > 0 ? Math.min(100, r.errors / r.requests * 100) : 0;
        return `<div class="sip-src tone-${tone}">
          <div class="sip-src-top">
            <span class="sip-rank">${String(idx + 1).padStart(2, '0')}</span>
            <div class="sip-src-id"><b class="mono">${esc(r.ip)}</b><small>${esc(where)}</small></div>
            <span class="sip-chip">${status}</span>
          </div>
          ${plot(r)}
          <div class="sip-src-stats">
            <div class="sip-src-stat"><b>${fmtN(r.requests)}</b><small>Requests</small></div>
            <div class="sip-src-stat"><b>${fmtN(r.errors)}</b><small>Errors</small></div>
            <div class="sip-src-stat"><b>${ratio.toFixed(1)}%</b><small>Error rate</small></div>
          </div>
        </div>`;
      }).join('');
    const outsideFocus = located.length - inFocus.length;
    const capped = inFocus.length - shown.length;
    const note = 'Marker size = request volume'
      + (outsideFocus > 0 ? ` · ${outsideFocus} outside South Kerala` : '')
      + (capped > 0 ? ` · ${capped} more regional IPs` : '')
      + (unlocated > 0 ? ` · ${unlocated} without location` : '');
    const coverage = all.length ? Math.round(located.length / all.length * 100) : 0;
    const regionalSummary = `<section class="sip-regional-summary" aria-label="Source IP coverage summary">
      <div class="sip-regional-summary-head"><b>REGIONAL ACTIVITY</b><span>${coverage}% GeoIP coverage</span></div>
      <div class="sip-regional-summary-metrics">
        <div><b>${fmtN(totals.requests)}</b><small>REQUESTS</small></div>
        <div><b>${fmtN(totals.errors)}</b><small>ERRORS</small></div>
        <div><b>${fmtN(located.length)} / ${fmtN(all.length)}</b><small>LOCATED IPs</small></div>
      </div>
      <div class="sip-coverage-track"><i style="width:${coverage}%"></i></div>
    </section>`;

    return `
    <div class="sip-layout" id="sipPanel">
      <section class="glass-panel sip sip-map-panel">
        <header class="panel-header sip-head">
          <div class="sip-title"><span class="eyebrow">GEOIP TELEMETRY</span><h2>Source IP activity</h2></div>
          <div class="sip-kpis" aria-label="Regional traffic summary">
            <div class="sip-kpi"><span>Mapped IPs</span><strong>${fmtN(inFocus.length)}</strong></div>
            <div class="sip-kpi"><span>Requests</span><strong>${fmtN(totals.requests)}</strong></div>
            <div class="sip-kpi"><span>Errors</span><strong class="${totals.errors > 0 ? 'coral' : ''}">${fmtN(totals.errors)}</strong></div>
            <div class="sip-kpi"><span>Error rate</span><strong>${totals.requests > 0 ? (totals.errors / totals.requests * 100).toFixed(1) : '0.0'}%</strong></div>
          </div>
          <div class="sip-head-status"><span class="online-badge sip-live"><i></i>Live · GeoIP</span></div>
        </header>
        <div class="sip-map" id="sipMap">
          <svg class="sip-svg" role="img" aria-label="South Kerala dot map with live GeoIP source connections to the server"></svg>
          <div class="sip-server-tag" title="Protected server"><span class="sip-server-icon">${icon('server', 17)}</span><span class="sip-server-text"><b>SERVER</b><small><i></i>Monitored by Sentinal AI</small></span></div>
          ${points}
          <div class="sip-detail" id="sipDetail">${detailHtml()}</div>
          ${empty ? `<div class="sip-empty">${esc(empty)}</div>` : ''}
        </div>
        <footer class="sip-foot">
          <span><i class="legend-dot" style="background:var(--cyan)"></i>Healthy traffic</span>
          <span><i class="legend-dot" style="background:var(--amber)"></i>Some errors</span>
          <span><i class="legend-dot" style="background:var(--coral)"></i>Mostly errors</span>
          <span class="sip-note">${esc(note)}</span>
        </footer>
      </section>
      <section class="glass-panel sip-source-panel">
        <header class="panel-header sip-source-head">
          <div><span class="eyebrow">TOP SOURCES</span><h2>Source IPs</h2></div>
          <span class="online-badge sip-live"><i></i>${fmtN(all.length)} IPs</span>
        </header>
        <div class="sip-srcs">${sources || '<small class="muted">Waiting for real-time data</small>'}${regionalSummary}</div>
      </section>
    </div>`;
  }

  /* ---------- placement: dot map, routes, markers and non-overlapping labels ---------- */
  function injectCss2() {
    if (document.getElementById('sipCss2')) return;
    const style = document.createElement('style');
    style.id = 'sipCss2';
    style.textContent = `
    .sip-map-panel .sip-map{background:radial-gradient(ellipse at 58% 50%,rgba(25,91,101,.14),transparent 65%),linear-gradient(135deg,#07181d,#08131b)}
    .sip-kpis{display:flex;align-items:center;flex-wrap:wrap;margin-left:auto}
    .sip-kpi{display:grid;gap:3px;padding:0 16px;border-left:1px solid var(--chart-grid)}
    .sip-kpi:first-child{border-left:0}
    .sip-kpi span{font:500 8.5px var(--font-mono);letter-spacing:.14em;color:var(--muted-foreground);text-transform:uppercase;white-space:nowrap}
    .sip-kpi strong{font:600 15px var(--font-mono);line-height:1.1;color:var(--foreground);font-variant-numeric:tabular-nums}
    .sip-map-panel .sip-pt{border:2px solid #07181d;background:var(--sip-c);animation:none;z-index:3;box-shadow:0 0 0 3px color-mix(in oklab,var(--sip-c) 38%,transparent),0 0 0 8px color-mix(in oklab,var(--sip-c) 12%,transparent),0 0 18px color-mix(in oklab,var(--sip-c) 55%,transparent)}
    .sip-map-panel .sip-pt::after{content:"";position:absolute;inset:-9px;border-radius:50%;border:1px solid var(--sip-c);opacity:0;animation:sipPing 2.8s ease-out infinite;pointer-events:none}
    @keyframes sipPing{0%{transform:scale(.55);opacity:.7}100%{transform:scale(1.6);opacity:0}}
    .sip-dlabel{font:600 9.5px var(--font-mono);letter-spacing:.24em;text-anchor:middle;opacity:.55;paint-order:stroke;stroke:rgba(5,18,24,.6);stroke-width:3px;pointer-events:none}
    .sip-axis{font:500 8px var(--font-mono);fill:var(--muted-foreground);opacity:.7;letter-spacing:.04em;paint-order:stroke;stroke:rgba(5,18,24,.85);stroke-width:3px}
    .sip-map-panel .sip-map{box-shadow:inset 0 0 70px rgba(0,0,0,.35)}
    .sip-map-panel .sip-pt{cursor:pointer;pointer-events:auto}
    .sip-map-panel .sip-pt.is-selected{box-shadow:0 0 0 3px var(--sip-c),0 0 0 9px color-mix(in oklab,var(--sip-c) 25%,transparent),0 0 24px var(--sip-c)}
    .sip-map-panel .sip-card{z-index:4;display:flex;align-items:stretch;min-width:0;cursor:pointer;border-radius:8px;border:1px solid color-mix(in oklab,var(--sip-c) 35%,rgba(255,255,255,.12));background:linear-gradient(160deg,rgba(14,38,46,.9),rgba(7,20,27,.92));backdrop-filter:blur(12px) saturate(140%);-webkit-backdrop-filter:blur(12px) saturate(140%);box-shadow:0 6px 18px rgba(0,0,0,.35);transition:border-color .2s,box-shadow .2s}
    .sip-map-panel .sip-card::before{content:"";flex:0 0 3px;width:auto;height:auto;background:var(--sip-c)}
    .sip-map-panel .sip-card:hover,.sip-map-panel .sip-card:focus-visible,.sip-map-panel .sip-card.is-selected{outline:0;border-color:var(--sip-c);box-shadow:0 0 0 1px var(--sip-c),0 6px 22px color-mix(in oklab,var(--sip-c) 35%,transparent)}
    .sip-map-panel .sip-card .sip-card-body{display:flex;align-items:center;gap:9px;grid-template-columns:none;padding:5px 9px}
    .sip-card-ip{font:600 10.5px var(--font-mono);color:var(--foreground);letter-spacing:.02em}
    .sip-card-n{padding-left:9px;border-left:1px solid var(--chart-grid);font:600 10.5px var(--font-mono);font-variant-numeric:tabular-nums;color:var(--sip-c)}
    .sip-narrow .sip-card-ip{display:none}.sip-narrow .sip-card-n{padding-left:0;border-left:0}
    .sip-server-tag{position:absolute;left:0;top:0;z-index:3;display:flex;align-items:center;gap:10px;padding:7px 13px 7px 7px;border-radius:10px;border:1px solid rgba(98,201,220,.32);background:linear-gradient(145deg,rgba(16,46,56,.82),rgba(7,20,28,.88));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 8px 20px rgba(0,0,0,.35);white-space:nowrap}
    .sip-server-icon{display:grid;place-items:center;width:32px;height:32px;flex:none;border-radius:8px;color:var(--cyan);border:1px solid rgba(98,201,220,.4);background:rgba(98,201,220,.1)}
    .sip-server-text{display:grid;gap:3px}
    .sip-server-text b{font:600 10.5px var(--font-mono);letter-spacing:.14em;color:var(--foreground)}
    .sip-server-text small{display:flex;align-items:center;gap:6px;font-size:9px;color:var(--muted-foreground)}
    .sip-server-text small i{width:5px;height:5px;border-radius:50%;background:var(--mint);box-shadow:0 0 6px var(--mint)}
    .sip-narrow .sip-server-text small{display:none}
    .sip-detail{position:absolute;left:24px;top:62px;z-index:6}
    .sip-detail:empty{display:none}
    .sip-detail-card{width:min(188px,calc(100vw - 80px));padding:8px 10px 9px;border-radius:9px;border:1px solid color-mix(in oklab,var(--sip-c) 36%,rgba(255,255,255,.12));background:linear-gradient(160deg,rgba(14,38,46,.95),rgba(7,20,27,.97));backdrop-filter:blur(14px) saturate(140%);-webkit-backdrop-filter:blur(14px) saturate(140%);box-shadow:0 8px 22px rgba(0,0,0,.45)}
    .sip-detail-card .eyebrow{font-size:7.5px;letter-spacing:.12em}
    .sip-detail-card .sip-chip{padding:2px 7px;font-size:7.5px}
    .sip-detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:5px}
    .sip-detail-ip{margin-top:2px;font:600 12px var(--font-mono);color:var(--foreground)}
    .sip-detail-x{display:grid;place-items:center;width:18px;height:18px;border-radius:5px;border:1px solid var(--chart-grid);background:transparent;color:var(--muted-foreground);cursor:pointer}
    .sip-detail-x:hover{color:var(--foreground);border-color:var(--cyan)}
    .sip-detail-list{display:grid;gap:4px;margin:7px 0 0;padding-top:7px;border-top:1px solid var(--chart-grid)}
    .sip-detail-list>div{display:flex;justify-content:space-between;gap:10px;font-size:9.5px}
    .sip-detail-list dt{color:var(--muted-foreground)}
    .sip-detail-list dd{margin:0;text-align:right;font:500 9.5px var(--font-mono);color:var(--foreground)}
    .sip-src{gap:8px;padding:10px 12px;background:linear-gradient(160deg,color-mix(in oklab,var(--sip-c) 7%,transparent),transparent)}
    .sip-src-top{gap:10px}
    .sip-src-id{min-width:0}
    .sip-rank{flex:none;width:24px;height:24px;border-radius:7px;display:grid;place-items:center;font:600 9.5px var(--font-mono);color:var(--sip-c);background:color-mix(in oklab,var(--sip-c) 14%,transparent);border:1px solid color-mix(in oklab,var(--sip-c) 30%,transparent)}
    .sip-chip{margin-left:auto;font:600 8.5px var(--font-mono);letter-spacing:.12em;text-transform:uppercase;padding:3px 9px;border-radius:99px;color:var(--sip-c);border:1px solid color-mix(in oklab,var(--sip-c) 40%,transparent);background:color-mix(in oklab,var(--sip-c) 10%,transparent)}
    .sip-src .sip-src-stats{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding-top:8px;border-top:1px solid var(--chart-grid)}
    .sip-src .sip-plot{flex:none;height:76px;min-height:0}
    .sip-src .sip-plot-bars{height:auto}
    .sip-src .sip-plot-svg{min-height:46px}
    @media(prefers-reduced-motion:reduce){.sip-map-panel .sip-pt::after{animation:none}}`;
    document.head.appendChild(style);
  }

  function layout(map) {
    const W = map.clientWidth, H = map.clientHeight;
    if (!W || !H) return;
    map.classList.toggle('sip-narrow', W < 640);
    map.classList.toggle('sip-compact', W < 1000);

    const ips = [...map.querySelectorAll('.sip-pt')].map(el => ({ lat: Number(el.dataset.lat), lon: Number(el.dataset.lon) })).filter(i => Number.isFinite(i.lat) && Number.isFinite(i.lon));
    const fr = frame(W, H, ips);
    const svg = map.querySelector('.sip-svg');
    const tag = map.querySelector('.sip-server-tag');
    const tw = tag ? tag.offsetWidth : 70, th = tag ? tag.offsetHeight : 26;
    const sTop = 16, sLeft = 24, sx = sLeft + tw, sy = sTop + th / 2;
    if (tag) { tag.style.left = `${sLeft}px`; tag.style.top = `${sTop}px`; }

    const pts = [...map.querySelectorAll('.sip-pt')], cardEls = [...map.querySelectorAll('.sip-card')];
    const pos = pts.map(el => {
      const base = fr.at(Number(el.dataset.lat), Number(el.dataset.lon));
      const slot = Number(el.dataset.slot) || 0;
      if (!slot) return base;
      const a = slot * 2.4, r = 20 + 8 * Math.floor(slot / 6);
      return { x: base.x + Math.cos(a) * r, y: base.y + Math.sin(a) * r };
    });

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    /* connections: one thin line per IP flowing to the server */
    let routes = '';
    const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    pts.forEach((el, i) => {
      const p = pos[i], tone = el.dataset.tone || 'cyan';
      const dist = Math.hypot(p.x - sx, p.y - sy), lane = ((i % 5) - 2) * 6;
      const d = `M${p.x.toFixed(1)} ${p.y.toFixed(1)}Q${((sx + p.x) / 2).toFixed(1)} ${((sy + p.y) / 2 - Math.min(46, dist * .1) + lane).toFixed(1)} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
      const dur = (3.2 + (i % 4) * .4).toFixed(2);
      routes += `<path d="${d}" fill="none" stroke="var(--${tone})" stroke-opacity=".07" stroke-width="3" stroke-linecap="round"/>`
        + `<path d="${d}" fill="none" stroke="var(--${tone})" stroke-opacity=".8" stroke-width=".9" stroke-linecap="round"/>`
        + (calm ? '' : `<circle r="2" fill="#f2ffff" style="filter:drop-shadow(0 0 3px var(--${tone}))"><animateMotion dur="${dur}s" begin="-${(i * .45 % Number(dur)).toFixed(2)}s" repeatCount="indefinite" path="${d}"/></circle>`);
    });
    routes += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="4" fill="none" stroke="var(--cyan)" stroke-opacity=".7"/><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="1.8" fill="var(--cyan)"/>`;
    svg.innerHTML = dotsSvg(W, H, fr) + routes;

    pts.forEach((el, i) => { el.style.left = `${pos[i].x.toFixed(1)}px`; el.style.top = `${pos[i].y.toFixed(1)}px`; });

    const placed = [{ l: sLeft - 8, t: sy - th / 2 - 8, r: sx + 10, b: sy + th / 2 + 8 }];
    svg.querySelectorAll('.sip-dlabel').forEach(t => { const bb = t.getBBox(); placed.push({ l: bb.x - 4, t: bb.y - 2, r: bb.x + bb.width + 4, b: bb.y + bb.height + 2 }); });
    const marks = pos.map((p, idx) => {
      const rad = (parseFloat(pts[idx].style.getPropertyValue('--d')) || 12) / 2 + 4;
      return { l: p.x - rad, r: p.x + rad, t: p.y - rad, b: p.y + rad };
    });
    const overlap = (c, left, top, q) => {
      const x = Math.min(left + c.w + 4, q.r) - Math.max(left - 4, q.l);
      const y = Math.min(top + c.h + 4, q.b) - Math.max(top - 4, q.t);
      return x > 0 && y > 0 ? x * y : 0;
    };
    const cards = cardEls.map((el, idx) => ({ el, idx, w: el.offsetWidth, h: el.offsetHeight, px: pos[idx].x, py: pos[idx].y }))
      .sort((a, b) => a.py - b.py);

    cards.forEach(c => {
      const gap = (parseFloat(c.el.dataset.d) || 12) / 2 + 6;
      const sides = [c.px + gap, c.px - gap - c.w].map(l => Math.max(4, Math.min(W - c.w - 4, l)));
      const step = c.h + 6;
      let best = null;
      for (const dy of [0, step, -step, 2 * step, -2 * step, 3 * step, -3 * step]) {
        for (const left of sides) {
          const top = Math.max(4, Math.min(H - c.h - 4, c.py - c.h / 2 + dy));
          const cost = placed.reduce((n, q) => n + overlap(c, left, top, q), 0)
            + marks.reduce((n, m) => n + overlap(c, left, top, m), 0) + Math.abs(dy) * 0.5;
          if (!best || cost < best.cost) best = { cost, left, top };
          if (cost === Math.abs(dy) * 0.5) break;
        }
        if (best && best.cost === Math.abs(dy) * 0.5) break;
      }
      placed.push({ l: best.left, t: best.top, r: best.left + c.w, b: best.top + c.h });
      c.el.style.transform = `translate(${best.left.toFixed(1)}px,${best.top.toFixed(1)}px)`;
      c.el.style.visibility = 'visible';
    });
  }

  function mount(root) {
    bindTaps();
    injectCss();
    injectCss2();
    const map = (root || document).querySelector('#sipMap');
    if (!map) return;
    if (!keralaLayerPromise) {
      keralaLayerPromise = fetch(GEOJSON_URL).then(response => {
        if (!response.ok) throw new Error(`Kerala boundary request failed (${response.status})`);
        return response.json();
      }).then(data => {
        districts = prepareDistricts(data.features);
        dotCache = { key: '', svg: '' };
        const liveMap = document.querySelector('#sipMap');
        if (liveMap) layout(liveMap);
      }).catch(error => console.warn('[Sentinal] Kerala dot map unavailable:', error));
    }
    if (observer) observer.disconnect();
    observer = new ResizeObserver(() => layout(map));
    observer.observe(map);
    layout(map);
  }

  return { resolve, html, mount };
})();

/* Application monitor page */
/* Application monitor page */
/* Application monitor page */
/* ============================================================
   SENTINAL AI — APPLICATION MONITOR
   COMPACT FULL-WIDTH PROFESSIONAL UI
   REAL TELEMETRY ONLY
   ============================================================ */

PAGES.application = () => {

  mountShell('application');

  const app = $('#app');

  let paused = false;
  let refreshing = false;
  let lastUpdated = null;
  let filter = '';

  let analytics = null;
  let applications = [];
  let liveEvents = [];
  let geoSources = [];
  let geoEndpointAvailable = true;

  const POLL_INTERVAL = 3000;
  let timer = null;


  /* ============================================================
     HELPERS
     ============================================================ */

  function num(value) {

    const n = Number(value);

    return Number.isFinite(n) ? n : 0;

  }


  function arr(value) {

    return Array.isArray(value) ? value : [];

  }


  function fmt(value) {

    return num(value).toLocaleString();

  }


  function safe(value) {

    if (typeof esc === 'function') {
      return esc(value ?? '');
    }

    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  }


  /* Application page layout tweaks: smooth inner scrolling and compact, equal-height
     HTTP status / username panels (the username list scrolls instead of growing). */
  function injectApplicationCss() {
    if (document.getElementById('appPageCss')) return;
    const st = document.createElement('style');
    st.id = 'appPageCss';
    st.textContent = `
    /* Source IP list: smooth, momentum scrolling that hands off to the page at the ends */
    .sip-srcs{scroll-behavior:smooth;-webkit-overflow-scrolling:touch;overscroll-behavior-y:auto;scrollbar-width:thin;scrollbar-color:color-mix(in oklab,var(--cyan) 40%,transparent) transparent}
    .sip-srcs::-webkit-scrollbar,.username-chart-rows::-webkit-scrollbar{width:6px}
    .sip-srcs::-webkit-scrollbar-thumb,.username-chart-rows::-webkit-scrollbar-thumb{background:color-mix(in oklab,var(--cyan) 40%,transparent);border-radius:999px}
    .sip-srcs::-webkit-scrollbar-track,.username-chart-rows::-webkit-scrollbar-track{background:transparent}

    /* HTTP status + username panels: same fixed height, no dead space */
    .status-user-grid{align-items:start!important;grid-auto-rows:auto!important}
    .status-user-grid>.compact-panel{display:flex!important;flex-direction:column;height:190px!important;min-height:0!important;max-height:190px!important;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:color-mix(in oklab,var(--cyan) 40%,transparent) transparent}
    .status-user-grid>.compact-panel>.panel-header{flex:none}
    .status-user-grid>.compact-panel .username-activity-chart{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;padding-bottom:6px}
    .status-user-grid>.compact-panel .username-chart-summary,
    .status-user-grid>.compact-panel .username-chart-axis{flex:none}
    .status-user-grid>.compact-panel .username-chart-rows{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior-y:auto;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;padding-right:6px;scrollbar-width:thin;scrollbar-color:color-mix(in oklab,var(--cyan) 40%,transparent) transparent}
    .status-user-grid>.compact-panel:has(.username-activity-chart){overflow-y:hidden}
    /* Username activity: tiny stats pinned top-right, names get the room */
    .status-user-grid>.compact-panel:has(.username-activity-chart){position:relative}
    .status-user-grid>.compact-panel .username-chart-summary{position:absolute;top:12px;right:16px;z-index:2;display:flex!important;justify-content:flex-end!important;flex-wrap:nowrap!important;gap:14px!important;padding:0!important;border-bottom:0!important}
    .status-user-grid>.compact-panel .username-chart-summary span{gap:1px;text-align:right}
    .status-user-grid>.compact-panel .username-chart-summary b{font:600 11px var(--font-mono)}
    .status-user-grid>.compact-panel .username-chart-summary small{font-size:6px;letter-spacing:.06em;white-space:nowrap}
    .status-user-grid>.compact-panel .username-chart-axis,
    .status-user-grid>.compact-panel .username-chart-row{grid-template-columns:24px 128px minmax(0,1fr) 40px;gap:8px}
    .status-user-grid>.compact-panel .username-chart-name{font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    @media (max-width:900px){
      .status-user-grid>.compact-panel .username-chart-summary{position:static;flex-wrap:wrap!important;justify-content:flex-start!important;padding-bottom:6px!important}
    }
    @media (max-width:760px){
      .status-user-grid>.compact-panel{height:auto!important;max-height:380px!important}
      .status-user-grid>.compact-panel .username-chart-rows{max-height:130px}
    }
    @media (prefers-reduced-motion:reduce){.sip-srcs,.username-chart-rows{scroll-behavior:auto}}`;
    document.head.appendChild(st);
  }


  function eventTime(event) {

    const raw =
      event?.time ||
      event?.received_at ||
      event?.timestamp ||
      event?.created_at ||
      '';

    if (!raw) return '--:--:--';

    const date = new Date(raw);

    if (Number.isNaN(date.getTime())) {
      return String(raw);
    }

    return date.toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }
    );

  }


  function eventClass(value) {

    const type =
      String(value || '').toUpperCase();

    if (
      type.includes('FAILED') ||
      type === 'ERROR' ||
      type.includes('SUSPICIOUS')
    ) {
      return 'coral';
    }

    if (type.includes('SECURITY')) {
      return 'amber';
    }

    return 'mint';

  }


  /* ============================================================
     HEALTH
     ============================================================ */

  function latestHealth() {

    const series =
      arr(analytics?.health_series);

    if (!series.length) {
      return 'NO DATA';
    }

    const last =
      series[series.length - 1];

    return String(
      last.health || 'UNKNOWN'
    ).toUpperCase();

  }


  /* ============================================================
     SUMMARY
     ============================================================ */

  function summary() {

    const overview =
      analytics?.overview || {};

    const logins =
      analytics?.authentication || {};

    const requests =
      analytics?.requests || {};

    const sessions =
      analytics?.sessions || {};

    const errors =
      analytics?.errors || {};


    const totalRequests =
      num(
        requests.total ??
        overview.requests?.total
      );


    const errorCount =
      num(
        requests.errors ??
        errors.total ??
        overview.errors
      );


    const responseSeries =
      arr(
        analytics?.response_time_series
      );


    const responseValues =
      responseSeries
        .map(
          item =>
            num(item.response_time)
        )
        .filter(
          value => value >= 0
        );


    const averageResponse =
      num(
        requests.average_response_time ??
        overview.requests?.average_response_time
      );


    const peakResponse =
      responseValues.length
      ? Math.max(...responseValues)
        : averageResponse;


    return {

      total:
        num(
          overview.total_events ??
          analytics?.total_events
        ),

      successful:
        num(
          logins.successful ??
          overview.logins?.successful
        ),

      failed:
        num(
          logins.failed ??
          overview.logins?.failed
        ),

      requests:
        totalRequests,

      errors:
        errorCount,

      active:
        num(
          sessions.active ??
          overview.sessions?.active
        ),

      started:
        num(
          sessions.started ??
          overview.sessions?.started
        ),

      ended:
        num(
          sessions.ended ??
          overview.sessions?.ended
        ),

      suspicious:
        num(
          analytics?.security?.suspicious_activity ??
          overview.suspicious_activity
        ),

      securityEvents:
        num(
          analytics?.security?.security_events ??
          overview.security_events
        ),

      averageResponse,

      peakResponse,

      errorRate:
        totalRequests > 0
          ? (
              errorCount /
              totalRequests *
              100
            )
          : 0,

      health:
        latestHealth()

    };

  }


  /* ============================================================
     REAL DATA SERIES
     ============================================================ */

  function authData() {

    return arr(
      analytics?.authentication_series
    ).map(
      item => ({

        time:
          eventTime(item),

        successful:
          num(item.successful),

        failed:
          num(item.failed)

      })
    );

  }


  function requestData() {

    return arr(
      analytics?.request_series
    ).map(
      item => ({

        time:
          eventTime(item),

        requests:
          num(item.requests),

        errors:
          num(item.errors)

      })
    );

  }


  function sessionData() {

    return arr(
      analytics?.session_series
    ).map(
      item => ({

        time:
          eventTime(item),

        started:
          num(item.started),

        ended:
          num(item.ended),

        active:
          num(item.active),

        requests:
          num(item.requests),

        source:
          String(item.source || '')

      })
    );

  }


  function responseData() {

    return arr(
      analytics?.response_time_series
    ).map(
      item => ({

        time:
          eventTime(item),

        response_time:
          num(item.response_time)

      })
    );

  }


  /* ============================================================
     PROFESSIONAL WAVE GRAPH
     ============================================================ */

  function professionalWaveChart(
    data,
    series,
    options = {}
  ) {

    if (
      !Array.isArray(data) ||
      !data.length
    ) {

      return emptyGraph(
        options.emptyMessage ||
        'Waiting for real-time data'
      );

    }

    /* "var(--mint)" -> "mint" so the shared engine can theme it */
    const tone = value =>
      String(value || 'cyan')
        .replace(/^var\(--(.+)\)$/, '$1');

    return Charts.add({

      data:
        data
          .filter(item => item && typeof item === 'object')
          .map(item => ({ ...item })),

      series:
        series.map(config => ({
          key: config.key,
          name: config.name || config.key,
          color: tone(config.color)
        })),

      area: true,
      sw: 1.8,
      dot: true,
      height: options.height || 165

    });

  }


  /* ============================================================
     EMPTY GRAPH
     ============================================================ */

  function emptyGraph(message) {

    return `

      <div
        class="empty-compact"
        style="
          display:flex;
          align-items:center;
          gap:10px;
          margin:4px 16px 16px;
          padding:12px 14px;
          border:1px dashed var(--chart-grid);
          border-radius:10px;
          color:var(--muted-foreground);
          font-size:12px;
        "
      >

        <span
          style="
            width:22px;
            height:22px;
            flex:0 0 22px;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            border:1px solid var(--chart-grid);
            border-radius:6px;
          "
        >
          —
        </span>

        ${safe(message)}

      </div>

    `;

  }


  /* ============================================================
     DISTRIBUTION ANALYSIS
     ============================================================ */

  function objectEntries(value) {

    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value)
    ) {

      return [];

    }


    return Object.entries(value)
      .map(
        ([label, value]) => ({

          label:
            String(label),

          value:
            num(value)

        })
      )
      .filter(
        item =>
          item.value > 0
      )
      .sort(
        (a, b) =>
          b.value -
          a.value
      )
      .slice(0, 10);

  }


  function distributionBars(
    items,
    emptyMessage,
    recentEvents = []
  ) {

    if (!items.length) {

      return emptyGraph(
        emptyMessage
      );

    }


    const max = Math.max(...items.map(item => item.value), 1);
    const total = items.reduce((sum, item) => sum + item.value, 0);
    const ticks = [0, .25, .5, .75, 1];

    // Per-user facts come only from real timestamped connector events.
    const facts = new Map();
    const allIps = new Set();
    let latest = 0;
    let failedTotal = 0;
    let recentCount = 0;
    arr(recentEvents).forEach(event => {
      const name = String(event?.username || '').trim();
      const ip = String(event?.source_ip || '').trim();
      const type = String(event?.event || '').toUpperCase();
      const code = Number(event?.status_code ?? event?.details?.status_code);
      const failed = type.includes('FAILED') || (Number.isFinite(code) && code >= 400);
      const at = Date.parse(event?.time || event?.received_at || event?.timestamp || '');
      if (Number.isFinite(at) && at > latest) latest = at;
      if (Number.isFinite(at) && Date.now() - at <= 300000) recentCount += 1;
      if (ip) allIps.add(ip);
      if (failed) failedTotal += 1;
      if (!name) return;
      const f = facts.get(name) || { failed: 0, last: 0, ip: '' };
      if (failed) f.failed += 1;
      if (Number.isFinite(at) && at >= f.last) { f.last = at; f.ip = ip || f.ip; }
      facts.set(name, f);
    });
    const clock = t => t
      ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      : '—';

    return `<div class="username-activity-chart" role="img" aria-label="Username activity by telemetry event count">
      <div class="username-chart-summary" style="justify-content:space-between;gap:16px">
        <span><b>${fmt(total)}</b><small>EVENTS · USERS SHOWN</small></span>
        <span><b>${fmt(items.length)}</b><small>TOP USERNAMES</small></span>
        <span><b>${fmt(recentCount)}</b><small>EVENTS · LAST 5 MIN</small></span>
        <span><b class="${failedTotal > 0 ? 'coral' : ''}">${fmt(failedTotal)}</b><small>FAILED EVENTS</small></span>
        <span><b>${fmt(allIps.size)}</b><small>SOURCE IPs</small></span>
        <span><b>${clock(latest)}</b><small>LATEST EVENT</small></span>
      </div>
      <div class="username-chart-axis"><span>ACCOUNT</span><div>${ticks.map(tick => `<i style="left:${tick * 100}%"><b>${fmt(Math.round(max * tick))}</b></i>`).join('')}</div><span>EVENTS</span></div>
      <div class="username-chart-rows">${items.map((item, index) => {
        const share = total ? item.value / total * 100 : 0;
        const f = facts.get(item.label);
        const meta = f
          ? `${share.toFixed(1)}% share · ${fmt(f.failed)} failed · last ${clock(f.last)}${f.ip ? ' · ' + safe(f.ip) : ''}`
          : `${share.toFixed(1)}% share`;
        return `<div class="username-chart-row" title="${safe(item.label)}: ${fmt(item.value)} observed events · ${meta}">
          <span class="username-chart-rank">${String(index + 1).padStart(2, '0')}</span>
          <span class="username-chart-name mono">${safe(item.label)}</span>
          <span class="username-chart-track"><i style="--bar:${(item.value / max * 100).toFixed(1)}%;--share:${share.toFixed(1)}%"></i></span>
          <b class="username-chart-value mono">${fmt(item.value)}</b>
        </div>`;
      }).join('')}</div>
    </div>`;

  }


  /* ============================================================
     HTTP STATUS PLOT
     Groups raw codes (200, 404 ...) or class keys (2xx, 4xx ...)
     into one stacked plot with a per-class breakdown.
     ============================================================ */

  function statusPlot(raw) {

    const emptyMessage =
      'Waiting for real-time data';

    if (
      !raw ||
      typeof raw !== 'object' ||
      Array.isArray(raw)
    ) {
      return emptyGraph(emptyMessage);
    }

    const classes = {
      '2xx': { name: 'Success',      color: 'mint',  n: 0 },
      '3xx': { name: 'Redirect',     color: 'cyan',  n: 0 },
      '4xx': { name: 'Client error', color: 'amber', n: 0 },
      '5xx': { name: 'Server error', color: 'coral', n: 0 }
    };

    const codes = [];
    let other = 0;

    Object.entries(raw).forEach(([key, value]) => {

      const n = num(value);

      if (n <= 0) return;

      const k = String(key).trim().toLowerCase();

      const isCode = /^\d{3}$/.test(k);

      const cls =
        isCode
          ? k[0] + 'xx'
          : (/^[1-5]xx$/.test(k) ? k : null);

      if (isCode) codes.push({ code: k, n });

      if (cls && classes[cls]) {
        classes[cls].n += n;
      } else {
        other += n;
      }

    });

    const total =
      Object.values(classes)
        .reduce((sum, c) => sum + c.n, 0) + other;

    if (!total) {
      return emptyGraph(emptyMessage);
    }

    const pct = n => n / total * 100;

    const rows = Object.entries(classes).map(
      ([key, c]) => ({
        key,
        label: c.name,
        color: c.color,
        n: c.n
      })
    );

    if (other > 0) {
      rows.push({
        key: 'other',
        label: 'Other',
        color: 'silver',
        n: other
      });
    }

    const segments =
      rows
        .filter(r => r.n > 0)
        .map(r => `
          <span
            title="${safe(r.key)} · ${fmt(r.n)}"
            style="
              flex:${r.n} 1 0;
              min-width:4px;
              background:var(--${r.color});
              border-radius:3px;
            "
          ></span>
        `)
        .join('');

    const rowHtml = rows.map(r => `

      <div
        class="status-row"
        style="
          display:grid;
          grid-template-columns:minmax(96px,1.1fr) 2.2fr 34px 48px;
          gap:10px;
          align-items:center;
          margin:5px 0;
          ${r.n ? '' : 'opacity:.45;'}
        "
      >

        <span class="mono muted text-9">
          <i
            class="legend-dot ${r.color}"
            style="margin-right:6px"
          ></i>${safe(r.key)} ${safe(r.label)}
        </span>

        <div
          style="
            height:5px;
            background:var(--chart-grid);
            border-radius:999px;
            overflow:hidden;
          "
        >
          <span
            style="
              display:block;
              width:${r.n ? Math.max(3, pct(r.n)) : 0}%;
              height:100%;
              background:var(--${r.color});
              border-radius:999px;
            "
          ></span>
        </div>

        <b class="mono" style="text-align:right;">
          ${fmt(r.n)}
        </b>

        <span class="mono muted text-9" style="text-align:right;">
          ${pct(r.n).toFixed(1)}%
        </span>

      </div>

    `).join('');

    const topCodes =
      codes
        .sort((a, b) => b.n - a.n)
        .slice(0, 6)
        .map(c => `
          <span
            class="mono muted text-9"
            style="
              padding:2px 7px;
              border:1px solid var(--chart-grid);
              border-radius:6px;
              margin:0 4px 4px 0;
              display:inline-block;
            "
          >${safe(c.code)} · ${fmt(c.n)}</span>
        `)
        .join('');

    return `

      <div style="padding:4px 16px 8px;">

        <div
          style="
            display:flex;
            justify-content:space-between;
            align-items:baseline;
            margin-bottom:8px;
          "
        >
          <span class="eyebrow">TOTAL RESPONSES</span>
          <b class="mono">${fmt(total)}</b>
        </div>

        <div
          role="img"
          aria-label="HTTP responses by status class"
          style="
            display:flex;
            gap:2px;
            height:9px;
            margin-bottom:6px;
          "
        >
          ${segments}
        </div>

        ${rowHtml}

        ${topCodes
          ? `<div style="margin-top:8px;">${topCodes}</div>`
          : ''}


      </div>

    `;

  }


  /* ============================================================
     COMPACT FULL-WIDTH APPLICATION CARD
     ============================================================ */

  function renderApplications() {

    if (!applications.length) {
      return `
        <div class="glass-panel connected-app-card is-empty">
          <div class="empty-state">
            Waiting for real-time data
          </div>
        </div>
      `;
    }

    return applications.map(item => {

      const name =
        item.application ||
        item.application_name ||
        item.application_id ||
        'Unknown Application';

      const id = item.application_id || '—';

      const eventCount = num(item.events ?? item.events_received);

      // Application status
const isConnected = eventCount > 0;

const appStatus = isConnected ? 'CONNECTED' : 'REGISTERED';

const statusClass = isConnected ? 'mint' : 'muted';

const cardLabel = isConnected
  ? 'CONNECTED APPLICATION'
  : 'REGISTERED APPLICATION';

      const last = item.last_event || item.last_communication || '—';

      const initial =
        String(name).trim().charAt(0).toUpperCase() || 'A';

      let formattedLast = last;

      if (last && last !== '—') {
        const date = new Date(last);
        if (!Number.isNaN(date.getTime())) {
          formattedLast = date.toLocaleString([], {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
        }
      }

      return `
        <article class="glass-panel connected-app-card">

<span class="eyebrow app-card-label">${cardLabel}</span>

<span class="online-badge app-card-badge">
  <i></i>${appStatus}
</span>

          <div class="app-card-identity">
            <div class="app-card-icon">${safe(initial)}</div>
            <div class="app-card-info">
              <h3>${safe(name)}</h3>
              <p>External Application</p>
              <span class="app-card-id mono">${safe(id)}</span>
            </div>
          </div>

          <div class="app-card-metrics">
            <div>
              <span class="eyebrow">EVENTS</span>
              <b>${fmt(eventCount)}</b>
            </div>
            <div>
              <span class="eyebrow">LAST EVENT</span>
              <b class="mono" title="${safe(formattedLast)}">${safe(formattedLast)}</b>
            </div>
           <div>
  <span class="eyebrow">STATUS</span>
  <b class="${statusClass} app-card-status">
    <i></i>${appStatus}
  </b>
</div>
          </div>

          <svg class="app-card-wave" viewBox="0 0 250 75" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 45 C25 18,43 68,69 43 S111 17,139 43 S185 67,250 24" fill="none" stroke="currentColor" stroke-opacity=".30" stroke-width="1"/>
            <path d="M0 51 C27 30,44 62,72 45 S113 27,142 45 S192 61,250 33" fill="none" stroke="currentColor" stroke-opacity=".18" stroke-width="1"/>
            <circle cx="182" cy="42" r="4.5" fill="currentColor" style="filter:drop-shadow(0 0 6px currentColor)"/>
          </svg>

        </article>
      `;

    }).join('');

  }


  /* ============================================================
     LIVE EVENTS
     ============================================================ */

  function renderEvents() {

    const query =
      filter.trim().toLowerCase();


    const events =
      liveEvents.filter(
        event => {

          if (!query) {
            return true;
          }


          return [

            event.event,
            event.source,
            event.application,
            event.application_id,
            event.username,
            event.source_ip,
            event.path,
            event.method,
            event.status_code,
            event.details

          ]
            .map(
              value =>
                String(
                  value ?? ''
                )
            )
            .join(' ')
            .toLowerCase()
            .includes(query);

        }
      );


    if (!events.length) {

      return `

        <tr>

          <td
            colspan="8"
            class="empty-state"
          >

            Waiting for real-time data

          </td>

        </tr>

      `;

    }


    return events
      .slice()
      .reverse()
      .map(
        event => {

          const type =
            String(
              event.event ||
              'UNKNOWN'
            ).toUpperCase();


          const responseTime =
            event.response_time ??
            event.details?.response_time;


          return `

            <tr>

              <td class="mono">

                ${safe(
                  eventTime(event)
                )}

              </td>


              <td
                class="${eventClass(
                  type
                )}"
              >

                ${safe(type)}

              </td>


              <td>

                ${safe(
                  event.application ||
                  event.source ||
                  '—'
                )}

              </td>


              <td class="mono">

                ${safe(
                  event.source_ip ||
                  '—'
                )}

              </td>


              <td>

                ${safe(
                  event.username ||
                  '—'
                )}

              </td>


              <td class="mono">

                ${safe(
                  event.path ||
                  '—'
                )}

              </td>


              <td>

                ${safe(
                  event.status_code ??
                  event.details?.status_code ??
                  '—'
                )}

              </td>


              <td class="mono">${responseTime !== undefined && responseTime !== null && !Number.isNaN(Number(responseTime)) ? Number(responseTime).toFixed(2) + ' ms' : '—'}</td>

            </tr>

          `;

        }
      )
      .join('');

  }


  /* ============================================================
     LOAD REAL DATA
     ============================================================ */

  /* Optional GeoIP endpoint: { sources: [{ ip, city, country, lat, lon }] }.
     If the backend has no such route, positions come from the analytics/events payload instead. */
  async function loadGeo() {
    if (!geoEndpointAvailable) return;
    try {
      const response = await fetch('/api/application/geo', { cache: 'no-store' });
      if (!response.ok) { geoEndpointAvailable = false; return; }
      const data = await response.json();
      geoSources = arr(data.sources ?? data.locations ?? data.geo ?? data);
    } catch (error) {
      geoEndpointAvailable = false;
    }
  }


  async function loadData() {

    try {

      const [

        analyticsResponse,
        applicationsResponse,
        eventsResponse

      ] = await Promise.all([

        fetch(
          '/api/application/analytics',
          {
            cache:
              'no-store'
          }
        ),

        fetch(
          '/api/application/apps',
          {
            cache:
              'no-store'
          }
        ),

        fetch(
          '/api/application/events',
          {
            cache:
              'no-store'
          }
        )

      ]);


      if (!analyticsResponse.ok) {

        throw new Error(
          `Application analytics HTTP ${analyticsResponse.status}`
        );

      }


      analytics =
        await analyticsResponse.json();


      if (applicationsResponse.ok) {

        const data =
          await applicationsResponse.json();

        applications =
          arr(
            data.applications
          );

      }
      else {

        applications =
          arr(
            analytics.applications
          );

      }


      if (eventsResponse.ok) {

        const data =
          await eventsResponse.json();

        liveEvents =
          arr(
            data.events
          );

      }
      else {

        liveEvents =
          arr(
            analytics.event_timeline
          );

      }


      await loadGeo();

      lastUpdated = new Date();

      render();

      return true;

    }

    catch (error) {

      console.error(
        'Sentinal application telemetry error:',
        error
      );

      renderOffline();

      return false;

    }

  }


  /* ============================================================
     OFFLINE
     ============================================================ */

  function renderOffline() {

    app.innerHTML = `

      <div class="page-heading">

        <div>

          <div class="eyebrow">
            CONNECTED APPLICATION INTELLIGENCE
          </div>

          <h1>
            Application monitor

            <span class="online-badge">
              <i></i>
              Connector offline
            </span>
          </h1>

          <p>
            Unable to retrieve application
            telemetry.
          </p>

        </div>

      </div>


      <div class="glass-panel">

        <div class="empty-state">

          <b>Waiting for real-time data</b>

          <br><br>

          Unable to connect to the
          Sentinal Application API.

          <br><br>

          <small>

            Make sure the Connector and
            Dashboard servers are running.

          </small>

        </div>

      </div>

    `;

  }


  /* ============================================================
     MAIN RENDER
     ============================================================ */

  function render() {

    if (!analytics) {

      renderOffline();

      return;

    }


    const s =
      summary();


    const authentication =
      authData();


    const requests =
      requestData();


    const sessions =
      sessionData();

    const hasSessionLifecycle = sessions.some(item => item.source === 'session_telemetry');
    const hasObservedRequestActivity = sessions.some(item => item.source === 'request_activity_proxy');
    const sessionGraphSeries = hasSessionLifecycle
      ? [
          { key: 'started', name: 'Started', color: 'var(--mint)' },
          { key: 'ended', name: 'Ended', color: 'var(--coral)' },
          { key: 'active', name: 'Active sessions', color: 'var(--cyan)' }
        ]
      : hasObservedRequestActivity
        ? [{ key: 'requests', name: 'Observed requests', color: 'var(--cyan)' }]
        : [];
    const sessionGraphEyebrow = hasSessionLifecycle
      ? 'LIVE SESSION LIFECYCLE'
      : hasObservedRequestActivity
        ? 'OBSERVED REQUEST ACTIVITY'
        : 'WAITING FOR CONNECTOR TELEMETRY';


    const responses =
      responseData();


    const statuses =
      objectEntries(
        analytics.status_distribution
      );


    const usernames =
      objectEntries(
        analytics.usernames
      );


    const apps =
      arr(
        analytics.applications
      );


    if (apps.length) {
      applications = apps;
    }


    const gate = (ok, html) => ok ? html : emptyGraph('Waiting for real-time data');

    /* Session stats: when the connector sends no session lifecycle counters,
       derive them from the observed-request series so the cards match the graph. */
    const sessStat = { active: s.active, started: s.started, ended: s.ended };
    if (!hasSessionLifecycle && hasObservedRequestActivity && s.active + s.started + s.ended === 0) {
      const pts = sessions.map(x => x.requests);
      if (pts.length) {
        sessStat.active = pts[pts.length - 1];
        for (let i = 1; i < pts.length; i++) {
          const d = pts[i] - pts[i - 1];
          if (d > 0) sessStat.started += d; else sessStat.ended += -d;
        }
      }
    }

    const activeEl = document.activeElement;
    const keepFilter = !!activeEl && activeEl.id === 'applicationEventFilter';
    const selStart = keepFilter ? activeEl.selectionStart : null;
    const selEnd = keepFilter ? activeEl.selectionEnd : null;

    /* Remember inner scroll positions: this page re-renders every few seconds,
       which would otherwise snap the Source IP list and username list back to the top. */
    const keepScroll = ['.sip-srcs', '.username-chart-rows']
      .map(sel => {
        const el = $(sel, app);
        return el ? [sel, el.scrollTop] : null;
      })
      .filter(Boolean);

    injectApplicationCss();

    app.innerHTML = `

      <!-- ====================================================
           HEADER
           ==================================================== -->

      <div class="page-heading">

        <div>

          <div class="eyebrow">
            CONNECTED APPLICATION INTELLIGENCE
          </div>

          <h1>

            Application monitor

            <span class="online-badge">

              <i></i>

              ${paused ? 'Monitoring paused' : 'Connector online'}

            </span>

          </h1>

          <p>
            Real-time telemetry from
            authorized external applications.
          </p>

        </div>


        <div class="flex items-center gap-2">

          <span class="muted mono" style="font-size:11px;margin-right:8px;white-space:nowrap">
            ${lastUpdated
              ? 'Updated ' + lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
              : 'Waiting for real-time data'}
          </span>

          <button class="btn btn-ghost" id="applicationRefresh" type="button" ${refreshing ? 'disabled' : ''} aria-label="Refresh telemetry now">
            ${icon('radio', 14)}${refreshing ? 'Refreshing…' : 'Refresh'}
          </button>

          <button class="btn btn-ghost" id="applicationPause" type="button" aria-pressed="${paused}" aria-label="${paused ? 'Resume live telemetry' : 'Pause live telemetry'}">
            ${icon(paused ? 'play' : 'pause', 14)}${paused ? 'Resume' : 'Pause'}
          </button>

        </div>

      </div>


      <!-- ====================================================
           COMPACT FULL WIDTH APPLICATION
           ==================================================== -->

      <div class="app-card-wrap">${renderApplications()}</div>


      <!-- ====================================================
           STATUS STRIP
           ==================================================== -->

      <div class="status-strip">

        <span>

          ${icon(
            'app',
            15
          )}

          <b>
            Applications
          </b>

          <small>
            ${applications.length}
            connected
          </small>

        </span>


        <span>

          <i class="live-dot"></i>

          ${
            paused
              ? 'Monitoring paused'
              : 'Live telemetry'
          }

        </span>


        <span>

          Events

          <b>
            ${fmt(s.total)}
          </b>

        </span>


        <span>

          Requests

          <b>
            ${fmt(s.requests)}
          </b>

        </span>


        <span>

          Errors

          <b>
            ${fmt(s.errors)}
          </b>

        </span>


        <span>

          Health

          <b>
            ${safe(s.health)}
          </b>

        </span>


        <span class="sample-label">
          REAL TELEMETRY
        </span>

      </div>


      <!-- ====================================================
           AUTHENTICATION + REQUESTS
           ==================================================== -->

      <div
        class="
          resource-grid
          mt-4
        "
      >

        ${panel({

          title:
            'Authentication activity',

          eyebrow:
            'LOGIN ANALYSIS',

          body: gate(authentication.length > 0 || s.successful + s.failed > 0, `

            <div class="metrics-row">

              ${stat(
                'SUCCESSFUL',
                fmt(s.successful)
              )}

              ${stat(
                'FAILED',
                fmt(s.failed),
                '',
                '',
                s.failed > 0
                  ? 'coral'
                  : ''
              )}

              ${stat(
                'SUCCESS RATE',

                (
                  s.successful +
                  s.failed
                ) > 0

                  ? (
                      s.successful /
                      (
                        s.successful +
                        s.failed
                      ) *
                      100
                    ).toFixed(1)

                  : '0.0',

                '%'
              )}

            </div>


            <div
              style="
                margin-top:8px;
              "
            >

              ${professionalWaveChart(

                authentication,

                [

                  {
                    key:
                      'successful',

                    name:
                      'Successful',

                    color:
                      'var(--mint)'
                  },

                  {
                    key:
                      'failed',

                    name:
                      'Failed',

                    color:
                      'var(--coral)'
                  }

                ],

                {
                  emptyMessage:
                    'Waiting for real-time data'
                }

              )}

            </div>

          `)

        })}


        ${panel({

          title:
            'Request traffic',

          eyebrow:
            'APPLICATION TRAFFIC',

          body: gate(requests.length > 0 || s.requests > 0, `

            <div class="metrics-row">

              ${stat(
                'TOTAL REQUESTS',
                fmt(s.requests)
              )}

              ${stat(
                'ERRORS',
                fmt(s.errors),
                '',
                '',
                s.errors > 0
                  ? 'coral'
                  : ''
              )}

              ${stat(
                'ERROR RATE',
                s.errorRate.toFixed(1),
                '%'
              )}

            </div>


            <div
              style="
                margin-top:8px;
              "
            >

              ${professionalWaveChart(

                requests,

                [

                  {
                    key:
                      'requests',

                    name:
                      'Requests',

                    color:
                      'var(--cyan)'
                  },

                  {
                    key:
                      'errors',

                    name:
                      'Errors',

                    color:
                      'var(--coral)'
                  }

                ],

                {
                  emptyMessage:
                    'Waiting for real-time data'
                }

              )}

            </div>

          `)

        })}

      </div>


      <!-- ====================================================
           SESSION + RESPONSE
           ==================================================== -->

      <div
        class="
          resource-grid
          mt-4
        "
      >

        ${panel({

          title:
            'Session activity',

          eyebrow:
            sessionGraphEyebrow,

          body: gate(sessions.length > 0 || s.active + s.started + s.ended > 0, `

            <div class="metrics-row">

              ${stat(
                'ACTIVE',
                fmt(sessStat.active)
              )}

              ${stat(
                'STARTED',
                fmt(sessStat.started)
              )}

              ${stat(
                'ENDED',
                fmt(sessStat.ended)
              )}

            </div>

            <div
              style="
                margin-top:4px;
              "
            >

              ${professionalWaveChart(
                sessions,
                sessionGraphSeries,
                { emptyMessage: 'Waiting for real-time data' }
              )}

            </div>

          `)

        })}


        ${panel({

          title:
            'Response time',

          eyebrow:
            'APPLICATION PERFORMANCE',

          body: gate(responses.length > 0 || s.averageResponse > 0 || s.peakResponse > 0, `

            <div class="metrics-row">

              ${stat(
                'AVERAGE',
                s.averageResponse.toFixed(2),
                'ms'
              )}

              ${stat(
                'PEAK',
                s.peakResponse.toFixed(2),
                'ms'
              )}

            </div>


            <div
              style="
                margin-top:8px;
              "
            >

              ${professionalWaveChart(

                responses,

                [

                  {
                    key:
                      'response_time',

                    name:
                      'Response time',

                    color:
                      'var(--cyan)'
                  }

                ],

                {
                  emptyMessage:
                    'Waiting for real-time data'
                }

              )}

            </div>

          `)

        })}

      </div>


      <!-- ====================================================
           SOURCE IP ACTIVITY MAP
           ==================================================== -->

      <div class="mt-4">${SIP.html(SIP.resolve(analytics, liveEvents, geoSources))}</div>


      <!-- ====================================================
           STATUS + USERNAME
           ==================================================== -->

      <div
        class="
          resource-grid
          status-user-grid
          mt-4
        "
      >

        ${panel({

          cls:
            'compact-panel',

          title:
            'HTTP status distribution',

          eyebrow:
            'RESPONSE HEALTH',

          body:
            statusPlot(
              analytics.status_distribution
            )

        })}


        ${panel({

          cls:
            'compact-panel',

          title:
            'Username activity',

          eyebrow:
            'IDENTITY · EVENT FREQUENCY',

          body:
            distributionBars(
              usernames,
              'Waiting for real-time data',
              analytics.event_timeline
            )

        })}

      </div>


      <!-- ====================================================
           HEALTH
           ==================================================== -->

      <div class="mt-4">

        ${(() => {
          const waiting = s.total === 0 && s.requests === 0;
          const h = String(s.health).toUpperCase();
          const tone = waiting ? 'amber' : h === 'HEALTHY' ? 'mint' : h === 'CRITICAL' ? 'coral' : 'amber';
          const rule = 'color-mix(in oklab, var(--muted-foreground) 28%, transparent)';
          const LABEL = 'font:500 10px var(--font-mono);letter-spacing:.12em;line-height:1;color:var(--muted-foreground);text-transform:uppercase';
          const VALUE = 'font:600 14px var(--font-mono);line-height:1;font-variant-numeric:tabular-nums';
          const cell = (label, value, unit = '', cls = '') => `
            <div style="display:flex;align-items:center;gap:10px;height:22px;padding:0 22px;border-left:1px solid ${rule};white-space:nowrap">
              <span style="${LABEL}">${label}</span>
              <span class="${cls}" style="${VALUE}">${waiting ? '—' : value}${unit && !waiting ? `<span style="font:500 10px var(--font-mono);margin-left:3px;color:var(--muted-foreground)">${unit}</span>` : ''}</span>
            </div>`;
          return `<section class="glass-panel app-health-slim" aria-label="Application health"
              style="display:flex;align-items:center;flex-wrap:wrap;gap:8px 0;padding:9px 18px;min-height:0">
            <div style="display:flex;flex-direction:column;justify-content:center;gap:3px;margin-right:auto;padding-right:22px">
              <span style="${LABEL}">REAL-TIME HEALTH</span>
              <h2 style="margin:0;font-size:14px;font-weight:600;line-height:1.2">Application health</h2>
            </div>
            ${cell('TOTAL EVENTS', fmt(s.total))}
            ${cell('SECURITY EVENTS', fmt(s.securityEvents))}
            ${cell('SUSPICIOUS', fmt(s.suspicious), '', s.suspicious > 0 ? 'amber' : '')}
            ${cell('ERROR RATE', s.errorRate.toFixed(2), '%')}
            <div style="display:flex;align-items:center;gap:10px;height:22px;padding:0 0 0 22px;border-left:1px solid ${rule}">
              <span style="${LABEL}">STATUS</span>
              <span class="${tone}" style="display:inline-flex;align-items:center;gap:7px;height:22px;padding:0 12px;border:1px solid color-mix(in oklab, currentColor 40%, transparent);border-radius:999px;background:color-mix(in oklab, currentColor 10%, transparent);font:600 10px var(--font-mono);letter-spacing:.1em;line-height:1;text-transform:uppercase;white-space:nowrap">
                <i style="width:6px;height:6px;border-radius:50%;background:currentColor"></i>${waiting ? 'Waiting for real-time data' : safe(s.health)}
              </span>
            </div>
          </section>`;
        })()}

      </div>


      <!-- ====================================================
           LIVE EVENT STREAM
           ==================================================== -->

      <div class="mt-4">

        ${panel({

          title:
            'Live event stream',

          eyebrow:
            'APPLICATION TELEMETRY',

          body: `

            <div class="table-toolbar"><span class="muted">${liveEvents.length} recent events</span>


              <input

                id="applicationEventFilter"

                class="input"

                type="text"

                placeholder="Filter events..."

                value="${safe(
                  filter
                )}"

              />

            </div>


            <div class="table-scroll">

              <table>

                <thead>

                  <tr>

                    <th>TIME</th>
                    <th>EVENT</th>
                    <th>APPLICATION</th>
                    <th>SOURCE IP</th>
                    <th>USERNAME</th>
                    <th>PATH</th>
                    <th>STATUS</th>
                    <th>RESPONSE</th>

                  </tr>

                </thead>


                <tbody
                  id="applicationEventBody"
                >

                  ${renderEvents()}

                </tbody>

              </table>

            </div>

          `

        })}

      </div>


      <!-- ====================================================
           FOOTER
           ==================================================== -->

      <div class="glass-panel mt-4"><div class="panel-footer">

          <span>

            Data source:

            <b>
              Sentinal Connector
            </b>

          </span>


          <span>

            Refresh:

            <b>
              3 seconds
            </b>

          </span>


          <span>

            Telemetry:

            <b>
              ${
                paused
                  ? 'PAUSED'
                  : 'LIVE'
              }
            </b>

          </span>


          <span>

            Fake telemetry:

            <b>
              DISABLED
            </b>

          </span>

        </div>

      </div>

    `;

    Charts.flush();

    SIP.mount(app);

    keepScroll.forEach(([sel, top]) => {
      const el = $(sel, app);
      if (!el) return;
      const prev = el.style.scrollBehavior;
      el.style.scrollBehavior = 'auto';   // restore instantly, no animated jump
      el.scrollTop = top;
      el.style.scrollBehavior = prev;
    });

    if (keepFilter) {
      const input = $('#applicationEventFilter');
      if (input) {
        input.focus();
        try { input.setSelectionRange(selStart, selEnd); } catch (e) { }
      }
    }

  }


  /* ============================================================
     BUTTON HANDLERS
     ============================================================ */

  app.addEventListener(
    'click',
    event => {

      const button =
        event.target.closest(
          'button'
        );


      if (!button) {
        return;
      }


      if (button.id === 'applicationRefresh') {

        if (refreshing) return;

        refreshing = true;
        render();

        loadData().then(ok => {
          refreshing = false;
          if (ok) render();
        });

        return;

      }


      if (button.id === 'applicationPause') {

        paused = !paused;

        render();

        // Resuming fetches immediately instead of waiting for the next poll.
        if (!paused) loadData();

      }

    }
  );


  /* ============================================================
     EVENT FILTER
     ============================================================ */

  app.addEventListener(
    'input',
    event => {

      if (
        event.target.id !==
        'applicationEventFilter'
      ) {

        return;

      }


      filter =
        event.target.value;


      const body =
        $('#applicationEventBody');


      if (body) {

        body.innerHTML =
          renderEvents();

      }

    }
  );


  /* ============================================================
     INITIAL LOAD
     ============================================================ */

  render();

  loadData();


  /* ============================================================
     LIVE REFRESH
     ============================================================ */

  timer =
    setInterval(
      () => {

        if (!paused) {

          loadData();

        }

      },
      POLL_INTERVAL
    );


  window.__sentinalApplicationTimer =
    timer;

};


/* Security analysis page */

/* Security analysis page */

/* Security analysis page */
/* =========================================================
   SENTINAL AI — SECURITY PAGE WITH LIVE TELEMETRY
   Data source: /api/application/analytics
   Refresh interval: 5 seconds
   ========================================================= */

PAGES.security = () => {
  mountShell('security');

  const app = $('#app');

  let liveAnalytics = null;
  let liveIncidents = [];
  let category = 'All threats';
  let range = '24 hours';
  let query = '';
  let selected = null;
  let securityPollTimer = null;

  const safeNum = value => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const asArray = value =>
    Array.isArray(value) ? value : [];

  /* =========================================================
   SENTINAL AI — CORRECT SECURITY GRAPH TIME
   Displays timestamps in Indian Standard Time (IST).
   ========================================================= */

const timeLabel = item => {
  const raw =
    item?.timestamp ??
    item?.event_time ??
    item?.received_at ??
    item?.created_at ??
    item?.createdAt ??
    item?.time ??
    null;

  if (raw === null || raw === undefined || raw === '') {
    return '--:--:--';
  }

  let date;

  if (raw instanceof Date) {
    date = raw;
  } else if (typeof raw === 'number') {
    // Support Unix timestamps in seconds or milliseconds.
    date = new Date(
      raw < 1000000000000 ? raw * 1000 : raw
    );
  } else {
    const value = String(raw).trim();

    // Detect Z, +05:30, -04:00, +0530, and similar offsets.
    const hasTimezone =
      /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);

    if (hasTimezone) {
      date = new Date(value);
    } else {
      /*
       * Your displayed timestamps look like ISO timestamps.
       * This branch assumes timezone-naive timestamps are UTC.
       * Change this if your backend stores them as local time.
       */
      date = new Date(
        value.replace(' ', 'T') + 'Z'
      );
    }
  }

  if (Number.isNaN(date.getTime())) {
    console.warn(
      '[Sentinal] Invalid event timestamp:',
      raw
    );

    return '--:--:--';
  }

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
};
  /* =====================================================
     BUILD CHART SERIES FROM REAL API DATA
     ===================================================== */

  /* =====================================================
   SENTINAL AI — REAL TELEMETRY CHART SERIES
   Builds chart points from actual API events.
   No random or fabricated data.
   ===================================================== */

/* =====================================================
   SENTINAL AI — REAL TELEMETRY CHART SERIES
   Uses actual authentication, request and event data.
   ===================================================== */

/* =========================================================
   SENTINAL AI — LIVE SERIES
   Uses real analytics and incident data
   ========================================================= */

const liveSeries = () => {
  const authenticationAll = asArray(
    liveAnalytics?.authentication_series
  );

  const requestsAll = asArray(
    liveAnalytics?.request_series
  );

  const timelineAll = asArray(
    liveAnalytics?.event_timeline
  );

  const getTime = item => {
    const value =
      item?.time ??
      item?.timestamp ??
      item?.event_time ??
      item?.received_at ??
      item?.detected_at ??
      item?.created_at;

    if (!value) return null;

    const timestamp = new Date(value).getTime();

    return Number.isFinite(timestamp) ? timestamp : null;
  };

  // Honour the selected time range (items without a timestamp are ignored later).
  const keep = item => {
    const t = getTime(item);
    return t === null || inRange(t);
  };

  const authentication = authenticationAll.filter(keep);
  const requests = requestsAll.filter(keep);
  const timeline = timelineAll.filter(keep);

  const timestamps = [
    ...authentication.map(getTime),
    ...requests.map(getTime),
    ...timeline.map(getTime)
  ]
    .filter(timestamp => timestamp !== null)
    .sort((a, b) => a - b);

  if (timestamps.length === 0) {
    return [];
  }

  const firstTime = timestamps[0];
  const lastTime = timestamps[timestamps.length - 1];

  const bucketCount = Math.min(
    30,
    Math.max(1, timestamps.length)
  );

  const duration = lastTime - firstTime;

  const bucketSize =
    duration > 0 ? duration / bucketCount : 1000;

  const buckets = Array.from(
    { length: bucketCount },
    (_, index) => ({
      timestamp: firstTime + index * bucketSize,
      successful: 0,
      failed: 0,
      requests: 0,
      high: 0,
      medium: 0,
      low: 0,
      critical: 0,
      risk: 0
    })
  );

  const getBucket = timestamp => {
    const index =
      duration > 0
        ? Math.min(
            bucketCount - 1,
            Math.max(
              0,
              Math.floor(
                (timestamp - firstTime) / bucketSize
              )
            )
          )
        : 0;

    return buckets[index];
  };

  // Authentication analytics
  authentication.forEach(item => {
    const timestamp = getTime(item);

    if (timestamp === null) return;

    const bucket = getBucket(timestamp);

    bucket.successful += Math.max(
      0,
      Number(item?.successful) || 0
    );

    bucket.failed += Math.max(
      0,
      Number(item?.failed) || 0
    );
  });

  // Request analytics
  requests.forEach(item => {
    const timestamp = getTime(item);

    if (timestamp === null) return;

    const bucket = getBucket(timestamp);

    bucket.requests += Math.max(
      0,
      Number(item?.requests) || 0
    );
  });

  // Actual incident risk scores
  const incidentsForSeries = Array.isArray(liveIncidents)
    ? liveIncidents
    : [];

  incidentsForSeries.forEach(incident => {
    const timestamp = getTime(incident);

    if (timestamp === null) return;

    const score = Number(
      incident?.risk_score ??
      incident?.risk?.score ??
      incident?.risk_analysis?.risk_score
    );

    if (!Number.isFinite(score)) return;

    const bucket = getBucket(timestamp);

    bucket.risk = Math.max(
      bucket.risk,
      Math.min(100, Math.max(0, score))
    );
  });

  // Actual security events
  timeline.forEach(item => {
    const timestamp = getTime(item);

    if (timestamp === null) return;

    const bucket = getBucket(timestamp);

    const type = String(
      item?.event ??
      item?.event_type ??
      item?.type ??
      ''
    ).toLowerCase();

    const severity = String(
      item?.severity ??
      item?.level ??
      item?.risk_level ??
      ''
    ).toUpperCase();

    if (type === 'login_failed') {
      bucket.high += 1;
    }

    if (severity === 'HIGH') bucket.high += 1;
    if (severity === 'MEDIUM') bucket.medium += 1;
    if (severity === 'LOW') bucket.low += 1;
    if (severity === 'CRITICAL') bucket.critical += 1;
  });

  return buckets.map(bucket => ({
    time: timeLabel({
      time: new Date(bucket.timestamp).toISOString()
    }),

    high: bucket.high,
    medium: bucket.medium,
    low: bucket.low,
    critical: bucket.critical,

    failed: bucket.failed,
    requests: bucket.requests,

    baseline: 0,
    risk: bucket.risk
  }));
};


/* =========================================================
   SENTINAL AI — LIVE SECURITY TIMELINE WAVE
   ========================================================= */

/* =========================================================
   SENTINAL AI — SECURITY TIMELINE LAYOUT REFINEMENT
   JavaScript only — no HTML or CSS file changes
   ========================================================= */

/* ============================================
   SENTINAL AI — TIMELINE LAYOUT FIX
   JavaScript only
   ============================================ */

/* ===================== SECURITY EVENT TIMELINE (all-in-one) ===================== */
(() => {
  /* ---------- CSS ---------- */
  const old = document.getElementById('tlCss'); if (old) old.remove();
  const css = document.createElement('style'); css.id = 'tlCss';
  css.textContent = `
  .tl{padding:0}
  .tl-head{display:flex;align-items:flex-end;gap:36px;padding:0 24px 12px;flex-wrap:wrap}
  .tl-m small{display:flex;align-items:center;gap:6px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted-foreground)}
  .tl-m small i{width:6px;height:6px;border-radius:50%}
  .tl-m b{display:block;margin-top:6px;font-size:22px;line-height:1;font-weight:400;font-variant-numeric:tabular-nums}
  .tl-meta{margin-left:auto;padding-bottom:2px;font-size:11px;color:var(--muted-foreground);font-variant-numeric:tabular-nums}
  .tl-meta span{margin-left:18px}.tl-meta b{font-weight:500;color:#e4ecee;margin-left:5px}
  .tl-wrap{position:relative}
  .tl-svg{display:block;width:100%;height:300px;overflow:visible;touch-action:none}
  .tl-svg text{font-size:11px;fill:var(--muted-foreground)}
  .tl-tip{position:absolute;top:8px;left:0;pointer-events:none;opacity:0;transition:opacity .15s;white-space:nowrap;
    padding:8px 11px;border-radius:8px;background:rgba(8,16,16,.95);font-size:11px;line-height:1.6;transform:translateX(-50%)}
  .tl-tip b{font-weight:500;font-variant-numeric:tabular-nums;margin-left:4px}
  .tl-foot{display:flex;justify-content:space-between;padding:12px 24px 16px;font-size:11px;color:var(--muted-foreground)}
  .tl-foot b{font-weight:500;color:#e4ecee}
  .tl-status{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-size:11px;background:rgba(255,255,255,.05);color:var(--muted-foreground)}
  .tl-status i{width:5px;height:5px;border-radius:50%;background:currentColor}
  .tl-status.live{color:var(--cyan);background:rgba(94,205,220,.1)}
  .tl-status.live i{animation:tlBlink 1.6s ease-in-out infinite}
  @keyframes tlBlink{0%,100%{opacity:.35}50%{opacity:1}}
  @media (prefers-reduced-motion:reduce){.tl-status i{animation:none!important}}`;
  document.head.appendChild(css);

  /* ---------- helpers ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const nice = x => { if (!(x > 0)) return 1; const p = 10 ** Math.floor(Math.log10(x)), m = x / p; return p * ([1, 1.5, 2, 3, 4, 5, 6, 8, 10].find(s => s >= m) || 10); };
  const smooth = (p, yMin, yMax) => {
    const c = v => Math.min(Math.max(v, yMin), yMax); let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${c(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${c(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    } return d;
  };

  let pending = [], cur = null, raf = 0, hbId = 0;
  window.SecTimeline = { push: (e, f = 0) => cur ? cur.push(e, f) : pending.push([e, f]) };

  /* ---------- panel HTML (your IDs kept) ---------- */
  window.securityTimeline = () => {
    requestAnimationFrame(() => requestAnimationFrame(start));          // auto-start after render
    const m = (id, label, c) => `<div class="tl-m"><small><i style="background:var(--${c})"></i>${label}</small><b id="${id}">0</b></div>`;
    return panel({
      title: 'Security event timeline', eyebrow: 'LIVE SECURITY TELEMETRY', cls: 'security-timeline-panel mt-4',
      action: `<span class="tl-status" id="tlStatus"><i></i><span id="sentinalWaveStatus">Connecting...</span></span>`,
      body: `<div class="tl" id="tl">
        <div class="tl-head">
          ${m('sentinalWaveEvents', 'Recorded events', 'cyan')}${m('sentinalWaveFailures', 'Failed logins', 'coral')}${m('tl-an', 'Anomalies', 'amber')}
          <div class="tl-meta"><span>Avg<b id="tl-av">0</b></span><span>Peak<b id="tl-pk">0</b></span><span>σ<b id="tl-sd">0</b></span></div>
        </div>
        <div class="tl-wrap"><svg class="tl-svg"></svg><div class="tl-tip"></div></div>
        <div class="tl-foot"><span>Data source: <b>Sentinal Connector</b></span><span id="sentinalWaveUpdated">Waiting for data</span></div>
        <div hidden><svg id="sentinalLiveWave"><path id="sentinalWaveLine"/><path id="sentinalWaveArea"/></svg><div id="sentinalWaveEmpty"></div></div>
      </div>`
    });
  };

  /* ---------- graph ---------- */
  function init() {
    const host = document.getElementById('tl'); if (!host) return null;
    const N = 60, H = 300, mT = 10, mB = 214, sT = 236, sB = 276, WIN = 8;
    const ev = Array(N + 1).fill(0), fl = Array(N + 1).fill(0), ts = Array(N + 1).fill(Date.now());
    let got = false, last = performance.now(), gap = 1500, ymax = 10, smax = 1, W = 0, fNow = 1, anom = 0;
    const svg = host.querySelector('.tl-svg'), tip = host.querySelector('.tl-tip'), $id = id => document.getElementById(id);
    svg.setAttribute('height', H);
    const uid = 'tl' + Date.now(), defs = el('defs', {}, svg);
    const cM = el('rect', {}, el('clipPath', { id: uid + 'm' }, defs)), cS = el('rect', {}, el('clipPath', { id: uid + 's' }, defs));

    const gy = [1, 2, 3].map(() => ({ l: el('line', { stroke: 'rgba(255,255,255,.05)' }, svg), t: el('text', {}, svg) }));
    const base = el('line', { stroke: 'rgba(255,255,255,.09)' }, svg), base2 = el('line', { stroke: 'rgba(255,255,255,.09)' }, svg);
    const note = el('text', { 'text-anchor': 'end' }, svg); note.textContent = 'Shaded band = expected range (±1.5σ)';
    const pm = el('g', { 'clip-path': `url(#${uid}m)` }, svg);
    const band = el('path', { fill: 'var(--cyan)', 'fill-opacity': .1 }, pm);
    const area = el('path', { fill: 'var(--cyan)', 'fill-opacity': .07 }, pm);
    const bars = el('path', { stroke: 'var(--coral)', 'stroke-linecap': 'round', opacity: .85 }, pm);
    const meanL = el('path', { fill: 'none', stroke: 'var(--muted-foreground)', 'stroke-dasharray': '3 4', opacity: .5 }, pm);
    const line = el('path', { fill: 'none', stroke: 'var(--cyan)', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, pm);
    const an = [0, 1, 2, 3, 4].map(() => ({
      stem: el('line', { stroke: 'var(--amber)', 'stroke-dasharray': '2 3', opacity: 0 }, svg),
      halo: el('circle', { r: 7, fill: 'none', stroke: 'var(--amber)', opacity: 0 }, svg),
      dot: el('circle', { r: 3.5, fill: 'var(--amber)', opacity: 0 }, svg),
      txt: el('text', { 'text-anchor': 'middle', style: 'fill:var(--amber)' }, svg) }));
    const ps = el('g', { 'clip-path': `url(#${uid}s)` }, svg);
    const vArea = el('path', { fill: 'var(--mint)', 'fill-opacity': .14 }, ps);
    const vLine = el('path', { fill: 'none', stroke: 'var(--mint)', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ps);
    const vLab = el('text', {}, svg); vLab.textContent = 'VOLATILITY σ';
    const vVal = el('text', { 'text-anchor': 'end', style: 'fill:var(--mint)' }, svg);
    const gx = [0, 1, 2, 3].map(() => el('text', {}, svg));
    const head = el('circle', { r: 3, fill: 'var(--cyan)' }, svg), pulse = el('circle', { fill: 'none', stroke: 'var(--cyan)' }, svg);
    const cross = el('line', { stroke: 'rgba(255,255,255,.25)', opacity: 0 }, svg), hd = el('circle', { r: 3.5, fill: 'var(--cyan)', opacity: 0 }, svg);
    const empty = el('text', { 'text-anchor': 'middle' }, svg); empty.textContent = 'Waiting for security telemetry...';

    const clock = t => new Date(t).toLocaleTimeString('en-GB', { hour12: false });
    const stats = a => { const m = a.reduce((x, y) => x + y, 0) / (a.length || 1); return [m, Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length || 1))]; };
    const roll = () => ev.map((v, i) => {
      const [m, sd] = stats(ev.slice(Math.max(0, i - WIN + 1), i + 1)), [pmn, psd] = stats(ev.slice(Math.max(0, i - WIN), i));
      return { m, sd, z: i ? (v - pmn) / Math.max(psd, pmn * .12, 1) : 0 };
    });

    function push(e, f) {
      e = Math.max(0, +e || 0); f = Math.max(0, +f || 0);
      const now = performance.now(); gap = Math.min(10000, Math.max(300, gap * .7 + (now - last) * .3)); last = now;
      ev.push(e); ev.shift(); fl.push(f); fl.shift(); ts.push(Date.now()); ts.shift(); got = true;
      const u = $id('sentinalWaveUpdated'); if (u) u.textContent = 'Updated ' + clock(Date.now());
      $id('tl-pk').textContent = Math.round(Math.max(...ev)); $id('tl-av').textContent = Math.round(stats(ev)[0]); $id('tl-sd').textContent = stats(ev.slice(-WIN))[1].toFixed(1);
    }

    function draw(now) {
      const w = svg.clientWidth || 600; if (w !== W) { W = w; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); }
      const dx = W / (N - 1), f = got && !matchMedia('(prefers-reduced-motion: reduce)').matches ? Math.min((now - last) / gap, 1) : 1; fNow = f;
      const X = i => (i - f) * dx, r = roll();
      ymax += (Math.max(5, nice(Math.max(...ev) * 1.2)) - ymax) * .08;
      smax += (Math.max(1, Math.max(...r.map(q => q.sd)) * 1.25) - smax) * .08;
      const Y = v => mT + (1 - Math.min(v, ymax * 1.03) / ymax) * (mB - mT), SY = v => sB - Math.min(v, smax) / smax * (sB - sT);
      [cM, cS].forEach((c, k) => { c.setAttribute('x', 0); c.setAttribute('y', 0); c.setAttribute('width', W); c.setAttribute('height', k ? H : mB); });
      gy.forEach((g, k) => { const y = mB - (mB - mT) * (k + 1) / 3;
        g.l.setAttribute('x1', 0); g.l.setAttribute('x2', W); g.l.setAttribute('y1', y); g.l.setAttribute('y2', y);
        g.t.setAttribute('x', 24); g.t.setAttribute('y', y - 4); g.t.textContent = Math.round(ymax * (k + 1) / 3); });
      [[base, mB], [base2, sB]].forEach(([l, y]) => { l.setAttribute('x1', 0); l.setAttribute('x2', W); l.setAttribute('y1', y); l.setAttribute('y2', y); });
      note.setAttribute('x', W - 24); note.setAttribute('y', mT + 10); note.style.opacity = got ? 1 : 0;
      vLab.setAttribute('x', 24); vLab.setAttribute('y', sT + 4); vVal.setAttribute('x', W - 24); vVal.setAttribute('y', sT + 4);
      gx.forEach((e, i) => { e.setAttribute('x', 24 + (W - 48) * i / 3); e.setAttribute('y', H - 6);
        e.setAttribute('text-anchor', i === 0 ? 'start' : i === 3 ? 'end' : 'middle'); e.textContent = got ? clock(ts[Math.round(i / 3 * (N - 1))]) : ''; });
      empty.setAttribute('x', W / 2); empty.setAttribute('y', (mT + mB) / 2); empty.style.opacity = got ? 0 : 1;

      const pe = ev.map((v, i) => [X(i), Y(v)]), de = smooth(pe, mT, mB);
      line.setAttribute('d', de); area.setAttribute('d', de + `L${pe[N][0]} ${mB}L${pe[0][0]} ${mB}Z`);
      const up = r.map((q, i) => [X(i), Y(q.m + 1.5 * q.sd)]), lo = r.map((q, i) => [X(i), Y(Math.max(0, q.m - 1.5 * q.sd))]).reverse();
      band.setAttribute('d', smooth(up, mT, mB) + smooth(lo, mT, mB).replace(/^M/, 'L') + 'Z');
      meanL.setAttribute('d', smooth(r.map((q, i) => [X(i), Y(q.m)]), mT, mB));
      let bd = ''; fl.forEach((v, i) => { if (v > 0) bd += `M${X(i).toFixed(1)} ${mB}V${Y(v).toFixed(1)}`; });
      bars.setAttribute('d', bd); bars.setAttribute('stroke-width', Math.max(2, dx * .4));
      const sp = r.map((q, i) => [X(i), SY(q.sd)]), ds = smooth(sp, sT, sB);
      vLine.setAttribute('d', ds); vArea.setAttribute('d', ds + `L${sp[N][0]} ${sB}L${sp[0][0]} ${sB}Z`);
      vVal.textContent = got ? 'σ ' + r[N].sd.toFixed(1) : '';

      let k = 0, c = 0;
      if (got) for (let i = WIN; i < N; i++) {
        if (r[i].z > 2.5 && ev[i] >= ev[i - 1] && ev[i] >= ev[i + 1]) {
          c++; const x = X(i), y = Y(ev[i]);
          if (k < an.length && x > 8 && x < W - 8) {
            const a = an[k++]; a.stem.setAttribute('x1', x); a.stem.setAttribute('x2', x); a.stem.setAttribute('y1', y); a.stem.setAttribute('y2', mB);
            [a.halo, a.dot].forEach(e => { e.setAttribute('cx', x); e.setAttribute('cy', y); });
            a.halo.setAttribute('opacity', .35); a.dot.setAttribute('opacity', 1); a.stem.setAttribute('opacity', .5);
            a.txt.setAttribute('x', x); a.txt.setAttribute('y', Math.max(mT + 10, y - 12)); a.txt.textContent = '+' + r[i].z.toFixed(1) + 'σ';
          }
        }
      }
      for (; k < an.length; k++) { const a = an[k]; a.halo.setAttribute('opacity', 0); a.dot.setAttribute('opacity', 0); a.stem.setAttribute('opacity', 0); a.txt.textContent = ''; }
      if (c !== anom) { anom = c; const e = $id('tl-an'); if (e) e.textContent = c; }

      const hy = Y(ev[N - 1] + (ev[N] - ev[N - 1]) * f), p = (now / 1000 * .8) % 1;
      [head, pulse].forEach(e => { e.setAttribute('cx', W - 3); e.setAttribute('cy', hy); e.style.opacity = got ? 1 : 0; });
      pulse.setAttribute('r', 4 + p * 8); pulse.setAttribute('opacity', got ? ((1 - p) * .45).toFixed(2) : 0);
      svg._m = { dx, X, Y, z: r.map(q => q.z) };
    }

    svg.addEventListener('pointermove', e => {
      if (!got || !svg._m) return;
      const m = svg._m, rc = svg.getBoundingClientRect(), x = e.clientX - rc.left;
      const i = Math.max(1, Math.min(N, Math.round(x / m.dx + fNow))), px = m.X(i); if (px < 0 || px > rc.width) return;
      cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.setAttribute('y1', mT); cross.setAttribute('y2', sB); cross.setAttribute('opacity', 1);
      hd.setAttribute('cx', px); hd.setAttribute('cy', m.Y(ev[i])); hd.setAttribute('opacity', 1);
      const z = m.z[i], zc = z > 2.5 ? 'var(--amber)' : 'var(--muted-foreground)';
      tip.innerHTML = `<span style="color:var(--muted-foreground)">${clock(ts[i])}</span><br><span style="color:var(--cyan)">Events</span><b>${Math.round(ev[i])}</b><br><span style="color:var(--coral)">Failed</span><b>${Math.round(fl[i])}</b><br><span style="color:${zc}">Deviation</span><b>${z >= 0 ? '+' : ''}${z.toFixed(1)}σ</b>`;
      tip.style.left = Math.max(70, Math.min(rc.width - 70, px)) + 'px'; tip.style.opacity = 1;
    });
    svg.addEventListener('pointerleave', () => { [cross, hd].forEach(e => e.setAttribute('opacity', 0)); tip.style.opacity = 0; });
    return {
  host,
  push,
  draw,

 seedBuckets(buckets) {
  if (!Array.isArray(buckets) || buckets.length === 0) {
    return;
  }

  const history = buckets.slice(-(N + 1));
  const offset = N + 1 - history.length;

  ev.fill(0);
  fl.fill(0);
  ts.fill(Date.now());

  history.forEach((bucket, index) => {
    const i = offset + index;

    ev[i] = Math.max(
      0,
      Number(bucket.events) || 0
    );

    fl[i] = Math.max(
      0,
      Number(bucket.failures) || 0
    );

    const timestamp = new Date(
      bucket.timestamp
    ).getTime();

    if (Number.isFinite(timestamp)) {
      ts[i] = timestamp;
    }
  });

  got = true;
  last = performance.now();
}
};
  }

  /* ---------- bridge: reads YOUR counters and feeds the graph ---------- */
  function bridge() {
    clearInterval(hbId);
    const E = document.getElementById('sentinalWaveEvents'), F = document.getElementById('sentinalWaveFailures'), S = document.getElementById('sentinalWaveStatus');
    if (!E || !F) return;
    const num = x => parseInt(x.textContent.replace(/[^\d]/g, ''), 10) || 0;
    let pe = num(E), pf = num(F), queued = false, lastPush = performance.now(), live = false;
    let timelineSeeded = false;
    const opt = { childList: true, characterData: true, subtree: true };
    const flush = () => {
      queued = false; const e = num(E), f = num(F), de = e - pe, df = f - pf; pe = e; pf = f;
      if (de > 0 || df > 0) { lastPush = performance.now(); SecTimeline.push(Math.max(0, de), Math.max(0, df)); }
    };
    const obs = new MutationObserver(() => { if (!queued) { queued = true; queueMicrotask(flush); } });
    obs.observe(E, opt); obs.observe(F, opt);
    if (S) {
      const sync = () => { live = !/connect|wait|offline|error/i.test(S.textContent); const p = document.getElementById('tlStatus'); if (p) p.classList.toggle('live', live); };
      new MutationObserver(sync).observe(S, opt); sync();
    }
    hbId = setInterval(() => {                                   // keeps the line scrolling during quiet seconds
      if (!document.getElementById('tl')) return clearInterval(hbId);
      if (live && performance.now() - lastPush > 2000) { lastPush = performance.now(); SecTimeline.push(0, 0); }
    }, 1000);
  }

  function start() {
    cancelAnimationFrame(raf);
    cur = init(); if (!cur) return;
    pending.splice(0).forEach(([e, f]) => cur.push(e, f));
    bridge();
    const loop = now => { if (!cur || !cur.host.isConnected) { cur = null; return; } cur.draw(now); raf = requestAnimationFrame(loop); };
    loop(performance.now());
  }
})();

/* =========================================================
   SERIES HELPER
   ========================================================= */

// Do not declare this again if it already exists elsewhere.
 const series = () => liveSeries();


/* =========================================================
   LIVE INCIDENT MODEL
   Every incident, count and chart on this page is derived from
   the connector feeds. Nothing is sample data: when a feed has
   not delivered anything yet, the element says so.
   ========================================================= */

let incidentsLoaded = false;
let incidentsError = null;
let analyticsError = null;

const WAITING = (message = 'Waiting for telemetry') =>
  `<div class="empty-state" style="padding:18px 16px;text-align:center">${esc(message)}</div>`;

const RANGE_MS = {
  '24 hours': 24 * 3600 * 1000,
  '7 days': 7 * 24 * 3600 * 1000,
  '30 days': 30 * 24 * 3600 * 1000
};

// Convert any backend timestamp to epoch milliseconds (naive ISO strings are UTC).
const toMs = raw => {
  if (raw === null || raw === undefined || raw === '') return null;
  if (raw instanceof Date) return raw.getTime();
  if (typeof raw === 'number') return raw < 1e12 ? raw * 1000 : raw;
  const value = String(raw).trim();
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
  const ms = Date.parse(hasZone ? value : value.replace(' ', 'T') + 'Z');
  return Number.isFinite(ms) ? ms : null;
};

const inRange = ms => {
  const span = RANGE_MS[range];
  if (!span || ms === null || ms === undefined) return true;
  return ms >= Date.now() - span;
};

const pickFirst = (...values) =>
  values.find(value => value !== undefined && value !== null && value !== '');

const isIp = text =>
  /^(\d{1,3}\.){3}\d{1,3}$/.test(text) ||
  (text.includes(':') && /^[0-9a-f:]+$/i.test(text));

const threatCategory = threat => {
  const text = String(threat || '').toLowerCase();
  if (/brute|credential|login/.test(text)) return 'Brute Force';
  if (/traffic|ddos|dos|flood|rate|anomal/.test(text)) return 'Traffic Anomaly';
  if (/phish/.test(text)) return 'Phishing';
  if (/suspicious/.test(text)) return 'Suspicious Activity';
  return 'Other';
};

const levelOf = (raw, risk) => {
  const level = String(raw || '').toUpperCase();
  if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(level)) return level;
  if (risk === null) return 'UNKNOWN';
  return risk >= 75 ? 'HIGH' : risk >= 40 ? 'MEDIUM' : 'LOW';
};

const toneOf = level =>
  level === 'CRITICAL' || level === 'HIGH' ? 'coral'
    : level === 'MEDIUM' ? 'amber'
      : level === 'LOW' ? 'mint'
        : 'silver';

// Normalise one raw connector incident into the fields the page displays.
const normIncident = raw => {
  const r = raw || {};

  const scoreRaw = pickFirst(
    r.risk_score,
    r.risk?.score,
    r.risk_analysis?.risk_score,
    typeof r.risk === 'number' ? r.risk : undefined
  );
  const score = Number(scoreRaw);
  const risk =
    scoreRaw !== undefined && Number.isFinite(score) && score >= 0 && score <= 100
      ? score
      : null;

  const ms = toMs(pickFirst(
    r.detected_at, r.timestamp, r.created_at, r.received_at, r.time
  ));

  const threat = String(
    pickFirst(r.threat, r.threat_type, r.type, r.title) ?? 'Unclassified'
  );

  // "source" is the application in connector incidents, but accept an IP there too.
  const sourceField = typeof r.source === 'string' ? r.source : undefined;
  const ipRaw = pickFirst(r.source_ip, r.ip, r.attacker_ip, r.details?.source_ip);
  const source =
    ipRaw !== undefined
      ? String(ipRaw)
      : sourceField && isIp(sourceField) ? sourceField : '—';

  const appRaw = pickFirst(
    r.application,
    r.application_name,
    r.app,
    sourceField && !isIp(sourceField) ? sourceField : undefined
  );

  const evidenceRaw = pickFirst(
    r.evidence, r.details?.evidence, r.risk_analysis?.evidence
  );
  const evidence = Array.isArray(evidenceRaw)
    ? evidenceRaw.map(String)
    : evidenceRaw !== undefined ? [String(evidenceRaw)] : [];

  const eventsRaw = pickFirst(r.attempt_count, r.events, r.event_count);
  const eventsNum = Array.isArray(eventsRaw) ? eventsRaw.length : Number(eventsRaw);

  const confRaw = Number(pickFirst(r.confidence, r.risk_analysis?.confidence));
  const confidence = Number.isFinite(confRaw)
    ? Math.round(confRaw <= 1 ? confRaw * 100 : confRaw)
    : null;

  return {
    id: String(pickFirst(r.incident_id, r.id) ?? '—'),
    threat,
    category: threatCategory(threat),
    source,
    target: String(pickFirst(r.target, r.endpoint, r.path) ?? '—'),
    app: appRaw !== undefined ? String(appRaw) : '—',
    username: String(pickFirst(r.username, r.user) ?? '—'),
    risk,
    level: levelOf(pickFirst(r.risk_level, r.level, r.severity), risk),
    status: String(pickFirst(r.status, r.state) ?? '—'),
    ms,
    time: ms === null ? '—' : timeLabel({ time: new Date(ms).toISOString() }),
    events: Number.isFinite(eventsNum) ? eventsNum : null,
    confidence,
    evidence
  };
};

// Live incidents inside the selected range, newest first.
const incList = () =>
  asArray(liveIncidents)
    .filter(item => item && typeof item === 'object')
    .map(normIncident)
    .filter(incident => inRange(incident.ms))
    .sort((a, b) => (b.ms ?? 0) - (a.ms ?? 0));

// Risk score of each real incident over time.
const riskSeries = () =>
  incList()
    .filter(incident => incident.risk !== null && incident.ms !== null)
    .sort((a, b) => a.ms - b.ms)
    .map(incident => ({ time: incident.time, risk: incident.risk }));

// Explains why the risk chart has nothing to plot.
const riskStatus = () => {
  if (!incidentsLoaded) {
    return incidentsError
      ? `Incident feed unreachable: ${incidentsError}`
      : 'Waiting for the incident feed';
  }

  if (liveIncidents.length === 0) {
    return 'Incident feed connected, but no incidents have been recorded yet';
  }

  const inRangeCount = incList().length;

  if (inRangeCount === 0) {
    return `${liveIncidents.length} incident(s) received, none in the last ${range}. Try a longer range.`;
  }

  const scored = riskSeries().length;

  if (scored === 0) {
    return `${inRangeCount} incident(s) received, but none has a numeric risk score (0-100) with a timestamp`;
  }

  return `${scored} scored incident(s) plotted`;
};

// Chart data per chart. An empty array makes the chart show "Waiting for telemetry…".
const dataFor = key => {
  if (key === 'risk') return riskSeries();
  if (!liveAnalytics) return [];

  const buckets = liveSeries();

  if (key === 'failed') {
    return asArray(liveAnalytics.authentication_series).length ? buckets : [];
  }

  if (key === 'requests') {
    return asArray(liveAnalytics.request_series).length ? buckets : [];
  }

  // Severity trends need security events or incidents.
  return asArray(liveAnalytics.event_timeline).length || incList().length
    ? buckets
    : [];
};

const badgeText = () =>
  !liveAnalytics
    ? 'Waiting for telemetry'
    : `${safeNum(liveAnalytics?.security?.security_events)} security events`;

/* =========================================================
   INCIDENT FILTERS
   ========================================================= */

const visible = () =>
  incList().filter(incident => {
    const matchesCategory =
      category === 'All threats' ||
      incident.category === category ||
      incident.threat === category ||
      incident.level === category ||
      (category === 'HIGH' && incident.level === 'CRITICAL');

    const searchable =
      `${incident.source} ${incident.id} ${incident.threat} ` +
      `${incident.target} ${incident.app}`;

    const matchesQuery =
      !query ||
      searchable.toLowerCase().includes(query.toLowerCase());

    return matchesCategory && matchesQuery;
  });

/* =====================================================
   THREAT DISTRIBUTION (counted from real incidents)
   ===================================================== */

const DIST_DEFS = [
  ['Brute Force', 'coral'],
  ['Traffic Anomaly', 'cyan'],
  ['Phishing', 'amber'],
  ['Suspicious Activity', 'mint'],
  ['Other', 'silver']
];

const computeDist = () => {
  const list = incList();

  return DIST_DEFS.map(([name, color]) => ({
    name,
    color,
    value: list.filter(incident => incident.category === name).length
  }));
};

let dist = computeDist();

  const totalDetections = () =>
    dist.reduce(
      (sum, item) => sum + item.value,
      0
    );

  const donut = () => {
    const circumference = 2 * Math.PI * 59;

    const total = Math.max(
      1,
      totalDetections()
    );

    let accumulated = 0;

    return `
      <svg
        viewBox="0 0 165 165"
        width="100%"
        height="165"
        role="img"
        aria-label="Threat distribution"
      >
        <circle cx="82.5" cy="82.5" r="59" fill="none" stroke="var(--chart-grid)" stroke-width="14" opacity=".5"/>
        ${dist.map(item => {
          const segmentLength =
            item.value / total * circumference;

          const circle = `
            <circle
              cx="82.5"
              cy="82.5"
              r="59"
              fill="none"
              stroke="var(--${item.color})"
              stroke-width="14"
              stroke-dasharray="${Math.max(0, segmentLength - 5)} ${circumference}"
              stroke-dashoffset="${-accumulated}"
              transform="rotate(-90 82.5 82.5)"
              data-cat="${item.name}"
              style="
                cursor:pointer;
                opacity:${
                  category === 'All threats' ||
                  category === item.name
                    ? 1
                    : 0.35
                }
              "
            >
              <title>
                ${item.name}: ${item.value}
              </title>
            </circle>
          `;

          accumulated += segmentLength;

          return circle;
        }).join('')}
      </svg>
    `;
  };

  /* =====================================================
     SUMMARY CARDS
     ===================================================== */

const summaryHtml = () => {
    const list = incList();

    const waitingEvents = !liveAnalytics;
    const waitingIncidents = !incidentsLoaded;

    const count = level =>
      list.filter(incident =>
        level === 'HIGH'
          ? incident.level === 'HIGH' || incident.level === 'CRITICAL'
          : incident.level === level
      ).length;

    const show = (value, waiting) =>
      waiting ? '—' : Number(value).toLocaleString();

    const hint = (waiting, text) =>
      waiting ? 'Waiting for telemetry' : text;

    const label = liveAnalytics
      ? 'LIVE TELEMETRY'
      : analyticsError
        ? 'TELEMETRY UNAVAILABLE'
        : 'WAITING FOR TELEMETRY';

    return `
      <div class="security-summary">

        ${stat(
          'TOTAL EVENTS',
          show(
            safeNum(
              liveAnalytics?.overview?.total_events ??
              liveAnalytics?.total_events
            ),
            waitingEvents
          ),
          '',
          hint(waitingEvents, 'Ingested application telemetry')
        )}

        ${stat(
          'ACTIVE INCIDENTS',
          show(list.length, waitingIncidents),
          '',
          hint(waitingIncidents, `Detected in the last ${range}`)
        )}

        <button
          class="btn btn-ghost summary-filter"
          data-cat="HIGH"
        >
          ${stat(
            'HIGH RISK',
            show(count('HIGH'), waitingIncidents),
            '',
            hint(waitingIncidents, 'High severity incidents'),
            waitingIncidents ? '' : 'coral'
          )}
        </button>

        <button
          class="btn btn-ghost summary-filter"
          data-cat="MEDIUM"
        >
          ${stat(
            'MEDIUM RISK',
            show(count('MEDIUM'), waitingIncidents),
            '',
            hint(waitingIncidents, 'Medium severity incidents'),
            waitingIncidents ? '' : 'amber'
          )}
        </button>

        <span class="sample-label">
          ${label}
        </span>

      </div>
    `;
  };

  /* =====================================================
     DISTRIBUTION PANEL
     ===================================================== */

const distPanel = () => {
    const total = totalDetections();
    const waiting = !incidentsLoaded;

    return panel({
      title: 'Threat distribution',

      eyebrow: waiting
        ? 'WAITING FOR TELEMETRY'
        : `${total} INCIDENTS`,

      body: `
        <div class="distribution">

          <div class="donut-wrap">
            ${donut()}

            <div class="donut-center">
              <b>${waiting ? '—' : total}</b>
              <small>${waiting ? 'WAITING' : 'INCIDENTS'}</small>
            </div>
          </div>

          <div class="distribution-legend">
            ${dist.map(item => `
              <button
                class="btn btn-ghost ${
                  category === item.name
                    ? 'selected'
                    : ''
                }"
                data-cat="${item.name}"
              >
                <i class="legend-dot ${item.color}"></i>

                <span>${item.name}</span>

                <b>${waiting ? '—' : item.value}</b>
              </button>
            `).join('')}
          </div>

        </div>

        <div class="panel-footer">
          <span>
            ${
              category === 'All threats'
                ? 'All categories'
                : category
            }
          </span>

          <button
            class="btn btn-sm btn-ghost"
            data-cat="All threats"
          >
            Reset filter
          </button>
        </div>
      `
    });
  };

  /* =====================================================
     INCIDENT TABLE
     Existing incident records are retained.
     ===================================================== */

const rowsHtml = () => {
    const rows = visible();

    if (!rows.length) {
      const message = !incidentsLoaded
        ? 'Waiting for telemetry'
        : liveIncidents.length === 0
          ? 'No incidents recorded yet'
          : incList().length === 0
            ? `No incidents in the last ${range}`
            : 'No incidents match these filters.';

      return `
        <tr>
          <td colspan="9" class="empty-state">
            ${esc(message)}
          </td>
        </tr>
      `;
    }

    return rows.map(incident => `
      <tr
        class="clickable-row"
        data-inc="${esc(incident.id)}"
      >
        <td class="mono">${esc(incident.id)}</td>

        <td>${esc(incident.threat)}</td>

        <td class="mono">${esc(incident.source)}</td>

        <td class="mono muted">
          ${esc(incident.target)}
        </td>

        <td>${esc(incident.app)}</td>

        <td>
          <span class="risk-pill ${toneOf(incident.level)}">
            ${incident.risk === null ? '—' : incident.risk} · ${esc(incident.level)}
          </span>
        </td>

        <td class="mono muted">
          ${esc(incident.time)}
        </td>

        <td class="small-status">
          ${esc(incident.status)}
        </td>

        <td>
          <button
            class="btn btn-ghost btn-icon small-icon"
            aria-label="Inspect ${esc(incident.id)}"
          >
            ${icon('arrowUR')}
          </button>
        </td>
      </tr>
    `).join('');
  };

  /* Source IP intelligence: request counts from analytics, risk from real incidents. */
  const sourceListHtml = () => {
    const rows = new Map();

    const entry = ip => {
      if (!rows.has(ip)) {
        rows.set(ip, { ip, events: 0, incidentEvents: 0, risk: null, incident: null });
      }
      return rows.get(ip);
    };

    const counts = liveAnalytics?.source_ips;
    const hasCounts =
      counts && typeof counts === 'object' && !Array.isArray(counts);

    if (hasCounts) {
      Object.entries(counts).forEach(([ip, n]) => {
        entry(ip).events = safeNum(n);
      });
    }

    incList().forEach(incident => {
      if (incident.source === '—') return;

      const row = entry(incident.source);
      row.incidentEvents += incident.events ?? 1;

      if (incident.risk !== null && (row.risk === null || incident.risk > row.risk)) {
        row.risk = incident.risk;
        row.incident = incident.id;
      } else if (!row.incident) {
        row.incident = incident.id;
      }
    });

    const list = [...rows.values()]
      .map(row => ({ ...row, events: row.events || row.incidentEvents }))
      .sort((a, b) =>
        (b.risk ?? -1) - (a.risk ?? -1) || b.events - a.events
      )
      .slice(0, 12);

    if (!list.length) return WAITING();

    /* scrollable, one card per IP: activity plot + details */
    if (!document.getElementById('srcxCss')) {
      const css = document.createElement('style');
      css.id = 'srcxCss';
      css.textContent = `
      #srcHost{height:250px;overflow-y:auto;overscroll-behavior:contain;padding:10px 14px 12px;display:grid;gap:10px;align-content:start;scrollbar-width:thin;scrollbar-color:color-mix(in oklab,var(--cyan) 40%,transparent) transparent}
      #srcHost::-webkit-scrollbar{width:6px}
      #srcHost::-webkit-scrollbar-thumb{background:color-mix(in oklab,var(--cyan) 40%,transparent);border-radius:999px}
      .srcx{--c:var(--cyan);display:grid;gap:8px;padding:10px 12px;border:1px solid var(--chart-grid);border-radius:10px;background:linear-gradient(160deg,color-mix(in oklab,var(--c) 6%,transparent),transparent)}
      .srcx.coral{--c:var(--coral)}.srcx.amber{--c:var(--amber)}.srcx.mint{--c:var(--mint)}
      .srcx-top{display:flex;align-items:center;gap:10px;min-width:0}
      .srcx-ip{font:600 13px var(--font-mono);color:var(--foreground)}
      .srcx-sub{font-size:10px;color:var(--muted-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .srcx-risk{margin-left:auto;flex:none;padding:3px 9px;border-radius:99px;font:600 9px var(--font-mono);letter-spacing:.1em;color:var(--c);border:1px solid color-mix(in oklab,var(--c) 40%,transparent);background:color-mix(in oklab,var(--c) 10%,transparent)}
      .srcx-open{flex:none;display:grid;place-items:center;width:22px;height:22px;padding:0;border-radius:6px;border:1px solid var(--chart-grid);background:transparent;color:var(--muted-foreground);cursor:pointer}
      .srcx-open:hover{color:var(--foreground);border-color:var(--c)}
      .srcx-plot{position:relative}
      .srcx-plot svg{display:block;width:100%;height:54px}
      .srcx-axis{display:flex;justify-content:space-between;margin-top:3px;font:500 9px var(--font-mono);color:var(--muted-foreground)}
      .srcx-empty{display:flex;align-items:center;justify-content:center;height:54px;border:1px dashed var(--chart-grid);border-radius:8px;font:500 10px var(--font-mono);letter-spacing:.06em;color:var(--muted-foreground)}
      .srcx-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 12px;padding-top:8px;border-top:1px solid var(--chart-grid)}
      .srcx-grid div{min-width:0}
      .srcx-grid span{display:block;font:500 8px var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted-foreground)}
      .srcx-grid b{display:block;margin-top:2px;font:600 11px var(--font-mono);color:var(--foreground);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}`;
      document.head.appendChild(css);
    }

    const evAll = asArray(liveAnalytics?.event_timeline);
    const clock = ms => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const incByIp = new Map();
    incList().forEach(incident => {
      if (!incByIp.has(incident.source)) incByIp.set(incident.source, incident);
    });

    return list.map(row => {
      const mine = evAll.filter(e => String(e?.source_ip ?? e?.ip ?? '') === row.ip);
      const hits = mine.map(e => {
        const t = toMs(pickFirst(e.time, e.received_at, e.timestamp, e.event_time, e.created_at));
        const code = Number(e.status_code ?? e.details?.status_code);
        const failed = /fail|error|blocked|suspicious/i.test(String(e.event || '')) || (Number.isFinite(code) && code >= 400);
        return { t, failed };
      }).filter(h => h.t !== null).sort((x, y) => x.t - y.t);
      const failed = mine.filter(e => {
        const code = Number(e.status_code ?? e.details?.status_code);
        return /fail|error|blocked|suspicious/i.test(String(e.event || '')) || (Number.isFinite(code) && code >= 400);
      }).length;
      const users = [...new Set(mine.map(e => e.username).filter(Boolean))];
      const inc = incByIp.get(row.ip);
      const level = row.risk === null ? '' : levelOf('', row.risk);
      const tone = row.risk === null ? '' : toneOf(level);

      let plot = '<div class="srcx-empty">Waiting for timestamped events</div>';
      if (hits.length >= 2 && hits[hits.length - 1].t > hits[0].t) {
        const B = 18, W = 300, H = 54, pad = 4;
        const t0 = hits[0].t, t1 = hits[hits.length - 1].t;
        const all = Array(B).fill(0), bad = Array(B).fill(0);
        hits.forEach(h => {
          const k = Math.min(B - 1, Math.floor((h.t - t0) / (t1 - t0) * B));
          all[k] += 1;
          if (h.failed) bad[k] += 1;
        });
        const top = Math.max(1, ...all);
        const pts = a => a.map((v, k) => [k / (B - 1) * W, H - pad - v / top * (H - pad * 2)]);
        const la = monotone(pts(all)), lb = monotone(pts(bad));
        plot = `<div class="srcx-plot"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Event activity over time for ${esc(row.ip)}">
            <path d="${la} L${W},${H - pad} L0,${H - pad} Z" fill="var(--cyan)" fill-opacity=".14"/>
            <path d="${la}" fill="none" stroke="var(--cyan)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
            <path d="${lb}" fill="none" stroke="var(--coral)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
          </svg>
          <div class="srcx-axis"><span>${clock(t0)}</span><span>${top} peak · cyan events · red failed</span><span>${clock(t1)}</span></div></div>`;
      }

      const last = hits.length ? clock(hits[hits.length - 1].t) : '—';
      return `<div class="srcx ${tone}">
        <div class="srcx-top">
          <div style="min-width:0"><div class="srcx-ip">${esc(row.ip)}</div><div class="srcx-sub">${inc ? esc(inc.threat) : 'No incident linked'}</div></div>
          <span class="srcx-risk">${row.risk === null ? 'UNSCORED' : esc(level) + ' · ' + row.risk}</span>
          ${row.incident ? `<button class="srcx-open" type="button" data-inc="${esc(row.incident)}" aria-label="Inspect ${esc(row.incident)}">${icon('arrowUR', 12)}</button>` : ''}
        </div>
        ${plot}
        <div class="srcx-grid">
          <div><span>Events</span><b>${row.events.toLocaleString()}</b></div>
          <div><span>Failed</span><b>${failed.toLocaleString()}</b></div>
          <div><span>Last seen</span><b>${last}</b></div>
          <div><span>Incident</span><b>${row.incident ? esc(row.incident) : '—'}</b></div>
          <div><span>Accounts</span><b title="${esc(users.join(', '))}">${users.length ? esc(users.slice(0, 2).join(', ')) + (users.length > 2 ? ' +' + (users.length - 2) : '') : '—'}</b></div>
          <div><span>Target</span><b>${inc ? esc(inc.target) : '—'}</b></div>
        </div>
      </div>`;
    }).join('');
  };

  /* =====================================================
     RENDER SECURITY PAGE
     ===================================================== */

  function render() {
    dist = computeDist();

    app.innerHTML = `
      <div class="page-heading">
        <div>
          <div class="eyebrow">
            THREAT DETECTION &amp; INVESTIGATION
          </div>

          <h1>
            Security analysis

            <span class="alert-badge">
              <i></i>
              ${badgeText()}
            </span>
          </h1>

          <p>
            Correlate threats, inspect evidence
            and assess your security posture.
          </p>
        </div>

        ${rangeSel(
          ['24 hours', '7 days', '30 days'],
          range
        )}
      </div>

      <div id="sumHost">
        ${summaryHtml()}
      </div>

      <div class="security-top">
        ${threatGraph()}

        <div id="distHost">
          ${distPanel()}
        </div>
      </div>

      <div class="three-chart-grid">

        ${panel({
          title: 'Threat trends',
          eyebrow: 'SEVERITY OVER TIME',

          body: Charts.add({
            data: dataFor('high'),

            series: [
              {
                key: 'high',
                name: 'High',
                color: 'coral'
              },
              {
                key: 'medium',
                name: 'Medium',
                color: 'amber'
              },
              {
                key: 'low',
                name: 'Low',
                color: 'mint'
              },
              {
                key: 'critical',
                name: 'Critical',
                color: 'silver'
              }
            ],

            area: true,
            sw: 1.6,
            height: 150
          })
        })}

        ${panel({
          title: 'Brute-force detection',
          eyebrow: 'AUTHENTICATION · LIVE EVENTS',

          body: `
            <div class="detection-label">
              ${icon('shieldAlert', 12)}
              Failed login events recorded by the connector
            </div>

            ${Charts.add({
              data: dataFor('failed'),

              series: [{
                key: 'failed',
                name: 'Failed attempts',
                color: 'coral'
              }],

              threshold: 6,
              area: true,
              sw: 1.8,
              dot: true,
              height: 150
            })}
          `
        })}

        ${panel({
          title: 'Traffic anomaly',
          eyebrow: 'RECORDED REQUEST ACTIVITY',

          body: `
            <div class="detection-label">
              Recorded request events · live connector data
            </div>

            ${Charts.add({
              data: dataFor('requests'),

              series: [{
                key: 'requests',
                name: 'Recorded requests',
                color: 'cyan'
              }],

              area: true,
              sw: 1.8,
              dot: true,
              height: 150
            })}
          `
        })}

      </div>

      ${panel({
        title: 'Active incidents',
        eyebrow: 'INVESTIGATION QUEUE',
        cls: 'mt-4',

        action: `
          <div class="flex gap-3 items-center wrap">

            <div class="search-field">
              ${icon('search', 13)}

              <input
                id="q"
                aria-label="Search incidents"
                placeholder="Search incident or IP…"
                value="${esc(query)}"
              >
            </div>

            <select id="catSel" aria-label="Filter threats">
              ${
                [
                  'All threats',
                  'HIGH',
                  'MEDIUM',
                  'LOW',
                  ...dist.map(item => item.name)
                ].map(item => `
                  <option ${
                    item === category
                      ? 'selected'
                      : ''
                  }>
                    ${item}
                  </option>
                `).join('')
              }
            </select>

          </div>
        `,

        body: `
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  ${
                    [
                      'INCIDENT',
                      'THREAT',
                      'SOURCE IP',
                      'TARGET',
                      'APPLICATION',
                      'RISK',
                      'DETECTED',
                      'STATUS',
                      ''
                    ].map(item => `<th>${item}</th>`).join('')
                  }
                </tr>
              </thead>

              <tbody id="incBody">
                ${rowsHtml()}
              </tbody>
            </table>
          </div>
        `
      })}

      <div class="resource-grid mt-4">

${panel({
          title: 'Source IP intelligence',
          eyebrow: 'LIVE SOURCE ACTIVITY',

          body: `<div id="srcHost">${sourceListHtml()}</div>`
        })}

         ${panel({
          title: 'Risk progression',
          eyebrow: 'CORRELATED RISK SCORE',

          body: Charts.add({
            data: dataFor('risk'),

            series: [{
              key: 'risk',
              name: 'Risk score',
              color: 'coral'
            }],

            unit: '%',
            area: true,
            sw: 1.8,
            dot: true,
            height: 150
          }) + `<div id="riskNote" class="muted" style="padding:0 16px 12px;font-size:11px">${esc(riskStatus())}</div>`
        })}

      </div>

      ${window.securityTimeline()}

      ${panel({
        title: 'Phishing URL analyzer',
        eyebrow: 'LOCAL INDICATOR INSPECTION · GRAPH ANALYSIS',
        cls: 'mt-4',
        id: 'phish',

        body: `
          <form
            class="url-form"
            id="urlForm"
            novalidate
          >
            <input
              id="urlIn"
              type="url"
              inputmode="url"
              autocomplete="off"
              aria-label="URL to analyze"
              placeholder="https://example.com/login"
              required
            >

            <button
              type="submit"
              class="btn btn-sm btn-secondary"
            >
              ${icon('scan')}
              Analyze URL
            </button>
          </form>

          <div class="sample-urls">
            <span class="muted">Try:</span>

            <button
              type="button"
              class="chip"
              data-url="https://example.com/docs"
            >
              Safe site
            </button>

            <button
              type="button"
              class="chip"
              data-url="http://192.168.4.20:8080/login?redirect=http://evil.top"
            >
              IP + redirect
            </button>

            <button
              type="button"
              class="chip"
              data-url="https://paypal.secure-account-verify.login.example-pay.xyz/update"
            >
              Brand lookalike
            </button>
          </div>

          <div id="urlOut">
            <p class="muted px-5 pb-5 text-xs">
              Paste a URL above to see its risk score,
              indicator graph and anatomy.
              The analysis never visits the destination.
            </p>
          </div>
        `
      })}
    `;

    Charts.flush();
  }

  /* =====================================================
     PHISHING URL ANALYSIS
     ===================================================== */

  function radar(cats) {
    const cx = 110;
    const cy = 105;
    const radius = 72;

    const point = (index, r) => {
      const angle =
        -Math.PI / 2 +
        index * 2 * Math.PI / 5;

      return [
        cx + Math.cos(angle) * r,
        cy + Math.sin(angle) * r
      ];
    };

    const polygon = r =>
      CATS.map((_, index) =>
        point(index, r).join(',')
      ).join(' ');

    return `
      <svg
        viewBox="0 0 220 210"
        width="100%"
        role="img"
        aria-label="Risk radar by category"
      >
        ${[0.25, 0.5, 0.75, 1].map(factor => `
          <polygon
            points="${polygon(radius * factor)}"
            fill="none"
            stroke="var(--chart-grid)"
          />
        `).join('')}

        ${CATS.map((name, index) => {
          const [x, y] = point(index, radius);
          const [labelX, labelY] =
            point(index, radius + 16);

          return `
            <line
              x1="${cx}"
              y1="${cy}"
              x2="${x}"
              y2="${y}"
              stroke="var(--chart-grid)"
            />

            <text
              x="${labelX}"
              y="${labelY + 3}"
              text-anchor="middle"
              fill="var(--muted-foreground)"
              font-size="8"
            >
              ${name}
            </text>
          `;
        }).join('')}

        <polygon
          points="${cats.map((value, index) =>
            point(
              index,
              Math.max(2, value / 100 * radius)
            ).join(',')
          ).join(' ')}"
          fill="var(--coral)"
          fill-opacity=".18"
          stroke="var(--coral)"
          stroke-width="1.3"
        />

        ${cats.map((value, index) => {
          const [x, y] = point(
            index,
            Math.max(2, value / 100 * radius)
          );

          return `
            <circle
              cx="${x}"
              cy="${y}"
              r="2.5"
              fill="var(--coral)"
            />
          `;
        }).join('')}
      </svg>
    `;
  }
/* ============================================================
   CYBI AI — SAFE MARKDOWN FORMATTER
   Formats headings, lists, tables, bold text and paragraphs.
   ============================================================ */

function renderCybiMarkdown(markdown) {
  if (!markdown) {
    return '<p class="muted">No Cybi analysis available.</p>';
  }

  // Escape HTML before formatting to prevent unsafe HTML injection.
  const escapeHTML = value =>
    String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);

  // Support literal HTML line-break tags returned by the AI.
  let text = String(markdown)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\r\n?/g, '\n');

  const inline = value => {
    let result = escapeHTML(value);

    // Inline code.
    result = result.replace(
      /`([^`]+)`/g,
      '<code>$1</code>'
    );

    // Bold text.
    result = result.replace(
      /\*\*(.+?)\*\*/g,
      '<strong>$1</strong>'
    );

    // Italic text.
    result = result.replace(
      /(^|[^*])\*([^*\n]+)\*(?!\*)/g,
      '$1<em>$2</em>'
    );

    // Links: allow only HTTP and HTTPS destinations.
    result = result.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      (_, label, url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`
    );

    return result;
  };

  const lines = text.split('\n');
  const output = [];

  let paragraph = [];
  let listType = null;
  let listItems = [];
  let tableRows = [];

  function flushParagraph() {
    if (!paragraph.length) return;

    output.push(
      `<p>${paragraph.map(inline).join('<br>')}</p>`
    );

    paragraph = [];
  }

  function flushList() {
    if (!listItems.length) return;

    const tag = listType === 'ol' ? 'ol' : 'ul';

    output.push(
      `<${tag}>${listItems
        .map(item => `<li>${inline(item)}</li>`)
        .join('')}</${tag}>`
    );

    listItems = [];
    listType = null;
  }

  function flushTable() {
    if (!tableRows.length) return;

    const rows = tableRows
      .filter(row => !/^\s*\|?[\s:|-]+\|?\s*$/.test(row))
      .map(row =>
        row.trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map(cell => cell.trim())
      );

    if (rows.length) {
      const headers = rows[0];

      output.push(`
        <div class="cybi-table-wrap">
          <table class="cybi-table">
            <thead>
              <tr>
                ${headers.map(cell =>
                  `<th>${inline(cell)}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.slice(1).map(row => `
                <tr>
                  ${headers.map((_, index) =>
                    `<td>${inline(row[index] || '')}</td>`
                  ).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `);
    }

    tableRows = [];
  }

  function flushBlocks() {
    flushParagraph();
    flushList();
    flushTable();
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line: finish the current block.
    if (!trimmed) {
      flushBlocks();
      continue;
    }

    // Markdown table.
    if (trimmed.includes('|') && trimmed.split('|').length >= 3) {
      flushParagraph();
      flushList();
      tableRows.push(trimmed);
      continue;
    } else {
      flushTable();
    }

    // Headings.
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);

    if (heading) {
      flushBlocks();

      const level = heading[1].length;

      output.push(
        `<h${level}>${inline(heading[2])}</h${level}>`
      );

      continue;
    }

    // Blockquotes.
    if (trimmed.startsWith('>')) {
      flushBlocks();

      output.push(
        `<blockquote>${inline(trimmed.replace(/^>\s?/, ''))}</blockquote>`
      );

      continue;
    }

    // Ordered lists.
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);

    if (ordered) {
      flushParagraph();

      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }

      listItems.push(ordered[1]);
      continue;
    }

    // Unordered lists.
    const unordered = trimmed.match(/^[-*•]\s+(.+)$/);

    if (unordered) {
      flushParagraph();

      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }

      listItems.push(unordered[1]);
      continue;
    }

    // Normal paragraph.
    flushList();
    paragraph.push(trimmed);
  }

  flushBlocks();

  return `
    <div class="cybi-markdown">
      ${output.join('\n')}
    </div>
  `;
}
function renderCybiMarkdown(markdown) {
    const escapeHTML = value =>
        String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);

    let text = escapeHTML(markdown);

    // Convert Markdown tables.
    text = text.replace(
        /((?:^\|.*\|\s*$\n?)+)/gm,
        tableBlock => {
            const rows = tableBlock.trim().split('\n')
                .map(row => row.trim())
                .filter(row => row.startsWith('|'))
                .map(row => row.split('|').slice(1, -1)
                    .map(cell => cell.trim()));

            const isSeparator = row =>
                row.every(cell => /^:?-{3,}:?$/.test(cell));

            const header = rows.shift() || [];
            const body = rows.filter(row => !isSeparator(row));

            return `
                <div class="cybi-table-wrap">
                    <table class="cybi-table">
                        <thead>
                            <tr>${header.map(cell =>
                                `<th>${cell}</th>`
                            ).join('')}</tr>
                        </thead>
                        <tbody>
                            ${body.map(row => `
                                <tr>${row.map(cell =>
                                    `<td>${cell || '—'}</td>`
                                ).join('')}</tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    );

    // Convert headings.
    text = text.replace(
        /^### (.+)$/gm,
        '<h4>$1</h4>'
    );
    text = text.replace(
        /^## (.+)$/gm,
        '<h3>$1</h3>'
    );
    text = text.replace(
        /^# (.+)$/gm,
        '<h2>$1</h2>'
    );

    // Convert bold and inline code.
    text = text.replace(
        /\*\*(.+?)\*\*/g,
        '<strong>$1</strong>'
    );
    text = text.replace(
        /`([^`]+)`/g,
        '<code>$1</code>'
    );

    // Convert bullet lists.
    text = text.replace(
        /^\s*[-*] (.+)$/gm,
        '<li>$1</li>'
    );

    text = text.replace(
        /(?:<li>.*?<\/li>\s*)+/gs,
        list => `<ul>${list}</ul>`
    );

    // Convert numbered lists.
    text = text.replace(
        /^\s*\d+\. (.+)$/gm,
        '<li>$1</li>'
    );

    // Convert HTML line breaks already present in the report.
    text = text.replace(
        /&lt;br\s*\/?&gt;/gi,
        '<br>'
    );

    // Preserve paragraph breaks.
    text = text
        .split(/\n{2,}/)
        .map(block => {
            block = block.trim();

            if (!block) return '';

            if (/^<(h[2-4]|ul|ol|div|table)/i.test(block)) {
                return block;
            }

            return `<p>${block.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');

    return text;
}
 async function showUrl(value) {
    const output = $('#urlOut');

    if (!output) {
        console.error('[Sentinal] #urlOut element not found.');
        return;
    }

    const escapeHTML = value =>
        String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);

    const url = String(value || '').trim();

    if (!url) {
        output.innerHTML = `
            <div class="analysis-result coral">
                Please enter a URL to analyze.
            </div>
        `;
        return;
    }

    // Validate URL format.
    try {
        const parsed = new URL(url);

        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Only HTTP and HTTPS URLs are supported.');
        }
    } catch {
        output.innerHTML = `
            <div class="analysis-result coral">
                Enter a valid HTTP or HTTPS URL.
            </div>
        `;
        return;
    }

    // Prevent older requests from replacing newer results.
    const requestId = (showUrl.requestId || 0) + 1;
    showUrl.requestId = requestId;

    output.innerHTML = `
        <div class="analysis-result">
            <span class="cyan">SENTINAL AI</span>
            <p>Connecting to Python phishing analyzer...</p>
        </div>
    `;

    try {
        // Send the URL to the existing Python API.
        const response = await fetch('/api/phishing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ url }),
            cache: 'no-store'
        });

        // Read the response safely.
        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(
                `Python API returned HTTP ${response.status}: ` +
                responseText.slice(0, 300)
            );
        }

        let server;

        try {
            server = JSON.parse(responseText);
        } catch {
            throw new Error(
                'Python API did not return valid JSON. Check the backend.'
            );
        }

        if (requestId !== showUrl.requestId) return;

        if (!server || typeof server !== 'object') {
            throw new Error('Invalid response from Python API.');
        }

        // The backend must return a result for the submitted URL.
        if (server.url !== url) {
            throw new Error(
                `URL mismatch. Submitted: ${url}; returned: ${server.url}`
            );
        }

        if (
            server.classification === 'ERROR' ||
            server.risk_level === 'ERROR'
        ) {
            throw new Error(
                Array.isArray(server.evidence)
                    ? server.evidence.join(' ')
                    : 'Python phishing analysis failed.'
            );
        }

        const score = Number(server.risk_score);

        if (
            server.risk_score === null ||
            server.risk_score === undefined ||
            !Number.isFinite(score) ||
            score < 0 ||
            score > 100
        ) {
            throw new Error('Python returned an invalid risk score.');
        }

        const classification = String(
            server.classification || 'UNKNOWN'
        );

        const riskLevel = String(
            server.risk_level || 'UNKNOWN'
        );

        const evidence = Array.isArray(server.evidence)
            ? server.evidence
            : [];

        const tone =
            score >= 70 ? 'coral' :
            score >= 40 ? 'amber' :
            'mint';

        // Preserve the original local graph and URL anatomy.
        // These are separate from the Python risk assessment.
        let local = null;

        if (typeof inspectUrl === 'function') {
            local = inspectUrl(url);
        }

        if (!local || local.error) {
            console.warn(
                '[Sentinal] Local URL visualization unavailable:',
                local?.error || 'inspectUrl() is unavailable.'
            );
        }

        const indicators = Array.isArray(local?.indicators)
            ? local.indicators
            : [];

        const hits = indicators.filter(item => item.hit);

        const sorted = [...indicators].sort(
            (a, b) =>
                Number(Boolean(b.hit)) - Number(Boolean(a.hit)) ||
                (Number(b.weight) || 0) - (Number(a.weight) || 0)
        );

        const anatomy = Array.isArray(local?.anatomy)
            ? local.anatomy
            : [];

        const anatomyHTML = anatomy.map(item => `
            <div>
                <dt>${escapeHTML(item[0])}</dt>
                <dd>${escapeHTML(item[1])}</dd>
            </div>
        `).join('');

        const radarHTML = typeof radar === 'function'
            ? radar(Array.isArray(local?.cats) ? local.cats : [])
            : '<p class="muted">Risk radar unavailable.</p>';

        // Display the score and classification received from Python.
        output.innerHTML = `
            <div class="url-result">

                <div class="url-col gauge">
                    ${typeof ring === 'function'
                        ? ring(score, 'RISK SCORE', tone, 130)
                        : `<div class="${tone}">
                               <strong>${score}/100</strong>
                           </div>`
                    }

                    <b class="${tone}">
                        ${escapeHTML(classification)}
                    </b>

                    <small class="muted">
                        Backend risk level: ${escapeHTML(riskLevel)}
                    </small>
                </div>

                <div class="url-col">
                    <span class="eyebrow">
                        INDICATOR GRAPH · WEIGHT
                    </span>

                    <div class="ibars">
                        ${sorted.map(item => {
                            const weight = Math.max(
                                0,
                                Number(item.weight) || 0
                            );

                            const barWidth = item.hit
                                ? Math.min(100, weight / 25 * 100)
                                : 0;

                            return `
                                <div class="ibar ${item.hit ? '' : 'off'}">
                                    <span title="${escapeHTML(item.cat)}">
                                        ${escapeHTML(item.label)}
                                    </span>

                                    <div class="track">
                                        <i style="width:${barWidth}%"></i>
                                    </div>

                                    <b>
                                        ${item.hit ? '+' + weight : '—'}
                                    </b>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <small class="muted">
                        ${hits.length} of ${indicators.length}
                        local URL indicators triggered
                    </small>
                </div>

                <div class="url-col">
                    <span class="eyebrow">RISK RADAR</span>
                    ${radarHTML}
                </div>

                <div class="url-col">
                    <span class="eyebrow">URL ANATOMY</span>
                    <dl class="detail-list">${anatomyHTML}</dl>
                </div>

            </div>

<div class="analysis-result phishing-evidence-panel">
    <span class="eyebrow">
        PYTHON ANALYZER · DETECTION EVIDENCE
    </span>

    ${
        evidence.length
            ? `<ul class="phishing-evidence-list">
                ${evidence.map(item => `
                    <li>${escapeHTML(item)}</li>
                `).join('')}
               </ul>`
            : '<p class="muted">No detection evidence returned.</p>'
    }
</div>

 <div class="analysis-result cybi-report" style="margin-top:16px">
    <span class="eyebrow">CYBI AI ANALYSIS</span>

    <div class="cybi-markdown">
        ${renderCybiMarkdown(
            server.cybi_analysis ||
            'Cybi analysis is unavailable.'
        )}
    </div>
</div>

            <div class="analysis-result">
                <small>
                    Risk score and evidence are provided by the Python
                    backend. Graphs and radar visualize local URL indicators.
                    A score alone does not prove a website is malicious.
                </small>
            </div>
        `;

        console.log(
            '[Sentinal] Python phishing analysis completed:',
            {
                submittedURL: url,
                returnedURL: server.url,
                riskScore: score,
                classification,
                evidence
            }
        );

    } catch (error) {
        if (requestId !== showUrl.requestId) return;

        console.error('[Sentinal] Phishing analysis failed:', error);

        output.innerHTML = `
            <div class="analysis-result coral" role="alert">
                <b>Phishing analysis failed</b>
                <p>${escapeHTML(error.message || 'Unknown error')}</p>
                <small>
                    Check the Python terminal for the backend error.
                </small>
            </div>
        `;
    }
}
  /* =====================================================
     INCIDENT DETAILS DRAWER
     ===================================================== */

function drawer() {
    let host = $('#drawerHost');

    if (!host) {
      host = document.createElement('div');
      host.id = 'drawerHost';
      document.body.appendChild(host);
    }

    const incident = selected;

    if (!incident) {
      host.innerHTML = '';
      return;
    }

    const show = value =>
      value === null || value === undefined || value === ''
        ? '—'
        : esc(value);

    const evidenceHtml = incident.evidence.length
      ? `<ul class="phishing-evidence-list">
          ${incident.evidence.map(item => `<li>${esc(item)}</li>`).join('')}
        </ul>`
      : '<p class="muted">No evidence was supplied by the connector for this incident.</p>';

    host.innerHTML = `
      <div class="drawer-backdrop" data-close>
        <aside
          class="detail-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Incident details"
        >
          <div class="flex items-center justify-between">
            <span class="eyebrow">
              INCIDENT INTELLIGENCE
            </span>

            <button
              class="btn btn-ghost btn-icon"
              data-close
              aria-label="Close incident details"
            >
              ${icon('x')}
            </button>
          </div>

          <h2>${esc(incident.threat)}</h2>

          <div class="flex gap-2 my-4">
            <span class="risk-badge">
              ${esc(incident.level)}${incident.risk === null ? '' : ` · ${incident.risk}/100`}
            </span>

            <span class="status-label">
              ${show(incident.status)}
            </span>
          </div>

          <dl class="detail-list">
            ${[
              ['Incident ID', show(incident.id)],
              ['Application', show(incident.app)],
              ['Source IP', show(incident.source)],
              ['Account', show(incident.username)],
              ['Target', show(incident.target)],
              ['Detected', show(incident.time)],
              ['Confidence', incident.confidence === null ? '—' : incident.confidence + '%'],
              ['Evidence events', show(incident.events)]
            ].map(([key, value]) => `
              <div>
                <dt>${key}</dt>
                <dd>${value}</dd>
              </div>
            `).join('')}
          </dl>

          <h3>Detection evidence</h3>

          ${evidenceHtml}

          <a
            class="btn btn-secondary mt-6 w-full"
            href="#cybi?incident=${encodeURIComponent(incident.id)}"
          >
            ${icon('arrowUR')}
            Investigate with CYBI
          </a>
        </aside>
      </div>
    `;
  }

  /* =====================================================
     EVENT HANDLERS
     ===================================================== */

  document.addEventListener('click', event => {
    if (
      selected &&
      (
        event.target.hasAttribute('data-close') ||
        event.target.closest('button[data-close]')
      )
    ) {
      selected = null;
      drawer();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && selected) {
      selected = null;
      drawer();
    }
  });

  const refreshFilters = () => {
    const summary = $('#sumHost');
    const distribution = $('#distHost');
    const incidentBody = $('#incBody');
    const categorySelect = $('#catSel');

    if (summary) {
      summary.innerHTML = summaryHtml();
    }

    if (distribution) {
      distribution.innerHTML = distPanel();
    }

    if (incidentBody) {
      incidentBody.innerHTML = rowsHtml();
    }

    if (categorySelect) {
      categorySelect.value = category;
    }
  };

  app.addEventListener('click', event => {
    const button = event.target.closest('button');

    if (!button && !event.target.closest('[data-cat], [data-inc]')) return;

    const categoryButton =
      event.target.closest('[data-cat]');

    const rangeButton = event.target.closest('[data-range]');

const incidentButton = event.target.closest('[data-inc]');

const urlButton = event.target.closest('[data-url]');

if (categoryButton) {
    const value = categoryButton.dataset.cat;

    category =
        category === value || value === 'All threats'
            ? 'All threats'
            : value;

    refreshFilters();

} else if (rangeButton) {
    range = rangeButton.dataset.range;
    render();

} else if (urlButton) {
    event.preventDefault();

    const chipInput = $('#urlIn');

    if (chipInput) {
        chipInput.value = urlButton.dataset.url;
    }

    showUrl(urlButton.dataset.url);
} else if (incidentButton) {
    selected = incList().find(
        incident => incident.id === incidentButton.dataset.inc
    ) || null;

    drawer();
}

});

app.addEventListener('input', event => {
    if (event.target.id === 'q') {
        query = event.target.value;

        const body = $('#incBody');

        if (body) {
            body.innerHTML = rowsHtml();
        }
    }
});

app.addEventListener('change', event => {
    if (event.target.id === 'catSel') {
        category = event.target.value;
        refreshFilters();
    }
});

// Analyze the URL only when the user submits the form.
app.addEventListener('submit', event => {
    if (event.target.id !== 'urlForm') {
        return;
    }

    event.preventDefault();

    const input = $('#urlIn');

    if (!input || !input.value.trim()) {
        if (input) {
            input.focus();
        }
        return;
    }

    showUrl(input.value.trim());
});
  /* =====================================================
     LIVE ANALYTICS POLLING
     ===================================================== */

/* Fetch real incidents from the dashboard backend, falling back to the Connector. */
  async function loadIncidents() {
    const urls = [
      '/api/incidents',
      'http://127.0.0.1:9000/api/v1/incidents'
    ];

    let lastError = null;

    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(`Incidents API returned ${response.status}`);
        }

        const data = await response.json();

        liveIncidents = Array.isArray(data)
          ? data
          : Array.isArray(data?.incidents) ? data.incidents : [];

        incidentsLoaded = true;
        incidentsError = null;

        return true;
      } catch (error) {
        lastError = error;
      }
    }

    // Keep whatever was loaded before; flag the outage.
    incidentsError = lastError ? lastError.message : 'Incident service unavailable';

    return false;
  }

  /* Push the latest live data into every element on the page. */
  function applyLiveData() {
    dist = computeDist();

    $$('.analytical-chart', app).forEach(chart => {
      if (!chart._o) return;

      chart._o.data = dataFor(chart._o.series?.[0]?.key);
      drawChart(chart);
    });

    const setHtml = (selector, html) => {
      const element = $(selector, app);
      if (element) element.innerHTML = html;
    };

    setHtml('#sumHost', summaryHtml());
    setHtml('#distHost', distPanel());
    setHtml('#incBody', rowsHtml());
    setHtml('#srcHost', sourceListHtml());

    const riskNote = $('#riskNote', app);

    if (riskNote) riskNote.textContent = riskStatus();

    const badge = $('.alert-badge', app);

    if (badge) {
      badge.innerHTML = `<i></i>${badgeText()}`;
    }

    const footer = $('.app-footer');

    if (footer) {
      const status = footer.querySelector('span:last-child');

      if (status) {
        status.innerHTML = `
          ${icon('radio', 12)}
          ${liveAnalytics ? 'Live connector telemetry' : 'Waiting for telemetry'}
          <i></i>
          All times local
          <i></i>
          v.1.4.2
        `;
      }
    }
  }

  async function refreshSecurityTelemetry() {
    let analyticsOk = false;

    try {
      const response = await fetch(
        '/api/application/analytics',
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error(
          `Analytics API returned ${response.status}`
        );
      }

      liveAnalytics = await response.json();
      analyticsError = null;
      analyticsOk = true;
    } catch (error) {
      analyticsError = error.message;

      console.warn(
        'Security telemetry refresh failed:',
        error
      );
    }

    await loadIncidents();

    applyLiveData();

    if (analyticsOk) {
      updateSentinalTimelineWave();
    }
  }
 /* =====================================================
   SENTINAL LIVE SECURITY TIMELINE WAVE
   Uses real Hanu AI connector telemetry
===================================================== */

/* =====================================================
   SENTINAL AI — REAL-TIME SECURITY EVENT TIMELINE
   Data source: Hanu AI → Sentinal Connector → Dashboard

   - Uses real timestamped telemetry
   - Five-second buckets
   - No random or simulated data
   - Prevents historical totals from becoming spikes
   - Preserves the original SecTimeline graph
===================================================== */

function updateSentinalTimelineWave() {
  const panel =
    document.querySelector('.security-timeline-panel') ||
    document.querySelector('#tl')?.closest('.glass-panel');

  if (!panel) {
    console.warn('[Sentinal] Security timeline panel not found.');
    return;
  }

  const analytics =
    typeof liveAnalytics !== 'undefined' && liveAnalytics
      ? liveAnalytics
      : {};

  const eventTimeline = Array.isArray(analytics.event_timeline)
    ? analytics.event_timeline
    : [];

  const authenticationSeries =
    Array.isArray(analytics.authentication_series)
      ? analytics.authentication_series
      : [];

  const eventsCounter =
    panel.querySelector('#sentinalWaveEvents');

  const failuresCounter =
    panel.querySelector('#sentinalWaveFailures');

  const anomaliesCounter =
    panel.querySelector('#tl-an');

  const status =
    panel.querySelector('#sentinalWaveStatus');

  const updated =
    panel.querySelector('#sentinalWaveUpdated');

  /* ---------- Normalize actual timestamps ---------- */

  function timestampOf(item) {
    return (
      item?.time ??
      item?.timestamp ??
      item?.event_time ??
      item?.received_at ??
      item?.details?.timestamp ??
      null
    );
  }

  function typeOf(item) {
    return String(
      item?.event ??
      item?.event_type ??
      item?.type ??
      item?.name ??
      'security_event'
    ).toLowerCase();
  }

  function isFailedLogin(type) {
    return /login_failed|failed.?login|authentication_failure|auth_failed|login.failure/.test(
      type
    );
  }

  function isAnomaly(type) {
    return /anomaly|attack|suspicious|brute.?force|sql.?injection|xss|phishing/.test(
      type
    );
  }

  /*
   * Prefer individual event records.
   *
   * Authentication series is used only when the API does not
   * provide individual timestamped events. This avoids counting
   * the same activity twice.
   */

  let source = 'event_timeline';

  let records = eventTimeline
    .map(item => {
      const type = typeOf(item);
      const timestamp = new Date(timestampOf(item)).getTime();

      return {
        timestamp,
        type,
        events: 1,
        failures: isFailedLogin(type) ? 1 : 0
      };
    })
    .filter(item => Number.isFinite(item.timestamp));

  /* ---------- Authentication fallback ---------- */

  if (records.length === 0 && authenticationSeries.length > 0) {
    source = 'authentication_series';

    records = authenticationSeries
      .map(item => {
        const timestamp = new Date(timestampOf(item)).getTime();

        const failures = Math.max(
          0,
          Number(item.failed ?? item.failed_logins ?? 0) || 0
        );

        const successful = Math.max(
          0,
          Number(
            item.successful ??
            item.success ??
            item.successful_logins ??
            0
          ) || 0
        );

        const events = Math.max(
          failures + successful,
          Number(item.events ?? item.total ?? 0) || 0
        );

        return {
          timestamp,
          type: failures > 0
            ? 'login_failed'
            : 'authentication_activity',
          events,
          failures
        };
      })
      .filter(item => Number.isFinite(item.timestamp));
  }

  records.sort((a, b) => a.timestamp - b.timestamp);

  /* ---------- Build real five-second buckets ---------- */

  const BUCKET_MS = 5000;
  const BUCKET_COUNT = 61;

  const end = Math.floor(Date.now() / BUCKET_MS) * BUCKET_MS;

  const start =
    end - (BUCKET_COUNT - 1) * BUCKET_MS;

  const buckets = Array.from(
    { length: BUCKET_COUNT },
    (_, index) => ({
      timestamp: start + index * BUCKET_MS,
      events: 0,
      failures: 0
    })
  );

  /*
   * Put each real event into its corresponding time bucket.
   *
   * Empty intervals stay at zero.
   * No artificial fluctuations are generated.
   */

  for (const record of records) {
    if (
      record.timestamp < start ||
      record.timestamp >= end + BUCKET_MS
    ) {
      continue;
    }

    const index = Math.floor(
      (record.timestamp - start) / BUCKET_MS
    );

    if (index < 0 || index >= BUCKET_COUNT) {
      continue;
    }

    buckets[index].events += record.events;
    buckets[index].failures += record.failures;
  }

  /* ---------- Update summary counters ---------- */

  const totalEvents = records.reduce(
    (sum, record) => sum + record.events,
    0
  );

  const totalFailures = records.reduce(
    (sum, record) => sum + record.failures,
    0
  );

  const totalAnomalies = records.filter(
    record => isAnomaly(record.type)
  ).length;

  if (eventsCounter) {
    eventsCounter.textContent = String(totalEvents);
  }

  if (failuresCounter) {
    failuresCounter.textContent = String(totalFailures);
  }

  if (anomaliesCounter) {
    anomaliesCounter.textContent = String(totalAnomalies);
  }

  /* ---------- Seed the ORIGINAL graph ---------- */

  if (
    window.SecTimeline &&
    typeof window.SecTimeline.seedBuckets === 'function' &&
    records.length > 0
  ) {
    window.SecTimeline.seedBuckets(buckets);
  }

  /* ---------- Update connection status ---------- */

  if (status) {
    status.textContent = records.length > 0
      ? `Live · ${source.replace('_', ' ')}`
      : 'Waiting for timestamped telemetry';
  }

  if (updated) {
    updated.textContent = records.length > 0
      ? `Updated ${new Date().toLocaleTimeString()} · 5s buckets`
      : 'Waiting for data';
  }

  /* ---------- Diagnostics ---------- */

  console.log('[Sentinal] Real security timeline:', {
    source,
    timestampedRecords: records.length,
    totalEvents,
    totalFailedLogins: totalFailures,
    totalAnomalies,
    bucketsWithEvents: buckets.filter(
      bucket => bucket.events > 0
    ).length,
    latestEvent: records.length
      ? new Date(
          records[records.length - 1].timestamp
        ).toISOString()
      : null
  });
}
render();

requestAnimationFrame(() => {
  if (typeof refineSentinalTimelineLayout === 'function') refineSentinalTimelineLayout();
  updateSentinalTimelineWave();
});

/* Fetch the latest security telemetry immediately. */
refreshSecurityTelemetry();

/* Refresh telemetry every five seconds. */
securityPollTimer = setInterval(
  () => {
    refreshSecurityTelemetry();
    updateSentinalTimelineWave();
  },
  5000
);

  /* Stop polling when navigating away. */
  window.addEventListener(
    'hashchange',
    () => {
      if (
        location.hash !== '#security' &&
        securityPollTimer
      ) {
        clearInterval(securityPollTimer);
        securityPollTimer = null;
      }
    },
    { once: true }
  );
};

PAGES.cybi = () => {
  mountShell('cybi');
  const app = $('#app');
  const wanted = new URLSearchParams((location.hash.split("?")[1]||"")).get('incident');
  /* Live incidents from /api/incidents (newest first). Nothing is pre-filled: empty until the backend reports. */
  let incidents = [];
  let loaded = false, loadError = null, lastSig = '', lastUpdate = null, aiProvider = 'checking…';
  let id = wanted || null, action = 'RECOMMENDED', focus = 'Observation';
  const auto = { investigate: true, report: false, notify: true, threshold: 80 };
  let automationProfile = null;
  try {
    const savedAutomation = JSON.parse(localStorage.getItem('sentinal-cybi-automation') || 'null');
    if (savedAutomation && typeof savedAutomation === 'object') {
      automationProfile = {
        name: String(savedAutomation.name || 'CYBI incident response'),
        enabled: savedAutomation.enabled !== false,
        investigate: savedAutomation.investigate !== false,
        notify: savedAutomation.notify === true,
        report: savedAutomation.report === true,
        threshold: Math.max(50, Math.min(95, Number(savedAutomation.threshold) || 80))
      };
      auto.investigate = automationProfile.enabled && automationProfile.investigate;
      auto.notify = automationProfile.enabled && automationProfile.notify;
      auto.report = automationProfile.enabled && automationProfile.report;
      auto.threshold = automationProfile.threshold;
    }
  } catch (error) { /* Keep the default in-memory settings when storage is unavailable. */ }
  if (automationProfile) syncCybiAutomationSettings(automationProfile);
  let cybiLiveSeries = [];
  let cybiLiveTimer = null;
  let composerOpener = null;
  let cybiGeneratedShareText = '';
  const chat = [{ who: 'cybi', text: 'Hello, I\'m CYBI. Ask me about the selected incident, its evidence, risk or recommended response.' }];

  const WAITING = m => `<div class="empty-state" style="padding:18px 16px;text-align:center">${esc(m)}</div>`;
  // CYBI: Format real backend timestamps in Indian Standard Time.
const utc = ms => {
    if (ms === null || ms === undefined || ms === '') return '—';

    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date);
};
  const tone = l => (l === 'HIGH' || l === 'CRITICAL') ? 'coral' : l === 'MEDIUM' ? 'amber' : l === 'LOW' ? 'mint' : 'silver';
  const normC = r => {
    const sc = Number(r.risk_score ?? r.risk?.score ?? r.risk_analysis?.risk_score);
    const risk = Number.isFinite(sc) ? Math.max(0, Math.min(100, Math.round(sc))) : null;
    const ms = Date.parse(r.detected_at || r.timestamp || r.created_at || '') || null;
    const cf = Number(r.confidence);
    const level = String(r.risk_level || '').toUpperCase() || (risk === null ? 'UNKNOWN' : risk >= 90 ? 'CRITICAL' : risk >= 70 ? 'HIGH' : risk >= 40 ? 'MEDIUM' : 'LOW');
    const ev = Number(r.attempt_count ?? r.events ?? r.event_count);
    return {
      id: String(r.incident_id || r.id || '—'), threat: String(r.threat || r.threat_type || 'Unclassified'),
      source: String(r.source_ip || r.ip || '—'), target: String(r.target || r.endpoint || '—'),
      app: String(r.application || r.source || 'Hanu AI'), username: r.username || '',
      risk, level, status: String(r.status || '—'), ms, time: utc(ms), detectedAt: r.detected_at || null,
      events: Number.isFinite(ev) ? ev : null,
      confidence: Number.isFinite(cf) ? Math.round(cf <= 1 ? cf * 100 : cf) : null,
      evidence: Array.isArray(r.evidence) ? r.evidence.map(String) : [],
      timeline: Array.isArray(r.timeline) ? r.timeline : [],
      analysis: String(r.analysis || ''), analyzedAt: r.analyzed_at || null
    };
  };
  const lastAnalysis = () => { const t = incidents.map(x => Date.parse(x.analyzedAt || '') || 0).sort((a, b) => b - a)[0]; return t ? new Date(t).toLocaleTimeString() : null; };
  const inc = () => incidents.find(i => i.id === id) || incidents[0] || null;
  const evidenceOf = i => i.evidence;
  const seriesFor = i => (i?.timeline || []).filter(t => Number.isFinite(Number(t.risk)) && Date.parse(t.time))
    .map(t => ({ time: utc(Date.parse(t.time)), risk: Math.max(0, Math.min(100, Number(t.risk))) }));
  const analysis = (i, t) => ({
    Observation: `${i.events ?? 'Unknown number of'} events originated from ${i.source}, targeting ${i.target} in ${i.app}. First flagged at ${i.time} UTC.`,
    Evidence: evidenceOf(i).length ? evidenceOf(i).join('. ') + '.' : 'No evidence has been recorded for this incident yet.',
    Assessment: `The correlated source, endpoint and short event window support a ${i.threat.toLowerCase()} assessment. Detection is rule-based on live telemetry; use "Ask CYBI" for AI analysis.`,
    Risk: `Risk is ${i.risk ?? 'unscored'}/100 (${i.level})${i.confidence !== null ? `, with ${i.confidence}% detection confidence` : ''}. Repeated behavior from one source increases severity.`,
    Recommendation: 'Investigate the source, review recent account activity and consider a temporary rate limit. Require human approval before changing access. No response has been executed.'
  })[t];

  const composerDefaultPrompt = i => `Prepare a professional incident analysis for ${i.id}. Include an executive summary, evidence, risk and potential impact, recommended next steps, and confidence. Clearly distinguish observed facts from assessment. Do not claim any response action was executed.`;
  const incidentPayload = i => ({
    id: i.id, threat: i.threat, application: i.app, source_ip: i.source,
    username: i.username || 'Unknown', target: i.target, risk_score: i.risk,
    risk_level: i.level, evidence: evidenceOf(i), attempt_count: i.events,
    confidence: i.confidence, status: i.status, detected_at: i.detectedAt
  });

  function composerMarkup() {
    const i = inc();
    const incidentSummary = i ? `${i.id} · ${i.threat} · risk ${i.risk ?? '—'}/100` : 'No incident selected';
    const summaryBody = (() => {
  if (!i) {
    return [
      "# CYBI Security Analysis Report",
      "",
      "## Analysis",
      "No incident is currently selected."
    ].join("\n");
  }

  const evidence = evidenceOf(i);

  return [
    "# CYBI Security Analysis Report",
    "",
    "## 1. Incident Overview",
    "",
    `- **Incident ID:** ${i.id ?? "Unavailable"}`,
    `- **Threat:** ${i.threat ?? "Unavailable"}`,
    `- **Application:** ${i.app ?? "Unavailable"}`,
    `- **Severity:** ${i.level ?? "Unavailable"}`,
    `- **Risk Score:** ${i.risk ?? "Unavailable"}/100`,
    `- **Source:** ${i.source ?? "Unavailable"}`,
    `- **Target:** ${i.target ?? "Unavailable"}`,
    `- **Status:** ${i.status ?? "Unavailable"}`,
    `- **Detection Time:** ${i.detectedAt ?? i.time ?? "Unavailable"}`,
    "",
    "## 2. Evidence",
    "",
    ...(Array.isArray(evidence) && evidence.length
      ? evidence.map(item =>
          `- ${typeof item === "string" ? item : JSON.stringify(item)}`
        )
      : ["- No evidence is available for this incident."]),
    "",
    "## 3. Risk Assessment",
    "",
    `- **Risk Score:** ${i.risk ?? "Unavailable"}/100`,
    `- **Confidence:** ${
      i.confidence == null ? "Unavailable" : `${i.confidence}%`
    }`,
    "",
    "## 4. Recommended Actions",
    "",
    "Review the incident evidence and verify the source and target before taking action.",
    "",
    "## 5. Conclusion",
    "",
    `Incident ${i.id ?? ""} is classified as ${
      i.level ?? "unclassified"
    }. Review the available evidence before deciding on a response.`
  ].join("\n");
})();
    const selected = tab => tab === 'analysis' ? 'true' : 'false';
    return `<div class="cybi-composer-backdrop" id="cybiComposer">
      <section class="cybi-composer" role="dialog" aria-modal="true" aria-labelledby="cybiComposerTitle" aria-describedby="cybiComposerDescription">
        <header class="cybi-composer-head">
          <div><span class="eyebrow">CYBI WORKSPACE · ${esc(i?.id || 'INCIDENT')}</span><h2 id="cybiComposerTitle">Generate an analyst response</h2><p id="cybiComposerDescription">Analyze the selected incident, configure an automation, or prepare a message.</p></div>
          <button class="btn btn-icon btn-ghost" type="button" data-composer-close aria-label="Close workspace">${icon('x')}</button>
        </header>
        <div class="cybi-composer-context"><span class="live-dot"></span><span>${esc(incidentSummary)}</span><span class="cybi-composer-context-status">LIVE INCIDENT CONTEXT</span></div>
        <nav class="cybi-composer-tabs" role="tablist" aria-label="CYBI actions">
          <button type="button" role="tab" id="cybiTabAnalysis" aria-controls="cybiPanelAnalysis" aria-selected="${selected('analysis')}" class="${selected('analysis') === 'true' ? 'selected' : ''}" data-composer-tab="analysis">${icon('brain', 14)}Analysis</button>
          <button type="button" role="tab" id="cybiTabAutomation" aria-controls="cybiPanelAutomation" aria-selected="false" data-composer-tab="automation">${icon('zap', 14)}Automation</button>
          <button type="button" role="tab" id="cybiTabEmail" aria-controls="cybiPanelEmail" aria-selected="false" data-composer-tab="email">${icon('send', 14)}Email</button>
          <button type="button" role="tab" id="cybiTabMessage" aria-controls="cybiPanelMessage" aria-selected="false" data-composer-tab="message">${icon('radio', 14)}Messaging</button>
        </nav>
        <div class="cybi-composer-content">
          <section class="cybi-composer-panel" id="cybiPanelAnalysis" role="tabpanel" aria-labelledby="cybiTabAnalysis" data-composer-panel="analysis">
            <div class="cybi-composer-intro"><span class="cybi-composer-icon">${icon('brain', 18)}</span><div><h3>Professional incident analysis</h3><p>Ask CYBI to produce a structured, evidence-led assessment using the selected incident.</p></div></div>
            <form id="cybiComposerAnalysisForm" class="cybi-composer-form">
              <label for="cybiComposerPrompt">Analysis instructions</label>
              <textarea id="cybiComposerPrompt" rows="5" required>${esc(composerDefaultPrompt(i || { id: 'the selected incident' }))}</textarea>
              <div class="cybi-composer-form-foot"><span class="muted">Analysis uses the configured CYBI provider.</span><button class="btn btn-secondary" type="submit">${icon('zap', 14)}Generate analysis</button></div>
            </form>
            <div id="cybiComposerAnalysisResult" class="cybi-composer-result" aria-live="polite" hidden></div>
          </section>
          <section class="cybi-composer-panel" id="cybiPanelAutomation" role="tabpanel" aria-labelledby="cybiTabAutomation" data-composer-panel="automation" hidden>
            <div class="cybi-composer-intro"><span class="cybi-composer-icon">${icon('zap', 18)}</span><div><h3>Incident automation</h3><p>Choose the CYBI actions to run as new incidents arrive and set the alert threshold.</p></div></div>
            <form id="cybiAutomationForm" class="cybi-composer-form">
              <label for="cybiAutomationName">Automation name</label>
              <input id="cybiAutomationName" name="name" maxlength="80" value="${esc(automationProfile?.name || 'CYBI incident response')}" required>
              <label for="cybiAutomationEmail">Notification email</label>
              <input id="cybiAutomationEmail" name="email" type="email" autocomplete="email" maxlength="254" value="${esc(automationProfile?.email || '')}" placeholder="you@example.com" aria-describedby="cybiAutomationEmailHelp">
              <small id="cybiAutomationEmailHelp" class="muted">CYBI sends generated incident reports to this address. Saved in Sentinal settings, not .env.</small>
              <label class="cybi-composer-check"><input type="checkbox" id="cybiAutomationEnabled" ${automationProfile && automationProfile.enabled !== false ? 'checked' : ''}><span><b>Enable this automation</b><small>Apply these settings to incoming incident updates.</small></span></label>
              <div class="cybi-composer-checks">
                <label class="cybi-composer-check"><input type="checkbox" id="cybiAutomationInvestigate" ${(automationProfile?.investigate ?? auto.investigate) ? 'checked' : ''}><span><b>Auto-investigate</b><small>Add an incident summary to analyst chat.</small></span></label>
                <label class="cybi-composer-check"><input type="checkbox" id="cybiAutomationNotify" ${(automationProfile?.notify ?? auto.notify) ? 'checked' : ''}><span><b>Alert on high risk</b><small>Raise a CYBI alert when risk meets the threshold.</small></span></label>
                <label class="cybi-composer-check"><input type="checkbox" id="cybiAutomationReport" ${(automationProfile?.report ?? auto.report) ? 'checked' : ''}><span><b>Prepare a report draft</b><small>Flag a report draft for high severity incidents.</small></span></label>
              </div>
              <label for="cybiAutomationThreshold">Alert threshold <span class="cybi-composer-threshold-value" id="cybiAutomationThresholdValue">${auto.threshold}</span></label>
              <input type="range" id="cybiAutomationThreshold" min="50" max="95" step="1" value="${auto.threshold}">
              <div class="cybi-composer-form-foot"><span id="cybiAutomationStatus" class="muted" aria-live="polite">${automationProfile ? `Saved: ${esc(automationProfile.name)}` : 'No custom automation saved yet.'}</span><div class="cybi-automation-actions" style="display:flex;align-items:center;justify-content:flex-end;gap:12px;flex-wrap:wrap"><button class="btn btn-secondary" id="cybiDeleteAutomation" type="button" ${automationProfile ? '' : 'hidden'} style="margin-right:4px;border-color:var(--coral,#ef4444);color:var(--coral,#ef4444)">${icon('x', 14)}Delete automation</button><button class="btn btn-secondary" type="submit">${icon('check', 14)}${automationProfile ? 'Save automation' : 'Create automation'}</button></div></div>
            </form>
          </section>
          <section class="cybi-composer-panel" id="cybiPanelEmail" role="tabpanel" aria-labelledby="cybiTabEmail" data-composer-panel="email" hidden>
            <div class="cybi-composer-intro"><span class="cybi-composer-icon">${icon('send', 18)}</span><div><h3>Prepare an incident email</h3><p>Send the incident summary or latest generated CYBI analysis to another email, with a PDF report attached automatically.</p></div></div>
            <form id="cybiEmailForm" class="cybi-composer-form">
              <label for="cybiEmailTo">To</label><input id="cybiEmailTo" type="email" autocomplete="email" placeholder="analyst@example.com" required>
              <label for="cybiEmailSubject">Subject</label><input id="cybiEmailSubject" value="${esc(i ? `CYBI incident ${i.id} · ${i.threat}` : 'CYBI incident update')}" required>
              <label for="cybiEmailBody">Message</label><textarea id="cybiEmailBody" rows="6" required>${esc(summaryBody)}</textarea>
              <div class="cybi-composer-form-foot"><span class="muted" id="cybiEmailStatus" aria-live="polite">Sends your message with an automatically generated CYBI PDF attached.</span><button class="btn btn-secondary" type="submit">${icon('send', 14)}Send PDF by email</button></div>
            </form>
          </section>
          <section class="cybi-composer-panel" id="cybiPanelMessage" role="tabpanel" aria-labelledby="cybiTabMessage" data-composer-panel="message" hidden>
            <div class="cybi-composer-intro"><span class="cybi-composer-icon">${icon('radio', 18)}</span><div><h3>Prepare an incident message</h3><p>Send the incident summary or latest generated CYBI analysis directly as an SMS.</p></div></div>
            <form id="cybiMessageForm" class="cybi-composer-form">
              <label for="cybiMessageTo">Phone number</label><input id="cybiMessageTo" type="tel" autocomplete="tel" placeholder="+1 555 010 1234" required>
              <label for="cybiMessageBody">Message</label><textarea id="cybiMessageBody" rows="7" maxlength="1200" required>${esc(summaryBody)}</textarea>
              <div class="cybi-composer-form-foot"><span class="muted" id="cybiMessageStatus" aria-live="polite">Sent directly by Sentinal using the configured SMS provider.</span><button class="btn btn-secondary" type="submit">${icon('send', 14)}Send SMS</button></div>
            </form>
          </section>
        </div>
      </section>
    </div>`;
  }

  function closeCybiComposer() {
    const modal = $('#cybiComposer');
    if (!modal) return;
    modal.remove();
    document.body.classList.remove('cybi-composer-open');
    document.removeEventListener('keydown', onComposerKeydown);
    if (composerOpener?.isConnected) composerOpener.focus();
    composerOpener = null;
  }

  function onComposerKeydown(e) {
    if (e.key === 'Escape') closeCybiComposer();
  }

  function openCybiComposer() {
    if ($('#cybiComposer')) return;
    composerOpener = document.activeElement;
    document.body.insertAdjacentHTML('beforeend', composerMarkup());
    const modal = $('#cybiComposer');
    document.body.classList.add('cybi-composer-open');
    modal.addEventListener('click', async e => {
      if (e.target === modal || e.target.closest('[data-composer-close]')) {
        closeCybiComposer();
        return;
      }
      const deleteAutomationButton = e.target.closest('#cybiDeleteAutomation');
      if (deleteAutomationButton) {
        if (!window.confirm('Delete the saved CYBI automation? This will disable it and clear its saved recipient email.')) return;
        deleteAutomationButton.disabled = true;
        const status = $('#cybiAutomationStatus', modal);
        if (status) status.textContent = 'Deleting automation…';
        try {
          const response = await fetch('/api/cybi/automation-settings', { method: 'DELETE', headers: { 'Accept': 'application/json' } });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || data.status !== 'success') throw new Error(data.detail || 'Could not delete automation');
          automationProfile = null;
          auto.investigate = false; auto.notify = false; auto.report = false; auto.threshold = 80;
          try { localStorage.removeItem('sentinal-cybi-automation'); } catch (_) {}
          $('#cybiAutomationName', modal).value = 'CYBI incident response';
          $('#cybiAutomationEmail', modal).value = '';
          $('#cybiAutomationEnabled', modal).checked = false;
          $('#cybiAutomationInvestigate', modal).checked = false;
          $('#cybiAutomationNotify', modal).checked = false;
          $('#cybiAutomationReport', modal).checked = false;
          $('#cybiAutomationThreshold', modal).value = '80';
          $('#cybiAutomationThresholdValue', modal).textContent = '80';
          deleteAutomationButton.hidden = true;
          const submit = $('#cybiAutomationForm', modal)?.querySelector('[type="submit"]');
          if (submit) submit.innerHTML = `${icon('check', 14)}Create automation`;
          if (status) status.textContent = 'Automation deleted and disabled.';
          $$('[data-auto]').forEach(toggleEl => { toggleEl.checked = false; });
          const state = $('#autoState'); if (state && inc()) state.innerHTML = autoState(inc());
        } catch (error) {
          if (status) status.textContent = `Delete failed: ${error.message}`;
          deleteAutomationButton.disabled = false;
        }
        return;
      }
      const tab = e.target.closest('[data-composer-tab]');
      if (tab) {
        $$('[data-composer-tab]', modal).forEach(button => {
          const active = button === tab;
          button.classList.toggle('selected', active);
          button.setAttribute('aria-selected', String(active));
        });
        $$('[data-composer-panel]', modal).forEach(panelEl => {
          panelEl.hidden = panelEl.dataset.composerPanel !== tab.dataset.composerTab;
        });
      }
    });
    modal.addEventListener('input', e => {
      if (e.target.id === 'cybiAutomationThreshold') $('#cybiAutomationThresholdValue', modal).textContent = e.target.value;
    });
    modal.addEventListener('submit', async e => {
      e.preventDefault();
      const form = e.target;
      if (form.id === 'cybiComposerAnalysisForm') {
        const incident = inc();
        if (!incident) return;
        const button = form.querySelector('[type="submit"]');
        const result = $('#cybiComposerAnalysisResult', modal);
        const question = $('#cybiComposerPrompt', modal).value.trim();
        if (!question) return;
        button.disabled = true;
        button.textContent = 'Analyzing…';
        result.hidden = false;
        result.innerHTML = '<div class="cybi-composer-loading"><span class="live-dot"></span>CYBI is preparing the professional analysis…</div>';
        try {
          const response = await fetch('/api/cybi/analyze', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ incident: incidentPayload(incident), question })
          });
          let data;
          try { data = await response.json(); } catch { throw new Error(`Server returned an invalid response (HTTP ${response.status}).`); }
          if (!response.ok) throw new Error(data.detail || data.error || `Request failed (HTTP ${response.status}).`);
          if (data.status !== 'success' || !data.analysis) throw new Error(data.detail || data.error || 'CYBI returned no analysis.');
          if (data.provider) {
            aiProvider = data.provider === 'anthropic' ? 'Claude (Anthropic)' : 'Local rule engine';
            const provider = $('#aiProv');
            if (provider) provider.textContent = aiProvider;
          }
          // Render the original analysis in the CYBI analysis panel.
const analysisText = String(data.analysis).trim();

result.innerHTML = `
  <div class="cybi-composer-result-head">
    <span class="eyebrow">PROFESSIONAL ANALYSIS</span>
    <span>${esc(incident.id)}</span>
  </div>
  <div class="cybi-markdown">
    ${renderMarkdown(analysisText)}
  </div>
`;

// Convert Markdown tables into readable text for the editable message box.
function markdownToReadableText(markdown) {
  return markdown
    .replace(/\r\n/g, "\n")

    // Remove Markdown table separator rows.
    .replace(
      /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/gm,
      ""
    )

    // Convert table rows into readable lines.
    .replace(/^\s*\|(.+)\|\s*$/gm, (_, row) => {
      const cells = row.split("|").map(cell => cell.trim());
      return cells.filter(Boolean).join(" — ");
    })

    // Remove Markdown bold, italic, and inline-code markers.
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")

    .trim();
}

// Preserve the complete generated analysis and incident context.
cybiGeneratedShareText = [
  "# CYBI SECURITY INCIDENT ANALYSIS",
  "",
  `**Incident:** ${incident.id}`,
  `**Threat:** ${incident.threat}`,
  `**Risk:** ${incident.risk ?? "Unknown"}/100 (${incident.level ?? "Unknown"})`,
  `**Source:** ${incident.source ?? "Unknown"}`,
  `**Target:** ${incident.target ?? "Unknown"}`,
  `**Application:** ${incident.app ?? "Unknown"}`,
  "",
  "## Generated Analysis",
  "",
  markdownToReadableText(analysisText)
].join("\n");

// Populate the email box with the complete analysis.
const emailBody = $("#cybiEmailBody", modal);
if (emailBody) {
  emailBody.value = cybiGeneratedShareText;
}

// Keep SMS length limited as before.
const messageBody = $("#cybiMessageBody", modal);
if (messageBody) {
  messageBody.value = cybiGeneratedShareText.slice(0, 1200);
}
        } catch (error) {
          result.innerHTML = `<p class="cybi-composer-error">Unable to generate analysis: ${esc(error.message || 'Unknown error')}</p>`;
        } finally {
          button.disabled = false;
          button.innerHTML = `${icon('zap', 14)}Generate analysis`;
        }
      } else if (form.id === 'cybiAutomationForm') {
        const enabled = $('#cybiAutomationEnabled', modal).checked;
        const threshold = Math.max(50, Math.min(95, Number($('#cybiAutomationThreshold', modal).value) || 80));
        automationProfile = {
          name: $('#cybiAutomationName', modal).value.trim() || 'CYBI incident response',
          email: $('#cybiAutomationEmail', modal).value.trim(),
          enabled,
          investigate: $('#cybiAutomationInvestigate', modal).checked,
          notify: $('#cybiAutomationNotify', modal).checked,
          report: $('#cybiAutomationReport', modal).checked,
          threshold
        };
        auto.investigate = enabled && automationProfile.investigate;
        auto.notify = enabled && automationProfile.notify;
        auto.report = enabled && automationProfile.report;
        auto.threshold = threshold;
        try {
          localStorage.setItem('sentinal-cybi-automation', JSON.stringify(automationProfile));
          $('#cybiAutomationStatus', modal).textContent = 'Saving settings to Sentinal backend…';
          syncCybiAutomationSettings(automationProfile).then(ok => {
            const status = $('#cybiAutomationStatus', modal);
            if (status) status.textContent = ok
              ? `Automation saved to backend${enabled ? ' and enabled' : ' as disabled'}.`
              : 'Saved in this browser only; backend sync failed.';
          });
        } catch (error) {
          $('#cybiAutomationStatus', modal).textContent = 'Automation is active for this session; browser storage is unavailable.';
        }
        $$('[data-auto]').forEach(toggleEl => { toggleEl.checked = auto[toggleEl.dataset.auto]; });
        const slider = $('#thSlider'), thresholdValue = $('#thVal');
        if (slider) slider.value = threshold;
        if (thresholdValue) thresholdValue.textContent = threshold;
        Charts.els.forEach(el => {
          if (el.isConnected && el._o?.series?.[0]?.key === 'risk') {
            el._o.threshold = threshold;
            drawChart(el);
          }
        });
        const state = $('#autoState');
        if (state && inc()) state.innerHTML = autoState(inc());
      } else if (form.id === 'cybiEmailForm') {
        const to = $('#cybiEmailTo', modal).value.trim();
        const subject = $('#cybiEmailSubject', modal).value.trim();
        const body = $('#cybiEmailBody', modal).value.trim();
        const button = form.querySelector('[type="submit"]');
        const status = $('#cybiEmailStatus', modal);
        button.disabled = true; button.textContent = 'Sending…';
        if (status) status.textContent = 'Sending email…';
        try {
          const response = await fetch('/api/cybi/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channel: 'email', to, subject, body }) });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || data.status !== 'success') throw new Error(data.detail || data.message || `Request failed (HTTP ${response.status})`);
          if (status) status.textContent = `✓ ${data.message} To: ${to}`;
        } catch (error) { if (status) status.textContent = `Send failed: ${error.message}`; }
        finally { button.disabled = false; button.innerHTML = `${icon('send', 14)}Send PDF by email`; }
      } else if (form.id === 'cybiMessageForm') {
        const to = $('#cybiMessageTo', modal).value.trim();
        const body = $('#cybiMessageBody', modal).value.trim();
        const phone = to.replace(/[^\d+]/g, '');
        const button = form.querySelector('[type="submit"]');
        const status = $('#cybiMessageStatus', modal);
        button.disabled = true; button.textContent = 'Sending…';
        if (status) status.textContent = 'Sending SMS…';
        try {
          const response = await fetch('/api/cybi/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channel: 'sms', to: phone, body }) });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || data.status !== 'success') throw new Error(data.detail || data.message || `Request failed (HTTP ${response.status})`);
          if (status) status.textContent = `✓ ${data.message} To: ${phone}`;
        } catch (error) { if (status) status.textContent = `Send failed: ${error.message}`; }
        finally { button.disabled = false; button.innerHTML = `${icon('send', 14)}Send SMS`; }
      }
    });
    document.addEventListener('keydown', onComposerKeydown);
    $('#cybiComposerPrompt', modal).focus();
  }

  /* ----- CYBI AI chat connected to the Sentinal backend ----- */
/* ----- CYBI Markdown Chat Renderer ----- */

/* =========================================================
   CYBI PROFESSIONAL MARKDOWN RENDERER
   Sentinal AI — Cybersecurity Analyst Chat
========================================================= */

function renderMarkdown(text) {
  let html = String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const codeBlocks = [];
  const tables = [];

  /* Preserve fenced code blocks */
  html = html.replace(
    /```([\w+-]*)\n?([\s\S]*?)```/g,
    (_, language, code) => {
      const index = codeBlocks.length;
      const lang = language || 'code';

      codeBlocks.push(`
        <div class="cybi-code-card">
          <div class="cybi-code-header">
            <span>${lang}</span>
            <span class="cybi-code-label">CODE</span>
          </div>
          <pre class="cybi-code"><code>${code.trimEnd()}</code></pre>
        </div>
      `);

      return `\n%%CYBI_CODE_${index}%%\n`;
    }
  );

  /* Inline code */
  html = html.replace(
    /`([^`\n]+)`/g,
    '<code class="cybi-inline-code">$1</code>'
  );

  /* Markdown tables */
  html = html.replace(
    /(?:^|\n)((?:\|[^\n]*\|[ \t]*\n?)+)/g,
    (match, tableText) => {
      const lines = tableText.trim().split('\n').filter(Boolean);

      if (lines.length < 2) return match;

      const parseRow = line =>
        line.trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map(cell => cell.trim());

      const isSeparator = line =>
        /^\|?[\s:|-]+\|?$/.test(line) &&
        line.includes('-');

      if (!isSeparator(lines[1])) return match;

      const headers = parseRow(lines[0]);
      const rows = lines.slice(2).map(parseRow);
      const index = tables.length;

      const headerHTML = headers.map(cell =>
        `<th>${cell}</th>`
      ).join('');

      const rowsHTML = rows.map(row => `
        <tr>
          ${headers.map((_, i) =>
            `<td>${row[i] || '—'}</td>`
          ).join('')}
        </tr>
      `).join('');

      tables.push(`
        <div class="cybi-table-wrap">
          <table class="cybi-table">
            <thead><tr>${headerHTML}</tr></thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </div>
      `);

      return `\n%%CYBI_TABLE_${index}%%\n`;
    }
  );

  /* Headings */
  html = html.replace(
    /^### (.+)$/gm,
    '<h4 class="cybi-h4">$1</h4>'
  );

  html = html.replace(
    /^## (.+)$/gm,
    '<h3 class="cybi-h3">$1</h3>'
  );

  html = html.replace(
    /^# (.+)$/gm,
    '<h2 class="cybi-h2">$1</h2>'
  );

  /* Bold and italic */
  html = html.replace(
    /\*\*(.+?)\*\*/g,
    '<strong>$1</strong>'
  );

  html = html.replace(
    /(^|[^*])\*([^*\n]+)\*/g,
    '$1<em>$2</em>'
  );

  /* Blockquotes */
  html = html.replace(
    /^&gt; (.+)$/gm,
    '<blockquote class="cybi-quote">$1</blockquote>'
  );

  /* Horizontal separators */
  html = html.replace(
    /^---+$/gm,
    '<hr class="cybi-divider">'
  );

  /* Lists */
  html = html.replace(
    /^(?:[-*]|\d+\.) (.+)$/gm,
    '<li>$1</li>'
  );

  /* Group consecutive list items */
  html = html.replace(
    /(?:<li>.*<\/li>\n?)+/g,
    match => `<ul class="cybi-list">${match}</ul>`
  );

  /* Paragraph formatting */
  html = html
    .split(/\n{2,}/)
    .map(block => {
      block = block.trim();

      if (!block) return '';

      if (
        /^<(h[1-6]|ul|ol|li|pre|div|blockquote|hr)/i.test(block) ||
        /^%%CYBI_(?:CODE|TABLE)_\d+%%$/.test(block)
      ) {
        return block;
      }

      return `<p class="cybi-paragraph">${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');

  /* Restore code blocks and tables */
  html = html.replace(
    /%%CYBI_CODE_(\d+)%%/g,
    (_, index) => codeBlocks[Number(index)] || ''
  );

  html = html.replace(
    /%%CYBI_TABLE_(\d+)%%/g,
    (_, index) => tables[Number(index)] || ''
  );

  /* Highlight common security severity labels */
  html = html.replace(
    /\b(CRITICAL)\b/gi,
    '<span class="cybi-badge cybi-critical">$1</span>'
  );

  html = html.replace(
    /\b(HIGH)\b/gi,
    '<span class="cybi-badge cybi-high">$1</span>'
  );

  html = html.replace(
    /\b(MEDIUM)\b/gi,
    '<span class="cybi-badge cybi-medium">$1</span>'
  );

  html = html.replace(
    /\b(LOW)\b/gi,
    '<span class="cybi-badge cybi-low">$1</span>'
  );

  return html;
}

/* =========================================================
   CYBI CHAT LOG
========================================================= */

const chatLog = () =>
  chat.map(m => `
    <div class="msg ${m.who}">
      <span class="av">
        ${m.who === 'cybi' ? icon('brain', 13) : 'AK'}
      </span>

      <div class="chat-message-content">
        <small class="msg-who">${m.who === 'cybi' ? 'CYBI' : 'You'}</small>
        ${
          m.who === 'cybi'
            ? renderMarkdown(m.text)
            : `<p>${esc(m.text)}</p>`
        }
      </div>
    </div>
  `).join('');
  
  chat.map(m => `
    <div class="msg ${m.who}">
      <span class="av">
        ${m.who === 'cybi' ? icon('brain', 13) : 'AK'}
      </span>
      <div class="chat-message-content">
        ${
          m.who === 'cybi'
            ? renderMarkdown(m.text)
            : `<p>${esc(m.text)}</p>`
        }
      </div>
    </div>
  `).join('');
function pushChat(who, text) {
  chat.push({ who, text });

  const log = $('#chatLog');
  if (log) {
    log.innerHTML = chatLog();
    log.scrollTop = log.scrollHeight;
  }
}

async function ask(q) {
  q = q.trim();
  if (!q) return;

  pushChat('user', q);

  const selectedIncident = inc();
  if (!selectedIncident) { pushChat('cybi', 'No incident is available yet. Waiting for telemetry from the backend.'); return; }

  const incident = {
    id: selectedIncident.id,
    threat: selectedIncident.threat,
    application: selectedIncident.app,
    source_ip: selectedIncident.source,
    username: selectedIncident.username || 'Unknown',
    target: selectedIncident.target,
    risk_score: selectedIncident.risk,
    risk_level: selectedIncident.level,
    evidence: evidenceOf(selectedIncident),
    attempt_count: selectedIncident.events,
    confidence: selectedIncident.confidence,
    status: selectedIncident.status,
    detected_at: selectedIncident.detectedAt
  };

  const loadingText = 'Cybi is analyzing your question...';

  const loadingMessage = {
    who: 'cybi',
    text: loadingText,
    requestId: `${Date.now()}-${Math.random()}`
  };

  chat.push(loadingMessage);

  const refreshChat = () => {
    const log = $('#chatLog');

    if (log) {
      log.innerHTML = chatLog();
      log.scrollTop = log.scrollHeight;
    }
  };

  refreshChat();

  try {
    const response = await fetch('/api/cybi/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        incident: incident,
        question: q
      })
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        `Server returned an invalid response (HTTP ${response.status}).`
      );
    }

    if (!response.ok) {
      throw new Error(
        data.detail ||
        data.error ||
        `Request failed (HTTP ${response.status}).`
      );
    }

    if (data.status !== 'success' || !data.analysis) {
      throw new Error(
        data.detail ||
        data.error ||
        'Cybi returned no analysis.'
      );
    }

    const index = chat.indexOf(loadingMessage);

    if (index !== -1) {
      chat.splice(index, 1);
    }

    if (data.provider) { aiProvider = data.provider === 'anthropic' ? 'Claude (Anthropic)' : 'Local rule engine'; const pe = $('#aiProv'); if (pe) pe.textContent = aiProvider; }
    pushChat('cybi', String(data.analysis));

  } catch (error) {
    const index = chat.indexOf(loadingMessage);

    if (index !== -1) {
      chat.splice(index, 1);
    }

    pushChat(
      'cybi',
      `Unable to connect to Cybi AI: ${error.message}`
    );
  }
}

const toggle = (k, label, sub) =>
  `<label class="tgl"><span><b>${label}</b><small>${sub}</small></span><input type="checkbox" role="switch" data-auto="${k}" ${auto[k] ? 'checked' : ''}><i></i></label>`;

function renderEmpty() { render(); }

let cyAnimId = null;

/* ---------- CYBI analysis panels (CYBI page only) ---------- */
const CY_CSS = `<style>
  .cy-auto{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:14px 28px;padding:2px 20px 16px;align-items:start}
  .cy-steps{grid-column:1 / -1;display:grid;grid-template-columns:auto 1fr auto 1fr auto 1fr auto;align-items:center;gap:0 10px;padding:4px 0 12px;border-bottom:1px solid var(--chart-grid)}
  .cy-step{display:flex;align-items:center;gap:9px;min-width:0}
  .cy-step i{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:600 10px var(--font-mono);font-style:normal;border:1px solid var(--chart-grid);color:var(--muted-foreground);background:color-mix(in oklab,var(--foreground) 4%,transparent)}
  .cy-step.done i{border-color:var(--cyan);color:var(--cyan);background:color-mix(in oklab,var(--cyan) 14%,transparent)}
  .cy-step.active i{border-color:var(--amber);color:var(--amber);animation:cyPulse 1.8s ease-in-out infinite}
  .cy-step b{display:block;font:600 11px var(--font-mono);letter-spacing:.06em;color:var(--foreground);white-space:nowrap}
  .cy-step small{display:block;font:500 9px var(--font-mono);letter-spacing:.08em;color:var(--muted-foreground);white-space:nowrap;text-transform:uppercase;margin-top:1px}
  .cy-line{height:2px;border-radius:2px;background:var(--chart-grid);position:relative;overflow:hidden}
  .cy-line::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--cyan),var(--mint));transform-origin:left;transform:scaleX(0)}
  .cy-line.done::after{transform:scaleX(1)}
  .cy-anim .cy-line.done::after{animation:cyGrow .8s ease-out both}
  .cy-report{min-width:0;font-size:13px;line-height:1.7;color:color-mix(in oklab,var(--foreground) 86%,transparent)}
  .cy-report .cybi-h2,.cy-report .cybi-h3,.cy-report .cybi-h4{font-weight:600;letter-spacing:-.005em;color:var(--foreground);margin:16px 0 6px;line-height:1.3}
  .cy-report>:first-child{margin-top:0}
  .cy-report .cybi-h2{font-size:17px}.cy-report .cybi-h3{font-size:15px}
  .cy-report .cybi-h4{font-size:11px;font-family:var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--cyan)}
  .cy-report .cybi-paragraph{margin:0 0 10px}
  .cy-report strong{color:var(--foreground);font-weight:600}
  .cy-report .cybi-list{margin:0 0 10px;padding:0;list-style:none;display:grid;gap:5px}
  .cy-report .cybi-list li{position:relative;padding-left:18px}
  .cy-report .cybi-list li::before{content:"";position:absolute;left:3px;top:.72em;width:5px;height:5px;border-radius:50%;background:var(--cyan)}
  .cy-report .cybi-quote{margin:0 0 10px;padding:6px 12px;border-left:2px solid var(--cyan);background:color-mix(in oklab,var(--cyan) 6%,transparent);border-radius:0 8px 8px 0}
  .cy-report .cybi-inline-code{font:500 11.5px var(--font-mono);padding:1px 6px;border-radius:5px;background:color-mix(in oklab,var(--foreground) 8%,transparent)}
  .cy-report .cybi-table{width:100%;border-collapse:collapse;font-size:12px}
  .cy-report .cybi-table th{font:600 9px var(--font-mono);letter-spacing:.1em;text-transform:uppercase;text-align:left;padding:6px 10px;color:var(--muted-foreground);border-bottom:1px solid var(--chart-grid)}
  .cy-report .cybi-table td{padding:6px 10px;border-bottom:1px solid color-mix(in oklab,var(--chart-grid) 60%,transparent)}
  .cy-skel{display:grid;gap:9px;margin:2px 0 12px}
  .cy-skel span{display:block;height:9px;border-radius:6px;background:linear-gradient(90deg,var(--chart-grid) 20%,color-mix(in oklab,var(--cyan) 35%,var(--chart-grid)) 50%,var(--chart-grid) 80%);background-size:200% 100%;animation:cyShimmer 1.6s linear infinite}
  .cy-note{display:inline-flex;align-items:center;gap:8px;font:600 10px var(--font-mono);letter-spacing:.12em;color:var(--amber);margin-bottom:10px}
  .cy-note::before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor;animation:cyPulse 1.6s ease-in-out infinite}
  .cy-interim{margin:0;font-size:13px;line-height:1.7}
  .cy-interim small{display:block;font:500 9px var(--font-mono);letter-spacing:.12em;color:var(--muted-foreground);margin-bottom:4px}
  .cy-snap{display:grid;gap:12px;min-width:0;padding-left:24px;border-left:1px solid var(--chart-grid)}
  .cy-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
  .cy-kpi{min-width:0}
  .cy-kpi span{display:block;font:500 9px var(--font-mono);letter-spacing:.12em;color:var(--muted-foreground);text-transform:uppercase}
  .cy-kpi b{display:block;font:600 19px var(--font-mono);line-height:1.15;font-variant-numeric:tabular-nums;margin-top:2px;white-space:nowrap}
  .cy-kpi b small{font-size:10px;margin-left:2px;color:var(--muted-foreground)}
  .cy-plot-head{display:flex;justify-content:space-between;gap:8px;font:500 9px var(--font-mono);letter-spacing:.12em;color:var(--muted-foreground);margin-bottom:6px}
  .cy-plot-head b{font-weight:500;color:var(--foreground)}
  .cy-plot{position:relative;height:64px}
  .cy-plot svg{display:block;width:100%;height:64px;overflow:visible}
  .cy-plot .cy-dot{position:absolute;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;animation:cyPulse 2.2s ease-in-out infinite}
  .cy-empty-plot{display:flex;align-items:center;justify-content:center;height:64px;border:1px dashed var(--chart-grid);border-radius:8px;font:500 10px var(--font-mono);letter-spacing:.08em;color:var(--muted-foreground);text-align:center;padding:0 10px}
  .cy-line-path{stroke-dasharray:1;stroke-dashoffset:0}
  .cy-anim .cy-line-path{stroke-dashoffset:1;animation:cyDraw 1.1s ease-out .15s forwards}
  /* tabs panel */
  .cy-tabs-body{padding:0 20px 16px}
  .cy-tab{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:14px 28px;align-items:start;padding-top:14px}
  .cy-tab-text{display:flex;gap:12px;min-width:0}
  .cy-tab-text>span{flex:none;margin-top:2px}
  .cy-tab-text h3{margin:0 0 6px;font-size:17px;font-weight:600;letter-spacing:-.005em;line-height:1.25}
  .cy-tab-text p{margin:0;font-size:13px;line-height:1.7;color:color-mix(in oklab,var(--foreground) 86%,transparent)}
  .cy-vis{display:grid;gap:12px;min-width:0;padding-left:24px;border-left:1px solid var(--chart-grid)}
  .cy-anim .cy-vis>*,.cy-anim .cy-rows li{animation:cyRise .5s ease-out both}
  .cy-anim .cy-vis>*:nth-child(2){animation-delay:.08s}.cy-anim .cy-vis>*:nth-child(3){animation-delay:.16s}
  .cy-rows{list-style:none;margin:0;padding:0;display:grid;gap:6px}
  .cy-rows li{display:flex;align-items:flex-start;gap:9px;min-width:0;padding:6px 10px;border:1px solid var(--chart-grid);border-radius:8px;background:color-mix(in oklab,var(--foreground) 3%,transparent);font-size:12px;line-height:1.45}
  .cy-rows li b{flex:none;font:600 10px var(--font-mono);color:var(--cyan);letter-spacing:.06em;padding-top:2px}
  .cy-rows li span{min-width:0;overflow-wrap:anywhere}
  .cy-rows .cy-empty{color:var(--muted-foreground);justify-content:center}
  .cy-anim .cy-rows li:nth-child(2){animation-delay:.07s}.cy-anim .cy-rows li:nth-child(3){animation-delay:.14s}.cy-anim .cy-rows li:nth-child(4){animation-delay:.21s}.cy-anim .cy-rows li:nth-child(5){animation-delay:.28s}.cy-anim .cy-rows li:nth-child(6){animation-delay:.35s}
  .cy-tags{display:flex;flex-wrap:wrap;gap:6px}
  .cy-tag{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:99px;border:1px solid color-mix(in oklab,currentColor 40%,transparent);background:color-mix(in oklab,currentColor 10%,transparent);font:600 10px var(--font-mono);letter-spacing:.1em;text-transform:uppercase}
  .cy-meter{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;font:500 10px var(--font-mono);letter-spacing:.1em;color:var(--muted-foreground)}
  .cy-meter div{height:6px;border-radius:99px;background:var(--chart-grid);overflow:hidden}
  .cy-meter div i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--cyan),var(--mint));transform-origin:left}
  .cy-anim .cy-meter div i{animation:cyGrow .9s ease-out both}
  .cy-meter b{font:600 13px var(--font-mono);color:var(--foreground)}
  .cy-gauge{position:relative;height:30px;display:flex;align-items:center}
  .cy-gauge-bar{width:100%;height:8px;border-radius:99px;background:linear-gradient(90deg,#5ed6a0 0 30%,#f2d45c 30% 50%,#f59e42 50% 75%,#ef5350 75% 100%);opacity:.85}
  .cy-gauge-mark{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:2px solid var(--background,#0b1a1e);animation:cyPulse 2.2s ease-in-out infinite}
  .cy-gauge-th{position:absolute;top:2px;bottom:2px;width:0;border-left:2px dashed var(--coral)}
  .cy-gauge-th em{position:absolute;top:-12px;left:4px;font:500 8px var(--font-mono);letter-spacing:.1em;color:var(--coral);font-style:normal;white-space:nowrap}
  .cy-steps-list{list-style:none;margin:0;padding:0;display:grid;gap:6px;counter-reset:cys}
  .cy-steps-list li{counter-increment:cys;display:flex;gap:10px;align-items:flex-start;padding:7px 10px;border:1px solid var(--chart-grid);border-radius:8px;font-size:12px;line-height:1.5;background:color-mix(in oklab,var(--foreground) 3%,transparent);animation:cyRise .5s ease-out both}
  .cy-steps-list li::before{content:counter(cys);flex:none;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font:600 10px var(--font-mono);color:var(--cyan);border:1px solid var(--cyan);margin-top:1px}
  .cy-steps-list li:nth-child(2){animation-delay:.08s}.cy-steps-list li:nth-child(3){animation-delay:.16s}.cy-steps-list li:nth-child(4){animation-delay:.24s}
  .cy-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 24px;margin:16px 0 0;padding:14px 0 0;border-top:1px solid var(--chart-grid)}
  .cy-facts div{min-width:0}
  .cy-facts dt{font:500 9px var(--font-mono);letter-spacing:.12em;color:var(--muted-foreground);text-transform:uppercase;margin:0 0 3px}
  .cy-facts dd{margin:0;font:600 13px var(--font-mono);color:var(--foreground);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .cy-tab-text p mark,.cy-tab-text p .hl{background:none;color:var(--cyan);font:600 12.5px var(--font-mono);padding:1px 6px;border-radius:5px;border:1px solid color-mix(in oklab,var(--cyan) 28%,transparent);background:color-mix(in oklab,var(--cyan) 8%,transparent);white-space:nowrap}
  .cy-tab-text p .hl.warn{color:var(--amber);border-color:color-mix(in oklab,var(--amber) 30%,transparent);background:color-mix(in oklab,var(--amber) 8%,transparent)}
  .cy-bars{display:grid;gap:7px}
  .cy-bar{display:grid;grid-template-columns:78px minmax(0,1fr) 34px;gap:10px;align-items:center;font:500 10px var(--font-mono);letter-spacing:.06em;color:var(--muted-foreground)}
  .cy-bar span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .cy-bar div{height:8px;border-radius:99px;background:var(--chart-grid);overflow:hidden}
  .cy-bar div i{display:block;height:100%;border-radius:99px;background:color-mix(in oklab,var(--cyan) 55%,transparent);transform-origin:left}
  .cy-anim .cy-bar div i{animation:cyGrow .9s ease-out both}
  .cy-bar b{text-align:right;font:600 12px var(--font-mono);color:var(--foreground);font-variant-numeric:tabular-nums}
  .cy-bar.is-cur span{color:var(--foreground)}
  .cy-bar.is-cur div i{background:linear-gradient(90deg,var(--cyan),var(--mint))}
  .cy-sec-title{display:flex;justify-content:space-between;gap:8px;font:500 9px var(--font-mono);letter-spacing:.12em;color:var(--muted-foreground);margin-bottom:8px;text-transform:uppercase}
  .cy-sec-title b{font-weight:500;color:var(--foreground)}
  @keyframes cyDraw{to{stroke-dashoffset:0}}
  @keyframes cyGrow{from{transform:scaleX(0)}}
  @keyframes cyRise{from{opacity:0;transform:translateY(6px)}}
  @keyframes cyShimmer{to{background-position:-200% 0}}
  @keyframes cyPulse{50%{box-shadow:0 0 0 6px color-mix(in oklab,currentColor 0%,transparent)}0%,100%{box-shadow:0 0 0 3px color-mix(in oklab,currentColor 26%,transparent)}}
  @media(prefers-reduced-motion:reduce){.cy-anim *,.cy-skel span,.cy-step.active i,.cy-note::before,.cy-dot,.cy-gauge-mark{animation:none!important;stroke-dashoffset:0!important}}
  @media(max-width:900px){
    .cy-auto,.cy-tab{grid-template-columns:minmax(0,1fr)}
    .cy-snap,.cy-vis{padding-left:0;border-left:0;padding-top:12px;border-top:1px solid var(--chart-grid)}
    .cy-steps{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .cy-steps .cy-line{display:none}
  }
  @media(max-width:560px){.cy-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>`;

function cySpark(d, col) {
  if (!d || d.length < 2) return `<div class="cy-empty-plot">Timeline builds as more events arrive</div>`;
  const W = 320, H = 64, pad = 4;
  const y = v => H - pad - (Math.min(100, Math.max(0, v)) / 100) * (H - pad * 2);
  const x = k => pad + k * (W - pad * 2) / (d.length - 1);
  const gid = 'cyg' + Math.random().toString(36).slice(2, 7);
  const line = d.map((q, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)} ${y(q.risk).toFixed(1)}`).join(' ');
  const area = `${line} L${x(d.length - 1).toFixed(1)} ${H - pad} L${x(0).toFixed(1)} ${H - pad} Z`;
  const th = Number(auto && auto.threshold);
  const thLine = Number.isFinite(th) ? `<line x1="0" x2="${W}" y1="${y(th).toFixed(1)}" y2="${y(th).toFixed(1)}" stroke="var(--coral)" stroke-opacity=".55" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/>` : '';
  const grid = [25, 50, 75].map(v => `<line x1="0" x2="${W}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="var(--chart-grid)" stroke-dasharray="2 5" vector-effect="non-scaling-stroke"/>`).join('');
  return `<div class="cy-plot"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Risk score over time">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--${col})" stop-opacity=".32"/><stop offset="1" stop-color="var(--${col})" stop-opacity="0"/></linearGradient></defs>
      ${grid}${thLine}<path d="${area}" fill="url(#${gid})"/>
      <path class="cy-line-path" d="${line}" fill="none" stroke="var(--${col})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" pathLength="1"/>
    </svg><i class="cy-dot" style="left:${(x(d.length - 1) / W * 100).toFixed(2)}%;top:${(y(d[d.length - 1].risk) / H * 100).toFixed(1)}%;background:var(--${col});color:var(--${col})"></i></div>`;
}

function cyPlotHead(d) {
  return `<div class="cy-plot-head"><span>RISK TIMELINE</span><b>${d && d.length >= 2 ? esc(d[0].time + ' → ' + d[d.length - 1].time + ' UTC') : 'WAITING FOR DATA'}</b></div>`;
}

function autoAnalysisBody(i, ev, d, animate) {
  const col = tone(i.level);
  const has = !!i.analysis;
  const stages = [
    { n: 'Telemetry', v: i.events !== null ? i.events + ' events' : 'No count', done: i.events !== null },
    { n: 'Correlation', v: ev.length + ' signals', done: ev.length > 0 },
    { n: 'Risk scoring', v: i.risk !== null ? i.risk + ' / 100' : 'Unscored', done: i.risk !== null },
    { n: 'AI analysis', v: has ? 'Complete' : 'Running', done: has }
  ];
  const firstOpen = stages.findIndex(s => !s.done);
  const stepsHtml = stages.map((s, k) => {
    const cls = s.done ? 'done' : k === firstOpen ? 'active' : '';
    const node = `<div class="cy-step ${cls}"><i>${s.done ? '✓' : k + 1}</i><div><b>${esc(s.n)}</b><small>${esc(s.v)}</small></div></div>`;
    return k < stages.length - 1 ? node + `<div class="cy-line ${s.done ? 'done' : ''}"></div>` : node;
  }).join('');

  const left = has
    ? `<div class="cy-report">${renderMarkdown(i.analysis)}</div>`
    : `<div class="cy-report">
         <div class="cy-note">CYBI IS ANALYSING THIS INCIDENT</div>
         <div class="cy-skel"><span style="width:92%"></span><span style="width:78%"></span><span style="width:64%"></span></div>
         <p class="cy-interim"><small>INTERIM · RULE-BASED ASSESSMENT</small>${esc(analysis(i, 'Assessment'))}</p>
       </div>`;

  const conf = i.confidence;
  return `${CY_CSS}
    <div class="cy-auto ${animate ? 'cy-anim' : ''}">
      <div class="cy-steps">${stepsHtml}</div>
      ${left}
      <div class="cy-snap">
        <div class="cy-kpis">
          <div class="cy-kpi"><span>Events</span><b>${i.events ?? '—'}</b></div>
          <div class="cy-kpi"><span>Evidence</span><b>${ev.length}</b></div>
          <div class="cy-kpi"><span>Risk</span><b class="${col}">${i.risk ?? '—'}<small>${i.risk === null ? '' : '/100'}</small></b></div>
          <div class="cy-kpi"><span>Confidence</span><b>${conf ?? '—'}<small>${conf === null ? '' : '%'}</small></b></div>
        </div>
        <div>${cyPlotHead(d)}${cySpark(d, col)}</div>
      </div>
    </div>`;
}

function cyHighlight(safeText) {
  return safeText
    .replace(/\b(\d{1,3}(?:\.\d{1,3}){3})\b/g, '<span class="hl">$1</span>')
    .replace(/\b(\d{2}:\d{2}:\d{2}(?:\s?UTC)?)/g, '<span class="hl">$1</span>')
    .replace(/\b(\d{1,3}\/100)\b/g, '<span class="hl">$1</span>')
    .replace(/\b(HIGH|CRITICAL|MEDIUM|LOW)\b/g, '<span class="hl warn">$1</span>');
}

/* Real comparison across the incidents currently loaded */
function cyBars(i, field, unit) {
  const list = (incidents || []).filter(x => x && Number.isFinite(Number(x[field])));
  if (!list.length) return `<div class="cy-empty-plot">No ${field} data yet</div>`;
  let rows = list.slice(0, 6);
  if (!rows.some(x => x.id === i.id)) rows = [...rows.slice(0, 5), list.find(x => x.id === i.id) || i];
  rows = rows.filter(x => Number.isFinite(Number(x[field])));
  const max = Math.max(1, ...rows.map(x => Number(x[field])));
  return `<div class="cy-bars">${rows.map((x, k) => `<div class="cy-bar ${x.id === i.id ? 'is-cur' : ''}" title="${esc(x.id)}: ${x[field]}${unit}">
      <span>${esc(x.id)}</span><div><i style="width:${(Number(x[field]) / max * 100).toFixed(1)}%;animation-delay:${k * 0.06}s"></i></div><b>${x[field]}</b></div>`).join('')}</div>`;
}

function anBodyHtml(i, tab, ev, d) {
  const col = tone(i.level);
  const text = analysis(i, tab);
  const th = Number(auto && auto.threshold);
  const hasTl = d && d.length >= 2;
  const timeline = () => `<div>${cyPlotHead(d)}${cySpark(d, col)}</div>`;
  const section = (title, note, body) => `<div><div class="cy-sec-title"><span>${title}</span><b>${note}</b></div>${body}</div>`;
  const meter = (label, v, suffix = '%', max = 100) => `<div class="cy-meter"><span>${label}</span><div><i style="width:${v === null ? 0 : Math.min(100, v / max * 100)}%"></i></div><b>${v ?? '—'}${v === null ? '' : suffix}</b></div>`;

  let vis = '';
  if (tab === 'Observation') {
    vis = `<div class="cy-kpis" style="grid-template-columns:repeat(2,minmax(0,1fr))">
        <div class="cy-kpi"><span>Events</span><b>${i.events ?? '—'}</b></div>
        <div class="cy-kpi"><span>First flagged</span><b style="font-size:15px">${esc(i.time)}<small>UTC</small></b></div>
      </div>
      ${hasTl ? timeline() : section('EVENTS BY INCIDENT', `${(incidents || []).length} loaded`, cyBars(i, 'events', ' events'))}`;
  } else if (tab === 'Evidence') {
    vis = section('SIGNALS', `${ev.length} recorded`, `<ul class="cy-rows">${ev.length
      ? ev.slice(0, 6).map((e, k) => `<li><b>${String(k + 1).padStart(2, '0')}</b><span>${esc(e)}</span></li>`).join('') + (ev.length > 6 ? `<li class="cy-empty"><span>+${ev.length - 6} more signals</span></li>` : '')
      : `<li class="cy-empty"><span>No evidence recorded yet</span></li>`}</ul>`);
  } else if (tab === 'Assessment') {
    vis = `<div class="cy-tags"><span class="cy-tag ${col}">${esc(i.threat)}</span><span class="cy-tag ${col}">${esc(i.level)}</span><span class="cy-tag" style="color:var(--cyan)">${esc(i.status)}</span></div>
      ${section('CONFIDENCE & RISK', 'LIVE', `<div style="display:grid;gap:10px">${meter('CONFIDENCE', i.confidence)}${meter('RISK SCORE', i.risk, '/100')}${Number.isFinite(th) && i.risk !== null ? meter('TO ALERT', Math.min(100, Math.round(i.risk / th * 100)), '%') : ''}</div>`)}`;
  } else if (tab === 'Risk') {
    const r = i.risk;
    vis = `<div class="cy-kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))">
        <div class="cy-kpi"><span>Score</span><b class="${col}">${r ?? '—'}<small>${r === null ? '' : '/100'}</small></b></div>
        <div class="cy-kpi"><span>Level</span><b class="${col}" style="font-size:14px;letter-spacing:.1em">${esc(i.level)}</b></div>
        <div class="cy-kpi"><span>Threshold</span><b>${Number.isFinite(th) ? th : '—'}</b></div>
      </div>
      <div class="cy-gauge"><div class="cy-gauge-bar"></div>${Number.isFinite(th) ? `<div class="cy-gauge-th" style="left:${th}%"><em>ALERT ${th}</em></div>` : ''}${r !== null ? `<i class="cy-gauge-mark" style="left:${r}%;background:var(--${col});color:var(--${col})"></i>` : ''}</div>
      ${hasTl ? timeline() : section('RISK BY INCIDENT', `${(incidents || []).length} loaded`, cyBars(i, 'risk', '/100'))}`;
  } else {
    const steps = (String(text).match(/[^.!?]+[.!?]+/g) || [String(text)]).map(s => s.trim()).filter(Boolean).slice(0, 4);
    vis = `<div class="cy-tags"><span class="cy-tag amber">Human approval required</span><span class="cy-tag" style="color:var(--mint)">No action executed</span></div>
      ${section('RECOMMENDED STEPS', `${steps.length} actions`, `<ol class="cy-steps-list">${steps.map(s => `<li><span>${esc(s)}</span></li>`).join('')}</ol>`)}`;
  }

  const facts = `<dl class="cy-facts">
      <div><dt>Threat</dt><dd title="${esc(i.threat)}">${esc(i.threat)}</dd></div>
      <div><dt>Severity</dt><dd class="${col}">${esc(i.level)}</dd></div>
      <div><dt>Source → Target</dt><dd title="${esc(i.source)} → ${esc(i.target)}">${esc(i.source)} → ${esc(i.target)}</dd></div>
      <div><dt>Application</dt><dd>${esc(i.app)}</dd></div>
    </dl>`;

  return `<div class="cy-tab cy-anim">
      <div class="cy-tab-text"><span class="cyan">${icon('brain', 19)}</span><div><h3>${esc(tab)}</h3><p>${cyHighlight(esc(text))}</p>${facts}</div></div>
      <div class="cy-vis">${vis}</div>
    </div>`;
}

let invAnimId = null;

/* Current investigation: compact, plotted layout (CYBI page only) */
function invPanelBody(i, ev, d, animate) {
  const col = tone(i.level);
  const risk = i.risk ?? 0;
  const W = 320, H = 72, pad = 4;
  const ty = v => H - pad - (Math.min(100, Math.max(0, v)) / 100) * (H - pad * 2);
  const gid = 'invg' + Math.random().toString(36).slice(2, 7);
  let plot, plotLabel, plotNote;
  if (d.length >= 2) {
    const x = k => pad + k * (W - pad * 2) / (d.length - 1);
    const line = d.map((q, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)} ${ty(q.risk).toFixed(1)}`).join(' ');
    const area = `${line} L${x(d.length - 1).toFixed(1)} ${H - pad} L${x(0).toFixed(1)} ${H - pad} Z`;
    const th = Number(auto && auto.threshold);
    const thLine = Number.isFinite(th) ? `<line x1="0" x2="${W}" y1="${ty(th).toFixed(1)}" y2="${ty(th).toFixed(1)}" stroke="var(--coral)" stroke-opacity=".55" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/>` : '';
    const grid = [25, 50, 75].map(v => `<line x1="0" x2="${W}" y1="${ty(v).toFixed(1)}" y2="${ty(v).toFixed(1)}" stroke="var(--chart-grid)" stroke-dasharray="2 5" vector-effect="non-scaling-stroke"/>`).join('');
    plot = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Incident risk timeline">
        <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--${col})" stop-opacity=".35"/><stop offset="1" stop-color="var(--${col})" stop-opacity="0"/></linearGradient></defs>
        ${grid}${thLine}
        <path d="${area}" fill="url(#${gid})"/>
        <path class="inv-line" d="${line}" fill="none" stroke="var(--${col})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" pathLength="1"/>
      </svg>
      <i class="inv-dot" style="left:${((x(d.length - 1)) / W * 100).toFixed(2)}%;top:${(ty(d[d.length - 1].risk) / H * 100).toFixed(1)}%;background:var(--${col});color:var(--${col})"></i>`;
    plotLabel = 'RISK TIMELINE';
    plotNote = `${d[0].time} → ${d[d.length - 1].time} UTC · ${d.length} points`;
  } else {
    plot = `<div class="inv-gauge"><div class="inv-gauge-bar"></div><i style="left:${risk}%;background:var(--${col});color:var(--${col})"></i></div>
      <div class="inv-gauge-scale"><span>LOW</span><span>MEDIUM</span><span>HIGH</span><span>CRITICAL</span></div>`;
    plotLabel = 'RISK POSITION';
    plotNote = 'Timeline builds as more events arrive';
  }

  const chips = ev.length
    ? ev.slice(0, 4).map((e, k) => `<li title="${esc(e)}"><b>${String(k + 1).padStart(2, '0')}</b><span>${esc(e)}</span></li>`).join('')
    : `<li class="inv-chip-empty"><span>No evidence recorded yet</span></li>`;
  const more = ev.length > 4 ? `<li class="inv-chip-more"><span>+${ev.length - 4} more signals</span></li>` : '';
  const conf = i.confidence;

  return `
  <style>
    .inv-panel .inv-body{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px 28px;padding:2px 20px 14px;align-items:stretch}
    .inv-id{display:flex;align-items:center;gap:14px;min-width:0}
    .inv-id .cybi-emblem{flex:none;width:46px;height:46px;border-radius:12px;display:grid;place-items:center;margin:0}
    .inv-id>div:last-child{min-width:0}
    .inv-id .eyebrow{display:block;margin:0 0 2px;font-size:10px;letter-spacing:.12em}
    .inv-id h3{margin:0;font-size:22px;line-height:1.15;font-weight:600;letter-spacing:-.01em;text-transform:capitalize;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .inv-id p{margin:3px 0 0;font-size:11.5px}
    .inv-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin-top:12px;border-top:1px solid var(--chart-grid);padding-top:10px}
    .inv-metrics .stat{padding:0 12px;border-left:1px solid var(--chart-grid);gap:3px;min-width:0}
    .inv-metrics .stat:first-child{padding-left:0;border-left:0}
    .inv-metrics .eyebrow{font-size:9px;letter-spacing:.12em}
    .inv-metrics .stat-value{font-size:20px;line-height:1.1;font-variant-numeric:tabular-nums;white-space:nowrap}
    .inv-metrics .stat-value small{font-size:10px;margin-left:3px;letter-spacing:.04em}
    .inv-metrics .stat-value.is-text{font-size:15px;letter-spacing:.12em;font-weight:700;padding-top:4px}
    .inv-side{display:grid;grid-template-columns:auto minmax(0,1fr);gap:16px;align-items:center;min-width:0;padding-left:24px;border-left:1px solid var(--chart-grid)}
    .inv-side .ring{width:92px;height:92px}
    .inv-side .ring svg{width:92px;height:92px;display:block}
    .inv-plotbox{min-width:0}
    .inv-plot-head{display:flex;justify-content:space-between;gap:8px;font:500 9px var(--font-mono);letter-spacing:.12em;color:var(--muted-foreground);margin-bottom:6px}
    .inv-plot-head b{font-weight:500;color:var(--foreground)}
    .inv-plot{position:relative;height:72px}
    .inv-plot svg{display:block;width:100%;height:72px;overflow:visible}
    .inv-dot{position:absolute;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;box-shadow:0 0 0 3px color-mix(in oklab,currentColor 28%,transparent)}
    .inv-gauge{position:relative;height:72px;display:flex;align-items:center}
    .inv-gauge-bar{width:100%;height:8px;border-radius:99px;background:linear-gradient(90deg,#5ed6a0 0 30%,#f2d45c 30% 50%,#f59e42 50% 75%,#ef5350 75% 100%);opacity:.85}
    .inv-gauge i{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:2px solid var(--background,#0b1a1e);box-shadow:0 0 0 3px color-mix(in oklab,currentColor 28%,transparent)}
    .inv-gauge-scale{display:flex;justify-content:space-between;font:500 8px var(--font-mono);letter-spacing:.1em;color:var(--muted-foreground);margin-top:-14px}
    .inv-foot{grid-column:1 / -1;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px 28px;padding-top:12px;border-top:1px solid var(--chart-grid);align-items:center}
    .inv-chips{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 10px}
    .inv-chips li{display:flex;align-items:center;gap:8px;min-width:0;padding:5px 9px;border:1px solid var(--chart-grid);border-radius:8px;background:color-mix(in oklab,var(--foreground) 3%,transparent);font-size:11px;line-height:1.25}
    .inv-chips li b{flex:none;font:600 9px var(--font-mono);color:var(--cyan);letter-spacing:.06em}
    .inv-chips li span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
    .inv-chips .inv-chip-more,.inv-chips .inv-chip-empty{color:var(--muted-foreground);justify-content:center}
    .inv-conf{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;padding-left:24px;font-size:11px;color:var(--muted-foreground)}
    .inv-conf progress{width:100%;height:6px;border:0;border-radius:99px;overflow:hidden;background:var(--chart-grid);appearance:none;-webkit-appearance:none}
    .inv-conf progress::-webkit-progress-bar{background:var(--chart-grid)}
    .inv-conf progress::-webkit-progress-value{background:linear-gradient(90deg,var(--cyan),var(--mint));border-radius:99px}
    .inv-conf progress::-moz-progress-bar{background:linear-gradient(90deg,var(--cyan),var(--mint));border-radius:99px}
    .inv-conf b{font:600 13px var(--font-mono);color:var(--foreground)}
    .inv-anim .inv-line{stroke-dasharray:1;stroke-dashoffset:1;animation:invDraw 1.1s ease-out .15s forwards}
    .inv-anim .ring circle:nth-of-type(2){animation:invRing .9s ease-out both}
    .inv-anim .inv-conf progress{animation:invFade .8s ease-out both}
    .inv-dot{animation:invPulse 2.2s ease-in-out infinite}
    @keyframes invDraw{to{stroke-dashoffset:0}}
    @keyframes invRing{from{stroke-dasharray:0 257.6}}
    @keyframes invFade{from{opacity:0}}
    @keyframes invPulse{50%{box-shadow:0 0 0 7px color-mix(in oklab,currentColor 0%,transparent)}}
    @media(prefers-reduced-motion:reduce){.inv-anim .inv-line,.inv-anim .ring circle:nth-of-type(2),.inv-anim .inv-conf progress,.inv-dot{animation:none!important;stroke-dashoffset:0}}
    @media(max-width:900px){
      .inv-panel .inv-body,.inv-foot{grid-template-columns:minmax(0,1fr)}
      .inv-side{padding-left:0;border-left:0;padding-top:12px;border-top:1px solid var(--chart-grid)}
      .inv-conf{padding-left:0}
    }
    @media(max-width:560px){
      .inv-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 0}
      .inv-metrics .stat:nth-child(3){padding-left:0;border-left:0}
      .inv-chips{grid-template-columns:minmax(0,1fr)}
      .inv-id h3{font-size:18px;white-space:normal}
    }
  </style>
  <div class="inv-body ${animate ? 'inv-anim' : ''}">
    <div>
      <div class="inv-id">
        <div class="cybi-emblem">${icon('brain', 26)}</div>
        <div>
          <span class="eyebrow">${esc(i.id)} · ${esc(i.app)}</span>
          <h3 title="${esc(i.threat)}">${esc(i.threat)}</h3>
          <p class="muted mono">${esc(i.source)} ${icon('arrowR', 12)} ${esc(i.target)}</p>
        </div>
      </div>
      <div class="inv-metrics">
        ${stat('CONFIDENCE', conf ?? '—', conf === null ? '' : '%')}
        ${stat('EVIDENCE', ev.length, 'signals')}
        ${stat('SEVERITY', i.level, '', '', col + ' is-text')}
        ${stat('DETECTED', i.time, 'IST')}
      </div>
    </div>
    <div class="inv-side">
      ${ring(risk, 'RISK SCORE', col, 92)}
      <div class="inv-plotbox">
        <div class="inv-plot-head"><span>${plotLabel}</span><b>${esc(plotNote)}</b></div>
        <div class="inv-plot">${plot}</div>
      </div>
    </div>
    <div class="inv-foot">
      <ul class="inv-chips">${chips}${more}</ul>
      <div class="inv-conf">
        <span>Detection confidence</span>
        <progress value="${conf ?? 0}" max="100"></progress>
        <b>${conf ?? '—'}${conf === null ? '' : '%'}</b>
      </div>
    </div>
  </div>`;
}

function render() {
  const real = inc();
  const empty = !real;
  const i = real || { id: '—', threat: 'Waiting for telemetry', source: '—', target: '—', app: 'Hanu AI', username: '', risk: null, level: 'UNKNOWN', status: '—', ms: null, time: '—', detectedAt: null, events: null, confidence: null, evidence: [], timeline: [], analysis: '', analyzedAt: null };
  const WAIT = () => WAITING(loadError ? 'Waiting for telemetry — backend unreachable: ' + loadError : 'Waiting for telemetry');
  if (!empty) id = i.id;
  const ev = evidenceOf(i), d = cybiLiveSeries = seriesFor(i);

  app.innerHTML = `
    <div class="page-heading">
      <div>
        <div class="eyebrow">AI CYBERSECURITY ANALYST</div>
        <h1>CYBI intelligence<span class="online-badge"><i></i>Analyst workspace</span></h1>
        <p>Evidence-led investigation. Explainable decisions. Controlled responses.</p>
      </div>
      <button class="btn btn-sm btn-secondary" id="cybiGenerateBtn" aria-haspopup="dialog">
        ${icon('zap')}Generate
      </button>
    </div>

    <div class="status-strip">
      <span>${icon('brain', 14)}<b>CYBI</b><small>Powered by Sentinal AI</small></span>
      <span>AI provider <b id="aiProv">${esc(aiProvider)}</b></span>
      <span>Last analysis <b>${lastAnalysis() || '—'}</b></span>
      <span>Incidents <b>${incidents.length}</b></span>
      <span class="sample-label">${empty ? (loadError ? 'BACKEND UNREACHABLE' : 'WAITING FOR TELEMETRY') : 'LIVE TELEMETRY'}</span>
    </div>

    <div class="cybi-grid">
      <div>
        ${panel({
          title: 'Current investigation',
          eyebrow: 'EVIDENCE-LED ANALYSIS',
          action: `<select id="incSel" aria-label="Select investigation" ${empty ? 'disabled' : ''}>${empty ? '<option>No incidents</option>' : incidents.map(x => `<option ${x.id === id ? 'selected' : ''}>${esc(x.id)}</option>`).join('')}</select>`,
          cls: 'inv-panel',
          body: empty ? WAIT() : invPanelBody(i, ev, d, (invAnimId !== i.id) && (invAnimId = i.id, true))
        })}

        <div class="mt-4">${threatGraph()}</div>

        ${panel({
          title: 'Automatic CYBI analysis',
          eyebrow: 'RUNS ON EVERY NEW OR UPDATED INCIDENT',
          cls: 'mt-4',
          action: `<span class="muted mono">${i.analyzedAt ? 'Updated ' + new Date(i.analyzedAt).toLocaleTimeString() : ''}</span>`,
          body: empty ? WAIT() : autoAnalysisBody(i, ev, d, (cyAnimId !== i.id) && (cyAnimId = i.id, true))
        })}

        ${panel({
          title: 'CYBI analysis',
          eyebrow: 'OBSERVATION → ASSESSMENT → RECOMMENDATION',
          cls: 'mt-4',
          body: `
            <div class="analysis-tabs">
              ${['Observation', 'Evidence', 'Assessment', 'Risk', 'Recommendation'].map(t =>
                `<button class="btn btn-sm btn-ghost ${focus === t ? 'selected' : ''}" data-focus="${t}">${t}</button>`
              ).join('')}
            </div>
            <div class="cy-tabs-body" id="anBody">${empty ? WAIT() : anBodyHtml(i, focus, ev, d)}</div>`
        })}

        ${(() => {
          /* Use the incident's own timeline; if it has none yet, plot real risk scores of all loaded incidents over time */
          const fallback = incidents
            .filter(x => x.risk !== null && x.ms !== null)
            .slice().sort((a, b) => a.ms - b.ms)
            .map(x => ({ time: x.time, risk: x.risk }));
          const usingFallback = d.length < 2 && fallback.length >= 1;
          return panel({
            title: 'Risk progression',
            eyebrow: 'INCIDENT DETECTION WINDOW',
            cls: 'mt-4',
            action: usingFallback ? `<span class="muted mono" style="font-size:10px;letter-spacing:.1em">ACROSS ${fallback.length} INCIDENT${fallback.length === 1 ? '' : 'S'}</span>` : '',
            body: Charts.add({
              data: usingFallback ? fallback : d,
              series: [{ key: 'risk', name: 'Risk score', color: 'coral' }],
              height: 140,
              threshold: auto.threshold
            })
          });
        })()}

        ${panel({
          title: 'Ask CYBI',
          eyebrow: 'ANALYST CHAT · LIVE INCIDENT CONTEXT',
          cls: 'mt-4 grow cy-chat',
          action: `<span class="cy-online"><i></i>${esc(aiProvider)}</span>`,
          body: `
            <style>
              .cy-online{display:inline-flex;align-items:center;gap:7px;font:600 10px var(--font-mono);letter-spacing:.1em;color:var(--mint);text-transform:uppercase;white-space:nowrap}
              .cy-online i{width:7px;height:7px;border-radius:50%;background:currentColor;animation:cyPulse 2s ease-in-out infinite}
              .cy-chat .chat-log{display:flex!important;flex-direction:column;justify-content:flex-start!important;gap:14px;min-height:230px;max-height:440px;overflow-y:auto;padding:6px 22px 10px;scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:color-mix(in oklab,var(--cyan) 40%,transparent) transparent}
              .cy-chat .msg{display:flex!important;align-items:flex-start;gap:10px;max-width:88%;margin:0!important;animation:cyRise .35s ease-out both}
              .cy-chat .msg.user{align-self:flex-end;flex-direction:row-reverse}
              .cy-chat .msg .av{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font:600 10px var(--font-mono);color:var(--cyan);border:1px solid color-mix(in oklab,var(--cyan) 40%,transparent);background:color-mix(in oklab,var(--cyan) 10%,transparent)}
              .cy-chat .msg.user .av{color:var(--foreground);border-color:var(--chart-grid);background:color-mix(in oklab,var(--foreground) 8%,transparent)}
              .cy-chat .chat-message-content{min-width:0;padding:10px 14px!important;border-radius:4px 14px 14px 14px!important;border:1px solid var(--chart-grid)!important;background:color-mix(in oklab,var(--foreground) 4%,transparent)!important;font-size:13px;line-height:1.65;overflow-wrap:anywhere}
              .cy-chat .msg.user .chat-message-content{border-radius:14px 4px 14px 14px!important;background:color-mix(in oklab,var(--cyan) 12%,transparent)!important;border-color:color-mix(in oklab,var(--cyan) 30%,transparent)!important}
              .cy-chat .msg-who{display:block;font:600 9px var(--font-mono);letter-spacing:.14em;color:var(--muted-foreground);margin-bottom:3px}
              .cy-chat .chat-message-content p{margin:0 0 6px}.cy-chat .chat-message-content p:last-child{margin-bottom:0}
              .cy-chat .chat-chips{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:4px 22px 0!important}
              .cy-chat .chip{display:flex!important;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:9px 12px!important;border:1px solid var(--chart-grid)!important;border-radius:10px!important;background:color-mix(in oklab,var(--foreground) 3%,transparent)!important;cursor:pointer;transition:border-color .2s,transform .2s,background .2s}
              .cy-chat .chip:hover{border-color:var(--cyan)!important;background:color-mix(in oklab,var(--cyan) 8%,transparent)!important;transform:translateY(-1px)}
              .cy-chat .chip b{font-size:12px;font-weight:600;color:var(--foreground)}
              .cy-chat .chip small{font-size:10.5px;color:var(--muted-foreground)}
              .cy-chat .chat-form{display:flex!important;align-items:center;gap:8px;margin:12px 22px 0!important;padding:5px 5px 5px 14px!important;border:1px solid var(--chart-grid);border-radius:12px;background:color-mix(in oklab,var(--foreground) 3%,transparent);transition:border-color .2s,box-shadow .2s}
              .cy-chat .chat-form:focus-within{border-color:var(--cyan);box-shadow:0 0 0 3px color-mix(in oklab,var(--cyan) 16%,transparent)}
              .cy-chat .chat-form input#chatIn{flex:1;min-width:0;background:transparent!important;border:0!important;box-shadow:none!important;outline:0!important;padding:8px 0!important;height:auto!important;font-size:13px;color:inherit}
              .cy-chat .chat-form button{flex:none;border-radius:9px}
              .cy-chat .panel-footer{margin-top:12px}
              @media(max-width:560px){.cy-chat .chat-chips{grid-template-columns:minmax(0,1fr)}.cy-chat .msg{max-width:96%}.cy-chat .chat-log,.cy-chat .chat-chips{padding-left:14px!important;padding-right:14px!important}.cy-chat .chat-form{margin-left:14px!important;margin-right:14px!important}}
              @media(prefers-reduced-motion:reduce){.cy-chat .msg,.cy-online i{animation:none!important}}
            </style>
            <div class="chat-log" id="chatLog" aria-live="polite">${chatLog()}</div>

            <div class="chat-chips">
              ${[
                ['Summarize this incident', 'Plain-language overview'],
                ['Why is the risk high?', 'Explain the score drivers'],
                ['Show the evidence', 'List correlated signals'],
                ['What should I do?', 'Recommended response']
              ].map(([q, sub]) => `<button class="chip" data-ask="${q}"><b>${q}</b><small>${sub}</small></button>`).join('')}
            </div>

            <form class="chat-form" id="chatForm">
              <input
                id="chatIn"
                autocomplete="off"
                aria-label="Message CYBI"
                placeholder="${empty ? 'Waiting for telemetry…' : 'Ask about ' + esc(i.id) + '…'}"
              >
              <button class="btn btn-sm btn-secondary" type="submit" aria-label="Send">
                ${icon('send')}
              </button>
            </form>

            <div class="panel-footer">
              <span>${icon('lock', 12)}Cannot execute actions · human approval required</span>
              <span>Answers use the selected live incident</span>
            </div>`
        })}
      </div>

      <aside>
        ${panel({
          title: 'Evidence chain',
          eyebrow: 'CORRELATED SIGNALS',
          action: `<span class="muted">${icon('finger')}</span>`,
          body: `
            ${empty ? WAIT() : ''}
            <div class="evidence-list">
              ${ev.map((e, n) => `
                <div>
                  <span class="evidence-number">0${n + 1}</span>
                  <div>
                    <small class="mono">${i.time} UTC</small>
                    <p>${esc(e)}</p>
                  </div>
                  <span class="mint">${icon('check', 13)}</span>
                </div>
              `).join('')}
            </div>
            <div class="panel-footer">
              <span>${ev.length} signals correlated</span>
              <span class="mint">Evidence from backend detection</span>
            </div>`
        })}

        ${panel({
          title: 'Controlled response',
          eyebrow: 'RECOMMENDATION ≠ EXECUTION',
          cls: 'mt-4',
          body: `
            <div class="response-recommendation">
              <span class="cyan">${icon('shieldCheck', 22)}</span>
              <div>
                <h3>Temporary rate limit</h3>
                <span class="${action === 'DRY RUN' ? 'amber' : 'cyan'}" id="actState">${empty ? 'WAITING FOR TELEMETRY' : action}</span>
              </div>
            </div>

            <dl class="detail-list px-5">
              <div><dt>Target</dt><dd>${esc(i.source)}</dd></div>
              <div><dt>Reason</dt><dd>${esc(i.threat)}</dd></div>
              <div><dt>Actual action</dt><dd>None executed</dd></div>
            </dl>

            <div class="decision-flow">
              <span>Detect</span>${icon('chevR', 12)}
              <span>Investigate</span>${icon('chevR', 12)}
              <span class="cyan">Recommend</span>
            </div>

            <div class="response-actions">
              <button class="btn btn-sm btn-secondary" id="dryBtn" ${empty ? 'disabled' : ''}>
                ${icon('flask')}${action === 'DRY RUN' ? 'Run again' : 'Run dry simulation'}
              </button>
              ${action === 'DRY RUN' ? `<p class="amber">Simulation complete. Rate limit would apply to ${esc(i.source)}. No access changes were made.</p>` : ''}
              <small>Response engine is not connected. Execution is unavailable.</small>
            </div>`
        })}

        ${panel({
          title: 'Automation',
          eyebrow: 'CYBI SETTINGS',
          cls: 'mt-4',
          action: `<span class="panel-symbol">${icon('zap')}</span>`,
          body: `
            <div class="auto-list">
              ${toggle('investigate', 'Auto-investigate', 'Analyse new incidents as they arrive')}
              ${toggle('notify', 'Notify on high risk', 'Show an alert when risk crosses the threshold')}
              ${toggle('report', 'Auto-draft report', 'Prepare a shareable brief for HIGH incidents')}

              <div class="slider-row">
                <span><b>Alert threshold</b><small>Risk score that raises an alert</small></span>
                <output id="thVal">${auto.threshold}</output>
              </div>

              <input type="range" id="thSlider" min="50" max="95" step="1" value="${auto.threshold}" aria-label="Alert threshold">

              <div class="lockrow">
                ${icon('lock', 12)}
                <span>Response execution <b>locked</b> · safe mode</span>
              </div>
            </div>

            <div class="panel-footer">
              <span id="autoState">${autoState(i)}</span>
            </div>`
        })}

        ${panel({
          title: 'Related incidents',
          eyebrow: 'INVESTIGATION QUEUE',
          cls: 'mt-4',
          body: `
            ${empty ? WAIT() : ''}
            <div class="related">
              ${incidents.map(x => `
                <button class="btn btn-ghost related-row ${x.id === id ? 'selected' : ''}" data-pick="${esc(x.id)}">
                  <span class="mono">${esc(x.id)}</span>
                  <span>${esc(x.threat)}</span>
                  <b class="risk-pill ${tone(x.level)}">${x.risk ?? '—'}</b>
                </button>
              `).join('')}
            </div>`
        })}

        ${(() => {
          const caps = [
            ['Login & brute-force analysis', 'Failed-login bursts and credential abuse'],
            ['Traffic & phishing analysis', 'Suspicious requests and lookalike URLs'],
            ['Threat correlation', 'Links source, endpoint and time window'],
            ['Risk assessment', 'Severity scored with confidence'],
            ['Incident investigation', 'Evidence chain and timeline'],
            ['Response recommendation', 'Human-approved next steps'],
            ['Security briefs', 'Shareable incident summaries']
          ];
          const analysed = incidents.filter(x => x.analysis).length;
          const signals = incidents.reduce((n, x) => n + (x.evidence ? x.evidence.length : 0), 0);
          const cov = incidents.length ? Math.round(analysed / incidents.length * 100) : 0;
          return panel({
            title: 'Analyst capabilities',
            eyebrow: 'CYBI',
            cls: 'mt-4 grow',
            body: `
              <style>
                .cy-cap{display:flex;flex-direction:column;gap:12px;padding:2px 20px 16px;height:100%;box-sizing:border-box}
                .cy-cap-head{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
                .cy-cap-head div span{display:block;font:500 9px var(--font-mono);letter-spacing:.12em;color:var(--muted-foreground);text-transform:uppercase}
                .cy-cap-head div b{display:block;margin-top:2px;font:600 15px var(--font-mono);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                .cy-cap-cov{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;font:500 9px var(--font-mono);letter-spacing:.12em;color:var(--muted-foreground);padding-bottom:12px;border-bottom:1px solid var(--chart-grid)}
                .cy-cap-cov div{height:5px;border-radius:99px;background:var(--chart-grid);overflow:hidden}
                .cy-cap-cov div i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--cyan),var(--mint));transform-origin:left;animation:cyGrow .9s ease-out both}
                .cy-cap-cov b{font:600 11px var(--font-mono);color:var(--foreground)}
                .cy-cap-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:1fr;gap:8px;flex:1 1 auto}
                .cy-cap-item{display:flex;gap:9px;align-items:flex-start;min-width:0;padding:9px 10px;border:1px solid var(--chart-grid);border-radius:10px;background:color-mix(in oklab,var(--foreground) 3%,transparent);transition:border-color .2s,background .2s;animation:cyRise .45s ease-out both}
                .cy-cap-item:hover{border-color:color-mix(in oklab,var(--cyan) 50%,transparent);background:color-mix(in oklab,var(--cyan) 6%,transparent)}
                .cy-cap-item>span{flex:none;width:20px;height:20px;border-radius:6px;display:grid;place-items:center;color:var(--cyan);background:color-mix(in oklab,var(--cyan) 12%,transparent)}
                .cy-cap-item b{display:block;font-size:12px;font-weight:600;line-height:1.3;color:var(--foreground)}
                .cy-cap-item small{display:block;margin-top:2px;font-size:10.5px;line-height:1.35;color:var(--muted-foreground)}
                .cy-cap-item:last-child:nth-child(odd){grid-column:1 / -1}
                @media(max-width:560px){.cy-cap-grid{grid-template-columns:minmax(0,1fr)}}
                @media(prefers-reduced-motion:reduce){.cy-cap-item,.cy-cap-cov div i{animation:none!important}}
              </style>
              <div class="cy-cap">
                <div class="cy-cap-head">
                  <div><span>Engine</span><b>${/claude/i.test(aiProvider) ? 'Claude' : 'Local rules'}</b></div>
                  <div><span>Incidents</span><b>${incidents.length}</b></div>
                  <div><span>Signals</span><b>${signals}</b></div>
                </div>
                <div class="cy-cap-cov"><span>AI ANALYSED</span><div><i style="width:${cov}%"></i></div><b>${analysed}/${incidents.length}</b></div>
                <div class="cy-cap-grid">
                  ${caps.map(([c, sub], k) => `<div class="cy-cap-item" style="animation-delay:${k * 0.05}s"><span>${icon('check', 12)}</span><div><b>${c}</b><small>${sub}</small></div></div>`).join('')}
                </div>
              </div>`
          });
        })()}
      </aside>
    </div>`;

  Charts.flush();
  if (typeof updateThreatGraphNodes === 'function') updateThreatGraphNodes();
}

const autoState = i =>
  (!i || i.id === '—')
    ? '<span class="muted">● Waiting for telemetry</span>'
    : (i.risk ?? -1) >= auto.threshold
    ? (
        auto.notify
          ? '<span class="coral">● Alert raised · risk ' + i.risk + ' ≥ ' + auto.threshold + '</span>'
          : '<span class="amber">● Above threshold · notifications off</span>'
      )
    : '<span class="mint">● Below threshold · no alert</span>';

app.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;

  if (b.id === 'cybiGenerateBtn') {
    openCybiComposer();
  } else if (b.id === 'dryBtn') {
    action = 'DRY RUN';
    render();
  } else if (b.dataset.focus) {
    focus = b.dataset.focus;

    $$('[data-focus]').forEach(x =>
      x.classList.toggle('selected', x === b)
    );

    const cur = inc();
    $('#anBody').innerHTML = cur ? anBodyHtml(cur, focus, evidenceOf(cur), seriesFor(cur)) : WAITING('Waiting for telemetry');
  } else if (b.dataset.ask) {
    ask(b.dataset.ask);
  } else if (b.dataset.pick) {
    id = b.dataset.pick;
    action = 'RECOMMENDED';
    render();

    if (auto.investigate) {
      pushChat(
        'cybi',
        `Auto-investigated ${id}: ${inc().threat}, risk ${inc().risk}/100 (${inc().level}).`
      );
    }
  }
});

app.addEventListener('change', e => {
  const t = e.target;

  if (t.id === 'incSel') {
    id = t.value;
    action = 'RECOMMENDED';
    render();

    if (auto.investigate) {
      pushChat(
        'cybi',
        `Auto-investigated ${id}: ${inc().threat}, risk ${inc().risk}/100 (${inc().level}).${auto.report && inc().level === 'HIGH' ? ' A report draft is ready; open Generate to review and share it.' : ''}`
      );
    }
  }

  if (t.dataset.auto) {
    auto[t.dataset.auto] = t.checked;
    if (automationProfile) {
      automationProfile.enabled = true;
      automationProfile[t.dataset.auto] = t.checked;
      try { localStorage.setItem('sentinal-cybi-automation', JSON.stringify(automationProfile)); } catch (error) { }
      syncCybiAutomationSettings(automationProfile);
    }
    $('#autoState').innerHTML = autoState(inc());
  }
});

app.addEventListener('input', e => {
  if (e.target.id === 'thSlider') {
    auto.threshold = +e.target.value;
    if (automationProfile) {
      automationProfile.threshold = auto.threshold;
      try { localStorage.setItem('sentinal-cybi-automation', JSON.stringify(automationProfile)); } catch (error) { }
      clearTimeout(window.__sentinalCybiSettingsSyncTimer);
      window.__sentinalCybiSettingsSyncTimer = setTimeout(() => syncCybiAutomationSettings(automationProfile), 300);
    }
    $('#thVal').textContent = auto.threshold;
    $('#autoState').innerHTML = autoState(inc());

    Charts.els.forEach(el => {
      if (
        el.isConnected &&
        el._o.series[0].key === 'risk'
      ) {
        el._o.threshold = auto.threshold;
        drawChart(el);
      }
    });
  }
});

app.addEventListener('submit', e => {
  if (e.target.id === 'chatForm') {
    e.preventDefault();

    const f = $('#chatIn');
    ask(f.value);
    f.value = '';
  }
});

// CYBI live refresh: incidents + AI provider from the backend; re-renders only when data changed.
async function refreshCybiGraphData() {
  try {
    const [incRes, healthRes] = await Promise.all([
      fetch('/api/incidents', { cache: 'no-store' }),
      fetch('/api/health', { cache: 'no-store' }).catch(() => null)
    ]);
    if (!incRes.ok) throw new Error(`Incidents HTTP ${incRes.status}`);
    const payload = await incRes.json();
    if (healthRes && healthRes.ok) {
      const h = await healthRes.json();
      aiProvider = h.ai_provider === 'anthropic' ? 'Claude (Anthropic)' : 'Local rule engine';
    }
    const raw = Array.isArray(payload) ? payload : Array.isArray(payload.incidents) ? payload.incidents : [];
    const previousIds = new Set(incidents.map(x => x.id));
    const wasLoaded = loaded;
    incidents = raw.map(normC).sort((a, b) => (b.ms ?? 0) - (a.ms ?? 0));
    loaded = true; loadError = null; lastUpdate = new Date();

    const sig = JSON.stringify(incidents.map(x => [x.id, x.risk, x.events, x.status, x.timeline.length, x.analyzedAt]));
    const typing = document.activeElement && document.activeElement.id === 'chatIn' && document.activeElement.value;
    if (sig !== lastSig && !typing) { lastSig = sig; render(); }

    // keep header strip current even when no re-render was needed
    const strip = document.querySelector('.status-strip');
    if (strip) {
      const items = strip.querySelectorAll('span');
      if (items[2]) items[2].innerHTML = `Last analysis <b>${lastAnalysis() || '—'}</b>`;
      if (items[3]) items[3].innerHTML = `Incidents <b>${incidents.length}</b>`;
    }

    // automation: react to NEW incidents as they arrive
    if (wasLoaded) {
      incidents.filter(x => !previousIds.has(x.id)).forEach(x => {
        if (auto.investigate) pushChat('cybi', `Auto-investigated ${x.id}: ${x.threat}, risk ${x.risk ?? '—'}/100 (${x.level}).${auto.report && ['HIGH', 'CRITICAL'].includes(x.level) ? ' A report draft is ready; open Generate to review and share it.' : ''}`);
        if (auto.notify && (x.risk ?? -1) >= auto.threshold) pushChat('cybi', `⚠ Alert: ${x.id} (${x.threat}) risk ${x.risk} crossed the ${auto.threshold} threshold.`);
      });
    }
  } catch (error) {
    loadError = error.message;
    if (!incidents.length) { lastSig = ''; renderEmpty(); }
    console.warn('[Sentinal] CYBI telemetry refresh failed:', error);
  }
}

render();
refreshCybiGraphData();
if (cybiLiveTimer) clearInterval(cybiLiveTimer);
if (window.__sentinalCybiGraphTimer) clearInterval(window.__sentinalCybiGraphTimer);
cybiLiveTimer = setInterval(refreshCybiGraphData, 3000);
window.__sentinalCybiGraphTimer = cybiLiveTimer;

const l = $('#chatLog');
if (l) l.scrollTop = l.scrollHeight;
};


/* ---------- responsive layer: tablet + mobile (injected last so it can override base styles) ---------- */
function injectResponsiveCss() {
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
    document.head.appendChild(meta);
  }
  if (document.getElementById('responsiveCss')) return;
  const st = document.createElement('style');
  st.id = 'responsiveCss';
  st.textContent = `
  html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
  .app-shell,.app-main{max-width:100%}
  .app-shell .glass-panel,.app-shell .system-main,.app-shell .system-side,.app-shell .cybi-grid>*{min-width:0}
  .app-shell svg{max-width:100%}
  .analytical-chart svg,.tl-svg{touch-action:pan-y!important}

  /* ===== tablet ===== */
  @media (max-width:1100px){
    .app-shell .workspace-grid,.app-shell .cybi-grid,.app-shell .security-top,.app-shell .system-bottom{grid-template-columns:minmax(0,1fr)!important}
    .app-shell .three-chart-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    .app-shell .url-result{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  }
  @media (max-width:900px){
    .app-shell .resource-grid{grid-template-columns:minmax(0,1fr)!important}
  }

  /* ===== mobile ===== */
  @media (max-width:760px){
    .app-shell .app-header{display:flex!important;flex-wrap:wrap;align-items:center;gap:8px 10px;height:auto!important;min-height:0!important;padding:10px 14px!important}
    .app-shell .app-header .brand{order:1;flex:1 1 auto;min-width:0}
    .app-shell .app-header .header-actions{order:2;margin-left:auto;gap:6px}
    .app-shell .app-header .header-live{display:none}
    .app-shell .app-header nav{order:3;flex:1 1 100%;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding-bottom:2px}
    .app-shell .app-header nav::-webkit-scrollbar{display:none}
    .app-shell .app-header nav .nav-item{flex:1 0 auto;justify-content:center;white-space:nowrap}
    .app-shell .header-popover{position:fixed!important;top:72px!important;left:12px!important;right:12px!important;width:auto!important;max-width:none!important;max-height:70vh;overflow:auto}
  }

  @media (max-width:760px){
    .app-shell .app-main{padding:14px 12px calc(24px + env(safe-area-inset-bottom))!important}
    .app-shell .page-heading{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:12px!important}
    .app-shell .page-heading h1{font-size:22px!important;line-height:1.25;display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px}
    .app-shell .page-heading p{font-size:12px}
    .app-shell .page-heading .flex,.app-shell .page-tools{flex-wrap:wrap;width:100%;gap:8px}
    .app-shell .page-tools select{flex:1 1 140px;min-width:0}
    .app-shell .range-selector{overflow-x:auto;max-width:100%}
    .app-shell .status-strip{display:flex!important;flex-wrap:wrap;gap:8px 16px!important;padding:10px 12px!important;height:auto!important}
    .app-shell .status-strip>span{min-width:0}

    .app-shell .three-chart-grid,.app-shell .resource-grid,.app-shell .url-result{grid-template-columns:minmax(0,1fr)!important}
    .app-shell .security-summary{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
    .app-shell .security-summary .summary-filter{width:100%;text-align:left}

    .app-shell .panel-header{flex-wrap:wrap;gap:8px;padding-left:14px!important;padding-right:14px!important}
    .app-shell .panel-header>*{min-width:0}
    .app-shell .panel-footer{flex-wrap:wrap;gap:6px 14px;padding-left:14px!important;padding-right:14px!important}
    .app-shell .metrics-row{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(104px,1fr))!important;gap:12px 14px!important;padding-left:14px!important;padding-right:14px!important}
    .app-shell .stat-value{font-size:22px!important}
    .app-shell .stat-value small{font-size:11px}

    /* tables scroll sideways instead of squashing */
    .app-shell .table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}
    .app-shell .table-scroll table{min-width:680px}
    .app-shell .table-scroll th,.app-shell .table-scroll td{white-space:nowrap}
    .app-shell .table-toolbar{flex-wrap:wrap;gap:8px;padding-left:14px!important;padding-right:14px!important}
    .app-shell .table-toolbar .input,.app-shell .search-field,.app-shell .panel-header select{width:100%;min-width:0;flex:1 1 100%}
    .app-shell input,.app-shell select,.app-shell textarea{font-size:16px}
    .app-shell .btn{min-height:38px}
    .app-shell .btn-icon{min-width:38px;min-height:38px}

    /* application page */
    .app-shell .connected-app-card{height:auto!important;min-height:0!important}
    .app-shell .app-card-metrics{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
    .app-shell .app-card-identity,.app-shell .app-card-info{min-width:0}
    .app-shell .app-card-wave{display:none}
    .app-shell .username-chart-summary{flex-wrap:wrap!important;justify-content:flex-start!important;gap:12px 22px!important}
    .app-shell .status-row{grid-template-columns:minmax(84px,1.2fr) 1.4fr 30px 44px!important;gap:8px!important}

    /* slim health strip becomes a tidy 2-column block */
    .app-shell .app-health-slim{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px!important;padding:12px 14px!important}
    .app-shell .app-health-slim>div{height:auto!important;padding:0!important;border-left:0!important;flex-direction:column!important;align-items:flex-start!important;gap:5px!important}
    .app-shell .app-health-slim>div:first-child{grid-column:1/-1;margin:0!important}
    .app-shell .app-health-slim>div:last-child{grid-column:1/-1}

    /* source-ip map */
    .app-shell .sip-map-panel,.app-shell .sip-source-panel{height:400px}
    .app-shell .sip-foot .sip-note{width:100%}

    /* security */
    .app-shell .threat-graph{height:auto!important;min-height:0!important;padding:10px!important}
    .app-shell .threat-graph>svg{display:none}
    .app-shell #threatGraphNodes{position:static!important;display:grid;gap:8px}
    .app-shell .graph-node{position:static!important;inset:auto!important;transform:none!important;width:100%!important;justify-content:flex-start;text-align:left}
    .app-shell .distribution{display:flex!important;flex-direction:column!important;align-items:stretch;gap:12px}
    .app-shell .donut-wrap{max-width:220px;margin:0 auto}
    .app-shell .url-form{display:flex;flex-direction:column;gap:8px}
    .app-shell .url-form input{width:100%}
    .app-shell .sample-urls{flex-wrap:wrap}
    .tl-head{gap:16px 24px!important;padding:0 14px 10px!important}
    .tl-meta{margin-left:0!important;width:100%}
    .tl-foot{flex-direction:column;gap:4px;padding:10px 14px 14px!important}
    .detail-drawer{width:100%!important;max-width:100%!important;border-radius:0!important}

    /* cybi */
    .app-shell .investigation-overview{flex-wrap:wrap;gap:12px}
    .app-shell .analysis-tabs{display:flex;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch}
    .app-shell .analysis-tabs .btn{flex:0 0 auto}
    .app-shell .chat-chips{flex-wrap:wrap}
    .app-shell .chat-form{gap:8px}
    .app-shell .confidence-line{flex-wrap:wrap;gap:6px}
    .app-shell .cybi-table-wrap{overflow-x:auto}

    /* footer */
    .app-shell .app-footer{display:flex!important;flex-direction:column!important;align-items:center;gap:6px!important;text-align:center;padding:14px 12px calc(14px + env(safe-area-inset-bottom))!important;height:auto!important}
  }

  @media (max-width:480px){
    .app-shell .app-header .brand small{display:none}
    .app-shell .page-heading h1{font-size:20px!important}
    .app-shell .security-summary{grid-template-columns:minmax(0,1fr)!important}
    .app-shell .stat-value{font-size:20px!important}
    .app-shell .sip-map-panel,.app-shell .sip-source-panel{height:380px}
  }

  /* final mobile refinements shared by System, Application, Security, and CYBI */
  @media (max-width:760px){
    .app-shell,.app-shell #app,.app-shell .app-main{width:100%;min-width:0;max-width:100%}
    .app-shell .page-heading>:first-child,.app-shell .page-heading>:nth-child(2){width:100%;max-width:100%;min-width:0}
    .app-shell .page-heading>:nth-child(2){position:static!important;top:auto!important;right:auto!important;transform:none!important}
    .app-shell .page-heading>:nth-child(2)>.btn{max-width:100%}
    .app-shell .status-strip>span{flex:1 1 calc(50% - 16px);min-width:0;align-items:flex-start;overflow-wrap:anywhere}
    .app-shell .status-strip .sample-label{flex:1 1 100%;margin-left:0;text-align:left}
    .app-shell .workspace-grid,.app-shell .resource-grid,.app-shell .system-bottom,.app-shell .security-top,.app-shell .three-chart-grid,.app-shell .cybi-grid,.app-shell .sip-layout{width:100%;min-width:0}
    .app-shell .workspace-grid>*,.app-shell .resource-grid>*,.app-shell .system-bottom>*,.app-shell .security-top>*,.app-shell .three-chart-grid>*,.app-shell .cybi-grid>*,.app-shell .sip-layout>*{min-width:0;max-width:100%}
    .app-shell .panel-header h2,.app-shell .panel-header .eyebrow{overflow-wrap:anywhere}
    .app-shell .panel-header .range-selector{width:100%;max-width:100%;justify-content:flex-start}
    .app-shell .table-scroll,.app-shell .cybi-table-wrap{overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;max-width:100%}
    .app-shell .table-scroll table{min-width:640px}
    .app-shell .table-toolbar>span{white-space:normal;overflow-wrap:anywhere}
    .app-shell .detail-list dd,.app-shell .related-row>span,.app-shell .panel-footer>span{min-width:0;overflow-wrap:anywhere}
    .app-shell .app-footer span{max-width:100%;display:flex;flex-wrap:wrap;justify-content:center;overflow-wrap:anywhere}
    .app-shell .event-timeline{justify-content:flex-start;gap:14px;overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;padding-inline:14px}
    .app-shell .event-timeline .timeline-event{flex:0 0 84px;max-width:none}
    .app-shell .sip-map-legend{max-width:calc(100% - 28px);overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none}
    .app-shell .sip-map-legend::-webkit-scrollbar{display:none}
    .app-shell .sip-map-stamp{max-width:42%;overflow:hidden}
    .app-shell .sip-map-stamp b,.app-shell .sip-map-stamp small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .app-shell .cybi-grid>aside .related-row{grid-template-columns:minmax(58px,auto) minmax(0,1fr) auto;gap:7px}
  }
  @media (max-width:480px){
    .app-shell .app-main{padding-left:max(10px,env(safe-area-inset-left))!important;padding-right:max(10px,env(safe-area-inset-right))!important}
    .app-shell .app-header{padding-left:max(10px,env(safe-area-inset-left))!important;padding-right:max(10px,env(safe-area-inset-right))!important}
    .app-shell .app-header nav{gap:4px;padding:3px}
    .app-shell .app-header nav .nav-item{height:34px;padding-inline:10px;font-size:10px}
    .app-shell .status-strip>span{flex-basis:100%}
    .app-shell .panel-header,.app-shell .panel-footer{padding-left:12px!important;padding-right:12px!important}
    .app-shell .metrics-row{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
    .app-shell .stat,.app-shell .stat-value{min-width:0;max-width:100%}
    .app-shell .stat-value{white-space:normal!important;overflow-wrap:anywhere;font-size:19px!important}
    .app-shell .status-row{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 28px 38px!important;gap:6px!important}
    .app-shell .investigation-overview{align-items:flex-start}
    .app-shell .inv-panel .inv-body{padding-left:12px;padding-right:12px}
    .app-shell .inv-conf{grid-template-columns:minmax(0,1fr) auto;gap:8px;padding-left:0}
    .app-shell .inv-conf>span{grid-column:1/-1}
    .app-shell .inv-chips li span,.app-shell .evidence-list p{overflow-wrap:anywhere;white-space:normal}
    .app-shell .sip-map-legend{left:8px;top:8px;gap:8px;padding:6px 8px}
    .app-shell .sip-map-stamp{right:8px;top:8px;padding:6px 7px}
    .app-shell .sip-map-panel,.app-shell .sip-source-panel{height:370px}
    .app-shell .app-footer{padding-bottom:calc(14px + env(safe-area-inset-bottom))!important}
  }
  /* Keep the security distribution card compact at phone widths. */
  @media (max-width:480px){
    .app-shell .security-top{grid-template-columns:minmax(0,1fr)!important;grid-auto-rows:auto!important;align-items:start!important}
    .app-shell .security-top>#distHost,.app-shell .security-top>#distHost>.glass-panel{width:100%;min-width:0;min-height:0;height:auto!important;align-self:start}
    .app-shell .distribution{display:grid!important;grid-template-columns:minmax(120px,.78fr) minmax(0,1fr);align-items:center;gap:10px;height:auto!important;min-height:0!important;padding:12px!important}
    .app-shell .donut-wrap{width:100%!important;max-width:180px!important;margin:0 auto;aspect-ratio:1}
    .app-shell .donut-wrap>svg{display:block;width:100%;height:auto!important;aspect-ratio:1}
    .app-shell .distribution-legend{width:100%;max-width:none!important;align-self:center}
    .app-shell .distribution-legend button{min-width:0;height:auto;min-height:32px;white-space:normal;text-align:left}
    .app-shell .distribution-legend button span{min-width:0;overflow-wrap:anywhere}
  }
  @media (max-width:480px){
    .app-shell .distribution{grid-template-columns:minmax(100px,.68fr) minmax(0,1fr);gap:8px;padding:10px!important}
    .app-shell .donut-wrap{max-width:150px!important}
    .app-shell .donut-center b{font-size:24px!important}
    .app-shell .donut-center small{font-size:7px}
    .app-shell .distribution-legend button{gap:5px;padding-inline:3px;font-size:9px}
  }
  @media (hover:none){
    .app-shell .btn:hover{transform:none}
  }`;
  document.head.appendChild(st);
}
injectResponsiveCss();

/* ===== router ===== */
(function () { var r = (location.hash.slice(1).split('?')[0]) || 'system'; (PAGES[r] || PAGES.system)(); addEventListener('hashchange', function () { location.reload(); }); })();



/* ===== Sentinal AI — animated tab backgrounds (added) =====
   One quiet, security-themed scene per tab, drawn inside the existing
   .ambient-field layer using the dashboard palette. Nothing else is touched.
   System       → circuit-board buses with data pulses   (infrastructure)
   Application  → hex service mesh, requests hop cell to cell
   Security     → shield radar: detect → lock → contain
   CYBI AI      → neural constellation + hex byte streams                  */
(function () {
  'use strict';
  var field = document.querySelector('.ambient-field');
  if (!field) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var label = ((document.querySelector('.nav-item.nav-active span') || {}).textContent || 'System').trim().toLowerCase();
  var mode = label.indexOf('cybi') === 0 ? 'cybi'
           : label.indexOf('sec') === 0 ? 'security'
           : label.indexOf('app') === 0 ? 'application' : 'system';

  /* palette (sRGB equivalents of the oklch tokens in style.css) */
  var CY = [99, 230, 242], MINT = [111, 217, 176], CORAL = [240, 138, 106], AMBER = [227, 184, 104];
  var TAU = Math.PI * 2;
  var rgba = function (c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')'; };
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;display:block';
  field.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  var w = 0, h = 0, dpr = 1, t = 0, scene = {};
  var small = function () { return w < 760; };

  /* soft drifting light behind each scene so the glass panels have depth to blur */
  var ORB_COLS = { system: [CY, [70, 120, 230], MINT], application: [CY, [70, 120, 230], MINT], security: [CY, [70, 120, 230], CORAL], cybi: [CY, [110, 100, 240], MINT] };
  var ORBS = [
    { x: 0.18, y: 0.22, r: 0.46, sx: 0.06, sy: 0.05, sp: 0.07, ph: 0.0, a: 0.13 },
    { x: 0.80, y: 0.62, r: 0.52, sx: 0.07, sy: 0.06, sp: 0.05, ph: 2.0, a: 0.11 },
    { x: 0.50, y: 0.95, r: 0.42, sx: 0.08, sy: 0.04, sp: 0.06, ph: 4.0, a: 0.07 }
  ];
  function orbs() {
    var cols = ORB_COLS[mode], big = Math.max(w, h);
    for (var i = 0; i < ORBS.length; i++) {
      var o = ORBS[i], x = (o.x + Math.sin(t * o.sp + o.ph) * o.sx) * w, y = (o.y + Math.cos(t * o.sp * 1.3 + o.ph) * o.sy) * h, r = o.r * big;
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(cols[i], o.a)); g.addColorStop(1, rgba(cols[i], 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scene = SCENES[mode].init();
    if (reduced) { for (var i = 0; i < 40; i++) SCENES[mode].draw(0.05); }
  }

  function hexAdd(p, x, y, r) {
    for (var k = 0; k < 6; k++) {
      var a = (60 * k - 30) * Math.PI / 180, px = x + r * Math.cos(a), py = y + r * Math.sin(a);
      k ? p.lineTo(px, py) : p.moveTo(px, py);
    }
    p.closePath();
  }

  var SCENES = {

    /* ---------------- SYSTEM: circuit buses ---------------- */
    system: {
      init: function () {
        var r = rng(21), buses = [];
        var reach = small() ? w * 0.4 : Math.min(w * 0.3, 540);
        var n = small() ? 3 : Math.max(4, Math.round(h / 150));
        var lanes = small() ? 3 : 4, gap = 9;
        for (var i = 0; i < n; i++) {
          var side = i % 2 ? 1 : -1, dir = -side;
          var x = side > 0 ? w + 10 : -10, y = (i + 0.5) * h / n + (r() - 0.5) * 40;
          var base = [[x, y]], travelled = 0, startX = x;
          var steps = 2 + ((r() * 3) | 0);
          for (var k = 0; k < steps && travelled < reach; k++) {
            var run = 70 + r() * 120; x += dir * run; travelled += run; base.push([x, y]);
            var bend = (r() < 0.5 ? -1 : 1) * (30 + r() * 60);
            if (y + bend < 40 || y + bend > h - 60) bend = -bend;
            x += dir * Math.abs(bend); y += bend; travelled += Math.abs(bend); base.push([x, y]);
          }
          x += dir * (50 + r() * 60); base.push([x, y]);
          var lines = [];
          for (var l = 0; l < lanes; l++) {
            var pts = base.map(function (p) { return [p[0], p[1] + l * gap]; });
            var segs = [], len = 0;
            for (var q = 1; q < pts.length; q++) { var sl = Math.hypot(pts[q][0] - pts[q - 1][0], pts[q][1] - pts[q - 1][1]); segs.push(sl); len += sl; }
            lines.push({ pts: pts, segs: segs, len: len });
          }
          buses.push({ lines: lines, startX: startX, endX: x, endY: y, lanes: lanes, gap: gap, dir: dir });
        }
        return { buses: buses, pulses: [], flashes: [], next: 0.3, r: r };
      },
      posAt: function (ln, d) {
        d = Math.max(0, Math.min(ln.len, d));
        for (var i = 0; i < ln.segs.length; i++) {
          if (d <= ln.segs[i]) { var f = d / ln.segs[i]; return [ln.pts[i][0] + (ln.pts[i + 1][0] - ln.pts[i][0]) * f, ln.pts[i][1] + (ln.pts[i + 1][1] - ln.pts[i][1]) * f]; }
          d -= ln.segs[i];
        }
        return ln.pts[ln.pts.length - 1];
      },
      draw: function (dt) {
        var s = scene; ctx.clearRect(0, 0, w, h); orbs();
        ctx.lineJoin = 'round';
        s.buses.forEach(function (b) {
          var g = ctx.createLinearGradient(b.startX, 0, b.endX, 0);
          g.addColorStop(0, rgba(CY, 0.32)); g.addColorStop(1, rgba(CY, 0.07));
          b.lines.forEach(function (ln) {
            ctx.beginPath();
            ln.pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
            ctx.strokeStyle = g; ctx.lineWidth = 1.3; ctx.stroke();
            var e = ln.pts[ln.pts.length - 1];
            ctx.strokeStyle = rgba(CY, 0.3); ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(e[0], e[1], 3, 0, TAU); ctx.stroke();
          });
          /* chip footprint at the end of the bus */
          var cw = 26, chh = (b.lanes - 1) * b.gap + 18, cx0 = b.endX + b.dir * 6, cy0 = b.endY + ((b.lanes - 1) * b.gap) / 2;
          ctx.strokeStyle = rgba(CY, 0.2); ctx.lineWidth = 1;
          ctx.strokeRect(b.dir > 0 ? cx0 : cx0 - cw, cy0 - chh / 2, cw, chh);
        });
        s.next -= dt;
        if (s.next <= 0 && s.pulses.length < 14) {
          var b = s.buses[(s.r() * s.buses.length) | 0], ln = b.lines[(s.r() * b.lines.length) | 0];
          s.pulses.push({ ln: ln, d: 0, v: 90 + s.r() * 100, col: s.r() < 0.3 ? MINT : CY });
          s.next = 0.28 + s.r() * 0.3;
        }
        var self = this;
        s.pulses = s.pulses.filter(function (p) {
          p.d += p.v * dt;
          var head = self.posAt(p.ln, p.d), tail = self.posAt(p.ln, p.d - 34);
          var tg = ctx.createLinearGradient(tail[0], tail[1], head[0], head[1]);
          tg.addColorStop(0, rgba(p.col, 0)); tg.addColorStop(1, rgba(p.col, 0.75));
          ctx.strokeStyle = tg; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(tail[0], tail[1]); ctx.lineTo(head[0], head[1]); ctx.stroke();
          var rg = ctx.createRadialGradient(head[0], head[1], 0, head[0], head[1], 8);
          rg.addColorStop(0, rgba(p.col, 0.8)); rg.addColorStop(1, rgba(p.col, 0));
          ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(head[0], head[1], 8, 0, TAU); ctx.fill();
          if (p.d >= p.ln.len) { s.flashes.push({ x: head[0], y: head[1], life: 1, col: p.col }); return false; }
          return true;
        });
        s.flashes = s.flashes.filter(function (f) {
          f.life -= dt * 1.4;
          ctx.strokeStyle = rgba(f.col, 0.5 * f.life); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(f.x, f.y, 3 + (1 - f.life) * 14, 0, TAU); ctx.stroke();
          return f.life > 0;
        });
      }
    },

    /* ---------------- APPLICATION: hex service mesh ---------------- */
    application: {
      init: function () {
        var S = small() ? 28 : 38, HW = Math.sqrt(3) * S, VH = 1.5 * S;
        var fx = w * 0.84, fy = h * 0.14, maxD = Math.hypot(w * 0.8, h * 0.9);
        var cells = [], row = 0, NB = 5, buckets = [];
        for (var b = 0; b < NB; b++) buckets.push(new Path2D());
        for (var y = -S; y < h + S; y += VH, row++) {
          for (var x = -HW + (row % 2 ? HW / 2 : 0); x < w + HW; x += HW) {
            var d = Math.min(0.999, Math.hypot(x - fx, y - fy) / maxD);
            cells.push({ x: x, y: y, e: 0, col: CY, nb: [], dist: Math.hypot(x - fx, y - fy) });
            hexAdd(buckets[(d * NB) | 0], x, y, S);
          }
        }
        for (var i = 0; i < cells.length; i++) for (var j = i + 1; j < cells.length; j++) {
          if (Math.hypot(cells[i].x - cells[j].x, cells[i].y - cells[j].y) < HW * 1.05) { cells[i].nb.push(cells[j]); cells[j].nb.push(cells[i]); }
        }
        return { S: S, cells: cells, buckets: buckets, NB: NB, walkers: [], nextWalk: 0.4, ripples: [], nextRip: 2.5 };
      },
      draw: function (dt) {
        var s = scene; ctx.clearRect(0, 0, w, h); orbs(); ctx.lineWidth = 1;
        for (var b = 0; b < s.NB; b++) {
          ctx.strokeStyle = rgba(CY, 0.14 * Math.pow(1 - b / s.NB, 1.8) + 0.024);
          ctx.stroke(s.buckets[b]);
        }
        /* request paths hopping across the mesh */
        s.nextWalk -= dt;
        if (s.nextWalk <= 0 && s.walkers.length < 4) {
          var c = s.cells[(Math.random() * s.cells.length) | 0];
          if (c.x > 0 && c.x < w && c.y > 0 && c.y < h) s.walkers.push({ c: c, prev: null, left: 6 + ((Math.random() * 4) | 0), tm: 0, col: Math.random() < 0.7 ? CY : MINT });
          s.nextWalk = 1.1 + Math.random() * 1.4;
        }
        s.walkers = s.walkers.filter(function (wk) {
          wk.tm -= dt;
          if (wk.tm <= 0) {
            wk.c.e = 1; wk.c.col = wk.col;
            var opts = wk.c.nb.filter(function (n) { return n !== wk.prev; });
            if (!opts.length || wk.left-- <= 0) { if (Math.random() < 0.12) { wk.c.col = AMBER; wk.c.e = 1.4; } return false; }
            wk.prev = wk.c; wk.c = opts[(Math.random() * opts.length) | 0]; wk.tm = 0.2;
          }
          return true;
        });
        /* occasional ripple */
        s.nextRip -= dt;
        if (s.nextRip <= 0) {
          var o = s.cells[(Math.random() * s.cells.length) | 0];
          s.ripples.push({ x: o.x, y: o.y, r: 0 }); s.nextRip = 6 + Math.random() * 3;
        }
        s.ripples = s.ripples.filter(function (rp) {
          rp.r += 130 * dt;
          s.cells.forEach(function (c) {
            var k = Math.abs(Math.hypot(c.x - rp.x, c.y - rp.y) - rp.r);
            if (k < 30) { var v = (1 - k / 30) * 0.4; if (v > c.e) { c.e = v; c.col = CY; } }
          });
          return rp.r < 300;
        });
        s.cells.forEach(function (c) {
          if (c.e <= 0.02) { c.e = 0; return; }
          var path = new Path2D(); hexAdd(path, c.x, c.y, s.S - 3);
          var a = Math.min(1, c.e);
          ctx.fillStyle = rgba(c.col, a * 0.14); ctx.fill(path);
          ctx.strokeStyle = rgba(c.col, a * 0.55); ctx.stroke(path);
          c.e -= dt * 0.7;
        });
        s.walkers.forEach(function (wk) {
          var g = ctx.createRadialGradient(wk.c.x, wk.c.y, 0, wk.c.x, wk.c.y, 14);
          g.addColorStop(0, rgba(wk.col, 0.55)); g.addColorStop(1, rgba(wk.col, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(wk.c.x, wk.c.y, 14, 0, TAU); ctx.fill();
        });
      }
    },

    /* ---------------- SECURITY: shield radar ---------------- */
    security: {
      init: function () {
        var k = Math.max(0.6, Math.min(1.2, Math.min(w, h) / 900));
        return { cx: small() ? w * 0.5 : w * 0.78, cy: small() ? h * 0.36 : h * 0.47, k: k, rot: 0, a: 0, blips: [], next: 0.8 };
      },
      shield: function (cx, cy, r) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.bezierCurveTo(cx + .35 * r, cy - .8 * r, cx + .65 * r, cy - .72 * r, cx + .9 * r, cy - .72 * r);
        ctx.bezierCurveTo(cx + .9 * r, cy - .1 * r, cx + .7 * r, cy + .55 * r, cx, cy + r);
        ctx.bezierCurveTo(cx - .7 * r, cy + .55 * r, cx - .9 * r, cy - .1 * r, cx - .9 * r, cy - .72 * r);
        ctx.bezierCurveTo(cx - .65 * r, cy - .72 * r, cx - .35 * r, cy - .8 * r, cx, cy - r);
        ctx.closePath();
      },
      draw: function (dt) {
        var s = scene, cx = s.cx, cy = s.cy, k = s.k, i;
        ctx.clearRect(0, 0, w, h); orbs();
        s.rot += dt * 0.04; s.a = (s.a + dt * 0.55) % TAU;

        /* soft aura */
        var au = ctx.createRadialGradient(cx, cy, 0, cx, cy, 460 * k);
        au.addColorStop(0, rgba(CY, 0.10)); au.addColorStop(1, rgba(CY, 0));
        ctx.fillStyle = au; ctx.beginPath(); ctx.arc(cx, cy, 460 * k, 0, TAU); ctx.fill();

        /* degree ticks */
        ctx.beginPath();
        for (i = 0; i < 120; i++) {
          var a = i * TAU / 120 + s.rot, len = i % 10 === 0 ? 14 : (i % 5 === 0 ? 9 : 5), r0 = 430 * k;
          ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * (r0 + len * k), cy + Math.sin(a) * (r0 + len * k));
        }
        ctx.strokeStyle = rgba(CY, 0.2); ctx.lineWidth = 1; ctx.stroke();

        /* rings */
        [[330, 0.05, []], [520, 0.06, [2, 10]], [610, 0.04, []]].forEach(function (r) {
          ctx.setLineDash(r[2]); ctx.strokeStyle = rgba(CY, r[1]); ctx.beginPath(); ctx.arc(cx, cy, r[0] * k, 0, TAU); ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.lineWidth = 2;
        for (i = 0; i < 3; i++) {
          var a0 = -t * 0.18 + i * TAU / 3;
          ctx.strokeStyle = rgba(MINT, 0.2); ctx.beginPath(); ctx.arc(cx, cy, 395 * k, a0, a0 + 0.9); ctx.stroke();
        }

        /* sweep */
        if (ctx.createConicGradient) {
          var cg = ctx.createConicGradient(s.a, cx, cy);
          cg.addColorStop(0, rgba(CY, 0.13)); cg.addColorStop(0.003, rgba(CY, 0));
          cg.addColorStop(0.9, rgba(CY, 0)); cg.addColorStop(1, rgba(CY, 0.13));
          ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, 610 * k, 0, TAU); ctx.fill();
        }

        /* shield with scan line */
        this.shield(cx, cy, 235 * k);
        ctx.fillStyle = rgba(CY, 0.05); ctx.fill();
        var sg = ctx.createLinearGradient(0, cy - 235 * k, 0, cy + 235 * k);
        sg.addColorStop(0, rgba(MINT, 0.5)); sg.addColorStop(1, rgba(CY, 0.2));
        ctx.strokeStyle = sg; ctx.lineWidth = 2; ctx.stroke();
        ctx.save(); this.shield(cx, cy, 235 * k); ctx.clip();
        var by = cy - 235 * k + ((t * 0.22) % 1) * 470 * k;
        var bg = ctx.createLinearGradient(0, by - 70 * k, 0, by + 4);
        bg.addColorStop(0, rgba(MINT, 0)); bg.addColorStop(1, rgba(MINT, 0.22));
        ctx.fillStyle = bg; ctx.fillRect(cx - 260 * k, by - 70 * k, 520 * k, 74 * k);
        ctx.restore();
        this.shield(cx, cy, 185 * k); ctx.strokeStyle = rgba(CY, 0.14); ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = rgba(MINT, 0.5 + 0.2 * Math.sin(t * 1.6)); ctx.beginPath(); ctx.arc(cx, cy, 4 * k + 1, 0, TAU); ctx.fill();

        /* detect → lock → contain */
        s.next -= dt;
        if (s.next <= 0 && s.blips.length < 4) {
          var rr = (300 + Math.random() * 280) * k, aa = s.a - 0.06;
          s.blips.push({ x: cx + Math.cos(aa) * rr, y: cy + Math.sin(aa) * rr, t: 0 });
          s.next = 1.8 + Math.random() * 1.2;
        }
        s.blips = s.blips.filter(function (b) {
          b.t += dt;
          var x = b.x, y = b.y;
          if (b.t < 1.3) {
            var p = 0.5 + 0.5 * Math.sin(b.t * 9);
            var g = ctx.createRadialGradient(x, y, 0, x, y, 18); g.addColorStop(0, rgba(CORAL, 0.5)); g.addColorStop(1, rgba(CORAL, 0));
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.fill();
            ctx.fillStyle = rgba(CORAL, 0.6 + p * 0.4); ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill();
          } else if (b.t < 2.2) {
            var q = (b.t - 1.3) / 0.9, sz = 18 - q * 9, l = sz * 0.5;
            ctx.strokeStyle = rgba(AMBER, 0.85); ctx.lineWidth = 1.4; ctx.beginPath();
            [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) {
              ctx.moveTo(x + c[0] * sz, y + c[1] * (sz - l)); ctx.lineTo(x + c[0] * sz, y + c[1] * sz); ctx.lineTo(x + c[0] * (sz - l), y + c[1] * sz);
            });
            ctx.stroke();
            ctx.fillStyle = rgba(AMBER, 0.9); ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill();
          } else {
            var f = Math.max(0, 1 - (b.t - 2.2) / 0.9);
            ctx.strokeStyle = rgba(MINT, 0.6 * f); ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.arc(x, y, 6 + (1 - f) * 22, 0, TAU); ctx.stroke();
            ctx.fillStyle = rgba(MINT, 0.9 * f); ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill();
          }
          return b.t < 3.1;
        });
      }
    },

    /* ---------------- CYBI AI: neural constellation ---------------- */
    cybi: {
      init: function () {
        var n = small() ? 30 : Math.min(70, Math.round(w * h / 26000)), pts = [], i;
        for (i = 0; i < n; i++) {
          var a = Math.random() * TAU, z = 0.4 + Math.random() * 0.6, v = (4 + Math.random() * 9) * z;
          pts.push({ x: Math.random() * w, y: Math.random() * h, vx: Math.cos(a) * v, vy: Math.sin(a) * v, z: z });
        }
        var cols = [], cn = small() ? 3 : 7;
        for (i = 0; i < cn; i++) {
          var chars = []; for (var q = 0; q < 16; q++) chars.push(Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0'));
          cols.push({ x: 24 + (i + Math.random() * 0.6) * ((w - 48) / cn), y: Math.random() * h, v: 22 + Math.random() * 28, len: 9 + ((Math.random() * 6) | 0), chars: chars, sw: 0 });
        }
        return { pts: pts, cols: cols, link: small() ? 120 : 165, pulses: [], next: 0.5, cx: w * 0.5, cy: h * 0.4, rings: [], nextRing: 0.6 };
      },
      draw: function (dt) {
        var s = scene, P = s.pts, i, j, edges = [];
        ctx.clearRect(0, 0, w, h); orbs();

        /* hex byte streams (very faint, margins) */
        ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace'; ctx.textAlign = 'center';
        s.cols.forEach(function (c) {
          c.y += c.v * dt; c.sw -= dt;
          if (c.sw <= 0) { c.chars[(Math.random() * c.chars.length) | 0] = Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0'); c.sw = 0.25; }
          if (c.y - c.len * 17 > h) { c.y = -10; }
          for (var q = 0; q < c.len; q++) {
            var yy = c.y - q * 17; if (yy < -10 || yy > h + 10) continue;
            var f = 1 - q / c.len;
            ctx.fillStyle = q === 0 ? rgba(MINT, 0.42) : rgba(CY, 0.15 * f);
            ctx.fillText(c.chars[q % c.chars.length], c.x, yy);
          }
        });

        /* constellation */
        for (i = 0; i < P.length; i++) {
          var p = P[i]; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
        }
        ctx.lineWidth = 1;
        for (i = 0; i < P.length; i++) for (j = i + 1; j < P.length; j++) {
          var dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < s.link) {
            ctx.strokeStyle = rgba(CY, 0.21 * (1 - d / s.link) * Math.min(P[i].z, P[j].z));
            ctx.beginPath(); ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(P[j].x, P[j].y); ctx.stroke();
            edges.push([P[i], P[j]]);
          }
        }
        P.forEach(function (p) { ctx.fillStyle = rgba(CY, 0.25 + 0.4 * p.z); ctx.beginPath(); ctx.arc(p.x, p.y, 0.8 + 1.6 * p.z, 0, TAU); ctx.fill(); });

        s.next -= dt;
        if (s.next <= 0 && edges.length) {
          var e = edges[(Math.random() * edges.length) | 0];
          s.pulses.push({ a: e[0], b: e[1], t: 0, col: Math.random() < 0.3 ? MINT : CY });
          s.next = 0.14;
        }
        s.pulses = s.pulses.filter(function (q) {
          q.t += dt * 0.9; if (q.t >= 1) return false;
          var x = q.a.x + (q.b.x - q.a.x) * q.t, y = q.a.y + (q.b.y - q.a.y) * q.t;
          var g = ctx.createRadialGradient(x, y, 0, x, y, 9); g.addColorStop(0, rgba(q.col, 0.85)); g.addColorStop(1, rgba(q.col, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); return true;
        });

        /* core aura + rings */
        s.nextRing -= dt;
        if (s.nextRing <= 0) { s.rings.push({ r: 24, life: 1 }); s.nextRing = 3.4; }
        s.rings = s.rings.filter(function (r) {
          r.life -= dt * 0.22; r.r += dt * 110;
          ctx.strokeStyle = rgba(CY, 0.16 * r.life); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(s.cx, s.cy, r.r, 0, TAU); ctx.stroke();
          return r.life > 0;
        });
        var cg = ctx.createRadialGradient(s.cx, s.cy, 0, s.cx, s.cy, 110);
        cg.addColorStop(0, rgba(CY, 0.14 + 0.04 * Math.sin(t * 1.4))); cg.addColorStop(1, rgba(CY, 0));
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(s.cx, s.cy, 110, 0, TAU); ctx.fill();
      }
    }
  };

  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    SCENES[mode].draw(dt);
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () { last = performance.now(); });
  resize();
  if (!reduced) requestAnimationFrame(frame);
})();

/* heading intro plays once per page load; later re-renders skip it */
setTimeout(function () { document.documentElement.classList.add('intro-done'); }, 3200);
