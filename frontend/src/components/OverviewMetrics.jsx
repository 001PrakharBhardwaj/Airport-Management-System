import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api'

const metrics = [
  ['totalPassengers', 'Passengers'],
  ['totalFlights', 'Flights'],
  ['scheduledFlights', 'Scheduled flights'],
  ['delayedFlights', 'Delayed flights'],
  ['cancelledFlights', 'Cancelled flights'],
  ['totalReservations', 'Reservations'],
  ['confirmedReservations', 'Confirmed reservations'],
  ['totalServices', 'Services'],
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
    <div className="metric-grid" aria-label="Operational overview">
      {metrics.map(([key, label]) => (
        <article className="metric" key={key}>
          <p>{label}</p>
          <strong>{overview[key] ?? 0}</strong>
        </article>
      ))}
    </div>
  )
}
