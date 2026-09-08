import OverviewMetrics from '../components/OverviewMetrics'

export default function HomePage() {
  return (
    <section className="intro" aria-labelledby="page-title">
      <p className="eyebrow">Flight management system</p>
      <h1 id="page-title">A calmer view of every journey.</h1>
      <p className="page-summary">
        AEROVAULT is being prepared as a modern home for flight operations,
        passenger care, and service management.
      </p>
      <OverviewMetrics />
    </section>
  )
}
