import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'

const MIN_WIDTH = 160
const MAX_WIDTH = 360
const DEFAULT_WIDTH = 240
const COLLAPSED_WIDTH = 64

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH)
  const [collapsed, setCollapsed] = useState(true)
  const [hovered, setHovered] = useState(false)

  const isExpanded = !collapsed || hovered
  const pinOpen = () => { setCollapsed(false); setHovered(false) }

  // Delay label rendering until after the width transition finishes
  const [showLabels, setShowLabels] = useState(false)
  useEffect(() => {
    if (isExpanded) {
      const t = setTimeout(() => setShowLabels(true), 180)
      return () => clearTimeout(t)
    } else {
      setShowLabels(false)
    }
  }, [isExpanded])

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
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">

      {/* Full-width header */}
      <Header onMenuOpen={() => setMenuOpen(true)} />

      {/* Middle row: sidebar + main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar — desktop only */}
        <div
          className="hidden md:flex flex-shrink-0 transition-[width] duration-200 overflow-hidden"
          style={{ width: isExpanded ? sidebarWidth : COLLAPSED_WIDTH }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={collapsed ? pinOpen : undefined}
        >
          <Sidebar collapsed={!showLabels} onToggle={() => { setCollapsed(true); setHovered(false) }} />
        </div>

        {/* Resize handle — desktop only, invisible when collapsed */}
        <div
          className={`hidden md:block w-1 flex-shrink-0 transition-colors ${
            isExpanded
              ? 'cursor-col-resize bg-slate-800 hover:bg-indigo-500 active:bg-indigo-400'
              : 'bg-transparent pointer-events-none'
          }`}
          onMouseDown={isExpanded ? startResize : undefined}
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 min-w-0">
          {children}
        </main>

      </div>

      {/* Full-width footer */}
      <Footer />

    </div>
  )
}
