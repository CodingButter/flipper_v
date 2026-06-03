import { app, BrowserWindow, session, Tray, Menu, nativeImage } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { join } from 'node:path'
import { createFloatingWindow, createSettingsWindow, getFloatingWindow } from './windows'
import { registerIpcHandlers } from './ipc'

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
  // The tray is now the *only* persistent UI surface — the floating
  // window has skipTaskbar:true, so without a tray icon the user could
  // hide the device and have no way to bring it back. We resolve the
  // icon from both the dev path (out/main → ../../resources) and the
  // packaged path (resources gets copied next to the app) so it works
  // in both environments.
  const candidates = [
    join(__dirname, '../../resources/tray.png'),
    join(process.resourcesPath ?? '', 'tray.png')
  ]
  let icon = nativeImage.createEmpty()
  for (const p of candidates) {
    const candidate = nativeImage.createFromPath(p)
    if (!candidate.isEmpty()) {
      icon = candidate
      break
    }
  }
  if (icon.isEmpty()) {
    console.warn('[flipper-v] tray icon not found at any of:', candidates)
  }
  tray = new Tray(icon.resize({ width: 16, height: 16 }))
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
