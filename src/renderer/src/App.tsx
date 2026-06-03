import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlipperViewport, type ViewportHandle } from './components/FlipperViewport'
import { Toolbar } from './components/Toolbar'
import { ResizeHandle } from './components/ResizeHandle'
import type { ButtonId, ConnStatus, Prefs, Theme } from '../../shared/types'
import { DEFAULT_SPLASH_URL } from '../../shared/splash'

export function App(): JSX.Element {
  const [prefs, setPrefs] = useState<Prefs | null>(null)
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null)
  const [hovered, setHovered] = useState(false)
  const [conn, setConn] = useState<ConnStatus>({ state: 'disconnected' })
  const viewport = useRef<ViewportHandle>(null)
  const settingsOpenedOnce = useRef(false)

  useEffect(() => {
    let unsubPrefs: (() => void) | null = null
    let unsubApply: (() => void) | null = null
    ;(async (): Promise<void> => {
      const p = await window.flipperV.prefs.get()
      setPrefs(p)
      const themes = await window.flipperV.themes.list()
      setActiveTheme(themes.find((t) => t.id === p.activeThemeId) ?? themes[0] ?? null)
    })()
    unsubPrefs = window.flipperV.prefs.onChanged(setPrefs)
    unsubApply = window.flipperV.themes.onApply((t) => setActiveTheme(t))
    return () => {
      unsubPrefs?.()
      unsubApply?.()
    }
  }, [])

  useEffect(() => {
    if (settingsOpenedOnce.current) return
    if (conn.state === 'connected' || conn.state === 'connecting') return
    const timer = window.setTimeout(() => {
      if (settingsOpenedOnce.current) return
      settingsOpenedOnce.current = true
      void window.flipperV.window.openSettings()
    }, 2500)
    return () => window.clearTimeout(timer)
  }, [conn.state])

  // Build a flat code-to-button map from the user's bindings. The
  // keyboard handler does an O(1) lookup per event instead of scanning
  // the bindings object for each of the 6 buttons on every keypress.
  const keyMap = useMemo(() => {
    const m = new Map<string, ButtonId>()
    const bindings = prefs?.keyBindings
    if (!bindings) return m
    for (const id of Object.keys(bindings) as ButtonId[]) {
      for (const code of bindings[id] ?? []) m.set(code, id)
    }
    return m
  }, [prefs])

  // Keyboard → virtual button. We bind to window so the user can press
  // without explicitly focusing the canvas. preventDefault stops browser
  // defaults (e.g. Backspace history-back, Space scrolling).
  useEffect(() => {
    if (!prefs) return
    const onDown = (e: KeyboardEvent): void => {
      if (e.repeat) return
      const id = keyMap.get(e.code)
      if (!id) return
      e.preventDefault()
      viewport.current?.pressButton(id)
    }
    const onUp = (e: KeyboardEvent): void => {
      const id = keyMap.get(e.code)
      if (!id) return
      e.preventDefault()
      viewport.current?.releaseButton(id)
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [keyMap, prefs])

  const handleConnStatus = useCallback((status: ConnStatus) => setConn(status), [])
  const handleConnect = useCallback(() => viewport.current?.connect(), [])
  const handleDisconnect = useCallback(() => viewport.current?.disconnect(), [])

  const backgroundStyle: React.CSSProperties = prefs?.chromaKey
    ? { backgroundColor: prefs.chromaColor }
    : {}

  return (
    <div
      className="relative h-screen w-screen"
      style={backgroundStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <FlipperViewport
        ref={viewport}
        activeTheme={activeTheme}
        splashSrc={prefs?.splashImage ?? DEFAULT_SPLASH_URL}
        onConnStatus={handleConnStatus}
      />
      <Toolbar
        visible={hovered}
        prefs={prefs}
        conn={conn}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      <ResizeHandle visible={hovered} />
    </div>
  )
}
