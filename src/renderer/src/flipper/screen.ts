import * as THREE from 'three'
import type { ScreenCanvas, ScreenCanvasCtor } from './bundle'

/**
 * Owns the offscreen 2D canvas that the WebSerial bundle paints framebuffers
 * onto, and the THREE.CanvasTexture that the model's `Flipper_Screen` mesh
 * samples from. Keeps `lastFb` so a backlight-color change can repaint the
 * same frame without waiting for a fresh one off the wire.
 */
export class ScreenMirror {
  readonly canvas: HTMLCanvasElement
  readonly texture: THREE.CanvasTexture
  /** Created lazily once the bundle's ScreenCanvas class is available. */
  renderer: ScreenCanvas | null = null
  private lastFb: Uint8Array | null = null
  private lastOrient = 0

  constructor() {
    this.canvas = document.createElement('canvas')
    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.magFilter = THREE.NearestFilter
    this.texture.minFilter = THREE.LinearMipmapLinearFilter
    this.texture.flipY = false
  }

  attachRenderer(renderer: ScreenCanvas): void {
    this.renderer = renderer
    this.renderer.clear()
    this.texture.needsUpdate = true
  }

  drawFrame(fb: Uint8Array, orient = 0): void {
    if (!this.renderer) return
    this.lastFb = fb
    this.lastOrient = orient
    this.renderer.drawFrame(fb, orient)
    this.texture.needsUpdate = true
  }

  clear(): void {
    this.renderer?.clear()
    this.texture.needsUpdate = true
  }

  /** Swap the backlight color by rebuilding the bundled ScreenCanvas. */
  setBackgroundColor(hex: string, ctor: ScreenCanvasCtor): void {
    this.renderer = new ctor(this.canvas, { scale: 4, bg: hex })
    if (this.lastFb) this.renderer.drawFrame(this.lastFb, this.lastOrient)
    else this.renderer.clear()
    this.texture.needsUpdate = true
  }
}
