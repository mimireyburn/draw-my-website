// App.tsx
import { useEffect, useState } from 'react'
import { Tldraw, Editor, type TLStoreSnapshot, type TLCameraOptions } from 'tldraw'
import 'tldraw/tldraw.css'
// import snapshot from '../drawing.json'

const licenseKey = import.meta.env.VITE_TLDRAW_LICENSE_KEY 

// env var (set in Vercel dashboard):
const SNAPSHOT_URL = import.meta.env.VITE_SNAPSHOT_URL 
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
      <Tldraw 
        licenseKey={licenseKey} 
        snapshot={snapshot} 
        cameraOptions={cameraOptions} 
        hideUi
        onMount={(editor: Editor) => {
          // Check if a shape at the given point has a URL
          const hasUrlAtPoint = (shape: any): boolean => {
            if (!shape) return false
            
            // Check various possible locations for URL
            // In tldraw, URL shapes might store the URL in different places depending on shape type
            const url = shape?.props?.url || shape?.url || shape?.meta?.url
            return !!(url && typeof url === 'string' && url.length > 0)
          }

          // Track drag state
          let isDragging = false
          let mouseDownPoint: { x: number; y: number } | null = null
          const DRAG_THRESHOLD = 5 // pixels

          // Handle mouse down
          const handleMouseDown = () => {
            isDragging = false
            mouseDownPoint = {
              x: editor.inputs.currentPagePoint.x,
              y: editor.inputs.currentPagePoint.y
            }
          }

          // Handle mouse move to detect dragging
          const handleMouseMove = () => {
            if (mouseDownPoint) {
              const currentPoint = editor.inputs.currentPagePoint
              const distance = Math.sqrt(
                Math.pow(currentPoint.x - mouseDownPoint.x, 2) + 
                Math.pow(currentPoint.y - mouseDownPoint.y, 2)
              )
              
              if (distance > DRAG_THRESHOLD) {
                isDragging = true
              }
            }
            
            // Update cursor based on hover
            const hoverPoint = editor.inputs.currentPagePoint
            const hitShape = editor.getShapeAtPoint(hoverPoint)
            const container = editor.getContainer()
            
            if (hitShape && hasUrlAtPoint(hitShape)) {
              container.setAttribute('data-clickable', 'true')
            } else {
              container.removeAttribute('data-clickable')
            }
          }

          // Handle mouse up / click
          const handleMouseUp = (e: MouseEvent) => {
            if (isDragging) {
              mouseDownPoint = null
              return
            }

            // Get the shape at the click point
            const clickPoint = editor.inputs.currentPagePoint
            const hitShape = editor.getShapeAtPoint(clickPoint)
            
            if (hitShape && hasUrlAtPoint(hitShape)) {
              // Prevent default behavior and navigate to URL
              e.preventDefault()
              e.stopPropagation()
              const shape = hitShape as any
              const url = shape?.props?.url || shape?.url
              window.open(url, '_blank')
            }

            mouseDownPoint = null
          }

          // Add event listeners to the editor container
          const container = editor.getContainer()
          container.addEventListener('mousedown', handleMouseDown, true)
          container.addEventListener('mousemove', handleMouseMove, true)
          container.addEventListener('mouseup', handleMouseUp, true)
          
          // Cleanup on unmount
          return () => {
            container.removeEventListener('mousedown', handleMouseDown, true)
            container.removeEventListener('mousemove', handleMouseMove, true)
            container.removeEventListener('mouseup', handleMouseUp, true)
          }
        }}
      />
    </div>
  )
}
