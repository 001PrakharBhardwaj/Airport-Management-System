import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../services/api'

const EMPTY_DEPENDENCIES = []

function toInputValue(value, field) {
  if (value === null || value === undefined) return field.type === 'checkbox' ? false : ''
  if (field.type === 'datetime-local') return String(value).replace(' ', 'T').slice(0, 16)
  return value
}

function initialValues(fields, record = null) {
  return fields.reduce((values, field) => {
    values[field.name] = record ? toInputValue(record[field.name], field) : (field.defaultValue ?? (field.type === 'checkbox' ? false : ''))
    return values
  }, {})
}

function payloadFromValues(values, fields) {
  return fields.reduce((payload, field) => {
    let value = values[field.name]

    if (field.type === 'number' && value !== '') value = Number(value)
    if (field.valueType === 'number' && value !== '') value = Number(value)
    if (!field.required && value === '') value = null

    payload[field.name] = value
    return payload
  }, {})
}

export default function CrudPage({
  title,
  description,
  endpoint,
  fields,
  columns,
  filters = [],
  dependencies = EMPTY_DEPENDENCIES,
  allowCreate = true,
  allowDelete = true,
}) {
  const [items, setItems] = useState([])
  const [relatedData, setRelatedData] = useState({})
  const [selected, setSelected] = useState(null)
  const [values, setValues] = useState({})
  const [filterValues, setFilterValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const resolvedFields = useMemo(
    () => (typeof fields === 'function' ? fields(relatedData) : fields),
    [fields, relatedData],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const search = new URLSearchParams(
        Object.entries(filterValues).filter(([, value]) => value !== ''),
      )
      const collectionPath = search.size ? `${endpoint}?${search}` : endpoint
      const requests = [apiRequest(collectionPath), ...dependencies.map((dependency) => apiRequest(dependency.endpoint))]
      const [collection, ...relatedCollections] = await Promise.all(requests)
      setItems(collection)
      setRelatedData(
        dependencies.reduce((data, dependency, index) => {
          data[dependency.key] = relatedCollections[index]
          return data
        }, {}),
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [dependencies, endpoint, filterValues])

  useEffect(() => {
    void load()
  }, [load])

  function beginCreate() {
    setSelected(null)
    setValues(initialValues(resolvedFields))
    setError('')
  }

  async function beginEdit(item) {
    setError('')

    try {
      const record = await apiRequest(`${endpoint}/${item.id}`)
      setSelected(record)
      setValues(initialValues(resolvedFields, record))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const method = selected ? 'PUT' : 'POST'
      await apiRequest(selected ? `${endpoint}/${selected.id}` : endpoint, {
        method,
        body: JSON.stringify(payloadFromValues(values, resolvedFields)),
      })
      setSelected(null)
      setValues({})
      await load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete this ${title.slice(0, -1).toLowerCase()}?`)) return

    setError('')
    try {
      await apiRequest(`${endpoint}/${item.id}`, { method: 'DELETE' })
      await load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <section className="data-page" aria-labelledby="page-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AEROVAULT</p>
          <h1 id="page-title">{title}</h1>
          <p className="page-summary">{description}</p>
        </div>
        {allowCreate && <button className="button button-primary" onClick={beginCreate}>Add {title.slice(0, -1)}</button>}
      </div>

      {filters.length > 0 && (
        <div className="filters" aria-label={`${title} filters`}>
          {filters.map((filter) => (
            <label key={filter.name}>
              {filter.label}
              <select
                value={filterValues[filter.name] ?? ''}
                onChange={(event) => setFilterValues((current) => ({ ...current, [filter.name]: event.target.value }))}
              >
                <option value="">All</option>
                {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          ))}
        </div>
      )}

      {error && <p className="api-state api-state-error">{error}</p>}

      {(allowCreate || selected) && (
        <form className="resource-form" onSubmit={submit}>
          <h2>{selected ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}</h2>
          <div className="form-grid">
            {resolvedFields.map((field) => (
              <label className={field.type === 'textarea' ? 'field-wide' : ''} key={field.name}>
                {field.label}
                {field.type === 'select' ? (
                  <select
                    required={field.required}
                    value={values[field.name] ?? ''}
                    onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  >
                    {field.required && <option value="" disabled>Select {field.label}</option>}
                    {!field.required && <option value="">Not set</option>}
                    {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={values[field.name] ?? ''}
                    onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                    maxLength={field.maxLength}
                  />
                ) : field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={Boolean(values[field.name])}
                    onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    maxLength={field.maxLength}
                    value={values[field.name] ?? ''}
                    onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="form-actions">
            <button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : selected ? 'Save changes' : `Create ${title.slice(0, -1)}`}</button>
            {selected && <button className="button" type="button" onClick={() => setSelected(null)}>Cancel</button>}
          </div>
        </form>
      )}

      {loading ? (
        <p className="api-state">Loading {title.toLowerCase()}…</p>
      ) : items.length === 0 ? (
        <p className="api-state">No {title.toLowerCase()} yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column) => <th key={column.label}>{column.label}</th>)}
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {columns.map((column) => <td key={column.label}>{column.render ? column.render(item) : item[column.key] ?? '—'}</td>)}
                  <td className="table-actions">
                    <button className="button button-small" onClick={() => beginEdit(item)}>Edit</button>
                    {allowDelete && <button className="button button-small button-danger" onClick={() => remove(item)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
