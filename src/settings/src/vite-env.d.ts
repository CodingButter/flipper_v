/// <reference types="vite/client" />

// Minimal WebSerial typing — we only need `requestPort` from the settings
// window. The full API surface lives in the bundle's own types.
interface SerialPortFilter {
  usbVendorId?: number
  usbProductId?: number
}
interface SerialPortRequestOptions {
  filters?: SerialPortFilter[]
}
interface SerialAPI {
  requestPort(options?: SerialPortRequestOptions): Promise<unknown>
  getPorts(): Promise<unknown[]>
}
interface Navigator {
  readonly serial: SerialAPI
}
