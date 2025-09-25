import { Tldraw, Editor, getSnapshot } from 'tldraw'
import type { TLStoreSnapshot, TLCameraOptions } from 'tldraw'
import 'tldraw/tldraw.css'
import rawSnapshot from '../drawing.json'
import { Link } from 'react-router-dom'

// 1) Narrow the cameraOptions types
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

// 2) Cast the imported JSON to a TL snapshot
const snapshot = rawSnapshot as unknown as TLStoreSnapshot

function GetSnap() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        snapshot={snapshot}
        cameraOptions={cameraOptions}
        onMount={(editor: Editor) => {
          ;(window as any).saveDrawing = () => {
            const s = getSnapshot(editor.store)
            console.log(s)
            const blob = new Blob([JSON.stringify(s)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'drawing.json'
            a.click()
          }
        }}
        hideUi
      />
      <Link
        to="/"
        style={{
          position: 'fixed',
          top: '50vh',
          left: '20px',
          zIndex: 1000,
          padding: '10px 20px',
          backgroundColor: '#6c757d',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        👁️ View Drawing
      </Link>

      <button
        onClick={() => (window as any).saveDrawing?.()}
        style={{
          position: 'fixed',
          top: '50vh',
          right: '20px',
          zIndex: 1000,
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#0056b3'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#007bff'
        }}
      >
        💾 Save Drawing
      </button>
    </div>
  )
}

export default GetSnap
