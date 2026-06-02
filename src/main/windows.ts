import { BrowserWindow, app, shell } from 'electron'
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

export function broadcast(channel: string, payload?: unknown): void {
  for (const w of BrowserWindow.getAllWindows()) {
    if (!w.isDestroyed()) w.webContents.send(channel, payload)
  }
}

export function createFloatingWindow(): BrowserWindow {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.focus()
    return floatingWindow
  }
  const prefs = getPrefs()

  floatingWindow = new BrowserWindow({
    width: 520,
    height: 520,
    show: false,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: true,
    backgroundColor: '#00000000',
    alwaysOnTop: prefs.alwaysOnTop,
    skipTaskbar: false,
    title: 'Flide',
    webPreferences: {
      preload: PRELOAD,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

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
    title: 'Flide Settings',
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
