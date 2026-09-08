import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Brand from '../components/Brand'
import PrimaryNav from '../components/PrimaryNav'

export default function AppLayout() {
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let frame

    const updateHeader = () => {
      frame = window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 12)
      })
    }

    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateHeader)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="header-bar">
          <Brand />
          <PrimaryNav />
        </div>
      </header>
      <main className="page-content page-enter" id="main-content" key={location.pathname}>
        <Outlet />
      </main>
    </div>
  )
}
