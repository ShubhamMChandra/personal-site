#!/usr/bin/env python3
"""Seeded texture tiles for the shelf spines (and, from WP3, the book boards).

HOW TO REGENERATE
  python3 -m venv /tmp/tex && /tmp/tex/bin/pip install numpy scipy pillow
  /tmp/tex/bin/python scripts/tools/make-textures.py
The tiles are written to assets/textures/. The generator is seeded (SEED
below), so with the same numpy/scipy/Pillow versions the output is
byte-identical to the committed files (verified with numpy 2.2.6, scipy
1.15.3, Pillow 12.3.0). Change a tile's strength here and regenerate; never
tune a tile with a CSS or SVG opacity (rule 2 below).

RULES
1. No live filters and no blend modes. Every texture is a pre-rendered tile
   drawn at normal compositing.
2. Every tile is BAKED AT ITS FINAL STRENGTH and drawn at opacity 1, so an SVG
   <pattern> and a CSS background use the same file and look the same (CSS
   backgrounds have no per-layer opacity).
3. Each tile is a two-tone alpha image: light pixels (a warm off-white) and
   dark pixels (a warm near-black) at low alpha, on a fully transparent
   ground. Drawn over the leather gradient they read as shading of a relief.
   Each tone's alpha is quantised to 24 steps over ITS OWN [0, max] range and
   the file is saved as a palette PNG (48 entries + transparent), which keeps
   every tile well under 40 KB.

Tiles (all periodic, so they can be used in a <pattern> or a CSS background):
  calf-mottle-256.png    smooth calf: large soft value variation (band-limited
                         FFT noise) plus sparse pores. Drawn at two scales on
                         the spine so the blotches do not recur every tile
  cloth-weave-128.png    plain-weave book cloth at a 4 px pitch, threads with a
                         crown, per-thread thickness variation, faint warp
                         slubs (the Colophon pamphlet)
  grain-128.png          plain speck grain: the room's wall, and the fine
                         component of the calf
  wear-cap-256x48.png    rubbing strip for head and tail: warm-light blotches
                         fading to nothing over 48 px, periodic in x,
                         concentrated in the outer ~30 % at each corner
  wear-joint-48x256.png  rubbing strip for the joints: fades over 48 px in x,
                         periodic in y (mirror it for the right joint)

Shadow sprites (black, alpha only, not tiles; exempt from rule 3):
  shadow-soft-96.png     blurred rounded square, 9-sliced at 40 px by CSS
                         border-image so the penumbra keeps one width on any
                         box: each spine's cast shadow on the wall, and the
                         tipped book's shadow on the board
  contact-256x48.png     contact shadow where a spine meets the board: dark
                         along the top edge, fading down the board's top face,
                         soft at both ends; stretched to each spine's width
"""
import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'textures')
SEED = 0x2F6E2B1
LEVELS = 24
LIGHT = (243, 226, 200)   # warm off-white, matches the top light
DARK = (28, 14, 10)       # warm near-black, matches the caps' shadow
WEAR = (236, 212, 184)    # rubbed leather: warm, a little desaturated


def save_two_tone(name, light_a, dark_a, light_rgb=LIGHT, dark_rgb=DARK):
    """light_a/dark_a: float arrays in [0,1]. Where both are >0 the larger wins.
    Each tone is quantised over its own [0, max] range."""
    light_a = np.clip(light_a, 0, 1)
    dark_a = np.clip(dark_a, 0, 1)
    lmax = float(light_a.max()) or 1.0
    dmax = float(dark_a.max()) or 1.0
    use_light = light_a >= dark_a
    lvl_l = np.rint(light_a / lmax * LEVELS).astype(np.int32)
    lvl_d = np.rint(dark_a / dmax * LEVELS).astype(np.int32)
    lvl = np.where(use_light, lvl_l, lvl_d)
    idx = np.where(lvl == 0, 0, np.where(use_light, lvl, LEVELS + lvl)).astype(np.uint8)
    pal = [0, 0, 0] + list(light_rgb) * LEVELS + list(dark_rgb) * LEVELS
    pal += [0, 0, 0] * (256 - 1 - 2 * LEVELS)
    alphas = [0] + [int(round(255 * lmax * i / LEVELS)) for i in range(1, LEVELS + 1)] \
        + [int(round(255 * dmax * i / LEVELS)) for i in range(1, LEVELS + 1)]
    alphas += [255] * (256 - len(alphas))
    img = Image.fromarray(idx, mode='P')
    img.putpalette(pal)
    path = os.path.join(OUT, name)
    img.save(path, transparency=bytes(alphas), optimize=True)
    size = os.path.getsize(path)
    h, w = idx.shape
    a = np.where(use_light, light_a, dark_a)
    print(f'{name:24s} {w}x{h}  {size/1024:5.1f} KB  mean alpha {a.mean():.3f}  '
          f'light max {lmax:.3f} mean {light_a.mean():.3f}  dark max {dmax:.3f} mean {dark_a.mean():.3f}  '
          f'levels used {len(np.unique(idx))}')
    return path


def wrap_grad(h):
    """Periodic central differences."""
    gx = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) * 0.5
    gy = (np.roll(h, -1, axis=0) - np.roll(h, 1, axis=0)) * 0.5
    return gx, gy


def shade(h, light=(-0.45, -1.0), gain=1.0):
    """Lambert-ish relief shading from a height field. Light comes from the top and
    a little from the left (the room's top light and the roll highlight at 42%).
    Returns (light_alpha, dark_alpha) before scaling."""
    lx, ly = light
    n = (lx * lx + ly * ly) ** 0.5
    lx, ly = lx / n, ly / n
    gx, gy = wrap_grad(h)
    i = -(gx * lx + gy * ly) * gain
    return np.clip(i, 0, None), np.clip(-i, 0, None)


def fft_noise(rng, size, wavelength_lo, wavelength_hi, aniso_y=1.0, power=1.0):
    """Band-limited periodic noise, unit variance. Wavelengths in px. aniso_y > 1
    stretches features along y (lower y frequencies pass)."""
    white = rng.standard_normal((size, size))
    F = np.fft.fft2(white)
    fy = np.fft.fftfreq(size)[:, None]
    fx = np.fft.fftfreq(size)[None, :]
    f = np.sqrt(fx ** 2 + (fy * aniso_y) ** 2) + 1e-9
    lo, hi = 1.0 / wavelength_hi, 1.0 / wavelength_lo    # band in cycles/px
    filt = 1.0 / (1.0 + (lo / f) ** 4) * 1.0 / (1.0 + (f / hi) ** 4)
    filt = filt ** power
    out = np.real(np.fft.ifft2(F * filt))
    out -= out.mean()
    return out / (out.std() + 1e-9)


def calf(rng, size=256):
    big = fft_noise(rng, size, 40, 150, aniso_y=0.8)      # soft mottling
    mid = fft_noise(rng, size, 12, 34) * 0.45              # a little finer body
    v = big + mid
    v = v / v.std()
    la = np.clip(v, 0, None) * 0.010
    da = np.clip(-v, 0, None) * 0.022
    pores = rng.random((size, size)) < 0.02
    da = da + pores * 0.09
    # baked for use as two layers (two scales) at opacity 1
    return la * 0.55, da * 0.55


def cloth(rng, size=128, pitch=4):
    n = size // pitch
    yy, xx = np.mgrid[0:size, 0:size]
    ix, iy = xx // pitch, yy // pitch
    u = (xx % pitch + 0.5) / pitch
    v = (yy % pitch + 0.5) / pitch
    warp_top = ((ix + iy) % 2) == 0
    # per-thread thickness / crown variation (slubs)
    warp_w = 1 + rng.uniform(-0.08, 0.08, n)
    weft_w = 1 + rng.uniform(-0.08, 0.08, n)
    crown_x = np.cos(np.pi * (u - 0.5)) ** 1.2 * warp_w[ix]     # warp runs along y
    crown_y = np.cos(np.pi * (v - 0.5)) ** 1.2 * weft_w[iy]     # weft runs along x
    # the top thread shows its full crown; the under thread shows at the sides
    h = np.where(warp_top, np.maximum(crown_x, 0.55 * crown_y), np.maximum(crown_y, 0.55 * crown_x))
    # a top thread dips a little where it passes over the crossing
    h = h * (1 - 0.12 * np.where(warp_top, crown_y, crown_x))
    h = gaussian_filter(h, 0.6, mode='wrap')
    light, dark = shade(h, light=(-0.85, -1.0), gain=2.0)   # diagonal, so warp and weft both catch it
    # gaps between threads are dark
    dark = dark + np.clip(0.45 - h, 0, None) * 0.5
    # long faint slubs along the warp (dye takes unevenly along a thread)
    slub = fft_noise(rng, size, 6, 40, aniso_y=0.12)
    la = np.clip(light * 0.13 + np.clip(slub, 0, None) * 0.02, 0, 0.18)
    da = np.clip(dark * 0.2 + np.clip(-slub, 0, None) * 0.03, 0, 0.28)
    return la * 0.7, da * 0.7   # baked at the strength the pamphlet uses


def grain(rng, size=128):
    v = rng.random((size, size))
    a = rng.random((size, size)) * 0.12
    light = v > 0.78
    return np.where(light, a, 0), np.where(light, 0, a)


def corner_profile(w, inner=0.4, floor=0.12):
    """1 at both ends of the strip, `floor` across the middle. Symmetric, so the strip
    stays periodic in x. `inner` is the half-width (as a fraction of w/2) of the
    untouched middle: 0.4 leaves the outer 30 % of each side rubbed."""
    x = np.abs(np.arange(w) + 0.5 - w / 2) / (w / 2)      # 0 at centre, 1 at the ends
    t = np.clip((x - inner) / (1 - inner), 0, 1) ** 1.3
    return floor + (1 - floor) * t


def wear_cap(rng, w=256, h=48):
    yy = np.arange(h)[:, None] / h
    fall = (1 - yy) ** 2.2
    blot = fft_noise(rng, w, 10, 60)[:h, :]               # periodic in x
    blot = 0.55 + 0.45 * np.clip(blot * 0.6 + 0.5, 0, 1)
    la = fall * blot * corner_profile(w)[None, :] * 0.30 * 0.13   # baked: leather uses it at 1
    return la, np.zeros_like(la)


def wear_joint(rng, w=48, h=256):
    xx = np.arange(w)[None, :] / w
    fall = (1 - xx) ** 2.2
    blot = fft_noise(rng, h, 10, 60)[:, :w]               # periodic in y
    blot = 0.55 + 0.45 * np.clip(blot * 0.6 + 0.5, 0, 1)
    la = fall * blot * 0.24 * 0.5   # baked: leather uses it at 1 (max .12)
    return la, np.zeros_like(la)


def shadow_soft(n=96, pad=26, sigma=8.5):
    """Blurred rounded square, alpha 0..1, for a 40 px 9-slice."""
    a = np.zeros((n, n), dtype=np.float32)
    a[pad:n - pad, pad:n - pad] = 1.0
    a = gaussian_filter(a, sigma=sigma)
    return np.clip(a / a.max(), 0, 1)


def contact_strip(w=256, h=48):
    """Steep vertical fade from the top edge, soft ends in x."""
    y = np.linspace(0, 1, h)[:, None]
    x = np.linspace(-1, 1, w)[None, :]
    fall = np.exp(-(y * 3.2) ** 2)
    ends = np.clip(1 - np.abs(x) ** 6, 0, 1)
    return np.clip(fall * ends, 0, 1)


def save_shadow(name, a):
    """Black RGBA with the alpha channel only (no palette: the ramp must stay smooth)."""
    alpha = Image.fromarray((a * 255).astype(np.uint8), 'L')
    black = Image.new('L', alpha.size, 0)
    Image.merge('RGBA', (black, black, black, alpha)).save(os.path.join(OUT, name), optimize=True)


def main():
    save_two_tone('calf-mottle-256.png', *calf(np.random.default_rng(SEED + 2)))
    save_two_tone('cloth-weave-128.png', *cloth(np.random.default_rng(SEED + 3)))
    save_two_tone('grain-128.png', *grain(np.random.default_rng(SEED)))
    save_two_tone('wear-cap-256x48.png', *wear_cap(np.random.default_rng(SEED + 4)), light_rgb=WEAR)
    save_two_tone('wear-joint-48x256.png', *wear_joint(np.random.default_rng(SEED + 5)), light_rgb=WEAR)
    save_shadow('shadow-soft-96.png', shadow_soft())
    save_shadow('contact-256x48.png', contact_strip())


if __name__ == '__main__':
    main()
