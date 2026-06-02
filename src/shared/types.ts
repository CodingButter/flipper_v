/**
 * Types and channel names shared between main, preload, and both renderers.
 */

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
  SetIgnoreMouse: 'window:set-ignore-mouse'
} as const

/** Main → renderer, one-way broadcast. */
export const IpcEvent = {
  PrefsChanged: 'prefs:changed',
  ThemesChanged: 'themes:changed',
  /** Tells the floating renderer to apply the active theme right now. */
  ApplyTheme: 'theme:apply'
} as const

export type IpcInvokeChannel = (typeof IpcInvoke)[keyof typeof IpcInvoke]
export type IpcEventChannel = (typeof IpcEvent)[keyof typeof IpcEvent]
