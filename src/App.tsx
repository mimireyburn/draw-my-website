// App.tsx
import { useEffect, useState } from 'react'
import { Tldraw, type TLStoreSnapshot, type TLCameraOptions } from 'tldraw'
import 'tldraw/tldraw.css'
// import snapshot from '../drawing.json'


// env var (set in Vercel dashboard):
const SNAPSHOT_URL = import.meta.env.VITE_SNAPSHOT_URL // || process.env.NEXT_PUBLIC_SNAPSHOT_URL

const cameraOptions = {
  isLocked: false,
  wheelBehavior: 'pan',
  panSpeed: 1,
  zoomSpeed: 2,
  constraints: {
    initialZoom: 'fit-max',
    baseZoom: 'fit-max',
    bounds: { x: 0, y: 0, w: 1600, h: 9000 },
    behavior: { x: 'fixed', y: 'contain' },
    padding: { x: 100, y: 100 },
    origin: { x: 0.5, y: 0.5 },
  },
} satisfies Partial<TLCameraOptions>

export default function App() {
  const [snapshot, setSnapshot] = useState<TLStoreSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(SNAPSHOT_URL, { cache: 'force-cache' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as TLStoreSnapshot
        if (!cancelled) setSnapshot(json)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load snapshot')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) return <div style={{ padding: 16 }}>Failed to load: {error}</div>
  if (!snapshot) return <div style={{ padding: 16 }}>Loading drawing…</div>

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw snapshot={snapshot} cameraOptions={cameraOptions} hideUi />
    </div>
  )
}
