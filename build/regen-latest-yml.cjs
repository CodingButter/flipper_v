// Recompute SHA512 + size in dist/latest.yml after post-build signing.
// Signing rewrites every .exe byte-for-byte; electron-updater rejects
// the download if the hash on disk doesn't match latest.yml. Fail the
// build loudly if we can't find a referenced file (would silently leave
// a stale hash otherwise).
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const dist = path.resolve(__dirname, '..', 'dist')
const yamlPath = path.join(dist, 'latest.yml')
if (!fs.existsSync(yamlPath)) {
  console.error('latest.yml not found at', yamlPath)
  process.exit(0)
}

let yaml = fs.readFileSync(yamlPath, 'utf8')
const sha512b64 = (p) => crypto.createHash('sha512').update(fs.readFileSync(p)).digest('base64')

// Find every URL referenced in latest.yml — both the `- url: <name>`
// entries inside `files:` and the top-level `path: <name>`.
const referenced = new Set()
for (const m of yaml.matchAll(/(?:^|\n)\s*(?:- url|path):\s*(\S+)/g)) referenced.add(m[1])

if (referenced.size === 0) {
  console.error('No url/path entries found in latest.yml — nothing to patch')
  process.exit(1)
}

let patched = 0
for (const ref of referenced) {
  // Try exact name, then with hyphens → spaces (electron-builder used
  // to write the disk filename with spaces while latest.yml had
  // hyphens). Belt-and-suspenders even after the artifactName fix.
  const candidates = [ref, ref.replace(/-/g, ' ')]
  const filePath = candidates.map((c) => path.join(dist, c)).find(fs.existsSync)
  if (!filePath) {
    console.error(`MISSING on disk: ${ref} (tried ${candidates.join(', ')})`)
    process.exit(1)
  }

  const sha512 = sha512b64(filePath)
  const size = fs.statSync(filePath).size
  const esc = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  yaml = yaml.replace(new RegExp(`(  - url: ${esc}\\s+sha512:)\\s+\\S+`, 'g'), `$1 ${sha512}`)
  yaml = yaml.replace(new RegExp(`(  - url: ${esc}[\\s\\S]*?size:)\\s+\\d+`, 'g'), `$1 ${size}`)
  if (yaml.includes(`\npath: ${ref}\n`)) {
    yaml = yaml.replace(/(\nsha512:)\s+\S+/, `$1 ${sha512}`)
  }
  console.log(`patched ${ref}: size=${size}, sha512=${sha512.slice(0, 16)}…`)
  patched++
}

fs.writeFileSync(yamlPath, yaml)
console.log(`latest.yml regenerated (${patched} entries)`)
