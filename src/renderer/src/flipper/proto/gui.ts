/**
 * Subset of Flipper's `gui.proto` we actually use. Matches the field
 * numbers from the upstream schema, so a real device speaks to us.
 * @see https://github.com/flipperdevices/Flipper-Protobuf/blob/dev/gui.proto
 */
import { MessageType, ScalarType } from '@protobuf-ts/runtime'

export enum InputKey {
  UP = 0,
  DOWN = 1,
  RIGHT = 2,
  LEFT = 3,
  OK = 4,
  BACK = 5
}

export enum InputType {
  PRESS = 0,
  RELEASE = 1,
  SHORT = 2,
  LONG = 3,
  REPEAT = 4
}

export enum ScreenOrientation {
  HORIZONTAL = 0,
  HORIZONTAL_FLIP = 1,
  VERTICAL = 2,
  VERTICAL_FLIP = 3
}

export interface ScreenFrame {
  data: Uint8Array
  orientation: ScreenOrientation
}
class ScreenFrame$Type extends MessageType<ScreenFrame> {
  constructor() {
    super('PB_Gui.ScreenFrame', [
      { no: 1, name: 'data', kind: 'scalar', T: ScalarType.BYTES },
      {
        no: 2,
        name: 'orientation',
        kind: 'enum',
        T: () => ['PB_Gui.ScreenOrientation', ScreenOrientation]
      }
    ])
  }
}
export const ScreenFrame = new ScreenFrame$Type()

export interface SendInputEventRequest {
  key: InputKey
  type: InputType
}
class SendInputEventRequest$Type extends MessageType<SendInputEventRequest> {
  constructor() {
    super('PB_Gui.SendInputEventRequest', [
      { no: 1, name: 'key', kind: 'enum', T: () => ['PB_Gui.InputKey', InputKey] },
      { no: 2, name: 'type', kind: 'enum', T: () => ['PB_Gui.InputType', InputType] }
    ])
  }
}
export const SendInputEventRequest = new SendInputEventRequest$Type()

export type StartScreenStreamRequest = Record<string, never>
class StartScreenStreamRequest$Type extends MessageType<StartScreenStreamRequest> {
  constructor() {
    super('PB_Gui.StartScreenStreamRequest', [])
  }
}
export const StartScreenStreamRequest = new StartScreenStreamRequest$Type()

export type StopScreenStreamRequest = Record<string, never>
class StopScreenStreamRequest$Type extends MessageType<StopScreenStreamRequest> {
  constructor() {
    super('PB_Gui.StopScreenStreamRequest', [])
  }
}
export const StopScreenStreamRequest = new StopScreenStreamRequest$Type()
