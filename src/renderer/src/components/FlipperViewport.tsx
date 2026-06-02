import { useEffect, useRef, useState } from 'react'
import type { Theme } from '../../../shared/types'
import { createScene, type MirrorHandle } from '../flipper/scene'
import { Connection, type ConnState } from '../flipper/connection'

type Props = {
  activeTheme: Theme | null
}

/**
 * Mounts the Three.js scene into a div that fills its parent. Owns one
 * Connection instance so button presses on the model route to the device
 * when WebSerial is connected.
 */
export function FlipperViewport({ activeTheme }: Props): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mirrorRef = useRef<MirrorHandle | null>(null)
  const connRef = useRef<Connection | null>(null)
  const [, setConn] = useState<ConnState>('disconnected')
  const [ready, setReady] = useState(false)

  // Boot the scene once. We don't pass activeTheme into createScene because
  // we don't want to refire scene creation when the theme changes — instead
  // a separate effect calls applyTheme() on the mirror handle.
  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    let mirror: MirrorHandle | null = null

    createScene(containerRef.current, {
      onLog: (msg, kind) => {
        if (kind === 'err') console.error('[flide]', msg)
        else console.log('[flide]', msg)
      },
      onButton: (id, kind) => {
        if (kind === 'press' || kind === 'short' || kind === 'release') {
          connRef.current?.sendInput(id, kind)
        }
      },
      onModelReady: () => {
        if (!cancelled) setReady(true)
      }
    })
      .then((m) => {
        if (cancelled) {
          m.dispose()
          return
        }
        mirrorRef.current = m
        mirror = m
        connRef.current = new Connection(m, {
          onState: (s) => setConn(s),
          onLog: (msg, kind) => {
            if (kind === 'err') console.error('[flide]', msg)
            else console.log('[flide]', msg)
          }
        })
        // Draw the test pattern immediately so the screen isn't blank
        // before the device is hooked up.
        m.drawTestPattern()
      })
      .catch((err) => console.error('[flide] scene failed to load', err))

    return () => {
      cancelled = true
      mirror?.dispose()
      mirrorRef.current = null
      connRef.current = null
    }
  }, [])

  // Push theme changes into the live scene.
  useEffect(() => {
    if (!ready || !activeTheme || !mirrorRef.current) return
    mirrorRef.current.applyTheme(activeTheme)
  }, [activeTheme, ready])

  // The viewport is interactive (clicks must reach the canvas), but the
  // rest of the window stays drag-able. The outer div is the canvas host.
  return <div ref={containerRef} className="interactive absolute inset-0" />
}
