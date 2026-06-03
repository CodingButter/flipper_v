import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import type { Prefs } from '../../../shared/types'
import { DEFAULT_SPLASH_URL, SCREEN_H, SCREEN_W, imageToFramebuffer } from '../../../shared/splash'

type Props = { prefs: Prefs }

/**
 * 4x preview canvas: shows the user exactly what their image will look
 * like after we threshold it down to the device's 128x64 1-bit screen.
 */
const PREVIEW_SCALE = 4

export function SplashPage({ prefs }: Props): JSX.Element {
  const previewRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const activeSrc = prefs.splashImage ?? DEFAULT_SPLASH_URL
  const isCustom = prefs.splashImage !== null

  // Re-render the preview whenever the active source changes — same
  // pipeline the floating window uses, so what you see here is exactly
  // what lands on the device's screen.
  useEffect(() => {
    let cancelled = false
    const canvas = previewRef.current
    if (!canvas) return
    canvas.width = SCREEN_W * PREVIEW_SCALE
    canvas.height = SCREEN_H * PREVIEW_SCALE
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ;(async (): Promise<void> => {
      try {
        const fb = await imageToFramebuffer(activeSrc)
        if (cancelled) return
        // Match the real Flipper LCD: backlight (orange) is the "off"
        // state and `1` bits are the dark pixels the LCD blocks.
        ctx.fillStyle = '#ff8200'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#0a0a0a'
        for (let y = 0; y < SCREEN_H; y++) {
          for (let x = 0; x < SCREEN_W; x++) {
            if (fb[(y >> 3) * SCREEN_W + x] & (1 << (y & 7))) {
              ctx.fillRect(
                x * PREVIEW_SCALE,
                y * PREVIEW_SCALE,
                PREVIEW_SCALE,
                PREVIEW_SCALE
              )
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [activeSrc])

  const onFileChosen = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    setError(null)
    setBusy(true)
    const reader = new FileReader()
    reader.onload = (): void => {
      const dataUrl = String(reader.result)
      void window.flipperV.prefs
        .set({ splashImage: dataUrl })
        .finally(() => setBusy(false))
    }
    reader.onerror = (): void => {
      setError('Failed to read file.')
      setBusy(false)
    }
    reader.readAsDataURL(file)
  }

  const reset = (): void => {
    setError(null)
    void window.flipperV.prefs.set({ splashImage: null })
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">Splash image</h1>
        <p className="text-sm text-muted-foreground">
          What shows on the device screen when no Flipper is connected. Any image
          works — we resize it to the Flipper&apos;s {SCREEN_W}×{SCREEN_H} resolution
          and threshold to 1-bit.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            How the active splash looks after conversion. {isCustom ? 'Custom upload.' : 'Default Flipper V mascot.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center rounded-md border bg-card/40 p-4">
            <canvas
              ref={previewRef}
              className="rounded-sm"
              style={{
                imageRendering: 'pixelated',
                width: SCREEN_W * PREVIEW_SCALE,
                height: SCREEN_H * PREVIEW_SCALE
              }}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/bmp,image/jpeg,image/gif,image/webp"
              onChange={onFileChosen}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={busy}>
              {busy ? 'Loading…' : 'Choose image…'}
            </Button>
            <Button variant="outline" onClick={reset} disabled={!isCustom || busy}>
              Reset to default
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            For best results, upload a {SCREEN_W}×{SCREEN_H} 1-bit BMP — anything
            with a fine gradient will look noisy after thresholding. Logos with
            solid blacks and whites work best.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
