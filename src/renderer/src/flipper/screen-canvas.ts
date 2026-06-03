/**
 * Renders a 128×64 page-packed 1-bit framebuffer to a 2D canvas, with
 * configurable foreground / backlight colors and orientation. The same
 * orientation values the firmware uses (`ScreenOrientation`):
 *   0 = horizontal (default)    1 = horizontal flipped (180°)
 *   2 = vertical (90° CW)       3 = vertical flipped (90° CCW)
 *
 * Page-packed format: byte at `fb[(y>>3)*128 + x]` holds 8 pixels in a
 * vertical column; bit `1 << (y & 7)` is the pixel at (x, y).
 */

export const SCREEN_WIDTH = 128
export const SCREEN_HEIGHT = 64
export const SCREEN_BYTES = (SCREEN_WIDTH * SCREEN_HEIGHT) / 8

export enum ScreenOrientation {
  HORIZONTAL = 0,
  HORIZONTAL_FLIP = 1,
  VERTICAL = 2,
  VERTICAL_FLIP = 3
}

export type ScreenCanvasOptions = {
  /** Integer scale factor. Default 5 → a 640×320 canvas. */
  scale?: number
  /** "On" pixel color (the LCD-blocked pixels). Default dark gray. */
  fg?: string
  /** Backlight color (the "off" pixel color). Default Flipper orange. */
  bg?: string
}

type Rgba = [number, number, number, number]

export class ScreenCanvas {
  private readonly ctx: CanvasRenderingContext2D
  private readonly scale: number
  private readonly fgRgba: Rgba
  private readonly bgRgba: Rgba
  private readonly image: ImageData
  private currentOrientation: ScreenOrientation = ScreenOrientation.HORIZONTAL

  constructor(
    private readonly canvas: HTMLCanvasElement,
    opts: ScreenCanvasOptions = {}
  ) {
    this.scale = Math.max(1, Math.floor(opts.scale ?? 5))
    const fg = opts.fg ?? '#1a1a1a'
    const bg = opts.bg ?? '#ff8200'

    this.applyCanvasSize(ScreenOrientation.HORIZONTAL)
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('2D canvas context unavailable')
    this.ctx = ctx
    this.ctx.imageSmoothingEnabled = false

    this.fgRgba = parseCssColor(fg)
    this.bgRgba = parseCssColor(bg)
    this.image = this.ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT)
    this.clear()
  }

  get orientation(): ScreenOrientation {
    return this.currentOrientation
  }

  /**
   * Paint a framebuffer onto the canvas. The orientation arg determines
   * how the underlying 128×64 image gets blitted into the canvas — the
   * pixel-walk is always in framebuffer coordinates; the rotation happens
   * at the blit step so the rotated content fills the visible canvas.
   */
  drawFrame(framebuffer: Uint8Array, orientation: number = ScreenOrientation.HORIZONTAL): void {
    if (framebuffer.byteLength !== SCREEN_BYTES) {
      throw new Error(
        `ScreenCanvas.drawFrame: expected ${SCREEN_BYTES} bytes, got ${framebuffer.byteLength}`
      )
    }
    if (orientation !== this.currentOrientation) {
      this.currentOrientation = orientation
      this.applyCanvasSize(orientation)
    }

    const data = this.image.data
    const [fr, fg, fb, fa] = this.fgRgba
    const [br, bg, bb, ba] = this.bgRgba
    for (let y = 0; y < SCREEN_HEIGHT; y++) {
      const page = y >> 3
      const bitMask = 1 << (y & 7)
      const rowBase = page * SCREEN_WIDTH
      for (let x = 0; x < SCREEN_WIDTH; x++) {
        const lit = (framebuffer[rowBase + x] & bitMask) !== 0
        const i = (y * SCREEN_WIDTH + x) * 4
        if (lit) {
          data[i] = fr
          data[i + 1] = fg
          data[i + 2] = fb
          data[i + 3] = fa
        } else {
          data[i] = br
          data[i + 1] = bg
          data[i + 2] = bb
          data[i + 3] = ba
        }
      }
    }
    this.blit()
  }

  clear(): void {
    const data = this.image.data
    const [br, bg, bb, ba] = this.bgRgba
    for (let i = 0; i < data.length; i += 4) {
      data[i] = br
      data[i + 1] = bg
      data[i + 2] = bb
      data[i + 3] = ba
    }
    this.blit()
  }

  private applyCanvasSize(orientation: ScreenOrientation): void {
    const portrait =
      orientation === ScreenOrientation.VERTICAL ||
      orientation === ScreenOrientation.VERTICAL_FLIP
    const w = (portrait ? SCREEN_HEIGHT : SCREEN_WIDTH) * this.scale
    const h = (portrait ? SCREEN_WIDTH : SCREEN_HEIGHT) * this.scale
    if (this.canvas.width !== w) this.canvas.width = w
    if (this.canvas.height !== h) this.canvas.height = h
  }

  /**
   * Two-stage blit: putImageData paints native-size into a scratch
   * canvas (so `imageSmoothingEnabled = false` is honored), then
   * drawImage scales it up and applies the orientation transform.
   * Painting ImageData directly onto a scaled destination would always
   * smooth — going via drawImage gives us crisp pixel-art scaling.
   */
  private blit(): void {
    const tmp = document.createElement('canvas')
    tmp.width = SCREEN_WIDTH
    tmp.height = SCREEN_HEIGHT
    const tctx = tmp.getContext('2d')
    if (!tctx) return
    tctx.putImageData(this.image, 0, 0)

    const ctx = this.ctx
    const cw = this.canvas.width
    const ch = this.canvas.height
    ctx.imageSmoothingEnabled = false
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const sw = SCREEN_WIDTH * this.scale
    const sh = SCREEN_HEIGHT * this.scale
    switch (this.currentOrientation) {
      case ScreenOrientation.HORIZONTAL_FLIP:
        ctx.translate(cw, ch)
        ctx.rotate(Math.PI)
        break
      case ScreenOrientation.VERTICAL:
        ctx.translate(cw, 0)
        ctx.rotate(Math.PI / 2)
        break
      case ScreenOrientation.VERTICAL_FLIP:
        ctx.translate(0, ch)
        ctx.rotate(-Math.PI / 2)
        break
      default:
        break
    }
    ctx.drawImage(tmp, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 0, 0, sw, sh)
    ctx.restore()
  }
}

function parseCssColor(c: string): Rgba {
  const m3 = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(c)
  if (m3) {
    return [
      parseInt(m3[1] + m3[1], 16),
      parseInt(m3[2] + m3[2], 16),
      parseInt(m3[3] + m3[3], 16),
      255
    ]
  }
  const m6 = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c)
  if (m6) {
    return [parseInt(m6[1], 16), parseInt(m6[2], 16), parseInt(m6[3], 16), 255]
  }
  return [255, 255, 255, 255]
}
