import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api'
import AnimatedNumber from './AnimatedNumber'

const primaryMetrics = [
  ['totalPassengers', 'Passengers', 'Registered travellers across the system.'],
  ['totalFlights', 'Flights', 'Schedules held in the operational record.'],
  ['totalReservations', 'Reservations', 'Bookings against current inventory.'],
  ['totalServices', 'Services', 'Passenger and airside services on file.'],
]

const secondaryMetrics = [
  ['scheduledFlights', 'Scheduled'],
  ['delayedFlights', 'Delayed'],
  ['cancelledFlights', 'Cancelled'],
  ['confirmedReservations', 'Confirmed'],
  ['activeServices', 'Active services'],
]

export default function OverviewMetrics() {
  const [overview, setOverview] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    apiRequest('/reports/overview')
      .then((data) => {
        if (active) setOverview(data)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })

    return () => {
      active = false
    }
  }, [])

  if (error) {
    return <p className="api-state api-state-error">Unable to load overview. {error}</p>
  }

  if (!overview) {
    return <p className="api-state">Loading operational overview…</p>
  }

  return (
    <div aria-label="Operational overview">
      <div className="metric-board">
        {primaryMetrics.map(([key, label, description]) => (
          <article className="metric" key={key}>
            <span className="metric-label">{label}</span>
            <AnimatedNumber className="metric-value" value={overview[key] ?? 0} />
            <p className="metric-copy">{description}</p>
          </article>
        ))}
      </div>
      <div className="metric-strip">
        {secondaryMetrics.map(([key, label]) => (
          <article className="metric-chip" key={key}>
            <span>{label}</span>
            <AnimatedNumber value={overview[key] ?? 0} />
          </article>
        ))}
      </div>
    </div>
  )
}
