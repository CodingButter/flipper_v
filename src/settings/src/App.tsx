import { useEffect, useState } from 'react'
import { ConnectionPage } from './pages/ConnectionPage'
import { ThemesPage } from './pages/ThemesPage'
import { DisplayPage } from './pages/DisplayPage'
import { ChromaPage } from './pages/ChromaPage'
import { BindingsPage } from './pages/BindingsPage'
import { SplashPage } from './pages/SplashPage'
import { AboutPage } from './pages/AboutPage'
import { cn } from './lib/utils'
import type { Prefs, Theme } from '../../shared/types'

type PageKey =
  | 'connection'
  | 'themes'
  | 'bindings'
  | 'splash'
  | 'display'
  | 'chroma'
  | 'about'

const NAV: ReadonlyArray<{ key: PageKey; label: string }> = [
  { key: 'connection', label: 'Connection' },
  { key: 'themes', label: 'Themes' },
  { key: 'bindings', label: 'Bindings' },
  { key: 'splash', label: 'Splash' },
  { key: 'display', label: 'Display' },
  { key: 'chroma', label: 'Chroma' },
  { key: 'about', label: 'About' }
]

export function App(): JSX.Element {
  const [page, setPage] = useState<PageKey>('connection')
  const [prefs, setPrefs] = useState<Prefs | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])

  useEffect(() => {
    let mounted = true
    Promise.all([window.flipperV.prefs.get(), window.flipperV.themes.list()]).then(([p, t]) => {
      if (!mounted) return
      setPrefs(p)
      setThemes(t)
    })
    const offPrefs = window.flipperV.prefs.onChanged(setPrefs)
    const offThemes = window.flipperV.themes.onChanged(setThemes)
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
          <div className="text-base font-semibold tracking-tight">Flipper V</div>
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
        {page === 'connection' && <ConnectionPage />}
        {page === 'themes' && prefs && (
          <ThemesPage prefs={prefs} themes={themes} />
        )}
        {page === 'display' && prefs && <DisplayPage prefs={prefs} />}
        {page === 'chroma' && prefs && <ChromaPage prefs={prefs} />}
        {page === 'bindings' && prefs && <BindingsPage prefs={prefs} />}
        {page === 'splash' && prefs && <SplashPage prefs={prefs} />}
        {page === 'about' && <AboutPage />}
        {(page === 'themes' ||
          page === 'display' ||
          page === 'chroma' ||
          page === 'bindings' ||
          page === 'splash') &&
          !prefs && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        )}
      </main>
    </div>
  )
}
