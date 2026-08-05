import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function createServiceWorker() {
  return {
    name: 'mirikkok-service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const bundleFiles = Object.keys(bundle).map((fileName) => `/${fileName}`)
      const precacheFiles = [
        '/',
        '/index.html',
        '/manifest.webmanifest',
        '/icons/icon-192.svg',
        '/icons/icon-512.svg',
        ...bundleFiles,
      ]
      const version = bundleFiles.join('|').split('').reduce((hash, character) => (
        ((hash << 5) - hash + character.charCodeAt(0)) | 0
      ), 0)

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `const CACHE_NAME = 'mirikkok-shell-${Math.abs(version)}'
const PRECACHE_FILES = ${JSON.stringify(precacheFiles)}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_FILES)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('mirikkok-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')))
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()))
      return response
    })),
  )
})
`,
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), createServiceWorker()],
})
