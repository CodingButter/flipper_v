import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import type { ButtonId, ConnStatus, Theme } from '../../../shared/types'
import { createScene, type MirrorHandle } from '../flipper/scene'
import { Connection } from '../flipper/connection'

type Props = {
  activeTheme: Theme | null
  /** Source for the offline splash — a public path or a data URL. */
  splashSrc: string
  onConnStatus: (status: ConnStatus) => void
}

export type ViewportHandle = {
  connect(): void
  disconnect(): void
  connectGranted(): void
  pressButton(id: ButtonId): void
  releaseButton(id: ButtonId): void
}

export const FlipperViewport = forwardRef<ViewportHandle, Props>(function FlipperViewport(
  { activeTheme, splashSrc, onConnStatus },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mirrorRef = useRef<MirrorHandle | null>(null)
  const connRef = useRef<Connection | null>(null)
  const [ready, setReady] = useState(false)
  // Latest props that asynchronous callbacks need to read. Putting these
  // in refs avoids re-creating the scene every time they change.
  const splashRef = useRef(splashSrc)
  const connectedRef = useRef(false)
  splashRef.current = splashSrc

  const pressStarts = useRef<Map<ButtonId, number>>(new Map())

  useImperativeHandle(ref, () => ({
    connect: () => void connRef.current?.connect(),
    disconnect: () => void connRef.current?.disconnect(),
    connectGranted: () => void connRef.current?.connectGranted(),
    pressButton: (id) => {
      if (pressStarts.current.has(id)) return
      pressStarts.current.set(id, performance.now())
      mirrorRef.current?.pressButton(id)
    },
    releaseButton: (id) => {
      const t = pressStarts.current.get(id)
      if (t === undefined) return
      pressStarts.current.delete(id)
      mirrorRef.current?.releaseButton(id, performance.now() - t)
    }
  }))

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    let mirror: MirrorHandle | null = null

    createScene(containerRef.current, {
      onLog: (msg, kind) => {
        if (kind === 'err') console.error('[flipper-v]', msg)
        else console.log('[flipper-v]', msg)
      },
      onButton: (id, kind) => {
        if (kind === 'press' || kind === 'short' || kind === 'release') {
          connRef.current?.sendInput(id, kind)
        }
      },
      onWindowDrag: (dx, dy) => {
        // Fire-and-forget — IPC backpressure isn't worth coordinating per move.
        window.flipperV.window.moveBy(dx, dy)
      },
      onWheelResize: (dw, dh) => {
        window.flipperV.window.resizeBy(dw, dh)
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
          onState: (state, message) => {
            const status: ConnStatus = { state, message }
            connectedRef.current = state === 'connected'
            onConnStatus(status)
            void window.flipperV.connection.push(status)
            // Whenever we leave the connected path, repaint the splash
            // — without this the screen would freeze on the last
            // streamed framebuffer or the bare backlight color.
            if (state === 'disconnected' || state === 'error') {
              void mirror?.drawSplash(splashRef.current).catch(() => {
                /* splash failures are non-fatal — leave the screen as-is */
              })
            }
          },
          onLog: (msg, kind) => {
            if (kind === 'err') console.error('[flipper-v]', msg)
            else console.log('[flipper-v]', msg)
          }
        })
        // Initial paint — show the splash until the device hooks up.
        void m.drawSplash(splashRef.current).catch(() => {
          m.screen.clear()
        })
      })
      .catch((err) => console.error('[flipper-v] scene failed to load', err))

    return () => {
      cancelled = true
      mirror?.dispose()
      mirrorRef.current = null
      connRef.current = null
    }
  }, [onConnStatus])

  // Apply theme changes into the live scene.
  useEffect(() => {
    if (!ready || !activeTheme || !mirrorRef.current) return
    mirrorRef.current.applyTheme(activeTheme)
  }, [activeTheme, ready])

  // Repaint splash when the user uploads/replaces it — but only while
  // we're offline, otherwise the live stream would briefly flash to the
  // splash image and back.
  useEffect(() => {
    if (!ready || !mirrorRef.current) return
    if (connectedRef.current) return
    void mirrorRef.current.drawSplash(splashSrc).catch(() => {
      /* ignore — splash load failures aren't fatal */
    })
  }, [splashSrc, ready])

  useEffect(() => {
    const offGranted = window.flipperV.connection.onPortGranted(() => {
      connRef.current?.connectGranted()
    })
    const offDisc = window.flipperV.connection.onDisconnectRequest(() => {
      void connRef.current?.disconnect()
    })
    return () => {
      offGranted()
      offDisc()
    }
  }, [])

  return <div ref={containerRef} className="interactive absolute inset-0" />
})
