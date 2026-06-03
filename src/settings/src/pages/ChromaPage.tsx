import type { Prefs } from '../../../shared/types'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'

type Props = { prefs: Prefs }

/**
 * Quick presets — covers the colors streamers most often key out in OBS
 * (the magentas dominate because greens conflict with grass / brand
 * logos; choose what doesn't appear in the device's accent palette).
 */
const CHROMA_PRESETS: ReadonlyArray<{ name: string; value: string }> = [
  { name: 'OBS Green', value: '#00ff00' },
  { name: 'Magenta', value: '#ff00ff' },
  { name: 'Cyan', value: '#00ffff' },
  { name: 'Blue', value: '#0000ff' },
  { name: 'Hot Pink', value: '#ff1493' }
]

export function ChromaPage({ prefs }: Props): JSX.Element {
  const set = (patch: Partial<Prefs>): void => {
    void window.flipperV.prefs.set(patch)
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">Chroma</h1>
        <p className="text-sm text-muted-foreground">
          Drop the floating Flipper into a livestream, screen recording, or video
          edit by filling the window behind the model with a solid keyable color.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Chroma-key background</CardTitle>
          <CardDescription>
            When on, the transparent window paints a solid fill behind the 3D model.
            Use OBS&apos;s built-in <span className="font-mono">Chroma Key</span> filter on
            the window capture to remove it. Magentas are usually safest — they don&apos;t
            collide with the Flipper&apos;s orange or with most brand colors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable chroma-key</Label>
              <p className="text-xs text-muted-foreground">
                Currently {prefs.chromaKey ? 'visible' : 'off — desktop shows through'}.
              </p>
            </div>
            <Switch
              checked={prefs.chromaKey}
              onCheckedChange={(v) => set({ chromaKey: v })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1">
              <input
                type="color"
                value={prefs.chromaColor}
                onChange={(e) => set({ chromaColor: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <Input
                value={prefs.chromaColor}
                onChange={(e) => set({ chromaColor: e.target.value })}
                className="h-8 border-0 px-1 font-mono text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {CHROMA_PRESETS.map((p) => (
                <Button
                  key={p.value}
                  size="sm"
                  variant="outline"
                  onClick={() => set({ chromaColor: p.value, chromaKey: true })}
                  className="gap-2"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-sm border border-white/20"
                    style={{ backgroundColor: p.value }}
                  />
                  {p.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-md border bg-card/40 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">OBS quick setup</p>
            <ol className="space-y-1 pl-4 [list-style:decimal]">
              <li>Add a <span className="text-foreground">Window Capture</span> source for &ldquo;Flipper V&rdquo;.</li>
              <li>Right-click → Filters → add a <span className="text-foreground">Chroma Key</span> filter.</li>
              <li>Set Key Color Type to <span className="text-foreground">Custom</span> and paste the hex above.</li>
              <li>Tweak Similarity / Smoothness if the edges look noisy.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
