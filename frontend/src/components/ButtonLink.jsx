import { Link } from 'react-router-dom'

export default function ButtonLink({ children, to, variant = 'primary' }) {
  return (
    <Link className={`button button-${variant}`} to={to}>
      <span>{children}</span>
      <span aria-hidden="true" className="button-arrow">↗</span>
    </Link>
  )
}
