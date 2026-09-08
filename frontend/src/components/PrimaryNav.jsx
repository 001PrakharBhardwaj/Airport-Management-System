import { NavLink } from 'react-router-dom'

const navigationItems = [
  { to: '/', label: 'Overview', end: true },
  { to: '/passengers', label: 'Passengers' },
  { to: '/reservations', label: 'Reservations' },
  { to: '/flights', label: 'Flights' },
  { to: '/services', label: 'Services' },
  { to: '/flight-operations', label: 'Operations' },
  { to: '/reports', label: 'Reports' },
]

export default function PrimaryNav() {
  return (
    <nav className="primary-nav" aria-label="Primary navigation">
      {navigationItems.map(({ to, label, end }) => (
        <NavLink end={end} key={to} to={to}>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
