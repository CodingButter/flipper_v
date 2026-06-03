import { BrowserWindow, app, screen, shell } from 'electron'
import { join } from 'node:path'
import { is } from '@electron-toolkit/utils'
import { getPrefs } from './store'

const PRELOAD = join(__dirname, '../preload/index.js')

/** Resolve a renderer entry — dev points at the vite server, prod loads files. */
function rendererURL(entry: 'renderer' | 'settings'): string {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    return `${process.env['ELECTRON_RENDERER_URL']}/${entry}/index.html`
  }
  // Prod files live at out/renderer/<entry>/index.html relative to app root.
  return `file://${join(__dirname, `../renderer/${entry}/index.html`)}`
}

let floatingWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null

export function getFloatingWindow(): BrowserWindow | null {
  return floatingWindow
}
export function getSettingsWindow(): BrowserWindow | null {
  return settingsWindow
}

export function broadcast(channel: string, payload?: unknown): void {
  for (const w of BrowserWindow.getAllWindows()) {
    if (!w.isDestroyed()) w.webContents.send(channel, payload)
  }
}

export function sendToFloating(channel: string, payload?: unknown): void {
  const w = floatingWindow
  if (w && !w.isDestroyed()) w.webContents.send(channel, payload)
}

export function createFloatingWindow(): BrowserWindow {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.focus()
    return floatingWindow
  }
  const prefs = getPrefs()

  // Square — just bigger than the Flipper's longest dimension. The
  // device's bounding *sphere* fits inside a square window in every
  // orbit angle, so the user can rotate freely without clipping.
  const FLOATING_ASPECT = 1
  const INITIAL_WIDTH = 400
  const INITIAL_HEIGHT = 400

  // The window is always created `transparent:true`; chroma-key mode is
  // implemented in the renderer by painting an opaque background on the
  // body. This avoids window recreation when the user toggles the mode.
  floatingWindow = new BrowserWindow({
    width: INITIAL_WIDTH,
    height: INITIAL_HEIGHT,
    minWidth: 320,
    minHeight: 160,
    show: false,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: true,
    backgroundColor: '#00000000',
    alwaysOnTop: prefs.alwaysOnTop,
    skipTaskbar: false,
    title: 'Flipper V',
    webPreferences: {
      preload: PRELOAD,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  floatingWindow.setAspectRatio(FLOATING_ASPECT)

  if (prefs.alwaysOnTop) floatingWindow.setAlwaysOnTop(true, 'floating')
  floatingWindow.setOpacity(prefs.opacity)
  floatingWindow.setIgnoreMouseEvents(prefs.clickThrough, { forward: true })

  floatingWindow.on('ready-to-show', () => floatingWindow?.show())
  floatingWindow.on('closed', () => {
    floatingWindow = null
  })
  floatingWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  floatingWindow.loadURL(rendererURL('renderer'))
  return floatingWindow
}

export function createSettingsWindow(): BrowserWindow {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus()
    return settingsWindow
  }
  settingsWindow = new BrowserWindow({
    width: 880,
    height: 640,
    minWidth: 720,
    minHeight: 520,
    show: false,
    title: 'Flipper V Settings',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: PRELOAD,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  settingsWindow.setMenuBarVisibility(false)
  settingsWindow.on('ready-to-show', () => settingsWindow?.show())
  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
  settingsWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  settingsWindow.loadURL(rendererURL('settings'))
  return settingsWindow
}

export function applyPrefsToFloating(): void {
  if (!floatingWindow || floatingWindow.isDestroyed()) return
  const prefs = getPrefs()
  floatingWindow.setAlwaysOnTop(prefs.alwaysOnTop, prefs.alwaysOnTop ? 'floating' : 'normal')
  floatingWindow.setOpacity(prefs.opacity)
  floatingWindow.setIgnoreMouseEvents(prefs.clickThrough, { forward: true })
}

/** Move the floating window by a delta. Used by drag-anywhere logic. */
export function moveFloatingBy(dx: number, dy: number): void {
  const w = floatingWindow
  if (!w || w.isDestroyed()) return
  const [x, y] = w.getPosition()
  w.setPosition(Math.round(x + dx), Math.round(y + dy))
}

/**
 * Resize the floating window by a delta, clamped to the work-area. The
 * window is square (aspect 1:1) — `setBounds` would otherwise bypass the
 * setAspectRatio constraint, so we enforce it here. We pick whichever
 * delta is bigger in absolute value so diagonal drag works and so does
 * a mostly-vertical drag.
 */
export function resizeFloatingBy(dw: number, dh: number): void {
  const w = floatingWindow
  if (!w || w.isDestroyed()) return
  const bounds = w.getBounds()
  const display = screen.getDisplayMatching(bounds)
  const minSide = 240
  const maxSide = Math.min(display.workAreaSize.width, display.workAreaSize.height)
  const delta = Math.abs(dw) >= Math.abs(dh) ? dw : dh
  const side = Math.round(Math.min(maxSide, Math.max(minSide, bounds.width + delta)))
  w.setBounds({ x: bounds.x, y: bounds.y, width: side, height: side })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
