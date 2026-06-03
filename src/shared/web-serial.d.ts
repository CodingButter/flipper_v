/**
 * Web Serial API typings. The spec is at https://wicg.github.io/serial/
 * — we declare the subset we touch so both renderers compile under
 * `moduleResolution: bundler` without pulling in `@types/w3c-web-serial`.
 *
 * Lives in `shared/` because `tsconfig.web.json` includes `src/shared/**`
 * which means both the floating and the settings renderers see these
 * augmentations.
 */

interface SerialPortFilter {
  readonly usbVendorId?: number
  readonly usbProductId?: number
}

interface SerialPortRequestOptions {
  filters?: SerialPortFilter[]
}

interface SerialOptions {
  baudRate?: number
  dataBits?: number
  stopBits?: number
  parity?: 'none' | 'even' | 'odd'
  bufferSize?: number
  flowControl?: 'none' | 'hardware'
}

interface SerialPortInfo {
  readonly usbVendorId?: number
  readonly usbProductId?: number
}

interface SerialPort extends EventTarget {
  readonly readable: ReadableStream<Uint8Array> | null
  readonly writable: WritableStream<Uint8Array> | null
  open(options: SerialOptions): Promise<void>
  close(): Promise<void>
  getInfo(): SerialPortInfo
}

interface Serial extends EventTarget {
  getPorts(): Promise<SerialPort[]>
  requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>
}

interface Navigator {
  readonly serial: Serial
}
