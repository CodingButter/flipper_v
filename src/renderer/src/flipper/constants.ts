export type ButtonId = 'up' | 'down' | 'left' | 'right' | 'ok' | 'back'

export const BUTTONS: ReadonlyArray<{ id: ButtonId; label: string; color: number }> = [
  { id: 'up', label: 'Up', color: 0xff3b30 },
  { id: 'down', label: 'Down', color: 0x34c759 },
  { id: 'left', label: 'Left', color: 0x0a84ff },
  { id: 'right', label: 'Right', color: 0xffd60a },
  { id: 'ok', label: 'OK', color: 0xff2d92 },
  { id: 'back', label: 'Back', color: 0x64d2ff }
]

/** Short-press cutoff — matches the original prototype. */
export const SHORT_MS = 300

/**
 * Asset URLs. In dev, Vite serves `public/` at the host root so absolute
 * paths work. In prod the HTML lives one level below the public dir
 * (`out/renderer/<entry>/index.html`) so a `../` prefix is needed for any
 * URL fetched against the document's base.
 *
 * The GLB and JSON are fetched via three.js (which resolves against
 * `document.baseURI`), so `../models/...` happens to work in both modes.
 * The bundle is `import()`ed against `import.meta.url`, which lands in
 * different places between dev and prod — branch.
 */
export const MODEL_URL = '../models/flipper_zero.glb'
export const MAP_URL = '../models/flipper-button-map.json'
export const BUNDLE_URL = import.meta.env.DEV
  ? '/flipper-mirror-bundle.js'
  : new URL('../flipper-mirror-bundle.js', import.meta.url).href
