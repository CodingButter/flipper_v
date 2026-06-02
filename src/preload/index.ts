import { contextBridge, ipcRenderer } from 'electron'
import { IpcEvent, IpcInvoke } from '../shared/types'
import type { Prefs, Theme } from '../shared/types'

const api = {
  themes: {
    list: (): Promise<Theme[]> => ipcRenderer.invoke(IpcInvoke.ThemesList),
    save: (theme: Theme): Promise<Theme[]> => ipcRenderer.invoke(IpcInvoke.ThemesSave, theme),
    delete: (id: string): Promise<Theme[]> => ipcRenderer.invoke(IpcInvoke.ThemesDelete, id),
    onChanged: (cb: (themes: Theme[]) => void): (() => void) => {
      const fn = (_: unknown, t: Theme[]): void => cb(t)
      ipcRenderer.on(IpcEvent.ThemesChanged, fn)
      return () => ipcRenderer.off(IpcEvent.ThemesChanged, fn)
    },
    onApply: (cb: (theme: Theme) => void): (() => void) => {
      const fn = (_: unknown, t: Theme): void => cb(t)
      ipcRenderer.on(IpcEvent.ApplyTheme, fn)
      return () => ipcRenderer.off(IpcEvent.ApplyTheme, fn)
    }
  },
  prefs: {
    get: (): Promise<Prefs> => ipcRenderer.invoke(IpcInvoke.PrefsGet),
    set: (patch: Partial<Prefs>): Promise<Prefs> => ipcRenderer.invoke(IpcInvoke.PrefsSet, patch),
    onChanged: (cb: (prefs: Prefs) => void): (() => void) => {
      const fn = (_: unknown, p: Prefs): void => cb(p)
      ipcRenderer.on(IpcEvent.PrefsChanged, fn)
      return () => ipcRenderer.off(IpcEvent.PrefsChanged, fn)
    }
  },
  window: {
    openSettings: (): Promise<void> => ipcRenderer.invoke(IpcInvoke.OpenSettings),
    hideFloating: (): Promise<void> => ipcRenderer.invoke(IpcInvoke.HideFloating),
    setIgnoreMouse: (ignore: boolean): Promise<void> =>
      ipcRenderer.invoke(IpcInvoke.SetIgnoreMouse, ignore)
  },
  app: {
    quit: (): Promise<void> => ipcRenderer.invoke(IpcInvoke.QuitApp)
  }
}

contextBridge.exposeInMainWorld('flide', api)

export type FlideAPI = typeof api
