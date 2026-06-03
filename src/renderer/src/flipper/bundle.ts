// `?url` tells Vite to emit the bundle as a static asset and give us its
// runtime URL. The file itself isn't parsed/transformed — it's the same
// ES module from the original IDE prototype.
import bundleUrl from './flipper-mirror-bundle.js?url'

/**
 * The bundle deals in `navigator.serial`'s SerialPort. Until TypeScript's
 * DOM lib ships it, we use a minimal opaque type — we never call methods on
 * the port directly; we just round-trip it through the transport.
 */
export type SerialPort = object

/**
 * Type contract for `/flipper-mirror-bundle.js` — the same runtime used by
 * the open-source Flipper IDE prototype. We don't ship .d.ts files alongside
 * it, so this interface is the single source of truth that mirrors the
 * bundle's actual exports.
 */
export interface ScreenCanvas {
  clear(): void
  drawFrame(fb: Uint8Array, orientation?: number): void
}

export type ScreenCanvasCtor = new (
  canvas: HTMLCanvasElement,
  options?: { scale?: number; bg?: string }
) => ScreenCanvas

export interface WebSerialTransport {
  open(options?: { baudRate?: number }): Promise<void>
  close(): Promise<void>
}

export type WebSerialTransportCtor = new (port: SerialPort) => WebSerialTransport

export interface FlipperRpcClient extends EventTarget {
  connect(transport: WebSerialTransport): Promise<void>
  disconnect(): Promise<void>
}

export type FlipperRpcClientCtor = new () => FlipperRpcClient

export type ScreenFrame = { data: ArrayBuffer; orientation: number }

export interface FlipperBundle {
  SCREEN_WIDTH: number
  SCREEN_HEIGHT: number
  SCREEN_BYTES: number
  ScreenCanvas: ScreenCanvasCtor
  WebSerialTransport: WebSerialTransportCtor
  FlipperRpcClient: FlipperRpcClientCtor
  requestFlipperPort(): Promise<SerialPort>
  getGrantedFlipperPort(): Promise<SerialPort | null>
  startScreenStream(
    client: FlipperRpcClient,
    onFrame: (f: ScreenFrame) => void
  ): Promise<() => Promise<void>>
  stopScreenStream(client: FlipperRpcClient): Promise<void>
  sendInput(
    client: FlipperRpcClient,
    button: string,
    type: 'press' | 'short' | 'long' | 'release' | 'repeat'
  ): Promise<void>
}

let cached: Promise<FlipperBundle> | null = null

export function loadBundle(): Promise<FlipperBundle> {
  if (!cached) {
    cached = import(/* @vite-ignore */ bundleUrl) as Promise<FlipperBundle>
  }
  return cached
}
