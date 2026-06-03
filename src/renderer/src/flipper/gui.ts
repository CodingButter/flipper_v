/**
 * High-level GUI helpers — subscribe to the live screen stream and send
 * synthetic button events. Thin wrappers around `FlipperRpcClient`.
 */
import type { FlipperRpcClient } from './rpc-client'
import { CommandStatus } from './proto/flipper'
import { InputKey, InputType } from './proto/gui'

export type FlipperButton = 'up' | 'down' | 'left' | 'right' | 'ok' | 'back'
export type FlipperPressType = 'press' | 'release' | 'short' | 'long' | 'repeat'

export type ScreenFramePayload = {
  data: Uint8Array
  orientation: number
}

const KEY_MAP: Record<FlipperButton, InputKey> = {
  up: InputKey.UP,
  down: InputKey.DOWN,
  left: InputKey.LEFT,
  right: InputKey.RIGHT,
  ok: InputKey.OK,
  back: InputKey.BACK
}

const TYPE_MAP: Record<FlipperPressType, InputType> = {
  press: InputType.PRESS,
  release: InputType.RELEASE,
  short: InputType.SHORT,
  long: InputType.LONG,
  repeat: InputType.REPEAT
}

/**
 * Subscribe to live screen frames. Returns a stop function that
 * unsubscribes locally AND tells the device to stop sending. Safe to
 * call multiple times.
 */
export async function startScreenStream(
  client: FlipperRpcClient,
  onFrame: (frame: ScreenFramePayload) => void
): Promise<() => Promise<void>> {
  const unsubscribe = client.onStreamMessage((msg) => {
    if (msg.content.oneofKind !== 'guiScreenFrame') return
    const frame = msg.content.guiScreenFrame
    onFrame({ data: frame.data, orientation: frame.orientation })
  })

  let started = false
  try {
    const response = await client.sendRequest({
      commandStatus: 0,
      hasNext: false,
      content: {
        oneofKind: 'guiStartScreenStreamRequest',
        guiStartScreenStreamRequest: {}
      }
    })
    if (response.commandStatus !== CommandStatus.OK) {
      const name = CommandStatus[response.commandStatus] ?? response.commandStatus
      throw new Error(`startScreenStream failed: ${name}`)
    }
    started = true
  } finally {
    if (!started) unsubscribe()
  }

  let cancelled = false
  return async (): Promise<void> => {
    if (cancelled) return
    cancelled = true
    unsubscribe()
    try {
      await stopScreenStream(client)
    } catch {
      /* device may already be closing — ignore */
    }
  }
}

export async function stopScreenStream(client: FlipperRpcClient): Promise<void> {
  await client.sendOneway({
    commandStatus: 0,
    hasNext: false,
    content: {
      oneofKind: 'guiStopScreenStreamRequest',
      guiStopScreenStreamRequest: {}
    }
  })
}

/** Synthesize an input event — press / release / short / long / repeat. */
export async function sendInput(
  client: FlipperRpcClient,
  key: FlipperButton,
  type: FlipperPressType
): Promise<void> {
  const pbKey = KEY_MAP[key]
  if (pbKey === undefined) throw new Error(`unknown input key: ${key}`)
  const pbType = TYPE_MAP[type]
  if (pbType === undefined) throw new Error(`unknown input type: ${type}`)
  await client.sendOneway({
    commandStatus: 0,
    hasNext: false,
    content: {
      oneofKind: 'guiSendInputEventRequest',
      guiSendInputEventRequest: { key: pbKey, type: pbType }
    }
  })
}
