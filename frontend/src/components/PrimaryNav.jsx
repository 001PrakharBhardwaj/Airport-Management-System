import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navigationItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/passengers', label: 'Passengers' },
  { to: '/reservations', label: 'Reservations' },
  { to: '/flights', label: 'Flights' },
  { to: '/services', label: 'Services' },
  { to: '/reports', label: 'Reports' },
]

export default function PrimaryNav() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('is-nav-open', isOpen)
    return () => document.body.classList.remove('is-nav-open')
  }, [isOpen])

  return (
    <div className="navigation-shell">
      <button
        aria-controls="primary-navigation"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        className={`nav-toggle ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span />
        <span />
      </button>
      <nav
        className={`primary-nav ${isOpen ? 'is-open' : ''}`}
        id="primary-navigation"
        aria-label="Primary navigation"
      >
        {navigationItems.map(({ to, label, end }) => (
          <NavLink end={end} key={to} to={to} onClick={() => setIsOpen(false)}>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
