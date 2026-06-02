import { app, BrowserWindow, session, Tray, Menu, nativeImage } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { join } from 'node:path'
import { createFloatingWindow, createSettingsWindow, getFloatingWindow } from './windows'
import { registerIpcHandlers } from './ipc'

const FLIPPER_USB_VID = '0483'
const FLIPPER_USB_PID = '5740'

let tray: Tray | null = null

function setupWebSerial(): void {
  const ses = session.defaultSession

  // 1) Auto-pick the first Flipper if WebSerial fires a port picker.
  ses.on('select-serial-port', (event, portList, _webContents, callback) => {
    event.preventDefault()
    const flipper = portList.find(
      (p) =>
        p.vendorId?.toLowerCase() === FLIPPER_USB_VID &&
        p.productId?.toLowerCase() === FLIPPER_USB_PID
    )
    callback(flipper ? flipper.portId : portList[0]?.portId ?? '')
  })

  // 2) Allow `navigator.serial.requestPort()` from our renderer to succeed.
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
    tray.setToolTip('Flide — Floating Flipper')
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
  electronApp.setAppUserModelId('com.codingbutter.flide')
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
