/**
 * Slim subset of Flipper's `flipper.proto`. Only includes the fields and
 * `Main.content` oneof variants this app actually exchanges with the
 * device. Other variants the firmware sends still wire-decode (the field
 * numbers match upstream); they just don't surface in the typed
 * `content` union — they fall through to `oneofKind: undefined` and are
 * ignored by our client.
 * @see https://github.com/flipperdevices/Flipper-Protobuf/blob/dev/flipper.proto
 */
import { MessageType, ScalarType } from '@protobuf-ts/runtime'
import {
  ScreenFrame,
  SendInputEventRequest,
  StartScreenStreamRequest,
  StopScreenStreamRequest
} from './gui'
import type {
  ScreenFrame as ScreenFrameT,
  SendInputEventRequest as SendInputEventRequestT,
  StartScreenStreamRequest as StartScreenStreamRequestT,
  StopScreenStreamRequest as StopScreenStreamRequestT
} from './gui'

export enum CommandStatus {
  OK = 0,
  ERROR = 1,
  ERROR_DECODE = 2,
  ERROR_NOT_IMPLEMENTED = 3,
  ERROR_BUSY = 4
}

export type Empty = Record<string, never>
class Empty$Type extends MessageType<Empty> {
  constructor() {
    super('PB.Empty', [])
  }
}
export const Empty = new Empty$Type()

export type StopSession = Record<string, never>
class StopSession$Type extends MessageType<StopSession> {
  constructor() {
    super('PB.StopSession', [])
  }
}
export const StopSession = new StopSession$Type()

/**
 * Top-level RPC envelope. The `content` oneof selects which inner
 * message is carried. We only model the variants we send or expect to
 * receive — everything else the firmware emits is decoded into the
 * `unknown` fallback and silently ignored.
 */
export interface Main {
  commandId: number
  commandStatus: CommandStatus
  hasNext: boolean
  content:
    | { oneofKind: 'empty'; empty: Empty }
    | { oneofKind: 'stopSession'; stopSession: StopSession }
    | {
        oneofKind: 'guiStartScreenStreamRequest'
        guiStartScreenStreamRequest: StartScreenStreamRequestT
      }
    | {
        oneofKind: 'guiStopScreenStreamRequest'
        guiStopScreenStreamRequest: StopScreenStreamRequestT
      }
    | { oneofKind: 'guiScreenFrame'; guiScreenFrame: ScreenFrameT }
    | {
        oneofKind: 'guiSendInputEventRequest'
        guiSendInputEventRequest: SendInputEventRequestT
      }
    | { oneofKind: undefined }
}

class Main$Type extends MessageType<Main> {
  constructor() {
    super('PB.Main', [
      { no: 1, name: 'command_id', kind: 'scalar', T: ScalarType.UINT32 },
      {
        no: 2,
        name: 'command_status',
        kind: 'enum',
        T: () => ['PB.CommandStatus', CommandStatus]
      },
      { no: 3, name: 'has_next', kind: 'scalar', T: ScalarType.BOOL },
      { no: 4, name: 'empty', kind: 'message', oneof: 'content', T: () => Empty },
      {
        no: 19,
        name: 'stop_session',
        kind: 'message',
        oneof: 'content',
        T: () => StopSession
      },
      {
        no: 20,
        name: 'gui_start_screen_stream_request',
        kind: 'message',
        oneof: 'content',
        T: () => StartScreenStreamRequest
      },
      {
        no: 21,
        name: 'gui_stop_screen_stream_request',
        kind: 'message',
        oneof: 'content',
        T: () => StopScreenStreamRequest
      },
      {
        no: 22,
        name: 'gui_screen_frame',
        kind: 'message',
        oneof: 'content',
        T: () => ScreenFrame
      },
      {
        no: 23,
        name: 'gui_send_input_event_request',
        kind: 'message',
        oneof: 'content',
        T: () => SendInputEventRequest
      }
    ])
  }
}
export const Main = new Main$Type()
