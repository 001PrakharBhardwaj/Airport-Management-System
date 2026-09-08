import OverviewMetrics from '../components/OverviewMetrics'

export default function ReportsPage() {
  return (
    <section className="data-page" aria-labelledby="page-title">
      <p className="eyebrow">AEROVAULT</p>
      <h1 id="page-title">Reports</h1>
      <p className="page-summary">A concise, live operational view calculated directly from AEROVAULT data.</p>
      <OverviewMetrics />
    </section>
  )
}
