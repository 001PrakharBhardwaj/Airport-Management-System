import pool from '../config/db.js'
import {
  createHttpError,
  dateTimeValue,
  getId,
  hasField,
  nonNegativeInteger,
  nullableString,
} from '../utils/validation.js'

const operationFields = ['terminal', 'gate', 'actual_departure', 'actual_arrival', 'delay_minutes', 'notes']

function operationValues(body) {
  const values = {}

  if (hasField(body, 'terminal')) values.terminal = nullableString(body.terminal, 'terminal', 10)
  if (hasField(body, 'gate')) values.gate = nullableString(body.gate, 'gate', 10)
  if (hasField(body, 'notes')) values.notes = nullableString(body.notes, 'notes', 500)
  if (hasField(body, 'actual_departure')) {
    values.actual_departure = body.actual_departure === null || body.actual_departure === ''
      ? null
      : dateTimeValue(body.actual_departure, 'actual_departure')
  }
  if (hasField(body, 'actual_arrival')) {
    values.actual_arrival = body.actual_arrival === null || body.actual_arrival === ''
      ? null
      : dateTimeValue(body.actual_arrival, 'actual_arrival')
  }
  if (hasField(body, 'delay_minutes')) values.delay_minutes = nonNegativeInteger(body.delay_minutes, 'delay_minutes')

  return values
}

const operationSelect = `
  SELECT fo.*, f.flight_number, f.departure_airport, f.arrival_airport, f.scheduled_departure, f.scheduled_arrival, f.status AS flight_status
  FROM flight_operations fo
  INNER JOIN flights f ON f.id = fo.flight_id
`

export async function listFlightOperations(_request, response) {
  const [rows] = await pool.query(`${operationSelect} ORDER BY f.scheduled_departure ASC, fo.id ASC`)
  response.json({ data: rows })
}

export async function getFlightOperation(request, response) {
  const id = getId(request.params.id, 'Flight operation ID')
  const [rows] = await pool.query(`${operationSelect} WHERE fo.id = ?`, [id])

  if (!rows.length) throw createHttpError(404, 'Flight operation not found')

  response.json({ data: rows[0] })
}

export async function updateFlightOperation(request, response) {
  const id = getId(request.params.id, 'Flight operation ID')
  const values = operationValues(request.body)
  const columns = Object.keys(values).filter((column) => operationFields.includes(column))

  if (!columns.length) throw createHttpError(400, 'No updatable flight operation fields provided')

  const [operations] = await pool.query('SELECT flight_id FROM flight_operations WHERE id = ?', [id])
  if (!operations.length) throw createHttpError(404, 'Flight operation not found')

  const [flights] = await pool.query('SELECT id FROM flights WHERE id = ?', [operations[0].flight_id])
  if (!flights.length) throw createHttpError(400, 'Referenced flight not found')

  await pool.query(
    `UPDATE flight_operations SET ${columns.map((column) => `${column} = ?`).join(', ')} WHERE id = ?`,
    [...columns.map((column) => values[column]), id],
  )
  const [rows] = await pool.query(`${operationSelect} WHERE fo.id = ?`, [id])

  response.json({ data: rows[0] })
}
