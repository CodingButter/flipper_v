import * as THREE from 'three'
import { ScreenCanvas } from './screen-canvas'

/**
 * Owns the offscreen 2D canvas that the screen-canvas module paints
 * framebuffers onto, and the THREE.CanvasTexture that the model's
 * `Flipper_Screen` mesh samples from. Keeps `lastFb` so a backlight-
 * color change can repaint the same frame without waiting for a fresh
 * one off the wire.
 */
export class ScreenMirror {
  readonly canvas: HTMLCanvasElement
  readonly texture: THREE.CanvasTexture
  private renderer: ScreenCanvas
  private lastFb: Uint8Array | null = null
  private lastOrient = 0

  constructor() {
    this.canvas = document.createElement('canvas')
    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.magFilter = THREE.NearestFilter
    this.texture.minFilter = THREE.LinearMipmapLinearFilter
    this.texture.flipY = false
    this.renderer = new ScreenCanvas(this.canvas, { scale: 4 })
    this.renderer.clear()
    this.texture.needsUpdate = true
  }

  drawFrame(fb: Uint8Array, orient = 0): void {
    this.lastFb = fb
    this.lastOrient = orient
    this.renderer.drawFrame(fb, orient)
    this.texture.needsUpdate = true
  }

  clear(): void {
    this.renderer.clear()
    this.texture.needsUpdate = true
  }

  /**
   * Swap the backlight color. `ScreenCanvas` bakes its bg into the
   * blit, so we rebuild the renderer against the same canvas element
   * (the texture binding stays valid) and redraw the last frame.
   */
  setBackgroundColor(hex: string): void {
    this.renderer = new ScreenCanvas(this.canvas, { scale: 4, bg: hex })
    if (this.lastFb) this.renderer.drawFrame(this.lastFb, this.lastOrient)
    else this.renderer.clear()
    this.texture.needsUpdate = true
  }
}
