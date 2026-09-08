import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import FlightOperationsPage from './pages/FlightOperationsPage'
import FlightsPage from './pages/FlightsPage'
import HomePage from './pages/HomePage'
import PassengersPage from './pages/PassengersPage'
import PlaceholderPage from './pages/PlaceholderPage'
import ReportsPage from './pages/ReportsPage'
import ReservationsPage from './pages/ReservationsPage'
import ServicesPage from './pages/ServicesPage'

const sections = [
  { path: 'passengers', element: <PassengersPage /> },
  { path: 'reservations', element: <ReservationsPage /> },
  { path: 'flights', element: <FlightsPage /> },
  { path: 'services', element: <ServicesPage /> },
  { path: 'flight-operations', element: <FlightOperationsPage /> },
  { path: 'reports', element: <ReportsPage /> },
]

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        {sections.map((section) => (
          <Route
            key={section.path}
            path={section.path}
            element={section.element}
          />
        ))}
        <Route path="*" element={<PlaceholderPage title="Page not found" description="The page you requested does not exist." />} />
      </Route>
    </Routes>
  )
}
