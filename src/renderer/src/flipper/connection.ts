import type { MirrorHandle } from './scene'
import type { ButtonId } from './constants'

export type ConnState = 'disconnected' | 'connecting' | 'connected' | 'error'

export type ConnEvents = {
  onState: (s: ConnState, msg?: string) => void
  onLog?: (msg: string, kind?: 'ok' | 'err') => void
}

/**
 * Manages the WebSerial connection lifecycle and live screen stream. Holds
 * the FlipperRpcClient instance so the scene's button handler can route
 * press/short/release events to the device.
 */
export class Connection {
  private client: InstanceType<MirrorHandle['bundle']['FlipperRpcClient']> | null = null
  private transport: InstanceType<MirrorHandle['bundle']['WebSerialTransport']> | null = null
  private stopStream: (() => Promise<void>) | null = null

  constructor(
    private readonly mirror: MirrorHandle,
    private readonly events: ConnEvents
  ) {}

  get connected(): boolean {
    return this.client != null
  }

  async connect(): Promise<void> {
    const { bundle } = this.mirror
    try {
      this.events.onState('connecting', 'opening port…')
      const port = await bundle.requestFlipperPort()
      this.transport = new bundle.WebSerialTransport(port)
      await this.transport.open()
      this.events.onState('connecting', 'starting RPC…')
      this.client = new bundle.FlipperRpcClient()
      this.client.addEventListener('state', (ev: Event) => {
        const detail = (ev as CustomEvent<{ state: string }>).detail
        this.events.onState('connecting', `rpc: ${detail.state}`)
      })
      await this.client.connect(this.transport)
      this.events.onState('connecting', 'starting screen stream…')
      this.stopStream = await bundle.startScreenStream(this.client, (f) => {
        if (f.data.byteLength !== bundle.SCREEN_BYTES) return
        try {
          this.mirror.screen.drawFrame(new Uint8Array(f.data), f.orientation)
        } catch (err) {
          this.events.onLog?.(`drawFrame failed: ${String(err)}`, 'err')
        }
      })
      this.events.onState('connected')
      this.events.onLog?.('Connected. Streaming live screen.', 'ok')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      this.events.onState('error', msg)
      this.events.onLog?.(`Connect failed: ${msg}`, 'err')
      this.client = null
      this.transport = null
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.stopStream) await this.stopStream()
    } catch {
      /* ignore */
    }
    try {
      if (this.transport) await this.transport.close()
    } catch {
      /* ignore */
    }
    this.client = null
    this.transport = null
    this.stopStream = null
    this.events.onState('disconnected')
    this.events.onLog?.('Disconnected.')
  }

  async sendInput(button: ButtonId, type: 'press' | 'short' | 'release'): Promise<void> {
    if (!this.client) return
    try {
      await this.mirror.bundle.sendInput(this.client, button, type)
    } catch (err) {
      this.events.onLog?.(`sendInput failed: ${String(err)}`, 'err')
    }
  }
}
