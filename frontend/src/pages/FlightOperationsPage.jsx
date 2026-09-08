import CrudPage from '../components/CrudPage'

const fields = [
  { name: 'terminal', label: 'Terminal', maxLength: 10 },
  { name: 'gate', label: 'Gate', maxLength: 10 },
  { name: 'actual_departure', label: 'Actual departure', type: 'datetime-local' },
  { name: 'actual_arrival', label: 'Actual arrival', type: 'datetime-local' },
  { name: 'delay_minutes', label: 'Delay minutes', type: 'number', min: 0 },
  { name: 'notes', label: 'Notes', type: 'textarea', maxLength: 500 },
]

const columns = [
  { label: 'Flight', key: 'flight_number' },
  { label: 'Terminal', key: 'terminal' },
  { label: 'Gate', key: 'gate' },
  { label: 'Delay', render: (item) => `${item.delay_minutes} min` },
  { label: 'Status', key: 'flight_status' },
]

export default function FlightOperationsPage() {
  return (
    <CrudPage
      title="Flight operations"
      description="Live operational details linked to existing AEROVAULT flights."
      endpoint="/flight-operations"
      fields={fields}
      columns={columns}
      allowCreate={false}
      allowDelete={false}
    />
  )
}
