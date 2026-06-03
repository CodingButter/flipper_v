import type { MirrorHandle } from './scene'
import type { ButtonId, ConnState } from '../../../shared/types'
import {
  WebSerialTransport,
  requestFlipperPort,
  getGrantedFlipperPort
} from './transport'
import { FlipperRpcClient } from './rpc-client'
import { sendInput, startScreenStream } from './gui'
import { SCREEN_BYTES } from './screen-canvas'

export type ConnEvents = {
  onState: (s: ConnState, msg?: string) => void
  onLog?: (msg: string, kind?: 'ok' | 'err') => void
}

/**
 * Owns the WebSerial connection to a Flipper Zero. Handles the full
 * lifecycle: requestPort (or accept already-granted port), open transport,
 * connect RPC client, start screen stream, and unwind all of it in
 * reverse order on disconnect.
 *
 * Reconnect-safe: callers may invoke `connect`/`connectGranted` at any
 * time. If a connection is in flight or already open we tear it down
 * first; if disconnecting, we wait for the in-flight teardown to settle
 * before starting a new one.
 */
export class Connection {
  private client: FlipperRpcClient | null = null
  private transport: WebSerialTransport | null = null
  private stopStream: (() => Promise<void>) | null = null

  /** Public lifecycle state. Mirrors the value last sent via onState. */
  private state: ConnState = 'disconnected'

  /**
   * Promise of the in-flight transition (connect or disconnect), if any.
   * Reconnect flows await it before starting their own work so we never
   * have two `connect` paths racing on the same WebSerial port.
   */
  private inflight: Promise<void> | null = null

  constructor(
    private readonly mirror: MirrorHandle,
    private readonly events: ConnEvents
  ) {}

  get connected(): boolean {
    return this.state === 'connected'
  }

  /**
   * User-gestured connect — pops the WebSerial picker. MUST be invoked
   * synchronously from a click handler. Calling while already connected
   * triggers a disconnect first.
   */
  async connect(): Promise<void> {
    // Request the port up-front while the user gesture is still active,
    // BEFORE we await any teardown. Storing the unresolved promise is
    // fine; only the call site matters for gesture preservation.
    let portPromise: Promise<SerialPort>
    try {
      portPromise = requestFlipperPort()
    } catch (err) {
      portPromise = Promise.reject(err)
    }
    return this.runConnect(portPromise)
  }

  /**
   * Connect to a port already granted at the session level (e.g. picked
   * in the settings window). No user gesture needed.
   */
  async connectGranted(): Promise<void> {
    return this.runConnect(
      (async (): Promise<SerialPort> => {
        const port = await getGrantedFlipperPort()
        if (!port) {
          throw new Error('No granted Flipper port — click Connect to pick one.')
        }
        return port
      })()
    )
  }

  /**
   * Idempotent and re-entrant. Safe to call from any state.
   */
  async disconnect(): Promise<void> {
    if (this.state === 'disconnected') return
    // If another transition is in flight, wait for it to finish — then
    // run a fresh teardown over whatever it left behind.
    if (this.inflight) {
      await this.inflight.catch(() => {})
    }
    const op = this.runDisconnect()
    this.inflight = op
    try {
      await op
    } finally {
      if (this.inflight === op) this.inflight = null
    }
  }

  async sendInput(button: ButtonId, type: 'press' | 'short' | 'release'): Promise<void> {
    if (!this.client || this.state !== 'connected') return
    try {
      await sendInput(this.client, button, type)
    } catch (err) {
      this.events.onLog?.(`sendInput failed: ${String(err)}`, 'err')
    }
  }

  // ---- Internals --------------------------------------------------------

  private setState(state: ConnState, message?: string): void {
    this.state = state
    this.events.onState(state, message)
  }

  /** Translate Chromium's vague WebSerial errors into actionable text. */
  private friendlyError(msg: string): string {
    if (msg.includes('No port selected')) {
      return "No Flipper detected. Plug it in via USB, make sure it's awake, and try a known-good data cable. On WSL you'll also need usbipd-win."
    }
    if (msg.includes('Failed to open')) {
      return 'Port is busy — another app may have it open. Try unplugging the Flipper for a moment and reconnecting.'
    }
    return msg
  }

  private async runConnect(portPromise: Promise<SerialPort>): Promise<void> {
    // Wait for any in-flight transition to finish, THEN tear down any
    // existing connection so the device is fully released before the
    // new open() call. requestPort has already been kicked off above so
    // the user gesture window doesn't matter here.
    if (this.inflight) await this.inflight.catch(() => {})
    if (this.state === 'connected' || this.state === 'connecting') {
      await this.runDisconnect().catch(() => {})
    }

    const op = this.connectInner(portPromise)
    this.inflight = op
    try {
      await op
    } finally {
      if (this.inflight === op) this.inflight = null
    }
  }

  private async connectInner(portPromise: Promise<SerialPort>): Promise<void> {
    try {
      this.setState('connecting', 'opening port…')
      const port = await portPromise
      this.transport = new WebSerialTransport(port)
      await this.transport.open()

      this.setState('connecting', 'starting RPC…')
      const client = new FlipperRpcClient()
      client.addEventListener('state', (ev: Event) => {
        const detail = (ev as CustomEvent<{ state: string }>).detail
        // Only surface RPC state while we're still mid-connect — once
        // we're connected, the rpc layer settles and per-event status
        // updates would just spam the UI.
        if (this.state === 'connecting') {
          this.setState('connecting', `rpc: ${detail.state}`)
        }
      })
      await client.connect(this.transport)
      this.client = client

      this.setState('connecting', 'starting screen stream…')
      // Track the last orientation we saw so we only update the model's
      // rotation on actual changes — the firmware sends orientation in
      // every frame even when the app hasn't switched modes.
      let lastOrient = -1
      this.stopStream = await startScreenStream(client, (f) => {
        if (f.data.byteLength !== SCREEN_BYTES) return
        try {
          this.mirror.screen.drawFrame(new Uint8Array(f.data), f.orientation)
          if (f.orientation !== lastOrient) {
            lastOrient = f.orientation
            this.mirror.setDeviceOrientation(f.orientation)
          }
        } catch (err) {
          this.events.onLog?.(`drawFrame failed: ${String(err)}`, 'err')
        }
      })

      this.setState('connected')
      this.events.onLog?.('Connected. Streaming live screen.', 'ok')
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err)
      const friendly = this.friendlyError(raw)
      this.events.onLog?.(`Connect failed: ${friendly}`, 'err')
      // Best-effort cleanup of whatever we set up before failing.
      await this.runDisconnect(true).catch(() => {})
      this.setState('error', friendly)
    }
  }

  /**
   * Tear down everything we own. `silent` suppresses the final state
   * transition — used when called from inside a failing connect, so the
   * caller can set the 'error' state itself.
   */
  private async runDisconnect(silent = false): Promise<void> {
    if (!silent) this.setState('disconnecting')
    // Stop receiving frames first — otherwise stream callbacks can fire
    // against a half-torn-down RPC client.
    if (this.stopStream) {
      try {
        await this.stopStream()
      } catch {
        /* best effort */
      }
      this.stopStream = null
    }
    // Disconnect the RPC layer if the bundle exposes it. The bundle's
    // FlipperRpcClient has a `disconnect()` method that drains pending
    // requests and resets internal state — without it, reconnect can
    // get stuck on stale RPC state.
    if (this.client) {
      try {
        await this.client.disconnect()
      } catch {
        /* best effort */
      }
      this.client = null
    }
    // Finally close the transport — this releases the SerialPort so
    // Windows / udev hands it back to us on the next open.
    if (this.transport) {
      try {
        await this.transport.close()
      } catch {
        /* best effort */
      }
      this.transport = null
    }
    if (!silent) {
      this.setState('disconnected')
      this.events.onLog?.('Disconnected.')
    }
  }
}
