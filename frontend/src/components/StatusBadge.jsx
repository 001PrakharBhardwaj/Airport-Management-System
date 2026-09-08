const statusLabels = {
  scheduled: 'Scheduled', boarding: 'Boarding', departed: 'Departed', arrived: 'Arrived', delayed: 'Delayed', cancelled: 'Cancelled',
}

export default function StatusBadge({ status }) {
  const normalizedStatus = status || 'scheduled'
  return <span className={`status-badge status-${normalizedStatus}`}><span aria-hidden="true" className="status-dot" />{statusLabels[normalizedStatus] || normalizedStatus}</span>
}
