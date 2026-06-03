/**
 * Default splash image bundled at the renderer's public root. Both the
 * floating window and the settings window can fetch it via this URL —
 * Vite serves `src/renderer/public/` at the host root in dev, and
 * electron-vite copies it to `out/renderer/` in prod (one level above
 * each entry HTML).
 */
export const DEFAULT_SPLASH_URL = '../flipper_v_screen_128x64.bmp'

/** Flipper Zero LCD resolution — what we threshold the image down to. */
export const SCREEN_W = 128
export const SCREEN_H = 64

/**
 * Decode any image the platform's image pipeline supports (PNG, BMP,
 * JPEG, WEBP, …), render it onto a 128×64 offscreen canvas, and pack
 * the result into a page-packed 1-bit framebuffer matching the wire
 * format the Flipper screen uses (`fb[(y>>3)*128 + x] |= 1 << (y&7)`).
 *
 * The threshold is luminance < 128 → "on". Transparent pixels are
 * treated as "off" so PNGs with alpha look right when re-painted on
 * the device's themed backlight.
 *
 * If the input image isn't already 128×64 the canvas's drawImage scales
 * it — we don't enforce the resolution here so the settings UI can
 * preview arbitrary user uploads.
 */
export async function imageToFramebuffer(src: string): Promise<Uint8Array> {
  const img = new Image()
  // CORS isn't a factor for local public assets or data URLs, but set
  // it anyway so future remote URLs don't surprise us.
  img.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    img.onload = (): void => resolve()
    img.onerror = (): void => reject(new Error(`Failed to load splash image: ${src}`))
    img.src = src
  })

  // Render into an offscreen canvas. OffscreenCanvas keeps us off the
  // DOM — the conversion is synchronous CPU work and doesn't need a
  // visible canvas anywhere.
  const canvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(SCREEN_W, SCREEN_H)
      : document.createElement('canvas')
  if (canvas instanceof HTMLCanvasElement) {
    canvas.width = SCREEN_W
    canvas.height = SCREEN_H
  }
  const ctx = canvas.getContext('2d') as
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null
  if (!ctx) throw new Error('2D canvas context unavailable')
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H)
  ctx.drawImage(img, 0, 0, SCREEN_W, SCREEN_H)

  const { data } = ctx.getImageData(0, 0, SCREEN_W, SCREEN_H)
  const fb = new Uint8Array((SCREEN_W * SCREEN_H) / 8) // 1024 bytes
  for (let y = 0; y < SCREEN_H; y++) {
    for (let x = 0; x < SCREEN_W; x++) {
      const i = (y * SCREEN_W + x) * 4
      // Rec.601 luma — better-looking than (r+g+b)/3 for typical screenshots.
      const lum = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000
      const alpha = data[i + 3] / 255
      if (alpha > 0.5 && lum < 128) {
        fb[(y >> 3) * SCREEN_W + x] |= 1 << (y & 7)
      }
    }
  }
  return fb
}
