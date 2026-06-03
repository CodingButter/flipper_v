import type { FlipperVAPI } from './index'

declare global {
  interface Window {
    flipperV: FlipperVAPI
  }
}

export {}
