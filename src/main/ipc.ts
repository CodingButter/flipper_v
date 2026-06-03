import { ipcMain, app, shell } from 'electron'
import { IpcEvent, IpcInvoke } from '../shared/types'
import type { ConnStatus, Prefs, Theme } from '../shared/types'
import {
  applyPrefsToFloating,
  broadcast,
  createSettingsWindow,
  getFloatingWindow,
  getSettingsWindow,
  moveFloatingBy,
  resizeFloatingBy,
  sendToFloating
} from './windows'
import { deleteTheme, getPrefs, listThemes, saveTheme, setPrefs } from './store'
import { checkForUpdates, downloadUpdate, getUpdateStatus, quitAndInstall } from './updater'

/**
 * Last connection status pushed by the floating renderer. Cached so the
 * settings window can show the correct state when it opens — it doesn't
 * have to wait for the next state change.
 */
let lastConnStatus: ConnStatus = { state: 'disconnected' }

export function registerIpcHandlers(): void {
  ipcMain.handle(IpcInvoke.ThemesList, () => listThemes())

  ipcMain.handle(IpcInvoke.ThemesSave, (_e, theme: Theme) => {
    const themes = saveTheme(theme)
    broadcast(IpcEvent.ThemesChanged, themes)
    return themes
  })

  ipcMain.handle(IpcInvoke.ThemesDelete, (_e, id: string) => {
    const themes = deleteTheme(id)
    broadcast(IpcEvent.ThemesChanged, themes)
    broadcast(IpcEvent.PrefsChanged, getPrefs())
    return themes
  })

  ipcMain.handle(IpcInvoke.PrefsGet, () => getPrefs())

  ipcMain.handle(IpcInvoke.PrefsSet, (_e, patch: Partial<Prefs>) => {
    const prev = getPrefs()
    const next = setPrefs(patch)
    applyPrefsToFloating()
    broadcast(IpcEvent.PrefsChanged, next)
    if (next.activeThemeId !== prev.activeThemeId) {
      const theme = listThemes().find((t) => t.id === next.activeThemeId)
      if (theme) broadcast(IpcEvent.ApplyTheme, theme)
    }
    return next
  })

  ipcMain.handle(IpcInvoke.OpenSettings, () => {
    createSettingsWindow()
  })

  ipcMain.handle(IpcInvoke.HideFloating, () => {
    getFloatingWindow()?.hide()
  })

  ipcMain.handle(IpcInvoke.QuitApp, () => {
    app.quit()
  })

  ipcMain.handle(IpcInvoke.SetIgnoreMouse, (_e, ignore: boolean) => {
    getFloatingWindow()?.setIgnoreMouseEvents(ignore, { forward: true })
  })

  ipcMain.handle(IpcInvoke.WindowMoveBy, (_e, dx: number, dy: number) => {
    moveFloatingBy(dx, dy)
  })

  ipcMain.handle(IpcInvoke.WindowResizeBy, (_e, dw: number, dh: number) => {
    resizeFloatingBy(dw, dh)
  })

  // ---- Connection status routing -------------------------------------
  // The floating renderer owns the WebSerial connection. Settings forwards
  // user actions ("connect", "disconnect") through main → floating. The
  // floating renderer pushes status back through main → all windows.
  ipcMain.handle(IpcInvoke.ConnectionPush, (_e, status: ConnStatus) => {
    lastConnStatus = status
    const settings = getSettingsWindow()
    if (settings && !settings.isDestroyed()) {
      settings.webContents.send(IpcEvent.ConnectionState, status)
    }
  })

  ipcMain.handle(IpcInvoke.ConnectionGet, () => lastConnStatus)

  ipcMain.on(IpcEvent.ConnectionDisconnect, () =>
    sendToFloating(IpcEvent.ConnectionDisconnect)
  )
  ipcMain.on(IpcEvent.ConnectionPortGranted, () =>
    sendToFloating(IpcEvent.ConnectionPortGranted)
  )

  ipcMain.handle(IpcInvoke.AppVersion, () => app.getVersion())
  ipcMain.handle(IpcInvoke.OpenReleasesPage, (_e, url: string) => {
    // Don't blindly trust a renderer-supplied URL — only allow GitHub
    // releases pages for our repo. Anything else gets dropped.
    if (typeof url === 'string' && url.startsWith('https://github.com/CodingButter/flipper_v/')) {
      void shell.openExternal(url)
    }
  })

  ipcMain.handle(IpcInvoke.UpdateGet, () => getUpdateStatus())
  ipcMain.handle(IpcInvoke.UpdateCheck, () => checkForUpdates())
  ipcMain.handle(IpcInvoke.UpdateDownload, () => downloadUpdate())
  ipcMain.handle(IpcInvoke.UpdateInstall, () => quitAndInstall())
}
