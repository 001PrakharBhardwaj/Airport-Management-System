import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api'
import StatusBadge from './StatusBadge'

function formatTime(value) {
  if (!value) return 'Pending'
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

export default function FlightOperationsPreview() {
  const [operations, setOperations] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    apiRequest('/flight-operations')
      .then((data) => {
        if (active) setOperations(data)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })

    return () => {
      active = false
    }
  }, [])

  if (error) {
    return <p className="dashboard-state dashboard-state-error">Unable to load flight operations. {error}</p>
  }

  if (!operations) {
    return <p className="dashboard-state">Loading flight operations…</p>
  }

  if (operations.length === 0) {
    return (
      <div className="operations-empty">
        <span className="empty-route">No active board</span>
        <p>No flight operations are recorded yet.</p>
        <span>Departures, gates, and delay information will appear here as operations are added.</span>
      </div>
    )
  }

  return (
    <div className="ops-table-wrap">
      <table className="ops-table">
        <thead>
          <tr>
            <th>Flight</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>Time</th>
            <th>Position</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {operations.slice(0, 6).map((operation) => (
            <tr key={operation.id}>
              <td className="ops-flight" data-label="Flight">{operation.flight_number}</td>
              <td className="ops-airports" data-label="Origin">{operation.departure_airport}</td>
              <td className="ops-airports" data-label="Destination">{operation.arrival_airport}</td>
              <td data-label="Time">
                <span className="ops-meta">
                  <strong>{formatTime(operation.actual_departure || operation.scheduled_departure)}</strong>
                  <small>{operation.delay_minutes ? `${operation.delay_minutes} min delay` : 'On time'}</small>
                </span>
              </td>
              <td data-label="Position">
                {[operation.terminal, operation.gate].filter(Boolean).join(' / ') || '—'}
              </td>
              <td data-label="Status">
                <StatusBadge status={operation.flight_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
