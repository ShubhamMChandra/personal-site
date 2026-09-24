#!/usr/bin/env python3
"""The shelf's five spines, painted with depth, written into index.html.

HOW TO REGENERATE
  python3 scripts/tools/make-shelf-spines.py
Standard library only. The site has no build step, so the output is pasted
into index.html in place: the shared shelf gradients at the top of the
.svg-defs block, and the whole .shelf-stage (wall shadows, spines, ground
shadows, board). Edit the numbers here, never the generated markup.

THE MODEL
Volume is drawn, not built in 3D: nothing is transformed at rest and there
are no filters, masks or blend modes. Each spine is
  - a silhouette (rounded head corners, a convex headcap, softly rounded
    tail) that clips everything painted on the spine; the square board
    shoulders show only at the corners, behind the curve
  - a half-cylinder shaded from ONE lamp above the group centre and in
    front of it (LIGHT). Lambert and Phong are sampled across the spine and
    baked into gradient stops: a black overlay (diffuse falloff plus
    occlusion at the joints), a faint warm-white overlay, and a radial
    specular lobe (bounding-box units) that fades toward the tail
  - the calf or cloth tiles and the wear strips (make-textures.py)
  - occlusion in the seams where it meets its neighbour, darker at the tail
  - gilt (pewter on the cloth Colophon) whose highlight slides toward the
    lamp and dims away from it
  - a tip-lit overlay at opacity 0 that CSS fades in when the book tips
The group layout is computed here too: books stand flush and the group is
centred, so each book's offset u (-1..1 from the lamp) is known, and the
wall and ground shadow spans get their positions from it.

UNITS
Every spine is H = 1000 x vol_h units tall and draws at --spine-h / 1000 CSS
px per unit (see the TILE RULE in styles.css). depth d is the fore-edge-to-
spine depth in --spine-h units, read by scripts/shelf-geometry.js.
"""
import math
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(HERE, '..', '..', 'index.html')

# id, title, h (x --spine-h), w (x h), leather (top, mid, low), cap colour,
# title size in units, material, depth d (x --spine-h), aria-label
BOOKS = [
    dict(id='work', title='WORK', h=1.00, w=0.190, lv=('#72262b', '#5a1e22', '#46171a'), cap='#3d1417', tu=46, mat='calf', d=0.62,
         label='Work: selected roles and engagements, 2016 to present'),
    dict(id='about', title='ABOUT', h=0.94, w=0.176, lv=('#294d5a', '#1f3a44', '#172a31'), cap='#13242a', tu=43, mat='calf', d=0.64,
         label='About: introduction, background, now'),
    dict(id='contact', title='CONTACT', h=0.87, w=0.162, lv=('#2c553c', '#21402d', '#182e20'), cap='#14271b', tu=40, mat='calf', d=0.66,
         label='Contact: email, CV, LinkedIn'),
    dict(id='references', title='REFERENCES', h=0.96, w=0.204, lv=('#4b2f5c', '#3a2447', '#2b1b35'), cap='#25172e', tu=44, mat='calf', d=0.60,
         label='References: three former colleagues'),
    dict(id='colophon', title='COLOPHON', h=0.79, w=0.136, lv=('#3b3d47', '#2c2e36', '#202127'), cap='#191a1e', tu=34, mat='cloth', d=0.56,
         label='Colophon: how this site is made'),
]
GILT = ('#7a5a28', '#c9a24f', '#f1dc9a')    # dark, mid, highlight
PEWTER = ('#5a5f66', '#8e939b', '#b9bec5')  # the cloth Colophon, kept the quietest volume
# Per-emblem placement, in symbol units (the <symbol> viewBox is 20 wide):
# dx moves the ink centre onto the spine axis (the laurel path sits 1.01
# right of its symbol centre); scale enlarges about the emblem centre (the
# quill is a thin diagonal, so at the common size it read as an apostrophe).
TOOL_ADJUST = {'references': dict(dx=-1.01), 'contact': dict(scale=1.25)}

# layout in --spine-h units: books stand flush, centred on the lamp
widths = [b['h'] * b['w'] for b in BOOKS]
GROUP = sum(widths)
_x = 0.0
for b, wd in zip(BOOKS, widths):
    b['x0'] = _x
    b['u'] = (_x + wd / 2 - GROUP / 2) / (GROUP / 2)
    _x += wd

LIGHT = dict(y=0.62, z=0.80)  # above the group centre and in front, in --spine-h units


def norm(v):
    n = math.sqrt(sum(c * c for c in v))
    return tuple(c / n for c in v)


def cylinder(u, mat, n=27):
    """Shade a half-round spine (70 deg either side) lit from LIGHT.
    Returns the black overlay stops, the warm-white overlay stops, the radial
    specular stops and the specular peak's x (0..1)."""
    lx = -(GROUP / 2) * u
    lamp = norm((lx, LIGHT['y'], LIGHT['z']))
    half = norm(tuple(a + b for a, b in zip(lamp, (0, 0, 1))))
    amax = math.radians(70)
    m, ks, kd = (9, 0.26, 0.55) if mat == 'calf' else (5, 0.10, 0.58)
    samples = []
    for i in range(n):
        t = i / (n - 1)
        th = (t - 0.5) * 2 * amax
        nrm = (math.sin(th), 0.0, math.cos(th))
        diff = max(0.0, sum(a * b for a, b in zip(nrm, lamp)))
        spec = max(0.0, sum(a * b for a, b in zip(nrm, half))) ** m
        samples.append((t, diff, spec))
    dmax = max(d for _, d, _ in samples)
    dark, light, specp = [], [], []
    for t, diff, spec in samples:
        edge = (2 * t - 1) ** 2  # the leather turns away at both joints (occlusion)
        dark.append((t, min(0.56, (1 - diff / dmax) * kd + 0.12 * edge)))
        light.append((t, max(0.0, diff / dmax - 0.75) * 0.05))
        specp.append((t, spec * ks))
    tp = max(specp, key=lambda p: p[1])[0]

    def at(t):
        t = min(1.0, max(0.0, t))
        i = t * (n - 1)
        j = int(i)
        f = i - j
        return specp[j][1] if j >= n - 1 else specp[j][1] * (1 - f) + specp[j + 1][1] * f
    radial = [(r / 12, (at(tp - 0.5 * r / 12) + at(tp + 0.5 * r / 12)) / 2) for r in range(13)]
    return dark, light, radial, tp


def stops(lst, color):
    return ''.join(f'<stop offset="{o:.3f}" stop-color="{color}" stop-opacity="{a:.3f}"/>' for o, a in lst)


def fmt(x):
    s = f'{x:.2f}'.rstrip('0').rstrip('.')
    return s if s and s != '-0' else '0'


def darken(hexc, k, grey=0.0):
    r, g, b = (int(hexc[i:i + 2], 16) for i in (1, 3, 5))
    m = (r + g + b) / 3
    return '#%02x%02x%02x' % tuple(int((c * (1 - grey) + m * grey) * k) for c in (r, g, b))


def spine_svg(b, ind):
    H = 1000 * b['h']
    W = H * b['w']
    i, u, p = b['id'], b['u'], fmt
    rh, rt, rise = 0.075 * W, 0.035 * W, 0.034 * W  # head radius, tail radius, headcap rise
    shoulder = 0.9 * rise
    face = (f'M0 {p(rise + rh)}A{p(rh)} {p(rh)} 0 0 1 {p(rh)} {p(rise)}'
            f'Q{p(W / 2)} {p(-rise)} {p(W - rh)} {p(rise)}'
            f'A{p(rh)} {p(rh)} 0 0 1 {p(W)} {p(rise + rh)}'
            f'V{p(H - rt)}A{p(rt)} {p(rt)} 0 0 1 {p(W - rt)} {p(H)}'
            f'H{p(rt)}A{p(rt)} {p(rt)} 0 0 1 0 {p(H - rt)}Z')
    head = f'M{p(rh)} {p(rise)}Q{p(W / 2)} {p(-rise)} {p(W - rh)} {p(rise)}'
    capH = max(10.0, 0.072 * W)
    sliverW = 2.6 if b['mat'] == 'calf' else 2.2
    sliverA = 0.62 - 0.14 * abs(u)
    dark, light, radial, tp = cylinder(u, b['mat'])
    gl = PEWTER if b['mat'] == 'cloth' else GILT
    gpos = 0.5 - 0.16 * u                  # the gilt highlight slides toward the lamp
    gdim = max(0.74, 0.86 - 0.16 * abs(u))  # and dims away from it

    def gilt(gid, horizontal, user=None):
        attrs = (f'gradientUnits="userSpaceOnUse" x1="{p(user[0])}" y1="0" x2="{p(user[1])}" y2="0"' if user
                 else ('x1="0" y1="0" x2="1" y2="0"' if horizontal else 'x1="0" y1="0" x2="0" y2="1"'))
        c = gpos if horizontal else 0.5
        return (f'<linearGradient id="{gid}" {attrs}>'
                f'<stop offset="0" stop-color="{gl[0]}"/><stop offset="{c - 0.16:.3f}" stop-color="{gl[1]}"/>'
                f'<stop offset="{c:.3f}" stop-color="{gl[2]}"/><stop offset="{c + 0.16:.3f}" stop-color="{gl[1]}"/>'
                f'<stop offset="1" stop-color="{gl[0]}"/></linearGradient>')
    board = darken(b['lv'][1], 0.55, 0.25)  # the shoulders sit behind the curve: darker, greyer
    rim = 0.24 - 0.06 * abs(u)
    fall = 0.11 * abs(u) ** 1.4
    full = f'width="{p(W)}" height="{p(H)}"'
    tex = (f'<rect {full} fill="url(#shelf-cloth)"/>' if b['mat'] == 'cloth' else
           f'<rect {full} fill="url(#shelf-calf)"/><rect {full} fill="url(#shelf-calf2)"/><rect {full} fill="url(#shelf-sand)" opacity=".3"/>')
    rx0, rx1 = 0.12 * W, 0.88 * W
    rules = ''.join(f'<line x1="{p(rx0)}" x2="{p(rx1)}" y1="{p(y)}" y2="{p(y)}"/>'
                    for y in (0.075 * H, 0.095 * H, 0.895 * H, 0.915 * H))
    adj = TOOL_ADJUST.get(i, {})
    toolS0 = 0.126 * W
    toolS = toolS0 * adj.get('scale', 1)
    toolX = W / 2 - toolS / 2 + adj.get('dx', 0) * toolS / 20
    toolY = 0.838 * H + toolS0 / 2 - toolS / 2
    titleX, titleY = W / 2 + 0.0218 * W, 0.465 * H
    edge = 0.045 * W
    lines = [
        f'<svg class="spine" viewBox="0 0 {p(W)} {p(H)}" preserveAspectRatio="xMidYMid meet" style="--title-u:{b["tu"]}" aria-hidden="true" focusable="false">',
        '  <defs>',
        f'    <clipPath id="shelf-clip-{i}"><path d="{face}"/></clipPath>',
        f'    <linearGradient id="shelf-lv-{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{b["lv"][0]}"/><stop offset=".5" stop-color="{b["lv"][1]}"/><stop offset="1" stop-color="{b["lv"][2]}"/></linearGradient>',
        f'    <linearGradient id="shelf-cyl-d-{i}" x1="0" y1="0" x2="1" y2="0">{stops(dark, "#000")}</linearGradient>',
        f'    <linearGradient id="shelf-cyl-l-{i}" x1="0" y1="0" x2="1" y2="0">{stops(light, "#fff1dc")}</linearGradient>',
        f'    <radialGradient id="shelf-spec-{i}" cx="{tp:.3f}" cy=".3" r=".5" gradientTransform="translate({tp:.3f} .3) scale(1 1.7) translate({-tp:.3f} -.3)">{stops(radial, "#fff1dc")}</radialGradient>',
        f'    {gilt(f"shelf-gilt-{i}", True, (rx0, rx1))}',
        f'    {gilt(f"shelf-gilt-tool-{i}", True)}',
        f'    {gilt(f"shelf-gilt-t-{i}", False)}',
        f'    <linearGradient id="shelf-sliver-{i}" gradientUnits="userSpaceOnUse" x1="{p(rh)}" y1="0" x2="{p(W - rh)}" y2="0"><stop offset="0" stop-color="#d9b981" stop-opacity="0"/><stop offset=".14" stop-color="#d9b981" stop-opacity="{sliverA:.2f}"/><stop offset=".86" stop-color="#d9b981" stop-opacity="{sliverA:.2f}"/><stop offset="1" stop-color="#d9b981" stop-opacity="0"/></linearGradient>',
        '  </defs>',
        '  <!-- boards: the square shoulders that show at the rounded corners -->',
        f'  <rect y="{p(shoulder)}" width="{p(W)}" height="{p(H - shoulder)}" fill="{board}"/>',
        f'  <rect y="{p(shoulder)}" width="{p(W)}" height="2.6" fill="#fff0d8" opacity="{rim:.2f}"/>',
        f'  <rect y="{p(0.94 * H)}" width="{p(W)}" height="{p(0.06 * H)}" fill="#000" opacity=".35"/>',
        f'  <g clip-path="url(#shelf-clip-{i})">',
        '    <!-- leather, turned as a half-cylinder under the lamp -->',
        f'    <rect {full} fill="url(#shelf-lv-{i})"/>',
        f'    <rect {full} fill="url(#shelf-cyl-d-{i})"/>',
        f'    <rect {full} fill="url(#shelf-cyl-l-{i})"/>',
        f'    <rect {full} fill="url(#shelf-spec-{i})"/>',
        f'    {tex}',
        '    <!-- headcap with the page block just showing past it, and the tailcap -->',
        f'    <rect width="{p(W)}" height="{p(capH)}" fill="{b["cap"]}"/><rect width="{p(W)}" height="{p(capH)}" fill="url(#shelf-cap-head)"/>',
        f'    <rect y="{p(capH - 1.6)}" width="{p(W)}" height="1.8" fill="#000" opacity=".38"/>',
        f'    <path d="{head}" fill="none" stroke="url(#shelf-sliver-{i})" stroke-width="{p(sliverW)}" transform="translate(0 {p(sliverW / 2)})"/>',
        f'    <rect y="{p(H - capH)}" width="{p(W)}" height="{p(capH)}" fill="{b["cap"]}"/><rect y="{p(H - capH)}" width="{p(W)}" height="{p(capH)}" fill="url(#shelf-cap-tail)"/>',
        f'    <rect y="{p(H - capH)}" width="{p(W)}" height="1.6" fill="#000" opacity=".32"/>',
        '    <!-- falloff: dimmer away from the lamp, and toward the tail -->',
        f'    <rect {full} fill="#000" opacity="{fall:.3f}"/>',
        f'    <rect {full} fill="url(#shelf-vfall)"/>',
        '    <!-- rubbing at the caps and the joints -->',
        f'    <g><image href="assets/textures/wear-cap-256x48.png" width="{p(W)}" height="{p(0.044 * H)}" preserveAspectRatio="none"/><image href="assets/textures/wear-cap-256x48.png" width="{p(W)}" height="{p(0.044 * H)}" preserveAspectRatio="none" transform="translate(0 {p(H)}) scale(1 -1)"/><rect width="24" height="{p(H)}" fill="url(#shelf-wear-joint)"/><rect width="24" height="{p(H)}" fill="url(#shelf-wear-joint)" transform="translate({p(W)} 0) scale(-1 1)"/></g>',
        '    <!-- the seams: occlusion where this spine meets its neighbours, darker at the tail -->',
        f'    <rect width="{p(edge)}" height="{p(H)}" fill="url(#shelf-crevice)"/>',
        f'    <rect width="{p(edge)}" height="{p(H)}" fill="url(#shelf-crevice)" transform="translate({p(W)} 0) scale(-1 1)"/>',
        f'    <rect width="{p(edge)}" height="{p(H)}" fill="url(#shelf-crevice-tail)"/>',
        f'    <rect width="{p(edge)}" height="{p(H)}" fill="url(#shelf-crevice-tail)" transform="translate({p(W)} 0) scale(-1 1)"/>',
        '    <!-- gilt: rules and title seated in a blind impression (a dark copy .6 units above) -->',
        f'    <g fill="none" stroke-width="2.5"><g stroke="#000" opacity=".35" transform="translate(0 -.6)">{rules}</g><g stroke="url(#shelf-gilt-{i})" opacity="{gdim:.2f}">{rules}</g></g>',
        f'    <use href="#tool-{i}" x="{p(toolX)}" y="{p(toolY)}" width="{p(toolS)}" height="{p(toolS)}" fill="url(#shelf-gilt-tool-{i})" opacity="{gdim - 0.06:.2f}"/>',
        f'    <use href="#shelf-t-{i}" transform="translate(0 -.6)" fill="#000" opacity=".45"/>',
        f'    <g fill="url(#shelf-gilt-t-{i})" opacity="{min(1, gdim + 0.1):.2f}"><text id="shelf-t-{i}" class="spine-title" x="{p(titleX)}" y="{p(titleY)}" transform="rotate(90 {p(W / 2)} {p(titleY)})" text-anchor="middle" dominant-baseline="central">{b["title"]}</text></g>',
        '    <!-- lit when tipped: the face turns up toward the lamp (opacity only, see .tip-lit) -->',
        f'    <rect class="tip-lit" {full} fill="url(#shelf-tip)"/>',
        '  </g>',
        '</svg>',
    ]
    return '\n'.join(ind + ln for ln in lines)


def stage():
    ind = '    '
    wall = ''.join(f'{ind}    <span style="--x0:{b["x0"]:.4f};--bw:{b["h"] * b["w"]:.4f};--bh:{b["h"]};--u:{b["u"]:.3f};--au:{abs(b["u"]):.3f}"></span>\n' for b in BOOKS)
    ground = ''.join(f'{ind}    <span style="--x0:{b["x0"]:.4f};--bw:{b["h"] * b["w"]:.4f};--u:{b["u"]:.3f}"></span>\n' for b in BOOKS)
    books = ''.join(
        f'{ind}  <li><button class="book" type="button" data-book="{b["id"]}" aria-label="{b["label"]}" style="--vol-h:{b["h"]};--vol-w:{b["w"]};--D:{b["d"]}">\n'
        f'{spine_svg(b, ind + "      ")}\n'
        f'{ind}      <span class="book-shadow" aria-hidden="true"></span>\n'
        f'{ind}    </button></li>\n' for b in BOOKS)
    return (f'{ind}<div class="shelf-stage">\n'
            f'{ind}  <!-- generated by scripts/tools/make-shelf-spines.py: edit the generator, not this block -->\n'
            f'{ind}  <div class="wall-shadows" aria-hidden="true">\n{wall}{ind}  </div>\n'
            f'{ind}  <ul class="books" role="list">\n{books}{ind}  </ul>\n'
            f'{ind}  <div class="ground-shadows" aria-hidden="true">\n{ground}{ind}  </div>\n'
            f'{ind}  <div class="shelf-board" aria-hidden="true"></div>\n'
            f'{ind}</div>\n')


SHARED = '''    <!-- caps, lit from the top -->
    <linearGradient id="shelf-cap-head" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0d8" stop-opacity=".30"/><stop offset=".5" stop-color="#fff0d8" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
    <linearGradient id="shelf-cap-tail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".35" stop-color="#fff0d8" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>
    <!-- the lamp falls off down the spine; darkest just above the board -->
    <linearGradient id="shelf-vfall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1dc" stop-opacity=".08"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".86" stop-color="#000" stop-opacity=".15"/><stop offset=".97" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient>
    <!-- the seams: a horizontal fade, plus an ellipse on the bottom joint corner so the seam is darker at the tail -->
    <linearGradient id="shelf-crevice" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".35" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <radialGradient id="shelf-crevice-tail" cx="0" cy="1" r="1"><stop offset="0" stop-color="#000" stop-opacity=".30"/><stop offset=".3" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <!-- a tipped face turns up toward the lamp: lighter at the head, darker at the tail -->
    <linearGradient id="shelf-tip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1dc" stop-opacity=".13"/><stop offset=".45" stop-color="#fff1dc" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>
'''


def main():
    html = open(INDEX, encoding='utf-8').read()
    # the shared gradients: everything in .svg-defs before the tiles
    html, n1 = re.subn(r'(<svg class="svg-defs"[^>]*>\n\s*<defs>\n).*?(?=    <!-- tiles, alpha baked)',
                       lambda m: m.group(1) + SHARED, html, count=1, flags=re.S)
    # the stage: from its opening div through the board and the closing div
    html, n2 = re.subn(r'    <div class="shelf-stage">\n.*?<div class="shelf-board" aria-hidden="true"></div>\n    </div>\n',
                       lambda m: stage(), html, count=1, flags=re.S)
    assert n1 == 1 and n2 == 1, 'index.html markers not found'
    open(INDEX, 'w', encoding='utf-8').write(html)
    print(f'--group-u: {GROUP:.4f}')
    for b in BOOKS:
        print(f'{b["id"]:11s} u={b["u"]:+.3f}  x0={b["x0"]:.4f}  w={b["h"] * b["w"]:.4f}  d={b["d"]}')


if __name__ == '__main__':
    main()
