/* =====================================================================
   SENTINAL AI – login behaviour
   - Application ID auto-format (SNT-XXXX-XXXX) + show/hide
   - Inline validation, focus on the first problem
   - Submits straight to Django (CSRF intact); no artificial delay
   - Server messages (django.contrib.messages) trigger the error state
   - Optional lockout countdown via `lockout_seconds` in the context
   ===================================================================== */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); }, all = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var card = $('#card'), form = $('#loginForm'), btn = $('#verifyBtn'), label = $('#btnLabel'), cb = $('#clientBanner'),
      nameIn = $('#app_name'), idIn = $('#app_id'), busy = false, scanTimer;
  var bg = function (k) { if (window.SentinalBg) window.SentinalBg.pulse(k); };
  var field = function (i) { return i.closest('.lg-field'); };

  $('#eye').addEventListener('click', function () {
    var show = idIn.type === 'password'; idIn.type = show ? 'text' : 'password';
    this.setAttribute('aria-pressed', show); this.setAttribute('aria-label', (show ? 'Hide' : 'Show') + ' application ID');
  });

idIn.addEventListener('input', function (e) {
    e.target.value = e.target.value
        .trim()
        .replace(/\s/g, '');
});
  function clearErrors() {
    [nameIn, idIn].forEach(function (i) { field(i).classList.remove('bad'); i.removeAttribute('aria-invalid'); field(i).querySelector('.lg-msg').textContent = ''; });
    cb.classList.remove('show'); card.classList.remove('is-error');
    all('.lg-banner.lg-error.show:not(#clientBanner)').forEach(function (b) { b.classList.remove('show'); });
  }
  [nameIn, idIn].forEach(function (i) { i.addEventListener('input', clearErrors); });

  function setErr(i, text) { field(i).classList.add('bad'); i.setAttribute('aria-invalid', 'true'); field(i).querySelector('.lg-msg').textContent = text; }
  function shake() { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
  function banner(title, text) { $('#bTitle').textContent = title; $('#bText').textContent = text; cb.classList.add('show'); card.classList.add('is-error'); }
  function reset() {
    busy = false; clearInterval(scanTimer); btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy');
    label.textContent = 'Sign in'; nameIn.readOnly = idIn.readOnly = false;
  }

  form.addEventListener('submit', function (e) {
    if (busy || btn.classList.contains('is-lock')) { e.preventDefault(); return; }
    clearErrors();
    var n = nameIn.value.trim(), id = idIn.value.trim(), first = null;
    if (!n) { setErr(nameIn, 'Enter your application name'); first = nameIn; }
   if (!id || !/^[A-Z0-9][A-Z0-9-]{2,30}$/.test(id)) { setErr(idIn, id ? 'Application ID must look like SNT-XXXX-XXXX' : 'Enter your application ID'); first = first || idIn; }
    if (first) { e.preventDefault(); first.focus(); bg('error'); return; }
    busy = true; btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true'); label.textContent = 'Signing in…';
    nameIn.readOnly = idIn.readOnly = true;                /* readOnly (not disabled) so values are still posted */
    bg('scan'); scanTimer = setInterval(function () { bg('scan'); }, 1400);
  });

  /* server-side error → highlight both fields, animate once */
  if ($('.lg-banner.lg-error.show:not(#clientBanner)')) {
    card.classList.add('is-error');
    [nameIn, idIn].forEach(function (i) { field(i).classList.add('bad'); i.setAttribute('aria-invalid', 'true'); });
    setTimeout(function () { shake(); bg('error'); }, 450);
  }

  /* optional lockout countdown */
  var lock = parseInt(card.getAttribute('data-lock'), 10) || 0;
  if (lock > 0) {
    btn.classList.add('is-lock'); btn.setAttribute('aria-disabled', 'true'); nameIn.readOnly = idIn.readOnly = true;
    (function tick() {
      if (lock <= 0) { btn.classList.remove('is-lock'); btn.removeAttribute('aria-disabled'); reset(); clearErrors(); return; }
      label.textContent = 'Try again in ' + lock + 's';
      banner('Too many failed attempts', 'Sign-in is temporarily locked. Try again in ' + lock + ' seconds.');
      lock--; setTimeout(tick, 1000);
    })();
  }

  window.addEventListener('pageshow', function (e) { if (e.persisted) reset(); });   /* back button restores a clean form */
})();


/* =====================================================================
   SENTINAL AI – login background
   Built from the dashboard's own background engine (dashboard.js):
   drifting light orbs plus the Application tab's hex service mesh, with
   requests hopping cell to cell. Coverage is even across the screen and
   slightly stronger toward the edges so the sign-in card stays calm.
   The mesh answers actions: SentinalBg.pulse('scan' | 'error' | 'ok')
   sends a ripple outward from the centre.
   ===================================================================== */
(function () {
  'use strict';
  var cv = document.getElementById('bg'); if (!cv) return;
  var ctx = cv.getContext('2d'), reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CY = [99, 230, 242], MINT = [111, 217, 176], CORAL = [240, 138, 106], AMBER = [227, 184, 104], BLUE = [70, 120, 230], TAU = Math.PI * 2;
  var rgba = function (c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')'; };
  var ORBS = [
    { x: .12, y: .18, r: .50, sx: .06, sy: .05, sp: .07, ph: 0, a: .13, c: CY },
    { x: .88, y: .30, r: .46, sx: .06, sy: .06, sp: .05, ph: 1.5, a: .10, c: BLUE },
    { x: .80, y: .90, r: .50, sx: .07, sy: .05, sp: .06, ph: 3, a: .10, c: MINT },
    { x: .18, y: .88, r: .44, sx: .07, sy: .04, sp: .05, ph: 4.5, a: .08, c: BLUE }
  ];
  var w, h, t = 0, cx, cy, S, NB = 5, cells = [], buckets = [], walkers = [], nextWalk = .3, rips = [], nextRip = 1.5, last, raf;

  function hexAdd(p, x, y, r) { for (var q = 0; q < 6; q++) { var a = (60 * q - 30) * Math.PI / 180, px = x + r * Math.cos(a), py = y + r * Math.sin(a); q ? p.lineTo(px, py) : p.moveTo(px, py); } p.closePath(); }
  function disc(x, y, r, col, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }

  function build() {
    var dpr = Math.min(devicePixelRatio || 1, 2), b, y, x, i, j, row = 0;
    w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2; cy = h / 2; S = w < 760 ? 28 : 36;
    var HW = Math.sqrt(3) * S, VH = 1.5 * S, maxD = Math.hypot(cx, cy);
    cells = []; buckets = []; walkers = []; for (b = 0; b < NB; b++) buckets.push(new Path2D());
    for (y = -S; y < h + S; y += VH, row++) for (x = -HW + (row % 2 ? HW / 2 : 0); x < w + HW; x += HW) {
      cells.push({ x: x, y: y, e: 0, col: CY, nb: [] });
      hexAdd(buckets[Math.min(NB - 1, ((1 - Math.min(1, Math.hypot(x - cx, y - cy) / maxD)) * NB) | 0)], x, y, S);   /* edges bright, centre calm */
    }
    for (i = 0; i < cells.length; i++) for (j = i + 1; j < cells.length; j++) if (Math.hypot(cells[i].x - cells[j].x, cells[i].y - cells[j].y) < HW * 1.05) { cells[i].nb.push(cells[j]); cells[j].nb.push(cells[i]); }
    if (reduced) for (i = 0; i < 40; i++) draw(.05);
  }

  function draw(dt) {
    var b; t += dt; ctx.clearRect(0, 0, w, h);
    var big = Math.max(w, h);
    ORBS.forEach(function (o) { disc((o.x + Math.sin(t * o.sp + o.ph) * o.sx) * w, (o.y + Math.cos(t * o.sp * 1.3 + o.ph) * o.sy) * h, o.r * big, o.c, o.a); });
    ctx.lineWidth = 1;
    for (b = 0; b < NB; b++) { ctx.strokeStyle = rgba(CY, .02 + .15 * Math.pow(1 - b / NB, 1.6)); ctx.stroke(buckets[b]); }

    nextWalk -= dt;                                                    /* requests hopping across the mesh */
    if (nextWalk <= 0 && walkers.length < 7) {
      var c = cells[(Math.random() * cells.length) | 0];
      if (c.x > 0 && c.x < w && c.y > 0 && c.y < h) walkers.push({ c: c, prev: null, left: 7 + ((Math.random() * 5) | 0), tm: 0, col: Math.random() < .7 ? CY : MINT });
      nextWalk = .6 + Math.random() * .9;
    }
    walkers = walkers.filter(function (wk) {
      wk.tm -= dt;
      if (wk.tm <= 0) {
        wk.c.e = 1; wk.c.col = wk.col; var opts = wk.c.nb.filter(function (n) { return n !== wk.prev; });
        if (!opts.length || wk.left-- <= 0) { if (Math.random() < .12) { wk.c.col = AMBER; wk.c.e = 1.4; } return false; }
        wk.prev = wk.c; wk.c = opts[(Math.random() * opts.length) | 0]; wk.tm = .2;
      }
      return true;
    });
    nextRip -= dt;                                                     /* occasional ripple */
    if (nextRip <= 0) { var o = cells[(Math.random() * cells.length) | 0]; rips.push({ x: o.x, y: o.y, r: 0, v: 130, max: 320, col: CY, a: .4 }); nextRip = 4 + Math.random() * 3; }
    rips = rips.filter(function (rp) {
      rp.r += rp.v * dt;
      cells.forEach(function (c) { var d = Math.abs(Math.hypot(c.x - rp.x, c.y - rp.y) - rp.r); if (d < 34) { var v = (1 - d / 34) * rp.a; if (v > c.e) { c.e = v; c.col = rp.col; } } });
      return rp.r < rp.max;
    });
    cells.forEach(function (c) {
      if (c.e <= .02) { c.e = 0; return; }
      var p = new Path2D(); hexAdd(p, c.x, c.y, S - 3); var a = Math.min(1, c.e);
      ctx.fillStyle = rgba(c.col, a * .14); ctx.fill(p); ctx.strokeStyle = rgba(c.col, a * .55); ctx.stroke(p); c.e -= dt * .7;
    });
    walkers.forEach(function (wk) { disc(wk.c.x, wk.c.y, 14, wk.col, .55); });
  }

  function frame(now) { var dt = Math.min(.05, (now - last) / 1000); last = now; draw(dt); raf = requestAnimationFrame(frame); }
  window.SentinalBg = { pulse: function (kind) { if (!reduced) rips.push({ x: cx, y: cy, r: 0, v: 300, max: Math.hypot(cx, cy) + 80, col: kind === 'error' ? CORAL : kind === 'ok' ? MINT : CY, a: .7 }); } };
  addEventListener('resize', build);
  document.addEventListener('visibilitychange', function () { cancelAnimationFrame(raf); if (!document.hidden && !reduced) { last = performance.now(); raf = requestAnimationFrame(frame); } });
  build();
  if (!reduced) { last = performance.now(); raf = requestAnimationFrame(frame); }
})();
