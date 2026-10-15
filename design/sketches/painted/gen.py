# Two versions of painted words: a quieter base, and two ways the colour arrives (currents, gust).
base = open('1.html').read()
def rep(s, a, b):
    assert s.count(a) == 1, ('missing', a[:90]); return s.replace(a, b)

common = base
common = rep(common, '#words { z-index: 1; }', '#colour { z-index: 1; }\n#words { z-index: 1; }')
common = rep(common, '<canvas id="words" aria-hidden="true"></canvas>', '<canvas id="colour" aria-hidden="true"></canvas>\n<canvas id="words" aria-hidden="true"></canvas>')
common = rep(common, "  const wc = document.getElementById('words'), w = wc.getContext('2d')",
  "  const wc = document.getElementById('words'), w = wc.getContext('2d')\n  const cc = document.getElementById('colour'), cx = cc.getContext('2d')")
common = rep(common, "    for (const c of [gc, wc]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr) }",
  "    for (const c of [gc, wc, cc]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr) }\n    marks = []")
# quieter: the ground keeps round 1's grey, with a little muted colour toward the side edges
common = rep(common, "        paint(g, px, py, a, shapeFor(len + wd * 0.6, wd * 1.3, rnd(-0.18, 0.18)), pick(GREY), 0.9, wd)",
  "        const edge = Math.abs(px - W / 2) / (W / 2), col = Math.random() < 0.015 + 0.2 * edge * edge * edge ? mute(pick(ACCENT)) : pick(GREY)\n        paint(g, px, py, a, shapeFor(len + wd * 0.6, wd * 1.3, rnd(-0.18, 0.18)), col, 0.9, wd)")
common = rep(common, "  const PALE = hex('#d8d0c4'), GROUND = hex('#a39b92')",
  "  const PALE = hex('#d8d0c4'), GROUND = hex('#a39b92')\n  const ACCENT = ['#e2a136', '#d4532f', '#dc6a84', '#3a63b4', '#2f8d84', '#eac34a', '#7a5bb0', '#e27a3a'].map(hex)\n  // round 1's colours, a step quieter: pulled a little toward the grey\n  const mute = c => mix(c, GROUND, 0.3)\n  const hsh = (i, j) => { let h = Math.imul(i, 374761393) + Math.imul(j, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }\n  const smo = t => t * t * (3 - 2 * t)\n  const vnoise = (x, y) => { const i = Math.floor(x), j = Math.floor(y), fx = smo(x - i), fy = smo(y - j), a = hsh(i, j), b = hsh(i + 1, j), c = hsh(i, j + 1), d = hsh(i + 1, j + 1); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy }")
# the words' own colours, a touch quieter too
common = rep(common, "  TABS.forEach(t => { t.rich = t.fam.map(hex) })", "  TABS.forEach(t => { t.rich = t.fam.map(h => mix(hex(h), hex('#a39b92'), 0.12)) })")
# out with the spiral
a = common.index('  // the swirl: a field of strokes that curls round'); b = common.index('  function showPanel (t) {')
common = common[:a] + '@@OPTION@@\n' + common[b:]
common = rep(common, "    measureText(t)\n", "    measureText(t)\n")
common = rep(common, "    swirl(L)\n  }", "    arrive(L)\n  }")
common = rep(common, "  setTimeout(() => { const L = labels[0]; L.burst = 1; swirl(L, 0.45) }, reduce ? 0 : 1300)",
  "  setTimeout(() => { const L = labels[0]; L.burst = 1; arrive(L, true) }, reduce ? 0 : 1300)")
common = rep(common, "    if (queue.length) stepQueue(now)", "    colourFrame(now)")
common = rep(common, "settle: () => { if (queue.length) stepQueue(1e12) },", "settle: () => { settleAll() },")

SHARED = r'''  // ---- the colour layer: marks that arrive, live, and fade when the next word is chosen ----
  let marks = [], lastDraw = 0
  const avoidText = (x, y, pad) => { const t = textBox; return t && x > t.x0 - pad && x < t.x1 + pad && y > t.y0 - pad && y < t.y1 + pad }
  const inCanvas = (x, y) => wide ? x < W * 0.56 + rnd(-40, 40) : y < H * 0.62 + rnd(-30, 30)
  function retire (now) { for (const m of marks) if (!m.out) m.out = now }
  function drawMarks (now, t) {
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cc.width, cc.height)
    for (let i = marks.length - 1; i >= 0; i--) { const m = marks[i]; if (m.out && now - m.out > 1100) marks.splice(i, 1) }
    for (const m of marks) {
      const st = place(m, now, t)
      if (!st) continue
      let al = st.al
      if (m.out) al *= Math.max(0, 1 - (now - m.out) / 1100)
      if (al <= 0.01) continue
      cx.save(); cx.translate(0, 0)
      const c = Math.cos(st.a), s = Math.sin(st.a), k = st.k ?? 1
      cx.setTransform(dpr * c * k, dpr * s * k, -dpr * s * k, dpr * c * k, dpr * (st.x + 1.2), dpr * (st.y + 1.4)); cx.fillStyle = css(mix(st.col, [58, 42, 30], 0.3), 0.22 * al); cx.fill(m.sh)
      cx.setTransform(dpr * c * k, dpr * s * k, -dpr * s * k, dpr * c * k, dpr * st.x, dpr * st.y); cx.fillStyle = css(st.col, al); cx.fill(m.sh)
      cx.restore()
    }
  }
  function colourFrame (now) {
    const busy = marks.some(m => !m.settled || m.out)
    // while things arrive, every frame; once settled, a gentler pace is enough for the slow life in it
    if (!busy && now - lastDraw < 45) return
    lastDraw = now
    drawMarks(now, now / 1000)
  }
'''

CURRENTS = SHARED + r'''
  // ---- A. currents: colour leaves the word as streams, meanders across the canvas, widens, and sometimes curls ----
  function arrive (L, small) {
    const now = performance.now()
    retire(now)
    const K = small ? 4 : (wide ? 18 : 12), seed = Math.random() * 100
    for (let k = 0; k < K; k++) {
      const s0 = pick(L.strokes)
      let x = s0.x, y = s0.y
      let dir = (wide ? Math.PI : -Math.PI / 2) + rnd(-0.95, 0.95)
      const length = (small ? rnd(180, 300) : rnd(560, 1100)) * (wide ? 1 : 0.65), eddy = Math.random() < 0.35
      const tx = wide ? rnd(W * 0.03, W * 0.5) : rnd(W * 0.05, W * 0.95), ty = wide ? rnd(H * 0.03, H * 0.97) : rnd(H * 0.03, H * 0.58)
      const fam = L.t.rich, delay = rnd(0, 0.35)
      let s = 0, turn = 0
      while (s < length) {
        // the current: a slow field of drift, a pull toward where this stream wants to go, and a turn away from the words
        const fa = Math.PI * 2 * vnoise(x / 260 + seed, y / 260)
        const pull = Math.atan2(ty - y, tx - x)
        let want = dir * 0.0 + fa * 0.0
        const vx = Math.cos(dir) * 0.78 + Math.cos(fa) * 0.3 + Math.cos(pull) * 0.26, vy = Math.sin(dir) * 0.78 + Math.sin(fa) * 0.3 + Math.sin(pull) * 0.26
        want = Math.atan2(vy, vx)
        if (avoidText(x + Math.cos(want) * 34, y + Math.sin(want) * 34, 30)) { const t = textBox, away = Math.atan2(y - (t.y0 + t.y1) / 2, x - (t.x0 + t.x1) / 2), d = Math.atan2(Math.sin(away - want), Math.cos(away - want)); want += d * 0.35 }
        if (eddy && s > length - 150) turn += 0.012
        dir = want + turn
        x += Math.cos(dir) * 6; y += Math.sin(dir) * 6; s += 6
        if (x < -20 || x > W + 20 || y < -20 || y > H + 20) break
        // lay paint across the stream: narrow near the word, wider as it travels
        const u = s / length, spread = 5 + 32 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (small ? 0.6 : 1)
        const n = 1 + (Math.random() < 0.5 ? 1 : 0) + (u > 0.3 && Math.random() < 0.4 ? 1 : 0)
        for (let j = 0; j < n; j++) {
          const off = rnd(-spread, spread), px = x - Math.sin(dir) * off, py = y + Math.cos(dir) * off
          if (avoidText(px, py, 10)) continue
          const q = Math.random()
          const fi = Math.max(0, Math.min(2, Math.floor(u * 3 + rnd(-0.4, 0.4))))
          const col = q < 0.24 ? pick(GREY) : q < 0.34 ? mix(mute(fam[0]), PALE, 0.4) : mute(fam[fi])
          const len = rnd(14, 32) * (0.7 + 0.5 * Math.sin(Math.PI * u)), wd = rnd(3.5, 8.5) * (0.6 + 0.5 * Math.sin(Math.PI * u))
          marks.push({ x: px, y: py, a: dir + rnd(-0.22, 0.22), sh: shapeFor(len + wd * 0.6, wd * 1.2, rnd(-0.15, 0.15)), col, al: rnd(0.8, 0.95), s, born: now + (delay + s / 380 + rnd(0, 0.08)) * 1000, ph: Math.random() * 6.28 })
        }
      }
    }
  }
  function place (m, now, t) {
    const age = (now - m.born) / 1000
    if (age < 0 && !reduce) return null
    const grow = reduce ? 1 : Math.min(1, Math.max(0, age) / 0.4)
    if (grow >= 1 && !m.settled) m.settled = true
    // the life in it: a slow sway, and a pulse of light that travels down each current
    const pulse = reduce ? 0 : Math.max(0, Math.sin(m.s / 46 - t * 1.3)) * 0.1
    return { x: m.x, y: m.y, a: m.a + (reduce ? 0 : Math.sin(t * 0.6 + m.ph) * 0.035), col: mix(m.col, [255, 248, 232], pulse), al: m.al * ease(grow), k: 0.55 + 0.45 * ease(grow) }
  }
  function settleAll () { for (const m of marks) { m.born = 0; m.settled = true } }
'''

GUST = SHARED + r'''
  // ---- B. gust: a flurry of strokes leaves the word, tumbles and flutters across, and settles into drifts ----
  const restAngle = (x, y) => 0.85 * (Math.sin(x * 0.0042 + 1.3) + Math.cos(y * 0.0037) + 0.6 * Math.sin((x + y) * 0.0019))
  function arrive (L, small) {
    const now = performance.now()
    retire(now)
    const cell = wide ? 15 : 13, seed = Math.random() * 100, fam = L.t.rich
    const ox = L.x + L.w / 2, oy = L.y + L.h / 2
    for (let y = 0; y < H; y += cell) {
      for (let x = 0; x < W; x += cell) {
        const px = x + rnd(0, cell), py = y + rnd(0, cell)
        if (!inCanvas(px, py) || avoidText(px, py, 14)) continue
        // colour gathers in drifts, leaving grey between
        const drift = smo(Math.min(1, Math.max(0, (vnoise(px / 170 + seed, py / 170) - 0.34) / 0.36)))
        let p = drift * 0.9
        if (small) p *= Math.max(0, 1 - Math.hypot(px - ox, py - oy) / 420) * 0.6
        if (Math.random() > p) continue
        const q = Math.random()
        const col = q < 0.26 ? pick(GREY) : q < 0.36 ? mix(mute(pick(fam)), PALE, 0.4) : mute(pick(fam))
        const len = rnd(16, 36), wd = rnd(4, 9)
        const s0 = pick(L.strokes), dist = Math.hypot(px - s0.x, py - s0.y)
        // a curved, wind-blown path: out of the word, bent by the gust, down to where it rests
        const side = Math.random() < 0.5 ? 1 : -1, bend = rnd(0.25, 0.6) * dist * side
        const mx = (s0.x + px) / 2, my = (s0.y + py) / 2, nx = -(py - s0.y) / (dist || 1), ny = (px - s0.x) / (dist || 1)
        marks.push({ x0: s0.x, y0: s0.y, cx: mx + nx * bend + rnd(-40, 40), cy: my + ny * bend - rnd(0, 80), x: px, y: py, a: restAngle(px, py) + rnd(-0.15, 0.15), spin: rnd(-3, 3) * Math.PI, sh: shapeFor(len + wd * 0.6, wd * 1.2, rnd(-0.15, 0.15)), col, al: rnd(0.82, 0.95), born: now + (rnd(0, 0.5) + dist / 900) * 1000, dur: rnd(1.1, 2.0) * 1000, ph: Math.random() * 6.28, lift: null })
      }
    }
  }
  const outEase = p => 1 - Math.pow(1 - p, 3)
  function flight (m, e, wob) {
    const u = 1 - e
    const x = u * u * m.x0 + 2 * u * e * m.cx + e * e * m.x, y = u * u * m.y0 + 2 * u * e * m.cy + e * e * m.y
    // it flutters as it falls, less as it lands
    const fl = Math.sin(e * Math.PI * 3 + m.ph) * 12 * (1 - e) * wob
    return { x: x + fl * Math.cos(m.a + 1.57), y: y + fl * Math.sin(m.a + 1.57), a: m.a + m.spin * (1 - e) * (1 - e) }
  }
  let nextGust = performance.now() + 6000
  function place (m, now, t) {
    let p = reduce ? 1 : (now - m.born) / m.dur
    if (p < 0) return null
    if (p >= 1 && !m.settled) m.settled = true
    p = Math.min(1, p)
    const e = outEase(p)
    let st = p < 1 ? flight(m, e, 1) : { x: m.x, y: m.y, a: m.a }
    // a small gust now and then lifts a few that have settled, turns them over, and sets them back down
    if (m.lift && !reduce) {
      const q = (now - m.lift.t0) / 1400
      if (q >= 1) m.lift = null
      else { const h = Math.sin(Math.PI * q); st = { x: st.x + Math.sin(q * Math.PI * 2 + m.ph) * 10 * h + m.lift.dx * h, y: st.y - 22 * h, a: st.a + m.lift.spin * h } }
    }
    const sway = reduce || p < 1 ? 0 : Math.sin(t * 0.7 + m.ph) * 0.04
    return { x: st.x, y: st.y, a: st.a + sway, col: m.col, al: m.al * Math.min(1, p * 4), k: 0.75 + 0.25 * e }
  }
  const baseFrame = colourFrame
  colourFrame = function (now) {
    if (!reduce && now > nextGust) {
      nextGust = now + rnd(4500, 7500)
      const settled = marks.filter(m => m.settled && !m.out)
      if (settled.length) {
        const c = pick(settled)
        for (const m of settled) if (Math.hypot(m.x - c.x, m.y - c.y) < 70 && Math.random() < 0.7) { m.lift = { t0: now + Math.hypot(m.x - c.x, m.y - c.y) * 4, dx: rnd(-10, 10), spin: rnd(-1.2, 1.2) }; m.settled = false; setTimeout(() => { m.settled = true }, 1500) }
      }
    }
    baseFrame(now)
  }
  function settleAll () { for (const m of marks) { m.born = -1e9; m.settled = true } }
'''

for name, block, title in [('2.html', CURRENTS, 'Painted words, currents'), ('3.html', GUST, 'Painted words, gust')]:
    s = common.replace('@@OPTION@@\n', block)
    s = s.replace('<title>Painted words</title>', f'<title>{title}</title>')
    if 'colourFrame = function' in s:
        s = s.replace('  function colourFrame (now) {', '  let colourFrame = function (now) {', 1)
    open(name, 'w').write(s); print('wrote', name)
