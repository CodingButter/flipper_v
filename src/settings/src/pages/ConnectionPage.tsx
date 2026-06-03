import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import type { ConnStatus } from '../../../shared/types'

const stateLabel: Record<ConnStatus['state'], string> = {
  disconnected: 'Disconnected',
  connecting: 'Connecting',
  connected: 'Connected',
  disconnecting: 'Disconnecting',
  error: 'Error'
}

const dotColor: Record<ConnStatus['state'], string> = {
  disconnected: 'bg-muted-foreground',
  connecting: 'bg-yellow-400 animate-pulse',
  connected: 'bg-green-400',
  disconnecting: 'bg-yellow-400 animate-pulse',
  error: 'bg-destructive'
}

// Flipper Zero CDC ACM identifiers (decimal: 1155, 22336).
const FLIPPER_FILTER = { usbVendorId: 0x0483, usbProductId: 0x5740 }

export function ConnectionPage(): JSX.Element {
  const [status, setStatus] = useState<ConnStatus>({ state: 'disconnected' })
  const [pickerError, setPickerError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    window.flipperV.connection.get().then((s) => {
      if (mounted) setStatus(s)
    })
    const off = window.flipperV.connection.onState(setStatus)
    return () => {
      mounted = false
      off()
    }
  }, [])

  const isConnected = status.state === 'connected'
  const isConnecting = status.state === 'connecting'
  const isDisconnecting = status.state === 'disconnecting'
  const inTransition = isConnecting || isDisconnecting

  /**
   * We call `requestPort` HERE — in the settings renderer — because
   * Chromium requires a user gesture to be active when it fires. Routing
   * the click through IPC to the floating window would lose the gesture
   * and throw "Must be handling a user gesture". Once the user picks a
   * port, the grant is session-wide, and we hand off to the floating
   * window via `portGranted` (no picker needed there).
   */
  const handleConnect = async (): Promise<void> => {
    setPickerError(null)
    if (!('serial' in navigator)) {
      setPickerError('Web Serial is not available in this build.')
      return
    }
    try {
      await navigator.serial.requestPort({ filters: [FLIPPER_FILTER] })
      window.flipperV.connection.portGranted()
    } catch (err) {
      if (err instanceof Error) {
        // User cancelled the picker — silent.
        if (err.name === 'NotFoundError') return
        // Chromium throws this when the auto-selector (main process)
        // returns no port. In our handler that means: no Flipper was
        // present in the system's USB serial list.
        if (err.message.includes('No port selected')) {
          setPickerError(
            "No Flipper detected. Plug it in via USB, make sure it's awake, and try a known-good data cable. " +
              "On WSL you'll also need to share the device with usbipd-win."
          )
          return
        }
        setPickerError(err.message)
        return
      }
      setPickerError(String(err))
    }
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">Connection</h1>
        <p className="text-sm text-muted-foreground">
          Connect a real Flipper Zero over USB. We auto-pick devices with the Flipper&apos;s
          USB id (<span className="font-mono">0483:5740</span>).
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${dotColor[status.state]}`} />
            {stateLabel[status.state]}
          </CardTitle>
          {status.message && (
            <CardDescription className="font-mono text-xs">{status.message}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleConnect} disabled={isConnected || inTransition}>
              {isConnecting ? 'Connecting…' : 'Connect'}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.flipperV.connection.requestDisconnect()}
              disabled={!isConnected || inTransition}
            >
              {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
            </Button>
          </div>
          {pickerError && (
            <p className="text-sm text-destructive">{pickerError}</p>
          )}
          <ol className="space-y-1.5 text-sm text-muted-foreground">
            <li>1. Plug your Flipper Zero into a USB port.</li>
            <li>2. Make sure it&apos;s unlocked and on the home screen.</li>
            <li>
              3. Click <span className="text-foreground">Connect</span> — a one-time port
              picker shows up the first time you connect a device.
            </li>
            <li>4. The live screen will start mirroring onto the floating device.</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="text-foreground">My Flipper isn&apos;t in the picker.</span>{' '}
            Try a different USB cable — many cheap cables are charge-only and don&apos;t
            expose data lines. Also confirm the device is awake.
          </p>
          <p>
            <span className="text-foreground">Linux: &ldquo;Access denied.&rdquo;</span>{' '}
            Add yourself to the <span className="font-mono">dialout</span> group or
            install a Flipper udev rule.
          </p>
          <p>
            <span className="text-foreground">WSL:</span> WebSerial needs the USB
            device shared via <span className="font-mono">usbipd-win</span> — running
            inside WSL won&apos;t see a USB Flipper plugged into Windows by default.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
