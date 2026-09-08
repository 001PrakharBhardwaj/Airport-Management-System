import ButtonLink from '../components/ButtonLink'
import FlightOperationsPreview from '../components/FlightOperationsPreview'
import HeroVisual from '../components/HeroVisual'
import ModuleCard from '../components/ModuleCard'
import OverviewMetrics from '../components/OverviewMetrics'
import Reveal from '../components/Reveal'
import SectionHeader from '../components/SectionHeader'
import SystemStatus from '../components/SystemStatus'

const modules = [
  ['Passengers', 'Manage passenger records and traveller details.', '/passengers'],
  ['Reservations', 'Coordinate bookings across every journey.', '/reservations'],
  ['Flights', 'Keep schedules and flight status in view.', '/flights'],
  ['Services', 'Manage services that support the passenger experience.', '/services'],
  ['Operations', 'Monitor gates, timings, and operational updates.', '/flight-operations'],
  ['Reports', 'Read the operational picture from live system data.', '/reports'],
]

export default function HomePage() {
  return (
    <div className="dashboard" aria-labelledby="page-title">
      <Reveal className="dashboard-hero">
        <section className="hero-copy">
          <p className="eyebrow">
            <span className="live-dot" aria-hidden="true" />
            AEROVAULT / Airport Management System
          </p>
          <h1 id="page-title">
            <span className="hero-line">Everything</span>
            <span className="hero-line">within reach.</span>
          </h1>
          <p className="page-summary">
            A precise operational home for passengers, reservations, flights, and services.
          </p>
          <div className="hero-actions">
            <ButtonLink to="/flights">Explore flights</ButtonLink>
            <ButtonLink to="/reports" variant="quiet">View reports</ButtonLink>
          </div>
          <div className="hero-meta">
            <span>
              <small>Desk</small>
              <strong>Operations</strong>
            </span>
            <span>
              <small>Data</small>
              <strong>Live API</strong>
            </span>
            <span>
              <small>Scope</small>
              <strong>Airport management</strong>
            </span>
          </div>
        </section>
        <HeroVisual />
      </Reveal>

      <Reveal delay={80}>
        <section className="dashboard-section">
          <SectionHeader
            eyebrow="Operations"
            title="A live reading of the field."
            description="Counts are drawn directly from AEROVAULT. Empty values mean the record is currently clear, not a placeholder."
          />
          <OverviewMetrics />
        </section>
      </Reveal>

      <Reveal delay={120}>
        <section className="dashboard-section operations-section">
          <SectionHeader
            eyebrow="Flight operations"
            title="On the board."
            description="Origin, destination, time, and status from recorded flight operations."
            action={<ButtonLink to="/flight-operations" variant="quiet">All operations</ButtonLink>}
          />
          <FlightOperationsPreview />
        </section>
      </Reveal>

      <Reveal delay={160}>
        <section className="dashboard-section">
          <SectionHeader
            eyebrow="Modules"
            title="Move through the system."
            description="Each module remains a working part of the same operational record."
          />
          <nav className="module-index" aria-label="System modules">
            {modules.map(([title, description, to], index) => (
              <ModuleCard description={description} index={index + 1} key={title} title={title} to={to} />
            ))}
          </nav>
        </section>
      </Reveal>

      <Reveal delay={200}>
        <section className="dashboard-section">
          <SectionHeader
            eyebrow="System"
            title="Current connection."
            description="Status is taken from the AEROVAULT health endpoints, not from estimated uptime."
          />
          <SystemStatus />
        </section>
      </Reveal>
    </div>
  )
}
