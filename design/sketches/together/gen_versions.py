# Five versions of "paint and glass" (2.html): same core, each carrying other things he likes.
import re
base = open('2.html').read()
a = base.index('  function ribbons () {'); b = base.index('  function buildGlass () {')
OLD_RIBBONS = base[a:b]

PRE = '''  function ribbons () {
    const out = []
    const colL = zones[0].cx - zones[0].hw, colR = zones[0].cx + zones[0].hw, mg = Math.min(colL, W - colR)
    zones.forEach((z, i) => {
      const left = i % 2 === 0
      let cx, cy, room
      if (!wide) {
        const n = zones[i + 1], top = z.cy + z.hh, bottom = n ? n.cy - n.hh : DOC - 30, gh = bottom - top
        if (gh < 140) return
        cx = W / 2; cy = top + gh / 2; room = gh
      } else { cx = left ? colL - mg * 0.5 : colR + mg * 0.5; cy = z.cy; room = Math.min(mg * 0.9, 2 * z.hh + 160) }
      const push = (x, y, a, len, wid, ink) => out.push({ x1: x, y1: y, a1: a, len, wid, ink })
@@ARR@@
    })
    return out
  }
'''
ARR = {
 'ring': '''      // laid like the leaves: pointing out from a centre, yellow at the top deepening to red below
      const S = wide ? 1.35 : 1, r = Math.min(room * 0.2, 56) * S, K = 14
      for (let k = 0; k < K; k++) {
        const t = -Math.PI / 2 + k / K * Math.PI * 2, L = rnd(46, 56) * S, g = (1 - Math.cos(t + Math.PI / 2)) / 2
        push(cx + Math.cos(t) * (r + L / 2), cy + Math.sin(t) * (r + L / 2), t, L, rnd(15, 19) * S, INKS[[5, 0, 7, 1][Math.min(3, Math.floor(g * 4))]])
      }''',
 'weave': '''      // crossed both ways like a twill, in indigo, madder and turmeric
      const S = wide ? 1.35 : 1, K = 16
      for (let k = 0; k < K; k++) {
        const u = (k + 0.5) / K, L = rnd(64, 74) * S, ink = INKS[[3, 1, 0][k % 3]], s = k % 2 ? 0.78 : -0.78
        if (!wide) push(W * (0.07 + 0.86 * u), cy, s, L, rnd(15, 18), ink)
        else push(cx, cy - room * 0.45 + room * 0.9 * u, Math.PI / 2 + s, L, rnd(21, 25), ink)
      }''',
 'highlight': '''      // laid under the words like a glaze: one sweep under the first line, one through the middle, one under the last
      const x0 = z.cx - z.hw + 16, w = 2 * z.hw - 32, fam = FAMILY[i % FAMILY.length]
      ;[[z.cy - z.hh + 32, 0.66], [z.cy, 0.4], [z.cy + z.hh - 30, 0.52]].forEach(([y, f], j) => {
        const L = w * f, x = j % 2 ? x0 + w - L / 2 : x0 + L / 2
        push(x, y, rnd(-0.025, 0.025), L, wide ? 34 : 28, INKS[fam[j % 2]])
      })''',
 'column': '''      // one warm column of glass in a cool concrete room, laid in courses like a lit window
      const S = wide ? 1.4 : 1, K = wide ? 7 : 5, x = wide ? cx : W * (left ? 0.7 : 0.3)
      for (let k = 0; k < K; k++) push(x + rnd(-5, 5), cy - (K - 1) * 8.5 * S + k * 17 * S, rnd(-0.02, 0.02), rnd(96, 116) * S, rnd(15, 18) * S, INKS[k % 3 === 1 ? 5 : 0])''',
}

V = {
 1: dict(title='Paint and glass, dusk', what='Dusk: the same page after dark. Warm lamplight round the words, sodium-amber glass, a cool note.',
   css={'--linen': '#2b2621', '--ink': '#f1e7d6', '--ink-soft': '#bcae98', '--link': '#e8a54a', '--chip': 'rgba(40, 34, 29, .88)'},
   grey="['#1f1b17', '#27221d', '#2f2924', '#38312a', '#5a4630', '#45392f', '#6b5236', '#7d6040', '#8f6e45']",
   pale="['#2f2823', '#2b2520', '#332b25', '#29231e', '#30292']".replace("'#30292'", "'#312a24'"),
   mud='[48, 40, 34]', light='rgba(255, 196, 120, .42), rgba(255, 170, 90, .14) 50%, rgba(255, 170, 90, 0)',
   inks="[['#e8901a', '#ffcf70'], ['#d9541c', '#f6a066'], ['#cf5578', '#f0a2b8'], ['#3a5fb8', '#8fa9ea'], ['#2a8a86', '#8ccdc6'], ['#f0b23a', '#ffe39a'], ['#6c4ca6', '#b8a2e0'], ['#de6e2e', '#f4b07c']]",
   family='[[0, 5], [0, 1], [5, 3], [0, 4], [1, 5], [5, 0]]', arr=None),
 2: dict(title='Paint and glass, leaves', what='Leaves: the glass gathers into a ring beside each passage, yellow at the top deepening to red, after the Goldsworthy still you liked.',
   arr='ring'),
 3: dict(title='Paint and glass, ikat', what='Ikat: cotton-pale paint, and glass in indigo, madder and turmeric that crosses into a woven band, from the Kerala market and the dye colours you liked.',
   css={'--linen': '#b8ae9f'},
   grey="['#9c9284', '#a99f90', '#b4aa9b', '#bdb3a4', '#c2b59c', '#c9bfb0', '#cdbf9f', '#d6ccbd', '#e2d8c8']",
   pale="['#e8dfd0', '#e4dbcc', '#ece4d6', '#e0d7c8', '#e6ddce']",
   inks="[['#d39a2a', '#f2cd72'], ['#a8382e', '#e0877a'], ['#cf5578', '#f0a2b8'], ['#2b3f86', '#7d92d0'], ['#4f7a52', '#a2c494'], ['#e2b532', '#f5df8a'], ['#6f3383', '#b885c9'], ['#c4521f', '#eba26f']]",
   arr='weave'),
 4: dict(title='Paint and glass, highlight', what='Highlight: the glass settles under the words you have reached, like the colour arriving under the words in round 2, sketch 2.',
   arr='highlight'),
 5: dict(title='Paint and glass, concrete', what='Concrete: cool board-marked greys laid flat like the Barbican, and one warm column of glass beside each passage, a lit window in a cold building.',
   css={'--linen': '#8e8c87'},
   grey="['#6d6c69', '#7b7a76', '#878581', '#93918c', '#9a968e', '#a3a09a', '#aaa59b', '#b7b3ab', '#c4c0b7']",
   pale="['#cfcbc3', '#cbc7bf', '#d3cfc7', '#c8c4bc', '#d0ccc4']",
   light='rgba(255, 214, 150, .5), rgba(255, 196, 120, .16) 50%, rgba(255, 196, 120, 0)',
   inks="[['#e8901a', '#ffcf70'], ['#d9541c', '#f6a066'], ['#cf5578', '#f0a2b8'], ['#3a5fb8', '#8fa9ea'], ['#2a8a86', '#8ccdc6'], ['#f0b23a', '#ffe39a'], ['#6c4ca6', '#b8a2e0'], ['#de6e2e', '#f4b07c']]",
   flat=True, arr='column'),
}

def rep(s, a, b):
    assert s.count(a) == 1, ('missing', a[:80]); return s.replace(a, b)

for n, v in V.items():
    s = base
    s = rep(s, '<title>Together, paint and glass</title>', f"<title>{v['title'].replace('Paint and glass', 'Together')}</title>")
    for k, val in v.get('css', {}).items():
        s = re.sub(rf'  {k}: [^;]+;', f'  {k}: {val};', s, count=1)
    if 'grey' in v: s = re.sub(r"  const GREY = \[[^\]]+\]", f"  const GREY = {v['grey']}", s, count=1)
    if 'pale' in v: s = re.sub(r"  const PALE = \[[^\]]+\]", f"  const PALE = {v['pale']}", s, count=1)
    if 'mud' in v: s = rep(s, 'const MUD = [122, 110, 98]', f"const MUD = {v['mud']}")
    if 'light' in v: s = rep(s, 'rgba(255, 241, 216, .5), rgba(255, 236, 206, .18) 50%, rgba(255, 236, 206, 0)', v['light'])
    if 'inks' in v: s = re.sub(r"  const INKS = \[\[.*?\]\]\n", f"  const INKS = {v['inks']}\n", s, count=1)
    if 'family' in v: s = re.sub(r"  const FAMILY = \[\[.*?\]\]\n", f"  const FAMILY = {v['family']}\n", s, count=1)
    if v.get('flat'):
        s = rep(s, 'add(0.4 * Math.sin(y / 150 + x / 290) + 0.28 * Math.sin(y / 95 - x / 180 + 1.7) + 0.16 * Math.sin(x / 70 + y / 230), 1)', 'add(0.06 * Math.sin(y / 300 + x / 520), 2.2)')
        s = rep(s, 'function placeWhorls () {\n    whorls = []', 'function placeWhorls () {\n    whorls = []\n    return')
    if v['arr']: s = rep(s, OLD_RIBBONS, PRE.replace("@@ARR@@", ARR[v["arr"]]))
    s = rep(s, 'const len = m.len, wid = wide ? rnd(38, 46) : rnd(27, 33)', 'const len = m.len, wid = m.wid || (wide ? rnd(38, 46) : rnd(27, 33))')
    s = s.replace('<a class="back" href="../index.html">All sketches</a>', '<a class="back" href="../index.html">All sketches</a>', 1)
    open(f'v{n}.html', 'w').write(s)
    print('wrote', f'v{n}.html', '-', v['title'])
open('versions.txt', 'w').write('\n'.join(f"v{n}\t{v['title']}\t{v['what']}" for n, v in V.items()))
