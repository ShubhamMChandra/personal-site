/**
 * shelf-geometry.js - the resting outline of every volume on the shelf
 *
 * WHAT: window.shelfGeometry() returns, per volume, its spine rect in CSS
 *       px, its depth, the perspective origin and the silhouette path.
 * WHY:  the future open animation lifts a book off the shelf with a 3D
 *       proxy. The proxy must match the painted spine exactly, so the swap
 *       from the flat spine to the proxy is invisible.
 * HOW:  the silhouette is a fixed function of the spine's width W and
 *       height H (the same numbers as scripts/tools/make-shelf-spines.py),
 *       so it can be rebuilt from the button's rect alone.
 *
 * A classic script, like the others: it only adds two globals.
 */

(function () {
  const SILHOUETTE = Object.freeze({
    headR: 0.075, // head corner radius, x W
    capRise: 0.034, // headcap rise at the centre (a convex quadratic), x W
    tailR: 0.035 // tail corner radius, x W
  })

  // SVG path of the spine face for a W x H spine (the generator's clip path)
  function silhouettePath (W, H) {
    const rh = SILHOUETTE.headR * W
    const rt = SILHOUETTE.tailR * W
    const b = SILHOUETTE.capRise * W
    const f = v => +v.toFixed(2)
    return `M0 ${f(b + rh)}A${f(rh)} ${f(rh)} 0 0 1 ${f(rh)} ${f(b)}Q${f(W / 2)} ${f(-b)} ${f(W - rh)} ${f(b)}` +
      `A${f(rh)} ${f(rh)} 0 0 1 ${f(W)} ${f(b + rh)}V${f(H - rt)}A${f(rt)} ${f(rt)} 0 0 1 ${f(W - rt)} ${f(H)}` +
      `H${f(rt)}A${f(rt)} ${f(rt)} 0 0 1 0 ${f(H - rt)}Z`
  }

  // One entry per volume: { id, x, y, w, h, depth, perspectiveOrigin, path }.
  // depth is fore-edge to spine in px (--D is in --spine-h units). The lift
  // proxy sets perspective-origin at the book's mid-height and keeps the
  // camera at eye level, so the head face stays hidden until the tip.
  function shelfGeometry (root = document) {
    return [...root.querySelectorAll('.book')].map(btn => {
      const spine = btn.querySelector('.spine')
      const r = spine.getBoundingClientRect()
      const cs = getComputedStyle(btn)
      // --spine-h is a calc() with round(); an unregistered custom property
      // keeps its token string, so derive the unit from the rect instead
      const spineH = r.height / parseFloat(cs.getPropertyValue('--vol-h'))
      const depth = parseFloat(cs.getPropertyValue('--D')) * spineH
      return {
        id: btn.dataset.book,
        x: r.x,
        y: r.y,
        w: r.width,
        h: r.height,
        depth,
        perspectiveOrigin: { x: r.x + r.width / 2, y: r.y + r.height / 2 },
        path: silhouettePath(r.width, r.height)
      }
    })
  }

  window.shelfGeometry = shelfGeometry
  window.shelfSilhouette = Object.freeze({ path: silhouettePath, ...SILHOUETTE })
})()
