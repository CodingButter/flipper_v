import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { Theme } from '../../../shared/types'
import { BUTTONS, MAP_URL, MODEL_URL, SHORT_MS, type ButtonId } from './constants'
import { ScreenMirror } from './screen'
import { buildPlanarUVs } from './uv'
import { SCREEN_BYTES } from './screen-canvas'

type ScreenOrient = { flipU: boolean; flipV: boolean; rot90: boolean }

export type ButtonMap = {
  [matName: string]: { [triIndex: number]: ButtonId }
}

export type MirrorEvents = {
  onLog?: (msg: string, kind?: 'ok' | 'err') => void
  onButton?: (id: ButtonId, kind: 'press' | 'short' | 'release') => void
  onModelReady?: () => void
  /** Left-drag started/continues outside of any mapped button — move the OS window. */
  onWindowDrag?: (dx: number, dy: number) => void
  /** Wheel over the device — resize the OS window. Caller decides direction. */
  onWheelResize?: (dw: number, dh: number) => void
}

export type SceneOptions = {
  /** When true, the canvas clears to transparent so the OS desktop shows through. */
  transparent?: boolean
  initialTheme?: Theme
  initialOrient?: ScreenOrient
}

const DEFAULT_ORIENT: ScreenOrient = { flipU: true, flipV: true, rot90: false }

/**
 * Builds and owns the whole Three.js scene, plus the offscreen ScreenMirror.
 * Returns an object with `dispose()` so React can tear it down on unmount,
 * and getters/setters that the UI uses to drive theme / orientation / etc.
 */
export async function createScene(
  container: HTMLElement,
  events: MirrorEvents,
  options: SceneOptions = {}
): Promise<MirrorHandle> {
  const transparent = options.transparent ?? true
  const orient: ScreenOrient = { ...DEFAULT_ORIENT, ...(options.initialOrient ?? {}) }

  // ---- Renderer / camera / scene --------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: transparent })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  if (transparent) renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  if (!transparent) scene.background = new THREE.Color(0x0d0f12)

  const camera = new THREE.PerspectiveCamera(
    42,
    container.clientWidth / container.clientHeight,
    0.01,
    100
  )
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  // Left = button-press OR window-drag (decided in pointerdown by raycast).
  // Right = orbit. We replace the wheel dolly with a window-resize handled
  // ourselves, otherwise zooming clips the model against the window.
  controls.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }
  controls.enableZoom = false

  scene.add(new THREE.AmbientLight(0xffffff, 1.15))
  const key = new THREE.DirectionalLight(0xffffff, 2.0)
  key.position.set(1, 2, 1.5)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xffffff, 0.9)
  fill.position.set(-1.5, -0.5, -1)
  scene.add(fill)

  // ---- Screen mirror plumbing ----------------------------------------
  const screen = new ScreenMirror()

  let screenMesh: THREE.Mesh | null = null
  let screenUVbase: Float32Array | null = null

  const applyOrient = (): void => {
    if (!screenMesh || !screenUVbase) return
    const uv = screenMesh.geometry.getAttribute('uv') as THREE.BufferAttribute
    for (let i = 0; i < screenUVbase.length / 2; i++) {
      let u = screenUVbase[i * 2]
      let v = screenUVbase[i * 2 + 1]
      if (orient.rot90) {
        const t = u
        u = v
        v = 1 - t
      }
      if (orient.flipU) u = 1 - u
      if (orient.flipV) v = 1 - v
      uv.setXY(i, u, v)
    }
    uv.needsUpdate = true
  }

  // ---- Button mapping infra -------------------------------------------
  const triMap = new Map<string, Map<number, ButtonId>>()
  const pickables: THREE.Mesh[] = []
  const highlightMeshes = new Map<ButtonId, THREE.Mesh>()
  const themeMats: Record<string, THREE.MeshStandardMaterial | THREE.MeshBasicMaterial> = {}

  function buildButtonRegions(meshByMat: Map<string, THREE.Mesh>): void {
    for (const b of BUTTONS) {
      const positions: number[] = []
      for (const [matName, tmap] of triMap) {
        const mesh = meshByMat.get(matName)
        if (!mesh) continue
        const p = mesh.geometry.getAttribute('position') as THREE.BufferAttribute
        for (const [tri, btn] of tmap) {
          if (btn !== b.id) continue
          const a = tri * 3
          const v = new THREE.Vector3()
          for (let k = 0; k < 3; k++) {
            v.fromBufferAttribute(p, a + k).applyMatrix4(mesh.matrixWorld)
            positions.push(v.x, v.y, v.z)
          }
        }
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      g.computeBoundingSphere()
      const mat = new THREE.MeshBasicMaterial({
        color: b.color,
        transparent: true,
        opacity: 0.55,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide
      })
      const mesh = new THREE.Mesh(g, mat)
      mesh.renderOrder = 998
      mesh.frustumCulled = false
      mesh.visible = false
      scene.add(mesh)
      highlightMeshes.set(b.id, mesh)
    }
  }

  // ---- Theming --------------------------------------------------------
  const setMatColor = (name: string, hex: string): void => {
    const mt = themeMats[name]
    if (!mt) return
    mt.color.set(hex)
    mt.needsUpdate = true
  }
  function applyTheme(t: Theme): void {
    setMatColor('Flipper_Main', t.body)
    setMatColor('Flipper_Orange', t.accent)
    setMatColor('Flipper_Black', t.trim)
    screen.setBackgroundColor(t.screen)
  }

  // ---- Load model + mapping ------------------------------------------
  const loader = new GLTFLoader()
  const [gltf, map] = await Promise.all([
    new Promise<{ scene: THREE.Object3D }>((res, rej) =>
      loader.load(MODEL_URL, (g) => res(g as unknown as { scene: THREE.Object3D }), undefined, rej)
    ),
    fetch(MAP_URL)
      .then((r) => r.json())
      .then((j) => (typeof j === 'string' ? JSON.parse(j) : j)) as Promise<{
      buttons: Record<string, Record<string, number[]>>
    }>
  ])

  const root = gltf.scene
  // Wrap the loaded model in a pivot Group so we can rotate it around
  // its bounding-sphere center (for the portrait-app feature) without
  // depending on the GLB's authored origin.
  const pivot = new THREE.Group()
  scene.add(pivot)
  pivot.add(root)
  pivot.updateWorldMatrix(true, true)

  const meshByMat = new Map<string, THREE.Mesh>()
  root.traverse((o: THREE.Object3D) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    // Must match the mapper — the JSON references face indices in the
    // de-indexed (per-triangle) geometry.
    m.geometry = m.geometry.toNonIndexed()
    m.geometry.computeVertexNormals()
    const matName = Array.isArray(m.material) ? m.material[0]?.name : m.material?.name
    m.userData.matName = matName || m.name
    pickables.push(m)
    meshByMat.set(m.userData.matName, m)
    themeMats[m.userData.matName] = Array.isArray(m.material)
      ? (m.material[0] as THREE.MeshStandardMaterial)
      : (m.material as THREE.MeshStandardMaterial)
    if (m.userData.matName === 'Flipper_Screen') screenMesh = m
  })

  for (const [btn, mats] of Object.entries(map.buttons || {})) {
    for (const [matName, tris] of Object.entries(mats)) {
      let tm = triMap.get(matName)
      if (!tm) {
        tm = new Map()
        triMap.set(matName, tm)
      }
      for (const t of tris) tm.set(t, btn as ButtonId)
    }
  }
  buildButtonRegions(meshByMat)

  // Capture into a local so TS narrows it across the assignments below
  // — the closure in root.traverse() above writes to screenMesh, which
  // confuses control-flow analysis.
  const sm = screenMesh as THREE.Mesh | null
  if (sm) {
    screenUVbase = buildPlanarUVs(sm.geometry)
    sm.geometry.setAttribute('uv', new THREE.BufferAttribute(screenUVbase.slice(), 2))
    sm.material = new THREE.MeshBasicMaterial({ map: screen.texture, toneMapped: false })
    applyOrient()
  } else {
    events.onLog?.('WARN: Flipper_Screen mesh not found', 'err')
  }

  // Front-on landscape view. `n` is the screen front normal; `up` keeps the
  // device's long edge horizontal with the d-pad on the right.
  const cameraNormal = new THREE.Vector3(0.879, 0.411, 0.242).normalize()
  const sphere = new THREE.Sphere()
  new THREE.Box3().setFromObject(root).getBoundingSphere(sphere)
  const sceneCenter = sphere.center.clone()
  const sphereRadius = sphere.radius
  // Move pivot so its origin sits at the model's bounding-sphere center
  // in world space. Then negate that on `root` — net effect: model
  // stays put visually, but pivot.quaternion now rotates the model
  // around its true centroid.
  pivot.position.copy(sceneCenter)
  root.position.set(-sceneCenter.x, -sceneCenter.y, -sceneCenter.z)
  pivot.updateWorldMatrix(true, true)
  const up = new THREE.Vector3()
    .crossVectors(cameraNormal, new THREE.Vector3(0, 0, 1))
    .normalize()
    .multiplyScalar(-1)
  camera.up.copy(up)
  controls.target.copy(sceneCenter)

  /**
   * Position the camera so the device's bounding sphere fits ~`fillFactor`
   * of the window. Sphere-fitting (vs bbox-max-dim fitting) means the
   * device stays fully visible at every orbit angle — rotating doesn't
   * push corners outside the window. Recomputed on every resize so the
   * device scales with the window.
   */
  const fillFactor = 0.98
  function fitCamera(): void {
    const halfFovV = THREE.MathUtils.degToRad(camera.fov) / 2
    const distV = sphereRadius / Math.tan(halfFovV)
    // Horizontal extent: half-fov-h = atan(aspect * tan(halfFovV))
    const distH = sphereRadius / (camera.aspect * Math.tan(halfFovV))
    const dist = Math.max(distV, distH) / fillFactor
    camera.position.copy(sceneCenter).addScaledVector(cameraNormal, dist)
    controls.update()
  }
  fitCamera()

  if (options.initialTheme) applyTheme(options.initialTheme)

  events.onModelReady?.()
  events.onLog?.(
    `Model + mapping loaded. ${pickables.length} meshes, ` +
      `${[...triMap.values()].reduce((s, m) => s + m.size, 0)} mapped faces.`
  )

  // ---- Picking / press --------------------------------------------------
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let pressed: { btn: ButtonId; startTime: number } | null = null
  let showRegionsAlways = false

  function hitButton(e: PointerEvent): ButtonId | null {
    const r = renderer.domElement.getBoundingClientRect()
    pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    )
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(pickables, false)
    if (!hits.length) return null
    const h = hits[0]
    const tm = triMap.get((h.object as THREE.Mesh).userData.matName as string)
    return tm?.get(h.faceIndex ?? -1) ?? null
  }

  const dom = renderer.domElement
  /** Set while left-dragging on background (i.e. moving the OS window). */
  let windowDragId: number | null = null

  const onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return
    const btn = hitButton(e)
    if (btn) {
      controls.enabled = false
      pressed = { btn, startTime: performance.now() }
      const hl = highlightMeshes.get(btn)
      if (hl) hl.visible = true
      events.onButton?.(btn, 'press')
      return
    }
    // No button hit + left button → start dragging the OS window. The
    // pointer is captured so we keep receiving move events even if the
    // OS window leaves the cursor behind for a frame.
    if (events.onWindowDrag) {
      windowDragId = e.pointerId
      dom.setPointerCapture(e.pointerId)
      controls.enabled = false
      dom.style.cursor = 'grabbing'
    }
  }
  const onPointerUp = (e: PointerEvent): void => {
    if (windowDragId !== null && e.pointerId === windowDragId) {
      try {
        dom.releasePointerCapture(windowDragId)
      } catch {
        /* already released */
      }
      windowDragId = null
      dom.style.cursor = 'default'
    }
    controls.enabled = true
    if (!pressed) return
    const { btn, startTime } = pressed
    pressed = null
    const dur = performance.now() - startTime
    if (!showRegionsAlways) {
      const hl = highlightMeshes.get(btn)
      if (hl) hl.visible = false
    }
    if (dur < SHORT_MS) events.onButton?.(btn, 'short')
    events.onButton?.(btn, 'release')
  }
  const onPointerMove = (e: PointerEvent): void => {
    if (windowDragId !== null) {
      // movementX/Y are in CSS pixels, OS window coords are in screen
      // pixels — close enough at integer DPRs; users won't perceive the
      // sub-pixel drift on fractional DPI.
      events.onWindowDrag?.(e.movementX, e.movementY)
      return
    }
    if (pressed) return
    const overButton = !!hitButton(e)
    dom.style.cursor = overButton ? 'pointer' : 'grab'
  }
  const onWheel = (e: WheelEvent): void => {
    if (!events.onWheelResize) return
    e.preventDefault()
    // ~6% of window per notch. Square so the window stays roughly square
    // (the renderer / camera then adjusts via fitCamera).
    const step = e.deltaY > 0 ? -1 : 1
    const px = Math.round(container.clientWidth * 0.06) * step
    events.onWheelResize(px, px)
  }
  dom.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointerup', onPointerUp)
  dom.addEventListener('pointermove', onPointerMove)
  dom.addEventListener('wheel', onWheel, { passive: false })

  // ---- Resize + animate -----------------------------------------------
  const onResize = (): void => {
    renderer.setSize(container.clientWidth, container.clientHeight)
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    fitCamera()
  }
  window.addEventListener('resize', onResize)
  const ro = new ResizeObserver(onResize)
  ro.observe(container)

  // ---- Device rotation (driven by the firmware's orientation field) -
  // The Flipper firmware reports orientation 0..3 in every screen frame.
  // Apps that render portrait (0=landscape, 1=portrait CW, 2=180,
  // 3=portrait CCW) set non-zero values. We rotate the model so the
  // user sees the device in the orientation they'd physically hold it.
  let currentRotation = 0
  let targetRotation = 0
  const rotAxis = cameraNormal.clone()
  const ORIENT_TO_ANGLE: Record<number, number> = {
    0: 0,
    1: -Math.PI / 2,
    2: Math.PI,
    3: Math.PI / 2
  }
  function setDeviceOrientation(orient: number): void {
    targetRotation = ORIENT_TO_ANGLE[orient] ?? 0
  }

  let raf = 0
  const animate = (): void => {
    raf = requestAnimationFrame(animate)
    // Lerp the device rotation toward target so portrait/landscape
    // transitions are smooth instead of snapping.
    if (Math.abs(currentRotation - targetRotation) > 0.001) {
      currentRotation += (targetRotation - currentRotation) * 0.18
      pivot.quaternion.setFromAxisAngle(rotAxis, currentRotation)
    }
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  // ---- Splash image --------------------------------------------------
  // Decode a user-supplied (or default) image into a 128x64 framebuffer
  // and paint it onto the device's screen. Used when no Flipper is
  // connected so the screen has something on it other than the bare
  // backlight. Lives on the handle so React owns the lifecycle decision.
  async function drawSplash(src: string): Promise<void> {
    const { imageToFramebuffer } = await import('../../../shared/splash')
    const fb = await imageToFramebuffer(src)
    screen.drawFrame(fb, 0)
  }

  // ---- Public handle --------------------------------------------------
  /** Programmatic press from a non-mouse source (keyboard, IPC, etc.). */
  function pressButton(id: ButtonId): void {
    const hl = highlightMeshes.get(id)
    if (hl) hl.visible = true
    events.onButton?.(id, 'press')
  }
  function releaseButton(id: ButtonId, durationMs: number): void {
    if (!showRegionsAlways) {
      const hl = highlightMeshes.get(id)
      if (hl) hl.visible = false
    }
    if (durationMs < SHORT_MS) events.onButton?.(id, 'short')
    events.onButton?.(id, 'release')
  }

  return {
    screen,
    applyTheme,
    setOrientation: (next: Partial<ScreenOrient>) => {
      Object.assign(orient, next)
      applyOrient()
    },
    setDeviceOrientation,
    drawSplash,
    setShowRegions: (show: boolean) => {
      showRegionsAlways = show
      for (const m of highlightMeshes.values()) m.visible = show
    },
    pressButton,
    releaseButton,
    drawTestPattern: () => drawTestPattern(screen, SCREEN_BYTES),
    dispose: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointerup', onPointerUp)
      dom.removeEventListener('pointerdown', onPointerDown)
      dom.removeEventListener('pointermove', onPointerMove)
      dom.removeEventListener('wheel', onWheel)
      controls.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      scene.traverse((o: THREE.Object3D) => {
        const m = o as THREE.Mesh
        if (m.isMesh) {
          m.geometry.dispose()
          const mat = m.material
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
          else mat?.dispose()
        }
      })
    }
  }
}

export type MirrorHandle = {
  screen: ScreenMirror
  applyTheme(theme: Theme): void
  setOrientation(next: Partial<ScreenOrient>): void
  /** Firmware orientation 0..3 — rotates the 3D model accordingly. */
  setDeviceOrientation(orient: number): void
  /** Paint a splash image (PNG / BMP / data URL) on the device screen. */
  drawSplash(src: string): Promise<void>
  /** Visual + timing press from non-mouse sources (keyboard, IPC). */
  pressButton(id: ButtonId): void
  releaseButton(id: ButtonId, durationMs: number): void
  setShowRegions(show: boolean): void
  drawTestPattern(): void
  dispose(): void
}

function drawTestPattern(screen: ScreenMirror, totalBytes: number): void {
  // Build a 1024-byte framebuffer (128×64, page-packed) with an
  // orientation-revealing pattern — same as the original prototype.
  const fb = new Uint8Array(totalBytes)
  const set = (x: number, y: number): void => {
    if (x < 0 || x >= 128 || y < 0 || y >= 64) return
    fb[(y >> 3) * 128 + x] |= 1 << (y & 7)
  }
  for (let x = 0; x < 128; x++) {
    set(x, 0)
    set(x, 63)
  }
  for (let y = 0; y < 64; y++) {
    set(0, y)
    set(127, y)
  }
  for (let x = 0; x < 22; x++) for (let y = 0; y < 10; y++) set(x, y) // TOP-LEFT marker
  for (let i = 0; i < 60; i++) set(4 + i, 4 + Math.floor(i * 0.4)) // diagonal
  const cx = 64
  const ty = 18
  for (let i = 0; i < 18; i++) {
    set(cx - i, ty + i)
    set(cx + i, ty + i)
  }
  for (let y = ty + 18; y < ty + 34; y++) {
    set(cx - 3, y)
    set(cx - 2, y)
    set(cx + 2, y)
    set(cx + 3, y)
  }
  screen.drawFrame(fb, 0)
}
