import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/main/index.ts') }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/preload/index.ts') }
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'src'),
    plugins: [react()],
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer/src'),
        '@settings': resolve(__dirname, 'src/settings/src'),
        '@shared': resolve(__dirname, 'src/shared')
      }
    },
    build: {
      outDir: resolve(__dirname, 'out/renderer'),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          floating: resolve(__dirname, 'src/renderer/index.html'),
          settings: resolve(__dirname, 'src/settings/index.html')
        }
      }
    },
    publicDir: resolve(__dirname, 'src/renderer/public'),
    server: {
      // Pin a port that isn't 5173 (avoids collisions with whatever else
      // the dev box has on the default Vite port — common on WSL2 with
      // mirrored networking). strictPort throws fast rather than asking
      // for an interactive port-change confirmation, which is invisible
      // when stdin is detached (e.g. background Electron-from-WSL runs).
      port: 5179,
      strictPort: true
    }
  }
})
