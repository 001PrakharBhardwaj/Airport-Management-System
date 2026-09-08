import pool from '../config/db.js'
import {
  SERVICE_TYPES,
  booleanValue,
  createHttpError,
  currencyCode,
  enumValue,
  getId,
  hasField,
  nullableString,
  positiveNumber,
  requiredString,
} from '../utils/validation.js'

const serviceFields = ['service_code', 'name', 'description', 'service_type', 'price', 'currency', 'is_active']

function serviceValues(body, required) {
  const values = {}

  if (required || hasField(body, 'service_code')) values.service_code = requiredString(body.service_code, 'service_code', 32)
  if (required || hasField(body, 'name')) values.name = requiredString(body.name, 'name', 100)
  if (hasField(body, 'description')) values.description = nullableString(body.description, 'description', 500)
  if (hasField(body, 'service_type')) values.service_type = enumValue(body.service_type, 'service_type', SERVICE_TYPES)
  if (required || hasField(body, 'price')) values.price = positiveNumber(body.price, 'price')
  if (hasField(body, 'currency')) values.currency = currencyCode(body.currency)
  if (hasField(body, 'is_active')) values.is_active = booleanValue(body.is_active, 'is_active')

  return values
}

export async function listServices(request, response) {
  const clauses = []
  const parameters = []

  if (request.query.service_type !== undefined) {
    clauses.push('service_type = ?')
    parameters.push(enumValue(request.query.service_type, 'service_type', SERVICE_TYPES))
  }
  if (request.query.is_active !== undefined) {
    clauses.push('is_active = ?')
    parameters.push(booleanValue(request.query.is_active, 'is_active'))
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const [rows] = await pool.query(`SELECT * FROM services ${where} ORDER BY name ASC, id ASC`, parameters)

  response.json({ data: rows })
}

export async function getService(request, response) {
  const id = getId(request.params.id, 'Service ID')
  const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [id])

  if (!rows.length) throw createHttpError(404, 'Service not found')

  response.json({ data: rows[0] })
}

export async function createService(request, response) {
  const values = serviceValues(request.body, true)
  const columns = Object.keys(values)
  const [result] = await pool.query(
    `INSERT INTO services (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    columns.map((column) => values[column]),
  )
  const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [result.insertId])

  response.status(201).json({ data: rows[0] })
}

export async function updateService(request, response) {
  const id = getId(request.params.id, 'Service ID')
  const values = serviceValues(request.body, false)
  const columns = Object.keys(values).filter((column) => serviceFields.includes(column))

  if (!columns.length) throw createHttpError(400, 'No updatable service fields provided')

  const [result] = await pool.query(
    `UPDATE services SET ${columns.map((column) => `${column} = ?`).join(', ')} WHERE id = ?`,
    [...columns.map((column) => values[column]), id],
  )

  if (!result.affectedRows) throw createHttpError(404, 'Service not found')

  const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [id])
  response.json({ data: rows[0] })
}

export async function deleteService(request, response) {
  const id = getId(request.params.id, 'Service ID')
  const [result] = await pool.query('DELETE FROM services WHERE id = ?', [id])

  if (!result.affectedRows) throw createHttpError(404, 'Service not found')

  response.status(204).send()
}
