import type { Prefs } from '../../../shared/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Slider } from '../components/ui/slider'
import { Switch } from '../components/ui/switch'

type Props = { prefs: Prefs }

export function DisplayPage({ prefs }: Props): JSX.Element {
  const set = (patch: Partial<Prefs>): void => {
    void window.flipperV.prefs.set(patch)
  }
  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">Display</h1>
        <p className="text-sm text-muted-foreground">
          Control how the floating Flipper behaves on your desktop.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Window</CardTitle>
          <CardDescription>
            The floating window has no chrome — it's just the 3D model on your desktop.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Row
            label="Always on top"
            description="Keep the Flipper above other windows."
            control={
              <Switch
                checked={prefs.alwaysOnTop}
                onCheckedChange={(v) => set({ alwaysOnTop: v })}
              />
            }
          />
          <Row
            label="Show drag handle on hover"
            description="A small bar appears at the top so you can move the window."
            control={
              <Switch
                checked={prefs.showDragHandle}
                onCheckedChange={(v) => set({ showDragHandle: v })}
              />
            }
          />
          <Row
            label="Click-through (experimental)"
            description="The Flipper becomes a pure overlay — mouse clicks pass through to the app underneath."
            control={
              <Switch
                checked={prefs.clickThrough}
                onCheckedChange={(v) => set({ clickThrough: v })}
              />
            }
          />
          <Row
            label="Tray-only"
            description="Hide the floating window from the taskbar. The system tray icon stays available so you can still toggle visibility."
            control={
              <Switch
                checked={prefs.trayOnly}
                onCheckedChange={(v) => set({ trayOnly: v })}
              />
            }
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Opacity</Label>
              <span className="text-xs text-muted-foreground">{Math.round(prefs.opacity * 100)}%</span>
            </div>
            <Slider
              min={0.2}
              max={1}
              step={0.05}
              value={[prefs.opacity]}
              onValueChange={(vs) => set({ opacity: vs[0] })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({
  label,
  description,
  control
}: {
  label: string
  description: string
  control: React.ReactNode
}): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {control}
    </div>
  )
}
