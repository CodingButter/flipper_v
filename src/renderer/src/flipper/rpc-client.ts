/**
 * FlipperRpcClient — wraps a `WebSerialTransport` in the Flipper RPC
 * protocol: drains the CLI prompt on connect, switches the device into
 * `start_rpc_session`, then reads/writes length-prefixed protobuf `Main`
 * frames. Tracks pending requests by `commandId` and routes responses
 * back to their callers.
 *
 * Higher-level helpers (`sendInput`, `startScreenStream`, etc.) live in
 * `./gui.ts`.
 */
import type { WebSerialTransport } from './transport'
import { VarintFramer, encodeVarintLength } from './framing'
import { Main, type Main as MainMsg } from './proto/flipper'

const DEFAULT_REQUEST_TIMEOUT_MS = 10_000

export type RpcState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'errored'

type Pending = {
  resolve: (msg: MainMsg) => void
  reject: (err: unknown) => void
  timer: ReturnType<typeof setTimeout> | null
}

type StreamingPending = Pending & {
  onFrame: (msg: MainMsg) => void
}

/** Race a reader against a timeout. Returns either the chunk, "timeout", or "closed". */
async function readWithTimeout(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  timeoutMs: number
): Promise<Uint8Array | 'timeout' | 'closed'> {
  let timer: ReturnType<typeof setTimeout> | null = null
  const timeoutPromise = new Promise<'timeout'>((resolve) => {
    timer = setTimeout(() => resolve('timeout'), timeoutMs)
  })
  try {
    const result = await Promise.race([
      reader.read().then((r): Uint8Array | 'closed' => (r.done ? 'closed' : r.value)),
      timeoutPromise
    ])
    return result
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function decodeLatin1(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.byteLength; i++) s += String.fromCharCode(bytes[i])
  return s
}

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  let total = 0
  for (const c of chunks) total += c.byteLength
  const out = new Uint8Array(total)
  let off = 0
  for (const c of chunks) {
    out.set(c, off)
    off += c.byteLength
  }
  return out
}

function toHexDump(bytes: Uint8Array, maxBytes = 128): string {
  const slice = bytes.subarray(0, maxBytes)
  const hex = Array.from(slice, (b) => b.toString(16).padStart(2, '0')).join(' ')
  return bytes.byteLength > maxBytes
    ? `${hex} ... (+${bytes.byteLength - maxBytes} more)`
    : hex
}

export class FlipperRpcClient extends EventTarget {
  private transport: WebSerialTransport | null = null
  private state: RpcState = 'disconnected'
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null
  private framedReadable: ReadableStream<Uint8Array> | null = null
  private readLoopPromise: Promise<void> | null = null
  private readAbort: AbortController | null = null
  /** Serializes outbound writes so framed payloads don't interleave. */
  private writeChain: Promise<unknown> = Promise.resolve()
  private nextCommandId = 1
  private pending = new Map<number, Pending>()
  private pendingStream = new Map<number, StreamingPending>()
  private streamHandlers = new Set<(msg: MainMsg) => void>()

  getState(): RpcState {
    return this.state
  }

  async connect(transport: WebSerialTransport): Promise<void> {
    if (this.state !== 'disconnected' && this.state !== 'errored') {
      throw new Error(`connect() called in state ${this.state}`)
    }
    this.transport = transport
    this.setState('connecting')

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
    try {
      this.writer = transport.writable.getWriter()
      reader = transport.readable.getReader()

      // Phase A: send CR, wait for the Flipper's CLI prompt ("\r>: ").
      // If the prompt doesn't arrive in 3s the device is likely locked
      // or in DFU mode.
      await this.writer.write(new TextEncoder().encode('\r'))
      const PROMPT = '\r\n>: '
      const PHASE_A_TIMEOUT_MS = 3000
      let accumulated = ''
      const collectedRaw: Uint8Array[] = []
      const deadline = Date.now() + PHASE_A_TIMEOUT_MS
      while (!accumulated.endsWith(PROMPT) && !accumulated.includes(PROMPT)) {
        const remaining = deadline - Date.now()
        if (remaining <= 0) {
          throw new Error(
            `CLI prompt not received within ${PHASE_A_TIMEOUT_MS / 1000}s. ` +
              `Last bytes (hex): ${toHexDump(concatChunks(collectedRaw))}. ` +
              `Is the Flipper unlocked and not in DFU mode?`
          )
        }
        const chunk = await readWithTimeout(reader, remaining)
        if (chunk === 'timeout') {
          throw new Error(
            `CLI prompt not received within ${PHASE_A_TIMEOUT_MS / 1000}s. ` +
              `Last bytes (hex): ${toHexDump(concatChunks(collectedRaw))}.`
          )
        }
        if (chunk === 'closed') {
          throw new Error(
            `Transport closed while waiting for CLI prompt. ` +
              `Last bytes (hex): ${toHexDump(concatChunks(collectedRaw))}.`
          )
        }
        collectedRaw.push(chunk)
        accumulated += decodeLatin1(chunk)
      }

      // Phase B: switch the CLI into RPC mode.
      await this.writer.write(new TextEncoder().encode('start_rpc_session\r'))

      // Phase C: drain the textual echo. Once we see a byte with the
      // high bit set, we're past the ASCII echo and into protobuf —
      // capture it as the seed for the framer.
      const PHASE_C_IDLE_MS = 250
      let prelude = new Uint8Array(0)
      while (true) {
        const chunk = await readWithTimeout(reader, PHASE_C_IDLE_MS)
        if (chunk === 'timeout') break
        if (chunk === 'closed') {
          throw new Error('Transport closed during RPC handshake drain.')
        }
        const splitIdx = chunk.findIndex((b) => b >= 128)
        if (splitIdx !== -1) {
          prelude = new Uint8Array(chunk.subarray(splitIdx))
          break
        }
      }
      reader.releaseLock()
      reader = null

      // Now we own the readable stream with a framer in front. Spawn
      // the read loop and we're live.
      this.framedReadable = transport.readable.pipeThrough(
        new VarintFramer(prelude.byteLength > 0 ? prelude : undefined)
      )
      this.readAbort = new AbortController()
      this.readLoopPromise = this.readLoop(this.framedReadable, this.readAbort.signal)
      this.setState('connected')
    } catch (err) {
      this.setState('errored')
      if (reader) {
        try {
          reader.releaseLock()
        } catch {
          /* ignore */
        }
      }
      this.writer = null
      this.framedReadable = null
      this.readLoopPromise = null
      this.readAbort = null
      this.transport = null
      throw err
    }
  }

  async disconnect(): Promise<void> {
    if (this.state === 'disconnected' || this.state === 'disconnecting') return
    const wasConnected = this.state === 'connected'
    this.setState('disconnecting')

    // Tell the device we're done so it stops its end of the session.
    // Best-effort — if the link is already dead it'll just throw.
    if (wasConnected) {
      try {
        await this.sendOneway({
          commandStatus: 0,
          hasNext: false,
          content: { oneofKind: 'stopSession', stopSession: {} }
        })
      } catch {
        /* ignore */
      }
    }

    this.readAbort?.abort()
    if (this.writer) {
      try {
        await this.writer.close()
      } catch {
        try {
          this.writer.releaseLock()
        } catch {
          /* ignore */
        }
      }
      this.writer = null
    }
    if (this.readLoopPromise) {
      try {
        await this.readLoopPromise
      } catch {
        /* ignore */
      }
      this.readLoopPromise = null
    }
    if (this.transport) {
      try {
        await this.transport.close()
      } catch {
        /* ignore */
      }
      this.transport = null
    }

    // Fail any in-flight requests so awaiting callers don't hang.
    for (const [, p] of this.pending) {
      if (p.timer) clearTimeout(p.timer)
      p.reject(new Error('client disconnected'))
    }
    this.pending.clear()
    for (const [, p] of this.pendingStream) {
      if (p.timer) clearTimeout(p.timer)
      p.reject(new Error('client disconnected'))
    }
    this.pendingStream.clear()

    this.framedReadable = null
    this.readAbort = null
    this.setState('disconnected')
  }

  /** Send a request and resolve with its single response. */
  async sendRequest(
    req: Omit<MainMsg, 'commandId'>,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS
  ): Promise<MainMsg> {
    if (this.state !== 'connected') {
      throw new Error(`sendRequest() in state ${this.state}`)
    }
    const commandId = this.allocateCommandId()
    const outbound: MainMsg = { ...req, commandId }
    const responsePromise = new Promise<MainMsg>((resolve, reject) => {
      const timer =
        timeoutMs > 0
          ? setTimeout(() => {
              const entry = this.pending.get(commandId)
              if (!entry) return
              this.pending.delete(commandId)
              reject(new Error(`request ${commandId} timed out`))
            }, timeoutMs)
          : null
      this.pending.set(commandId, { resolve, reject, timer })
    })
    try {
      await this.writeFramed(outbound)
    } catch (err) {
      const entry = this.pending.get(commandId)
      if (entry) {
        if (entry.timer) clearTimeout(entry.timer)
        this.pending.delete(commandId)
      }
      throw err
    }
    return responsePromise
  }

  /** Send a one-way request — don't expect a response. */
  async sendOneway(req: Omit<MainMsg, 'commandId'>): Promise<void> {
    if (this.state !== 'connected' && this.state !== 'disconnecting') {
      throw new Error(`sendOneway() in state ${this.state}`)
    }
    const commandId = this.allocateCommandId()
    await this.writeFramed({ ...req, commandId })
  }

  /**
   * Subscribe to unsolicited stream messages — the ones the device
   * sends with `commandId === 0` (screen frames, for example). Returns
   * an unsubscribe function.
   */
  onStreamMessage(handler: (msg: MainMsg) => void): () => void {
    this.streamHandlers.add(handler)
    return () => {
      this.streamHandlers.delete(handler)
    }
  }

  // ---- internals ------------------------------------------------------

  private dispatch(msg: MainMsg): void {
    this.dispatchEvent(new CustomEvent('message', { detail: { msg } }))

    // commandId === 0 marks an unsolicited stream message.
    if (msg.commandId === 0) {
      for (const h of this.streamHandlers) h(msg)
      return
    }

    const streaming = this.pendingStream.get(msg.commandId)
    if (streaming) {
      streaming.onFrame(msg)
      if (!msg.hasNext) {
        this.pendingStream.delete(msg.commandId)
        if (streaming.timer) clearTimeout(streaming.timer)
        streaming.resolve(msg)
      }
      return
    }

    const pending = this.pending.get(msg.commandId)
    if (!pending) return
    this.pending.delete(msg.commandId)
    if (pending.timer) clearTimeout(pending.timer)
    pending.resolve(msg)
  }

  private setState(next: RpcState): void {
    if (this.state === next) return
    this.state = next
    this.dispatchEvent(new CustomEvent('state', { detail: { state: next } }))
  }

  private allocateCommandId(): number {
    const id = this.nextCommandId++
    // Wrap to 1 (skip 0 — reserved for stream messages).
    if (this.nextCommandId === 0) this.nextCommandId = 1
    return id
  }

  private writeFramed(msg: MainMsg): Promise<void> {
    const writer = this.writer
    if (!writer) return Promise.reject(new Error('transport writer not available'))
    const payload = Main.toBinary(msg)
    const framed = encodeVarintLength(payload)
    // writeChain serializes writes so two callers can't interleave
    // frame bytes on the wire.
    const next = this.writeChain.then(() => writer.write(framed))
    this.writeChain = next.catch(() => {})
    return next
  }

  private async readLoop(
    framed: ReadableStream<Uint8Array>,
    signal: AbortSignal
  ): Promise<void> {
    const reader = framed.getReader()
    const onAbort = (): void => {
      reader.cancel(new Error('read loop aborted')).catch(() => {})
    }
    signal.addEventListener('abort', onAbort, { once: true })
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) return
        if (!value) continue
        let msg: MainMsg
        try {
          msg = Main.fromBinary(value)
        } catch (err) {
          this.failPending(err)
          this.setState('errored')
          return
        }
        this.dispatch(msg)
      }
    } catch (err) {
      if (!signal.aborted) {
        this.failPending(err)
        this.setState('errored')
      }
    } finally {
      signal.removeEventListener('abort', onAbort)
      try {
        reader.releaseLock()
      } catch {
        /* ignore */
      }
    }
  }

  private failPending(err: unknown): void {
    for (const [, p] of this.pending) {
      if (p.timer) clearTimeout(p.timer)
      p.reject(err)
    }
    this.pending.clear()
    for (const [, p] of this.pendingStream) {
      if (p.timer) clearTimeout(p.timer)
      p.reject(err)
    }
    this.pendingStream.clear()
  }
}
