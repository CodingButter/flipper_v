// Re-export from shared so renderer code can keep importing from ./constants.
export type { ButtonId } from '../../../shared/types'
import type { ButtonId } from '../../../shared/types'

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
 * Asset URLs. The GLB and JSON live in `public/` and are fetched via
 * three.js (which resolves against `document.baseURI`). The HTML lives at
 * `out/renderer/<entry>/index.html` in prod and `/<entry>/index.html` in
 * dev — `../models/...` works for both.
 *
 * The flipper-mirror-bundle is loaded via a Vite `?url` import (see
 * `bundle.ts`) rather than from publicDir, because Vite forbids JS source
 * from importing files in publicDir.
 */
export const MODEL_URL = '../models/flipper_zero.glb'
export const MAP_URL = '../models/flipper-button-map.json'
