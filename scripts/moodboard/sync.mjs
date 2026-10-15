// Keeps design/moodboard/notes.md in step with design/moodboard/images/.
//
// - Adds a stub entry under "# Board" for every image that notes.md does not
//   mention yet, so annotation is fill-in-the-blanks.
// - Converts .heic/.heif (iPhone AirDrop default) to .jpg with macOS `sips`,
//   because browsers cannot render HEIC.
// - Warns about entries whose image file no longer exists.
//
// Usage: npm run moodboard:sync

import { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = new URL('../../design/moodboard/', import.meta.url).pathname
const IMAGES = join(ROOT, 'images')
const NOTES = join(ROOT, 'notes.md')
const RENDERABLE = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg'])

function convertHeic () {
  if (process.platform !== 'darwin') return
  for (const file of readdirSync(IMAGES)) {
    const ext = extname(file).toLowerCase()
    if (ext !== '.heic' && ext !== '.heif') continue
    const out = join(IMAGES, basename(file, extname(file)) + '.jpg')
    if (existsSync(out)) continue
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '85', join(IMAGES, file), '--out', out], { stdio: 'ignore' })
    unlinkSync(join(IMAGES, file))
    console.log(`converted ${file} -> ${basename(out)}`)
  }
}

function listImages () {
  return readdirSync(IMAGES)
    .filter(f => RENDERABLE.has(extname(f).toLowerCase()))
    .sort()
}

function mentioned (notes) {
  const visible = notes.replace(/<!--[\s\S]*?-->/g, '')
  return new Set([...visible.matchAll(/^## +(.+?)\s*$/gm)].map(m => m[1]))
}

function stub (file) {
  return `## ${file}\nsource: \ntags: \nlike: \nnot: \n`
}

convertHeic()
const images = listImages()
let notes = readFileSync(NOTES, 'utf8')
const known = mentioned(notes)

const fresh = images.filter(f => !known.has(f))
if (fresh.length) {
  const block = fresh.map(stub).join('\n')
  const marker = /^# Not me[ \t]*$/m
  notes = marker.test(notes)
    ? notes.replace(marker, `${block}\n# Not me`)
    : `${notes.trimEnd()}\n\n${block}`
  writeFileSync(NOTES, notes)
}

const missing = [...known].filter(f => !images.includes(f))

console.log(`${images.length} image(s), ${fresh.length} new stub(s) added`)
for (const f of missing) console.warn(`warning: notes.md mentions ${f} but images/ has no such file`)
