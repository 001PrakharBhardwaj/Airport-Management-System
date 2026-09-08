import CrudPage from '../components/CrudPage'

const cabinClasses = ['economy', 'premium_economy', 'business', 'first']
const reservationStatuses = ['reserved', 'confirmed', 'checked_in', 'cancelled']

function fields({ passengers = [], flights = [] }) {
  return [
    { name: 'booking_reference', label: 'Booking reference', required: true, maxLength: 8 },
    {
      name: 'passenger_id',
      label: 'Passenger',
      type: 'select',
      valueType: 'number',
      required: true,
      options: passengers.map((passenger) => ({ value: passenger.id, label: `${passenger.first_name} ${passenger.last_name}` })),
    },
    {
      name: 'flight_id',
      label: 'Flight',
      type: 'select',
      valueType: 'number',
      required: true,
      options: flights.map((flight) => ({ value: flight.id, label: `${flight.flight_number} — ${flight.departure_airport} to ${flight.arrival_airport}` })),
    },
    { name: 'seat_number', label: 'Seat number', maxLength: 8 },
    { name: 'cabin_class', label: 'Cabin class', type: 'select', options: cabinClasses.map((value) => ({ value, label: value.replace('_', ' ') })), defaultValue: 'economy' },
    { name: 'status', label: 'Status', type: 'select', options: reservationStatuses.map((value) => ({ value, label: value.replace('_', ' ') })), defaultValue: 'reserved' },
    { name: 'fare_amount', label: 'Fare amount', type: 'number', required: true, min: 0.01, step: '0.01' },
    { name: 'currency', label: 'Currency', maxLength: 3, defaultValue: 'INR' },
  ]
}

const columns = [
  { label: 'Reference', key: 'booking_reference' },
  { label: 'Passenger', render: (item) => `${item.passenger_first_name} ${item.passenger_last_name}` },
  { label: 'Flight', key: 'flight_number' },
  { label: 'Seat', key: 'seat_number' },
  { label: 'Status', key: 'status' },
  { label: 'Fare', render: (item) => `${item.currency} ${item.fare_amount}` },
]

export default function ReservationsPage() {
  return (
    <CrudPage
      title="Reservations"
      description="Reservations linked directly to passengers and flights in the AEROVAULT database."
      endpoint="/reservations"
      fields={fields}
      columns={columns}
      dependencies={[
        { key: 'passengers', endpoint: '/passengers' },
        { key: 'flights', endpoint: '/flights' },
      ]}
    />
  )
}
