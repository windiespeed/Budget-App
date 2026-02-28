import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

const MIN_WIDTH = 160
const MAX_WIDTH = 360
const DEFAULT_WIDTH = 240

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH)

  const startResize = (e) => {
    e.preventDefault()
    const onMove = (e) => {
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX))
      setSidebarWidth(newWidth)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex flex-shrink-0" style={{ width: sidebarWidth }}>
        <Sidebar />
      </div>

      {/* Resize handle — desktop only */}
      <div
        className="hidden md:block w-1 flex-shrink-0 cursor-col-resize bg-slate-800 hover:bg-indigo-500 active:bg-indigo-400 transition-colors"
        onMouseDown={startResize}
      />

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative w-64 flex-shrink-0">
            <Sidebar onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuOpen={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
