import { useRef } from 'react'

type Props = { visible: boolean }

/**
 * Small diagonal-grip handle anchored to the bottom-right. Frameless
 * transparent windows don't expose an OS resize handle, so we drag this
 * one and tell the main process to grow/shrink the floating window by the
 * pointer delta.
 */
export function ResizeHandle({ visible }: Props): JSX.Element {
  const dragging = useRef<number | null>(null)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (e.button !== 0) return
    dragging.current = e.pointerId
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (dragging.current === null) return
    window.flipperV.window.resizeBy(e.movementX, e.movementY)
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (dragging.current === null) return
    try {
      ;(e.target as HTMLElement).releasePointerCapture(dragging.current)
    } catch {
      /* already released */
    }
    dragging.current = null
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      title="Drag to resize"
      className={`interactive pointer-events-auto absolute bottom-1 right-1 z-10 flex h-5 w-5 cursor-nwse-resize items-end justify-end rounded-sm bg-black/40 p-1 transition-opacity duration-150 hover:bg-black/60 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" className="text-white/80">
        <path d="M9 3 L3 9 M9 6 L6 9" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}
