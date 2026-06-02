import { ipcMain, app } from 'electron'
import { IpcEvent, IpcInvoke } from '../shared/types'
import {
  applyPrefsToFloating,
  broadcast,
  createSettingsWindow,
  getFloatingWindow
} from './windows'
import { deleteTheme, getPrefs, listThemes, saveTheme, setPrefs } from './store'
import type { Prefs, Theme } from '../shared/types'

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
    // If the active theme changed, tell the floating renderer to repaint.
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
    // Floating renderer toggles this when the pointer enters/leaves the
    // model — the rest of the (transparent) window stays click-through.
    getFloatingWindow()?.setIgnoreMouseEvents(ignore, { forward: true })
  })
}
