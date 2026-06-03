/**
 * Length-prefixed framing for the Flipper RPC wire format.
 *
 * Each frame on the wire is `<varint length><payload>`. `VarintFramer` is
 * a TransformStream that consumes raw bytes from the SerialPort's
 * `readable` and emits one Uint8Array per complete frame.
 *
 * The optional `seed` argument seeds the buffer with leftover bytes from
 * the connection handshake — during the RPC startup we drain the CLI
 * prompt with a plain reader and only switch to framed reading once we
 * see the first protobuf byte. Those leftover bytes get passed in here.
 */

/** Cap on a single frame to keep a corrupt stream from allocating GBs. */
const MAX_FRAME_BYTES = 1 << 20

export class VarintFramer extends TransformStream<Uint8Array, Uint8Array> {
  constructor(seed?: Uint8Array) {
    // `Uint8Array<ArrayBufferLike>` here matches what the TransformStream
    // hands us in `transform(chunk, controller)`. The strict TS5.7+
    // generic on TypedArrays propagates from `chunk` through `concat`
    // back into `buf`, so we annotate explicitly to avoid widening
    // errors at every assignment.
    let buf: Uint8Array<ArrayBufferLike> = new Uint8Array(0)
    if (seed && seed.byteLength > 0) {
      buf = new Uint8Array(seed.byteLength)
      buf.set(seed)
    }
    let expectedLen: number | null = null
    super({
      transform(chunk, controller) {
        buf = concat(buf, chunk)
        while (true) {
          if (expectedLen === null) {
            const decoded = tryDecodeVarint(buf)
            if (decoded === null) return
            if (decoded.value > MAX_FRAME_BYTES) {
              controller.error(new Error(`Frame length ${decoded.value} exceeds limit`))
              return
            }
            expectedLen = decoded.value
            buf = buf.subarray(decoded.bytesRead)
          }
          if (buf.byteLength < expectedLen) return
          const frame = buf.subarray(0, expectedLen)
          // Copy out — `subarray` shares the underlying buffer, and we're
          // about to advance `buf` past these bytes.
          controller.enqueue(new Uint8Array(frame))
          buf = buf.subarray(expectedLen)
          expectedLen = null
        }
      }
    })
  }
}

/** Prepend a varint length prefix to a binary payload. */
export function encodeVarintLength(payload: Uint8Array): Uint8Array {
  const prefix = encodeVarint(payload.byteLength)
  const out = new Uint8Array(prefix.byteLength + payload.byteLength)
  out.set(prefix, 0)
  out.set(payload, prefix.byteLength)
  return out
}

/** Standard protobuf varint encoding for a non-negative integer. */
export function encodeVarint(value: number): Uint8Array {
  if (value < 0 || !Number.isFinite(value) || !Number.isInteger(value)) {
    throw new Error(`encodeVarint: bad value ${value}`)
  }
  const bytes: number[] = []
  let v = value
  while (v > 127) {
    bytes.push((v & 127) | 128)
    v >>>= 7
  }
  bytes.push(v & 127)
  return Uint8Array.from(bytes)
}

/**
 * Try to read one varint from the start of `buf`. Returns `null` if the
 * buffer doesn't contain a full varint yet (the caller should await
 * more bytes). Throws if the varint is longer than 5 bytes — Flipper
 * frame lengths fit in 32 bits, so anything longer means the stream is
 * corrupt.
 */
export function tryDecodeVarint(
  buf: Uint8Array
): { value: number; bytesRead: number } | null {
  let value = 0
  let shift = 0
  for (let i = 0; i < buf.byteLength; i++) {
    const byte = buf[i]
    value |= (byte & 127) << shift
    if ((byte & 128) === 0) {
      return { value: value >>> 0, bytesRead: i + 1 }
    }
    shift += 7
    if (shift >= 35) {
      throw new Error('Varint too long; stream corrupt?')
    }
  }
  return null
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  if (a.byteLength === 0) return b
  if (b.byteLength === 0) return a
  const out = new Uint8Array(a.byteLength + b.byteLength)
  out.set(a, 0)
  out.set(b, a.byteLength)
  return out
}
