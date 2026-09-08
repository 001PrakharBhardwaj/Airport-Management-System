import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api'

function statusCopy(value, connected, unavailable) {
  if (value === 'checking') return ['Checking', 'Reading live system health.']
  if (value === 'connected') return [connected, 'Responding from the current environment.']
  return [unavailable, 'The latest health check did not succeed.']
}

export default function SystemStatus() {
  const [apiStatus, setApiStatus] = useState('checking')
  const [databaseStatus, setDatabaseStatus] = useState('checking')

  useEffect(() => {
    let active = true

    apiRequest('/health')
      .then(() => {
        if (active) setApiStatus('connected')
      })
      .catch(() => {
        if (active) setApiStatus('unavailable')
      })

    apiRequest('/health/database')
      .then(() => {
        if (active) setDatabaseStatus('connected')
      })
      .catch(() => {
        if (active) setDatabaseStatus('unavailable')
      })

    return () => {
      active = false
    }
  }, [])

  const systemStatus = apiStatus === 'checking' || databaseStatus === 'checking'
    ? 'checking'
    : apiStatus === 'connected' && databaseStatus === 'connected'
      ? 'connected'
      : 'unavailable'

  const items = [
    ['System status', ...statusCopy(systemStatus, 'Operational', 'Attention required')],
    ['API status', ...statusCopy(apiStatus, 'Connected', 'Unreachable')],
    ['Database status', ...statusCopy(databaseStatus, 'Connected', 'Unavailable')],
  ]

  return (
    <div className="status-panel" aria-label="System status">
      {items.map(([label, title, description]) => (
        <article className={`status-item ${title === 'Attention required' || title === 'Unreachable' || title === 'Unavailable' ? 'is-error' : ''}`} key={label}>
          <small>{label}</small>
          <strong>{title}</strong>
          <span>{description}</span>
        </article>
      ))}
    </div>
  )
}
