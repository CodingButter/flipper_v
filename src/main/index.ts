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
  // The tray icon is optional — only construct if an icon ships.
  try {
    const icon = nativeImage.createFromPath(join(__dirname, '../../resources/tray.png'))
    if (icon.isEmpty()) return
    tray = new Tray(icon.resize({ width: 16, height: 16 }))
    tray.setToolTip('Flipper V — Floating Flipper')
    tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: 'Show floating device',
          click: (): void => {
            const w = getFloatingWindow()
            if (w) w.show()
            else createFloatingWindow()
          }
        },
        { label: 'Open settings…', click: (): void => void createSettingsWindow() },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
      ])
    )
    tray.on('click', () => {
      const w = getFloatingWindow()
      if (w?.isVisible()) w.hide()
      else if (w) w.show()
      else createFloatingWindow()
    })
  } catch {
    // No tray icon yet — that's fine, settings are still reachable via the floating window.
  }
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
