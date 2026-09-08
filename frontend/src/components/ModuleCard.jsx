import { Link } from 'react-router-dom'

export default function ModuleCard({ index, title, description, to }) {
  return (
    <Link className="module-card" to={to}>
      <span className="module-index-number">{String(index).padStart(2, '0')}</span>
      <span>
        <h3>{title}</h3>
        <p>{description}</p>
      </span>
      <span aria-hidden="true" className="module-arrow">→</span>
    </Link>
  )
}
