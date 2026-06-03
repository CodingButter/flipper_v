/**
 * Types and channel names shared between main, preload, and both renderers.
 */

export type ButtonId = 'up' | 'down' | 'left' | 'right' | 'ok' | 'back'

/**
 * One key binding per `KeyboardEvent.code`. We store codes (not `key`)
 * so bindings are layout-independent — `KeyW` is the physical key, not
 * the character "w".
 */
export type KeyBindings = Record<ButtonId, string[]>

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  ok: ['Enter', 'Space'],
  back: ['Backspace', 'Escape']
}

export const BUTTON_ORDER: ReadonlyArray<{ id: ButtonId; label: string }> = [
  { id: 'up', label: 'Up' },
  { id: 'down', label: 'Down' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'ok', label: 'OK' },
  { id: 'back', label: 'Back' }
]

export type ThemeColors = {
  /** Body / case color of the Flipper. */
  body: string
  /** Buttons + branding orange. */
  accent: string
  /** Black trim. */
  trim: string
  /** Backlight color of the on-device screen. */
  screen: string
}

export type Theme = ThemeColors & {
  /** Stable id (kebab-case). For built-ins this is the slug of `name`. */
  id: string
  name: string
  /** Built-ins are not editable / deletable. */
  builtin?: boolean
}

export type Prefs = {
  alwaysOnTop: boolean
  /** Window opacity 0.2 – 1.0. */
  opacity: number
  /** Currently-applied theme id. */
  activeThemeId: string
  /** Click-through (mouse events pass through, except small drag handle). */
  clickThrough: boolean
  /** Show a small drag handle when hovering the floating window. */
  showDragHandle: boolean
  /**
   * When true, paints the window background a solid color (`chromaColor`)
   * so streamers / video editors can key it out in OBS or Premiere.
   * Three.js still renders with an alpha-cleared canvas, so the model
   * overlays cleanly on top of the chroma fill.
   */
  chromaKey: boolean
  chromaColor: string
  keyBindings: KeyBindings
  /**
   * Image shown on the device screen when no Flipper is connected.
   *   - `null` → use the bundled default (Flipper V mascot).
   *   - Otherwise: a data URL of an image the user uploaded. Any format
   *     the renderer can decode is fine; we render it onto a 128×64
   *     offscreen canvas and threshold to 1-bit before sending to the
   *     screen mesh.
   */
  splashImage: string | null
}

/** Connection lifecycle as seen by the UI. */
export type ConnState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'error'

export type ConnStatus = {
  state: ConnState
  /** Last status / error message — surfaces in both windows. */
  message?: string
}

/** Renderer → main, awaitable. */
export const IpcInvoke = {
  ThemesList: 'themes:list',
  ThemesSave: 'themes:save',
  ThemesDelete: 'themes:delete',
  PrefsGet: 'prefs:get',
  PrefsSet: 'prefs:set',
  OpenSettings: 'window:open-settings',
  HideFloating: 'window:hide-floating',
  QuitApp: 'app:quit',
  SetIgnoreMouse: 'window:set-ignore-mouse',
  /** Move the floating window by `dx, dy` screen pixels. */
  WindowMoveBy: 'window:move-by',
  /** Resize the floating window by `dw, dh` from the bottom-right anchor. */
  WindowResizeBy: 'window:resize-by',
  /** Floating renderer pushes its current connection status to main. */
  ConnectionPush: 'connection:push',
  /** Read the cached status from main (used by settings on mount). */
  ConnectionGet: 'connection:get'
} as const

/** Main → renderer, one-way broadcast. */
export const IpcEvent = {
  PrefsChanged: 'prefs:changed',
  ThemesChanged: 'themes:changed',
  /** Tells the floating renderer to apply the active theme right now. */
  ApplyTheme: 'theme:apply',
  /** Settings → floating, "please disconnect now". */
  ConnectionDisconnect: 'connection:disconnect',
  /**
   * Settings → floating: a user-gestured `requestPort` in settings just
   * granted a Flipper port at the session level. Floating should now
   * call `getGrantedFlipperPort` and complete the connect without
   * showing a picker.
   */
  ConnectionPortGranted: 'connection:port-granted',
  /** Floating → settings, status changed (relayed via main). */
  ConnectionState: 'connection:state'
} as const

export type IpcInvokeChannel = (typeof IpcInvoke)[keyof typeof IpcInvoke]
export type IpcEventChannel = (typeof IpcEvent)[keyof typeof IpcEvent]
