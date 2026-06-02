import { useEffect, useState } from 'react'
import { ThemesPage } from './pages/ThemesPage'
import { DisplayPage } from './pages/DisplayPage'
import { AboutPage } from './pages/AboutPage'
import { cn } from './lib/utils'
import type { Prefs, Theme } from '../../shared/types'

type PageKey = 'themes' | 'display' | 'about'

const NAV: ReadonlyArray<{ key: PageKey; label: string }> = [
  { key: 'themes', label: 'Themes' },
  { key: 'display', label: 'Display' },
  { key: 'about', label: 'About' }
]

export function App(): JSX.Element {
  const [page, setPage] = useState<PageKey>('themes')
  const [prefs, setPrefs] = useState<Prefs | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])

  useEffect(() => {
    let mounted = true
    Promise.all([window.flide.prefs.get(), window.flide.themes.list()]).then(([p, t]) => {
      if (!mounted) return
      setPrefs(p)
      setThemes(t)
    })
    const offPrefs = window.flide.prefs.onChanged(setPrefs)
    const offThemes = window.flide.themes.onChanged(setThemes)
    return () => {
      mounted = false
      offPrefs()
      offThemes()
    }
  }, [])

  return (
    <div className="grid h-screen grid-cols-[200px_1fr] overflow-hidden">
      <aside className="flex flex-col border-r bg-card/40 p-3">
        <div className="px-2 pb-4 pt-1">
          <div className="text-base font-semibold tracking-tight">Flide</div>
          <div className="text-xs text-muted-foreground">Floating Flipper settings</div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setPage(n.key)}
              className={cn(
                'rounded-md px-3 py-2 text-left text-sm transition-colors',
                page === n.key
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="overflow-y-auto">
        {page === 'themes' && prefs && (
          <ThemesPage prefs={prefs} themes={themes} />
        )}
        {page === 'display' && prefs && <DisplayPage prefs={prefs} />}
        {page === 'about' && <AboutPage />}
        {!prefs && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        )}
      </main>
    </div>
  )
}
