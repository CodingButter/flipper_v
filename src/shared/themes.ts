import type { Theme } from './types'

/**
 * Built-in themes. Matching the originals from the HTML prototype plus a few
 * extras. `id` is the slug — used as the stable key in storage and as the
 * default activeThemeId.
 */
export const BUILTIN_THEMES: Theme[] = [
  {
    id: 'flipper',
    name: 'Flipper',
    body: '#dfe1e6',
    accent: '#ff8200',
    trim: '#2a2a2a',
    screen: '#ff8200',
    builtin: true
  },
  {
    id: 'dracula',
    name: 'Dracula',
    body: '#3b3f54',
    accent: '#bd93f9',
    trim: '#22242e',
    screen: '#bd93f9',
    builtin: true
  },
  {
    id: 'nord',
    name: 'Nord',
    body: '#3b4252',
    accent: '#88c0d0',
    trim: '#2e3440',
    screen: '#88c0d0',
    builtin: true
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    body: '#2a1f3d',
    accent: '#ff2d92',
    trim: '#1a1126',
    screen: '#ff2d92',
    builtin: true
  },
  {
    id: 'matrix',
    name: 'Matrix',
    body: '#0f1a0f',
    accent: '#39ff14',
    trim: '#0a0a0a',
    screen: '#39ff14',
    builtin: true
  },
  {
    id: 'mono',
    name: 'Mono',
    body: '#4a4a4f',
    accent: '#d8d8dc',
    trim: '#0d0d0d',
    screen: '#c8c8cc',
    builtin: true
  }
]

export const DEFAULT_THEME_ID = 'flipper'
