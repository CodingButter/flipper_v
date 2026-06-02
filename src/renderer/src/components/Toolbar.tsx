import type { Prefs } from '../../../shared/types'

type Props = {
  visible: boolean
  prefs: Prefs | null
}

/**
 * Tiny overlay shown on hover. Settings is the only entry into the
 * shadcn-styled settings window. The right edge has a drag region for
 * moving the floating window around.
 */
export function Toolbar({ visible, prefs }: Props): JSX.Element {
  const opacityClass = visible ? 'opacity-100' : 'opacity-0'
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-1 p-2 transition-opacity duration-150 ${opacityClass}`}
    >
      <div className="draggable pointer-events-auto h-7 flex-1 rounded-md bg-black/30 backdrop-blur-sm" />
      <div className="interactive pointer-events-auto flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-1 backdrop-blur">
        <button
          type="button"
          title="Settings"
          onClick={() => window.flide.window.openSettings()}
          className="flex h-7 w-7 items-center justify-center rounded text-white/80 hover:bg-white/10 hover:text-white"
        >
          <SettingsIcon />
        </button>
        <button
          type="button"
          title={prefs?.alwaysOnTop ? 'Always on top: on' : 'Always on top: off'}
          onClick={() =>
            window.flide.prefs.set({ alwaysOnTop: !(prefs?.alwaysOnTop ?? true) })
          }
          className={`flex h-7 w-7 items-center justify-center rounded ${
            prefs?.alwaysOnTop ? 'text-orange-400' : 'text-white/60'
          } hover:bg-white/10`}
        >
          <PinIcon />
        </button>
        <button
          type="button"
          title="Hide window"
          onClick={() => window.flide.window.hideFloating()}
          className="flex h-7 w-7 items-center justify-center rounded text-white/80 hover:bg-white/10 hover:text-white"
        >
          <HideIcon />
        </button>
      </div>
    </div>
  )
}

function SettingsIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
function PinIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14l-1.68-2.99A2 2 0 0 1 17 13V8a5 5 0 0 0-10 0v5a2 2 0 0 1-.32 1.01L5 17z" />
    </svg>
  )
}
function HideIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
