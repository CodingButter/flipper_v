<div align="center">
  <img src="src/renderer/public/flipper_v_icon.png" alt="Flipper V" width="128" />

  # Flipper V

  **A floating virtual Flipper Zero for your desktop.**

  Live screen mirroring over WebSerial, clickable 3D buttons, themable to match your setup.

  [![Release](https://img.shields.io/github/v/release/CodingButter/flipper_v?label=download)](https://github.com/CodingButter/flipper_v/releases/latest)
  [![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/CodingButter/flipper_v/releases/latest)
  [![License](https://img.shields.io/github/license/CodingButter/flipper_v)](LICENSE)
</div>

---

## What it is

A frameless, transparent, always-on-top window that paints a 3D Flipper Zero on your desktop. Plug a real Flipper in over USB and the on-device LCD streams onto the model's screen at 30 fps; click a button on the model and the firmware sees the input. Themable, keyboard-bindable, OBS-friendly.

## Install

Download the build for your OS from the [latest release](https://github.com/CodingButter/flipper_v/releases/latest):

| Platform | Artifact |
|---|---|
| **Windows** | `Flipper-V-Setup-X.Y.Z.exe` (NSIS installer) or `Flipper-V-X.Y.Z.exe` (portable) |
| **macOS** (Apple Silicon) | `Flipper-V-X.Y.Z-arm64.dmg` |
| **macOS** (Intel) | `Flipper-V-X.Y.Z.dmg` |
| **Linux** | `Flipper-V-X.Y.Z.AppImage` |

The app **auto-updates** from the in-app About page once installed — when a new release is published, click **Check for updates** → **Update to vX.Y.Z** → **Install & Restart** and the new version takes over.

> **Note on code signing.** The v0 builds aren't signed yet, so Windows SmartScreen and macOS Gatekeeper will warn on first launch. Click **More info → Run anyway** on Windows or right-click → **Open** on macOS to bypass. Signed builds are on the roadmap.

## Features

**3D + window**
- Frameless transparent window, square aspect, always-on-top by default
- Bounding-sphere camera fit so the device fills the window cleanly at any orbit angle
- Drag the window from anywhere on the device body; mouse-wheel resizes
- System tray icon (Show / Hide / Settings / Quit); optional tray-only mode

**Mirroring a real Flipper**
- WebSerial auto-detects the Flipper's USB id (`0483:5740`) — no driver, no permission picker on subsequent connects
- Live 128×64 framebuffer streamed onto the model's screen mesh
- Clicking a button on the 3D model sends a real input event to the device
- 3D model **auto-rotates** when the firmware reports a portrait-orientation app

**Themes**
- Six built-in palettes (Flipper, Dracula, Nord, Synthwave, Matrix, Mono)
- Custom theme builder — case / accent / trim / backlight color pickers, named and saved
- Per-color HSL + hex inputs

**Keyboard bindings**
- Defaults: arrows + WASD (d-pad), Enter / Space (OK), Backspace / Escape (Back)
- Multiple keys per button, captured from a real keypress
- Layout-independent (`KeyboardEvent.code`, not `.key`)

**Splash image**
- Configurable per-user — defaults to a bundled mascot, upload any PNG/BMP/JPG and we threshold it to 1-bit at 128×64
- Live preview in settings matches what lands on the device

**Streaming / video**
- "Chroma" tab fills the window background with a solid keyable color (presets for OBS green, magenta, etc.) so the device drops cleanly into a stream or video timeline

**Auto-update**
- Polls GitHub Releases via `electron-updater`, downloads in the background, runs the installer on restart

## Develop

```bash
bun install
bun run dev
```

`bun run dev` starts the renderer dev server, the main process, and both windows. `npm install && npm run dev` works identically — the project doesn't depend on bun-specific APIs.

### Typecheck

```bash
bun run typecheck
```

Splits into node (main / preload) and web (renderer / settings) passes. CI runs both; PRs are expected to pass.

### Build distributables locally

```bash
bun run build:win     # NSIS installer + portable .exe
bun run build:mac     # .dmg + .zip (arm64 + x64)
bun run build:linux   # AppImage + .deb
```

Output lands in `dist/`.

## Releases

Push a `v*.*.*` tag — `.github/workflows/release.yml` fans out to three platform runners in parallel, builds with `electron-builder`, and publishes the artifacts to the matching GitHub Release. The workflow also publishes the `latest.yml` / `latest-mac.yml` manifests that `electron-updater` reads from.

```bash
# Cut a release
git tag v0.1.0
git push origin v0.1.0
```

The workflow can also be re-run from the Actions tab (workflow_dispatch); it'll re-publish over the latest tag.

## Architecture

```
src/
  main/            Electron main process
    index.ts       app lifecycle, tray, WebSerial permission handlers
    windows.ts     floating + settings BrowserWindow factories
    ipc.ts         IPC handlers (themes, prefs, connection, updates)
    store.ts       electron-store persistence with schema migrations
    updater.ts     electron-updater wrapper exposing a single state machine

  preload/         contextBridge bridge — exposes window.flipperV to renderers

  renderer/        Floating 3D window
    src/
      components/  React shell (toolbar, viewport, resize handle)
      flipper/
        transport.ts     WebSerial port helpers + WebSerialTransport
        framing.ts       varint-length protobuf framing
        rpc-client.ts    FlipperRpcClient — handshake + request/response/stream
        gui.ts           sendInput, startScreenStream helpers
        screen-canvas.ts 128×64 1-bit framebuffer → 2D canvas
        proto/           generated-style TS types for the gui + flipper protobufs
        scene.ts         Three.js scene, pivot rotation, button raycasting
        connection.ts    user-facing Connection lifecycle (idempotent, reentrant)

  settings/        Separate settings window (shadcn/ui)
    src/pages/     Connection · Themes · Bindings · Splash · Display · Chroma · About

  shared/          Types + utilities shared across processes
    types.ts       IPC channel names, Prefs, UpdateStatus, ConnState, ButtonId
    splash.ts      Image → 128×64 1-bit framebuffer converter
    themes.ts      Built-in theme definitions
    web-serial.d.ts WebSerial DOM type declarations
```

The Flipper RPC layer talks the [official Flipper protobuf protocol](https://github.com/flipperdevices/Flipper-Protobuf). We model only the messages we actually exchange (`gui.proto` + the slim `Main` wrapper from `flipper.proto`); the rest of the schema is decoded into the runtime's unknown-field fallback and silently ignored.

## Credits

The 3D model is **"Flipper Zero" by [blazitt](https://sketchfab.com/blazitt)** on Sketchfab:

> https://sketchfab.com/3d-models/flipper-zero-f8ad3fdf5f2b485ba46b0ac91626fc76

Used under its Sketchfab license — please check the model page for the current terms. If you fork this project, keep the credit and the link intact.

Built on:

- [Electron](https://electronjs.org) + [electron-vite](https://electron-vite.org) + [electron-builder](https://www.electron.build) + [electron-updater](https://www.electron.build/auto-update)
- [React](https://react.dev) + [TailwindCSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Three.js](https://threejs.org)
- [@protobuf-ts/runtime](https://github.com/timostamm/protobuf-ts)

## License

Application code is [MIT](LICENSE). The Flipper Zero 3D model file (`src/renderer/public/models/flipper_zero.glb`) is **not** covered by the MIT license — its rights belong to the original artist under the Sketchfab terms linked above.
