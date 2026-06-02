import Store from 'electron-store'
import type { Prefs, Theme } from '../shared/types'
import { BUILTIN_THEMES, DEFAULT_THEME_ID } from '../shared/themes'

type Schema = {
  /** Only USER-created themes are persisted; built-ins live in code. */
  customThemes: Theme[]
  prefs: Prefs
}

const defaults: Schema = {
  customThemes: [],
  prefs: {
    alwaysOnTop: true,
    opacity: 1,
    activeThemeId: DEFAULT_THEME_ID,
    clickThrough: false,
    showDragHandle: true
  }
}

const store = new Store<Schema>({ defaults })

export const getPrefs = (): Prefs => store.get('prefs')
export const setPrefs = (patch: Partial<Prefs>): Prefs => {
  const next = { ...getPrefs(), ...patch }
  store.set('prefs', next)
  return next
}

export const listThemes = (): Theme[] => [...BUILTIN_THEMES, ...store.get('customThemes')]

export const saveTheme = (theme: Theme): Theme[] => {
  if (BUILTIN_THEMES.some((t) => t.id === theme.id)) {
    throw new Error(`Cannot overwrite built-in theme "${theme.id}"`)
  }
  const custom = store.get('customThemes')
  const next = custom.filter((t) => t.id !== theme.id)
  next.push({ ...theme, builtin: false })
  store.set('customThemes', next)
  return listThemes()
}

export const deleteTheme = (id: string): Theme[] => {
  if (BUILTIN_THEMES.some((t) => t.id === id)) {
    throw new Error(`Cannot delete built-in theme "${id}"`)
  }
  store.set(
    'customThemes',
    store.get('customThemes').filter((t) => t.id !== id)
  )
  // If the active theme was the one we just deleted, fall back to default.
  if (getPrefs().activeThemeId === id) setPrefs({ activeThemeId: DEFAULT_THEME_ID })
  return listThemes()
}
