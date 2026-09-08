import CrudPage from '../components/CrudPage'

const serviceTypes = ['baggage', 'meal', 'lounge', 'onboard', 'other']
const typeOptions = serviceTypes.map((serviceType) => ({ value: serviceType, label: serviceType }))

const fields = [
  { name: 'service_code', label: 'Service code', required: true, maxLength: 32 },
  { name: 'name', label: 'Name', required: true, maxLength: 100 },
  { name: 'description', label: 'Description', type: 'textarea', maxLength: 500 },
  { name: 'service_type', label: 'Type', type: 'select', options: typeOptions, defaultValue: 'other' },
  { name: 'price', label: 'Price', type: 'number', required: true, min: 0.01, step: '0.01' },
  { name: 'currency', label: 'Currency', maxLength: 3, defaultValue: 'INR' },
  { name: 'is_active', label: 'Active service', type: 'checkbox', defaultValue: true },
]

const columns = [
  { label: 'Code', key: 'service_code' },
  { label: 'Name', key: 'name' },
  { label: 'Type', key: 'service_type' },
  { label: 'Price', render: (item) => `${item.currency} ${item.price}` },
  { label: 'Active', render: (item) => item.is_active ? 'Yes' : 'No' },
]

export default function ServicesPage() {
  return (
    <CrudPage
      title="Services"
      description="Ancillary services and availability from the live AEROVAULT database."
      endpoint="/services"
      fields={fields}
      columns={columns}
      filters={[{ name: 'service_type', label: 'Type', options: typeOptions }]}
    />
  )
}
