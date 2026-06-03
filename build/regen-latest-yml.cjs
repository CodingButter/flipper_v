// Recompute SHA512 + size in dist/latest.yml after post-build signing.
// Signing changes every .exe byte-for-byte, so electron-updater's hash
// check would fail otherwise.
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

for (const exe of fs.readdirSync(dist).filter((f) => f.endsWith('.exe'))) {
  const filePath = path.join(dist, exe)
  const sha512 = sha512b64(filePath)
  const size = fs.statSync(filePath).size
  const esc = exe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  yaml = yaml.replace(new RegExp(`(  - url: ${esc}\\s+sha512:)\\s+\\S+`, 'g'), `$1 ${sha512}`)
  yaml = yaml.replace(new RegExp(`(  - url: ${esc}[\\s\\S]*?size:)\\s+\\d+`, 'g'), `$1 ${size}`)
  if (yaml.includes(`\npath: ${exe}\n`)) {
    yaml = yaml.replace(/(\nsha512:)\s+\S+/, `$1 ${sha512}`)
  }
  console.log(`patched ${exe}: size=${size}, sha512=${sha512.slice(0, 16)}…`)
}

fs.writeFileSync(yamlPath, yaml)
console.log('latest.yml regenerated')
