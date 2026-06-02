import { useEffect, useState } from 'react'
import { FlipperViewport } from './components/FlipperViewport'
import { Toolbar } from './components/Toolbar'
import type { Prefs, Theme } from '../../shared/types'

/**
 * Floating window root. The viewport fills the window and is fully
 * transparent — the only visible chrome is the small Toolbar that appears
 * on hover.
 */
export function App(): JSX.Element {
  const [prefs, setPrefs] = useState<Prefs | null>(null)
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null)
  const [hovered, setHovered] = useState(false)

  // Load prefs + active theme up front, then subscribe to changes.
  useEffect(() => {
    let unsubPrefs: (() => void) | null = null
    let unsubApply: (() => void) | null = null
    ;(async (): Promise<void> => {
      const p = await window.flide.prefs.get()
      setPrefs(p)
      const themes = await window.flide.themes.list()
      setActiveTheme(themes.find((t) => t.id === p.activeThemeId) ?? themes[0] ?? null)
    })()
    unsubPrefs = window.flide.prefs.onChanged(setPrefs)
    unsubApply = window.flide.themes.onApply((t) => setActiveTheme(t))
    return () => {
      unsubPrefs?.()
      unsubApply?.()
    }
  }, [])

  return (
    <div
      className="relative h-screen w-screen"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <FlipperViewport activeTheme={activeTheme} />
      <Toolbar visible={hovered} prefs={prefs} />
    </div>
  )
}
