import type { FlideAPI } from './index'

declare global {
  interface Window {
    flide: FlideAPI
  }
}

export {}
