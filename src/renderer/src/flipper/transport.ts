/**
 * WebSerial transport layer for talking to a Flipper Zero.
 *
 * The Flipper exposes a CDC-ACM serial endpoint (VID 0x0483, PID 0x5740).
 * `requestFlipperPort` pops the browser/Electron picker filtered to that
 * VID:PID; `getGrantedFlipperPort` returns any previously-granted port
 * without prompting (used after the settings window has already shown
 * a picker).
 *
 * `WebSerialTransport` adapts the SerialPort to the framed-stream
 * interface the RPC client wants — exposes `readable` and `writable`
 * once `open()` has been called.
 */

export const FLIPPER_USB_FILTER: SerialPortFilter = {
  usbVendorId: 0x0483,
  usbProductId: 0x5740
}

const DEFAULT_SERIAL_OPTIONS: SerialOptions = { baudRate: 115200 }

export async function requestFlipperPort(): Promise<SerialPort> {
  if (!('serial' in navigator)) {
    throw new Error(
      'Web Serial API unavailable. Use Chrome/Edge or another Chromium-based browser.'
    )
  }
  return navigator.serial.requestPort({ filters: [FLIPPER_USB_FILTER] })
}

export async function getGrantedFlipperPort(): Promise<SerialPort | null> {
  if (!('serial' in navigator)) return null
  const ports = await navigator.serial.getPorts()
  for (const port of ports) {
    const info = port.getInfo()
    if (
      info.usbVendorId === FLIPPER_USB_FILTER.usbVendorId &&
      info.usbProductId === FLIPPER_USB_FILTER.usbProductId
    ) {
      return port
    }
  }
  return null
}

export class WebSerialTransport {
  private opened = false

  constructor(private readonly port: SerialPort) {}

  async open(options: SerialOptions = DEFAULT_SERIAL_OPTIONS): Promise<void> {
    if (this.opened) return
    await this.port.open(options)
    this.opened = true
  }

  get readable(): ReadableStream<Uint8Array> {
    const r = this.port.readable
    if (!r) throw new Error('Transport not open or readable stream unavailable.')
    return r
  }

  get writable(): WritableStream<Uint8Array> {
    const w = this.port.writable
    if (!w) throw new Error('Transport not open or writable stream unavailable.')
    return w
  }

  async close(): Promise<void> {
    if (!this.opened) return
    // Best-effort: cancel readable, abort writable, then close the port.
    // Each step is independent — failures in one shouldn't block the
    // next, otherwise a stuck reader could leak the port handle.
    try {
      const r = this.port.readable
      if (r) await r.cancel().catch(() => {})
    } catch {
      /* ignore */
    }
    try {
      const w = this.port.writable
      if (w) await w.abort().catch(() => {})
    } catch {
      /* ignore */
    }
    try {
      await this.port.close()
    } finally {
      this.opened = false
    }
  }
}
