import { app } from 'electron'
import electronUpdater from 'electron-updater'
import type { UpdateStatus } from '../shared/types'
import { IpcEvent } from '../shared/types'
import { broadcast } from './windows'

const { autoUpdater } = electronUpdater

/**
 * Wraps `electron-updater` to expose a single, simple state machine the
 * renderer subscribes to. We don't auto-check on launch (that would
 * surprise users with notifications); the renderer triggers checks
 * from the About page's button.
 *
 * Auto-download is disabled so the user gets to decide "update now" vs.
 * "I'll keep working" — the Update button drives `downloadUpdate()`,
 * and we call `quitAndInstall()` only when the renderer explicitly
 * asks for it.
 */

let lastStatus: UpdateStatus = { kind: 'idle' }

function setStatus(s: UpdateStatus): void {
  lastStatus = s
  broadcast(IpcEvent.UpdateState, s)
}

export function getUpdateStatus(): UpdateStatus {
  return lastStatus
}

export function setupAutoUpdater(): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
  // Verbose enough to debug if a release shows up wrong in the picker,
  // quiet enough not to dominate the dev log.
  autoUpdater.logger = {
    info: (m: unknown): void => console.log('[update]', m),
    warn: (m: unknown): void => console.warn('[update]', m),
    error: (m: unknown): void => console.error('[update]', m),
    debug: (): void => {}
  } as typeof autoUpdater.logger

  autoUpdater.on('checking-for-update', () => setStatus({ kind: 'checking' }))

  autoUpdater.on('update-available', (info) => {
    setStatus({
      kind: 'available',
      current: app.getVersion(),
      latest: info.version
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    setStatus({
      kind: 'up-to-date',
      current: app.getVersion(),
      latest: info.version
    })
  })

  autoUpdater.on('download-progress', (p) => {
    setStatus({
      kind: 'downloading',
      percent: Math.round(p.percent),
      bytesPerSecond: p.bytesPerSecond
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    setStatus({ kind: 'downloaded', latest: info.version })
  })

  autoUpdater.on('error', (err) => {
    const message = err instanceof Error ? err.message : String(err)
    // electron-updater throws when there's no published release yet —
    // for v0 / pre-release situations this would look like an error in
    // the UI. Translate to a friendlier "no releases" message.
    if (message.includes('Cannot find latest')) {
      setStatus({
        kind: 'error',
        message: "Couldn't find a published release yet — try again after a release is on GitHub."
      })
      return
    }
    setStatus({ kind: 'error', message })
  })
}

export async function checkForUpdates(): Promise<void> {
  // In dev, electron-updater normally refuses to do anything because
  // the app isn't packaged. We do nothing useful in dev — the UI shows
  // "Updates only available in packaged builds" via the friendly error.
  if (!app.isPackaged) {
    setStatus({
      kind: 'error',
      message:
        'Auto-update only works in packaged installs (dev builds aren’t signed and lack a version channel).'
    })
    return
  }
  try {
    await autoUpdater.checkForUpdates()
  } catch (err) {
    setStatus({
      kind: 'error',
      message: err instanceof Error ? err.message : String(err)
    })
  }
}

export async function downloadUpdate(): Promise<void> {
  if (!app.isPackaged) return
  try {
    await autoUpdater.downloadUpdate()
  } catch (err) {
    setStatus({
      kind: 'error',
      message: err instanceof Error ? err.message : String(err)
    })
  }
}

export function quitAndInstall(): void {
  if (!app.isPackaged) return
  // `isSilent: false` shows the installer UI on Windows; the user has
  // already opted in by clicking "Install & Restart" so we don't need
  // to hide it. `isForceRunAfter: true` re-launches Flipper V after.
  autoUpdater.quitAndInstall(false, true)
}
