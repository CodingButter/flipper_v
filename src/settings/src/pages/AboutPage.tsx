import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import type { UpdateStatus } from '../../../shared/types'

const REPO = 'CodingButter/flipper_v'

function formatBps(bps?: number): string {
  if (!bps || !isFinite(bps)) return ''
  if (bps >= 1024 * 1024) return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`
  if (bps >= 1024) return `${(bps / 1024).toFixed(0)} KB/s`
  return `${bps.toFixed(0)} B/s`
}

export function AboutPage(): JSX.Element {
  const [version, setVersion] = useState<string>('—')
  const [update, setUpdate] = useState<UpdateStatus>({ kind: 'idle' })

  useEffect(() => {
    void window.flipperV.app.version().then(setVersion)
    void window.flipperV.updates.get().then(setUpdate)
    const off = window.flipperV.updates.onState(setUpdate)
    return off
  }, [])

  /**
   * One button, several states. The button always reflects the next
   * action the user can take — Check → Update → Downloading… → Install.
   * Errors and the already-up-to-date case fall back to a plain Check
   * button so the user can retry without leaving the page.
   */
  const buttonProps = ((): { label: string; onClick: () => void; disabled?: boolean } => {
    switch (update.kind) {
      case 'checking':
        return { label: 'Checking…', onClick: () => {}, disabled: true }
      case 'available':
        return {
          label: `Update to v${update.latest}`,
          onClick: () => void window.flipperV.updates.download()
        }
      case 'downloading':
        return {
          label: `Downloading… ${update.percent}%`,
          onClick: () => {},
          disabled: true
        }
      case 'downloaded':
        return {
          label: 'Install & Restart',
          onClick: () => void window.flipperV.updates.install()
        }
      default:
        return {
          label: 'Check for updates',
          onClick: () => void window.flipperV.updates.check()
        }
    }
  })()

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">About</h1>
        <p className="text-sm text-muted-foreground">Credits, version, and updates.</p>
      </header>

      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <img
            src="../flipper_v_icon.png"
            alt="Flipper V logo"
            className="h-16 w-16 shrink-0 rounded-md object-cover"
          />
          <div className="space-y-1">
            <CardTitle>Flipper V</CardTitle>
            <CardDescription>
              A floating virtual Flipper Zero that mirrors a real device over WebSerial.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="font-medium">3D model</div>
            <p className="text-muted-foreground">
              &ldquo;Flipper Zero&rdquo; by{' '}
              <a
                className="text-primary hover:underline"
                href="https://sketchfab.com/blazitt"
                target="_blank"
                rel="noreferrer"
              >
                blazitt
              </a>{' '}
              on{' '}
              <a
                className="text-primary hover:underline"
                href="https://sketchfab.com/3d-models/flipper-zero-f8ad3fdf5f2b485ba46b0ac91626fc76"
                target="_blank"
                rel="noreferrer"
              >
                Sketchfab
              </a>
              . Used under its original Sketchfab license — please check that page for the
              latest terms.
            </p>
          </div>
          <div>
            <div className="font-medium">Project</div>
            <p className="text-muted-foreground">
              Open source. Built with Electron, React, Tailwind, shadcn/ui, and Three.js.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Updates</CardTitle>
          <CardDescription>
            Polls{' '}
            <span className="font-mono">{REPO}</span> on GitHub for new releases.
            When an update is available, clicking through downloads it in the
            background and restarts into the installer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div>
              <div className="font-medium">Installed version</div>
              <div className="font-mono text-muted-foreground">v{version}</div>
            </div>
            <Button onClick={buttonProps.onClick} disabled={buttonProps.disabled}>
              {buttonProps.label}
            </Button>
          </div>

          {update.kind === 'up-to-date' && (
            <p className="text-sm text-muted-foreground">
              You&apos;re on the latest version (v{update.latest}).
            </p>
          )}

          {update.kind === 'downloading' && (
            <div className="space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${update.percent}%` }}
                />
              </div>
              {update.bytesPerSecond !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {formatBps(update.bytesPerSecond)}
                </p>
              )}
            </div>
          )}

          {update.kind === 'downloaded' && (
            <p className="text-sm text-muted-foreground">
              v{update.latest} is ready. Clicking <span className="text-foreground">Install &amp; Restart</span> closes
              Flipper V and runs the installer.
            </p>
          )}

          {update.kind === 'error' && (
            <p className="text-sm text-destructive">{update.message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
