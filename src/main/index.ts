import { app, BrowserWindow, session, Tray, Menu, nativeImage } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { join } from 'node:path'
import { createFloatingWindow, createSettingsWindow, getFloatingWindow } from './windows'
import { registerIpcHandlers } from './ipc'
import { setupAutoUpdater } from './updater'

/**
 * Flipper Zero USB identifiers. We match numerically because Electron
 * reports vendorId/productId as decimal strings (e.g. "1155") on some
 * platforms and hex strings (e.g. "0483") on others — comparing as
 * numbers normalizes that.
 */
const FLIPPER_USB_VID = 0x0483
const FLIPPER_USB_PID = 0x5740

let tray: Tray | null = null

function setupWebSerial(): void {
  const ses = session.defaultSession

  // Auto-pick the Flipper if it's in the system port list. If no Flipper
  // is plugged in, log what *was* available — useful for diagnosing
  // "no devices found" cases (wrong cable, USB permissions, WSL without
  // usbipd, etc.). We never silently fall back to a non-Flipper port —
  // the bundle's RPC only talks to Flippers.
  ses.on('select-serial-port', (event, portList, _webContents, callback) => {
    event.preventDefault()
    const flipper = portList.find(
      (p) => Number(p.vendorId) === FLIPPER_USB_VID && Number(p.productId) === FLIPPER_USB_PID
    )
    if (flipper) {
      callback(flipper.portId)
      return
    }
    if (portList.length === 0) {
      console.log('[flipper-v] select-serial-port: no USB serial devices visible to the system')
    } else {
      console.log(
        '[flipper-v] select-serial-port: no Flipper found. Available:',
        portList.map((p) => `${p.vendorId}:${p.productId} (${p.displayName || p.portName})`)
      )
    }
    callback('')
  })

  ses.setPermissionCheckHandler((_wc, permission) => {
    return permission === 'serial' || permission === 'hid' || permission === 'usb'
  })
  ses.setDevicePermissionHandler((details) => details.deviceType === 'serial')
}

function setupTray(): void {
  // The tray is the user's primary way to find the app even when the
  // floating window is hidden / behind other windows. Resolve from dev
  // (out/main → ../../resources) AND packaged paths so it works in both.
  const candidates = [
    join(__dirname, '../../resources/tray.png'),
    join(process.resourcesPath ?? '', 'tray.png')
  ]
  let icon = nativeImage.createEmpty()
  let loadedFrom = ''
  for (const p of candidates) {
    const candidate = nativeImage.createFromPath(p)
    if (!candidate.isEmpty()) {
      icon = candidate
      loadedFrom = p
      break
    }
  }
  if (icon.isEmpty()) {
    console.warn('[flipper-v] tray icon not found at any of:', candidates)
  } else {
    // `quality: 'best'` gets Chromium's Lanczos-style resize instead of
    // its default nearest-neighbor — important when the source PNG is
    // 1014×1001 and the target is 16×16. Without it the icon turns into
    // an unrecognizable blob.
    const sized = icon.resize({ width: 16, height: 16, quality: 'best' })
    if (!sized.isEmpty()) icon = sized
    console.log('[flipper-v] tray icon loaded from', loadedFrom)
  }
  tray = new Tray(icon)
  tray.setToolTip('Flipper V — Virtual Flipper Zero')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Show device',
        click: (): void => {
          const w = getFloatingWindow()
          if (w) w.show()
          else createFloatingWindow()
        }
      },
      {
        label: 'Hide device',
        click: (): void => {
          getFloatingWindow()?.hide()
        }
      },
      { type: 'separator' },
      { label: 'Settings…', click: (): void => void createSettingsWindow() },
      { type: 'separator' },
      { label: 'Quit', role: 'quit' }
    ])
  )
  // Left-click is the obvious "toggle visibility" gesture on Windows.
  // macOS tray icons typically open the menu on any click; that's
  // already wired via setContextMenu so we don't double-handle it.
  tray.on('click', () => {
    const w = getFloatingWindow()
    if (w?.isVisible()) w.hide()
    else if (w) w.show()
    else createFloatingWindow()
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.codingbutter.flipperv')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupWebSerial()
  setupAutoUpdater()
  registerIpcHandlers()
  createFloatingWindow()
  setupTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createFloatingWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
