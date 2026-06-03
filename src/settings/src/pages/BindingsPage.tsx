import { useEffect, useRef, useState } from 'react'
import {
  BUTTON_ORDER,
  DEFAULT_KEY_BINDINGS,
  type ButtonId,
  type KeyBindings,
  type Prefs
} from '../../../shared/types'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

type Props = { prefs: Prefs }

/**
 * Map a `KeyboardEvent.code` to a short, human-readable label.
 * "KeyW" → "W", "ArrowUp" → "↑", etc.
 */
function labelForCode(code: string): string {
  if (code.startsWith('Key')) return code.slice(3)
  if (code.startsWith('Digit')) return code.slice(5)
  const aliases: Record<string, string> = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Space: 'Space',
    Enter: 'Enter',
    Escape: 'Esc',
    Backspace: 'Backspace',
    Tab: 'Tab',
    ShiftLeft: 'L Shift',
    ShiftRight: 'R Shift',
    ControlLeft: 'L Ctrl',
    ControlRight: 'R Ctrl',
    AltLeft: 'L Alt',
    AltRight: 'R Alt'
  }
  return aliases[code] ?? code
}

export function BindingsPage({ prefs }: Props): JSX.Element {
  const [draft, setDraft] = useState<KeyBindings>(prefs.keyBindings)
  // Which button (if any) is currently waiting for the user to press a key.
  const [capturing, setCapturing] = useState<ButtonId | null>(null)
  const capturingRef = useRef<ButtonId | null>(null)
  capturingRef.current = capturing

  // Reflect external pref updates (e.g. reset from another window).
  useEffect(() => {
    setDraft(prefs.keyBindings)
  }, [prefs.keyBindings])

  // While capturing, swallow keystrokes — they're meant for the binding,
  // not for the underlying form / browser navigation.
  useEffect(() => {
    if (!capturing) return
    const onKey = (e: KeyboardEvent): void => {
      e.preventDefault()
      e.stopPropagation()
      // Escape cancels.
      if (e.code === 'Escape') {
        setCapturing(null)
        return
      }
      const id = capturingRef.current
      if (!id) return
      setDraft((prev) => {
        const existing = prev[id]
        if (existing.includes(e.code)) return prev
        return { ...prev, [id]: [...existing, e.code] }
      })
      setCapturing(null)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [capturing])

  // Persist draft → prefs whenever it diverges, debounced via React's
  // microtask cadence (one save per state update is fine here).
  useEffect(() => {
    const a = JSON.stringify(draft)
    const b = JSON.stringify(prefs.keyBindings)
    if (a === b) return
    void window.flipperV.prefs.set({ keyBindings: draft })
  }, [draft, prefs.keyBindings])

  const removeKey = (id: ButtonId, code: string): void => {
    setDraft((prev) => ({ ...prev, [id]: prev[id].filter((c) => c !== code) }))
  }
  const resetAll = (): void => setDraft(DEFAULT_KEY_BINDINGS)

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Key bindings</h1>
          <p className="text-sm text-muted-foreground">
            Keys you press while the floating Flipper window is focused drive the
            virtual buttons. Each button can have multiple bindings.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetAll}>
          Reset to defaults
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Bindings</CardTitle>
          <CardDescription>
            Click <span className="text-foreground">Add key</span> and press the key you
            want to bind. The X removes a binding. Escape cancels capture.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {BUTTON_ORDER.map(({ id, label }) => (
            <div key={id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-16 shrink-0 text-sm font-medium">{label}</div>
              <div className="flex flex-1 flex-wrap items-center gap-1.5">
                {draft[id].length === 0 ? (
                  <span className="text-xs italic text-muted-foreground">(none)</span>
                ) : (
                  draft[id].map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1 rounded-md border bg-secondary px-2 py-0.5 text-xs"
                    >
                      <kbd className="font-mono">{labelForCode(code)}</kbd>
                      <button
                        type="button"
                        onClick={() => removeKey(id, code)}
                        className="ml-0.5 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${code}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
              <Button
                size="sm"
                variant={capturing === id ? 'default' : 'outline'}
                onClick={() => setCapturing(capturing === id ? null : id)}
                className="shrink-0"
              >
                {capturing === id ? 'Press a key…' : 'Add key'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Bindings only fire when the floating Flipper window has focus. Global
        system-wide shortcuts are intentionally not bound to avoid stealing keys
        from other apps.
      </p>
    </div>
  )
}
