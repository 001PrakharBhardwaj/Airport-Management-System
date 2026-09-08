import CrudPage from '../components/CrudPage'

const flightStatuses = ['scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled']
const statusOptions = flightStatuses.map((status) => ({ value: status, label: status.replace('_', ' ') }))

const fields = [
  { name: 'flight_number', label: 'Flight number', required: true, maxLength: 16 },
  { name: 'departure_airport', label: 'Departure airport', required: true, maxLength: 3 },
  { name: 'arrival_airport', label: 'Arrival airport', required: true, maxLength: 3 },
  { name: 'scheduled_departure', label: 'Scheduled departure', type: 'datetime-local', required: true },
  { name: 'scheduled_arrival', label: 'Scheduled arrival', type: 'datetime-local', required: true },
  { name: 'status', label: 'Status', type: 'select', options: statusOptions, defaultValue: 'scheduled' },
  { name: 'capacity', label: 'Capacity', type: 'number', required: true, min: 1, max: 65535 },
]

const columns = [
  { label: 'Flight', key: 'flight_number' },
  { label: 'Route', render: (item) => `${item.departure_airport} → ${item.arrival_airport}` },
  { label: 'Departure', render: (item) => new Date(item.scheduled_departure).toLocaleString() },
  { label: 'Status', key: 'status' },
  { label: 'Capacity', key: 'capacity' },
]

export default function FlightsPage() {
  return (
    <CrudPage
      title="Flights"
      description="Flight schedules and operational status from the live AEROVAULT database."
      endpoint="/flights"
      fields={fields}
      columns={columns}
      filters={[{ name: 'status', label: 'Status', options: statusOptions }]}
    />
  )
}
