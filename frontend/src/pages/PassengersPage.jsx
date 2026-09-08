import CrudPage from '../components/CrudPage'

const fields = [
  { name: 'first_name', label: 'First name', required: true, maxLength: 80 },
  { name: 'last_name', label: 'Last name', required: true, maxLength: 80 },
  { name: 'email', label: 'Email', type: 'email', maxLength: 255 },
  { name: 'phone', label: 'Phone', type: 'tel', maxLength: 30 },
  { name: 'date_of_birth', label: 'Date of birth', type: 'date' },
  { name: 'passport_number', label: 'Passport number', maxLength: 50 },
]

const columns = [
  { label: 'Name', render: (item) => `${item.first_name} ${item.last_name}` },
  { label: 'Email', key: 'email' },
  { label: 'Phone', key: 'phone' },
  { label: 'Passport', key: 'passport_number' },
]

export default function PassengersPage() {
  return <CrudPage title="Passengers" description="Passenger records connected to the live AEROVAULT database." endpoint="/passengers" fields={fields} columns={columns} />
}
