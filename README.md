# Flipper V — Floating Virtual Flipper Zero

A cross-platform desktop app that puts a 3D Flipper Zero on your desktop. It
mirrors a real device over WebSerial — the live screen renders on the model
and clicking the on-screen buttons drives the hardware. There's no window
chrome: the 3D model floats free, always-on-top by default.

- **3D, frameless, transparent** floating window
- **Themes** — six built-ins plus a custom theme builder
- **WebSerial** — auto-detects the Flipper's `0483:5740` USB id
- **Cross-platform** — Windows, macOS, Linux
- **Stack** — Electron + Vite + React + TailwindCSS + shadcn/ui + Three.js

## Status

Early prototype. The 3D mirror, theme system, settings window, and WebSerial
auto-connect are wired up. Web Bluetooth, key-binding to physical keys, and
custom skinning of individual mesh parts are on the roadmap.

## Develop

```bash
bun install
bun run dev
```

`bun run dev` starts both the main floating window and the settings window
(opened via the hover toolbar → ⚙). `npm` works too — the project doesn't
depend on bun-specific APIs.

> **Developing on WSL2?** USB devices don't reach WSL by default. See
> [`scripts/README.md`](scripts/README.md) for a one-time setup that
> auto-attaches your Flipper to WSL on every logon.

## Build distributables locally

```bash
bun run build:win     # NSIS installer + portable .exe
bun run build:mac     # .dmg + .zip
bun run build:linux   # AppImage + .deb
```

Output lands in `dist/`.

## Releases

Pushing a `v*.*.*` tag triggers `.github/workflows/release.yml`, which builds
on Windows, macOS, and Linux runners in parallel and attaches the artifacts
to a matching GitHub Release.

```bash
# Cut a release:
git tag v0.1.0
git push origin v0.1.0
```

You can also re-run the workflow manually from the Actions tab (it will
re-publish the latest tag).

## Layout

```
src/
  main/        Electron main process — windows, WebSerial, IPC, persistence
  preload/     contextBridge API exposed to renderers as window.flipperV
  renderer/    Floating 3D window (Three.js scene + tiny hover toolbar)
  settings/    Separate settings window (shadcn/ui)
  shared/      Types + built-in themes shared across processes
```

The original prototype lives at `public/flipper-device-mirror.html` — kept
for reference. The shipped renderer is `src/renderer/`.

## Credits

The 3D model is **"Flipper Zero" by [blazitt](https://sketchfab.com/blazitt)**,
published on Sketchfab:

> https://sketchfab.com/3d-models/flipper-zero-f8ad3fdf5f2b485ba46b0ac91626fc76

Used under its Sketchfab license — please check the model page for the
current terms. If you fork this project, keep the credit and the link
intact.

The WebSerial RPC / screen-streaming layer in `flipper-mirror-bundle.js`
is a prebuilt JavaScript module — it ships as-is in this repo as the
runtime that talks to a real Flipper Zero over USB.

## License

The Flipper V application code is MIT. The Flipper Zero 3D model is **not**
covered by the MIT license — its rights belong to the original artist
under the Sketchfab terms linked above.
