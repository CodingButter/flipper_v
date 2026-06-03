import { contextBridge, ipcRenderer } from 'electron'
import { IpcEvent, IpcInvoke } from '../shared/types'
import type { ConnStatus, Prefs, Theme, UpdateStatus } from '../shared/types'

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
      ipcRenderer.invoke(IpcInvoke.SetIgnoreMouse, ignore),
    moveBy: (dx: number, dy: number): Promise<void> =>
      ipcRenderer.invoke(IpcInvoke.WindowMoveBy, dx, dy),
    resizeBy: (dw: number, dh: number): Promise<void> =>
      ipcRenderer.invoke(IpcInvoke.WindowResizeBy, dw, dh)
  },
  connection: {
    // Floating renderer pushes status updates here; main caches + relays.
    push: (status: ConnStatus): Promise<void> =>
      ipcRenderer.invoke(IpcInvoke.ConnectionPush, status),
    // Settings reads the cached status when it opens.
    get: (): Promise<ConnStatus> => ipcRenderer.invoke(IpcInvoke.ConnectionGet),
    /**
     * Settings calls navigator.serial.requestPort itself (so the user
     * gesture is preserved), then fires this to ask the floating window
     * to complete the connect using the now-granted port.
     */
    portGranted: (): void => ipcRenderer.send(IpcEvent.ConnectionPortGranted),
    requestDisconnect: (): void => ipcRenderer.send(IpcEvent.ConnectionDisconnect),
    onPortGranted: (cb: () => void): (() => void) => {
      const fn = (): void => cb()
      ipcRenderer.on(IpcEvent.ConnectionPortGranted, fn)
      return () => ipcRenderer.off(IpcEvent.ConnectionPortGranted, fn)
    },
    onDisconnectRequest: (cb: () => void): (() => void) => {
      const fn = (): void => cb()
      ipcRenderer.on(IpcEvent.ConnectionDisconnect, fn)
      return () => ipcRenderer.off(IpcEvent.ConnectionDisconnect, fn)
    },
    // Settings (or any other window) subscribes to status changes.
    onState: (cb: (status: ConnStatus) => void): (() => void) => {
      const fn = (_: unknown, s: ConnStatus): void => cb(s)
      ipcRenderer.on(IpcEvent.ConnectionState, fn)
      return () => ipcRenderer.off(IpcEvent.ConnectionState, fn)
    }
  },
  app: {
    quit: (): Promise<void> => ipcRenderer.invoke(IpcInvoke.QuitApp),
    version: (): Promise<string> => ipcRenderer.invoke(IpcInvoke.AppVersion),
    openReleasesPage: (url: string): Promise<void> =>
      ipcRenderer.invoke(IpcInvoke.OpenReleasesPage, url)
  },
  updates: {
    get: (): Promise<UpdateStatus> => ipcRenderer.invoke(IpcInvoke.UpdateGet),
    check: (): Promise<void> => ipcRenderer.invoke(IpcInvoke.UpdateCheck),
    download: (): Promise<void> => ipcRenderer.invoke(IpcInvoke.UpdateDownload),
    install: (): Promise<void> => ipcRenderer.invoke(IpcInvoke.UpdateInstall),
    onState: (cb: (status: UpdateStatus) => void): (() => void) => {
      const fn = (_: unknown, s: UpdateStatus): void => cb(s)
      ipcRenderer.on(IpcEvent.UpdateState, fn)
      return () => ipcRenderer.off(IpcEvent.UpdateState, fn)
    }
  }
}

contextBridge.exposeInMainWorld('flipperV', api)

export type FlipperVAPI = typeof api
