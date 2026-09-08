import pool from '../config/db.js'
import {
  FLIGHT_STATUSES,
  airportCode,
  createHttpError,
  dateTimeValue,
  enumValue,
  getId,
  hasField,
  nonNegativeInteger,
  requiredString,
} from '../utils/validation.js'

const flightFields = [
  'flight_number',
  'departure_airport',
  'arrival_airport',
  'scheduled_departure',
  'scheduled_arrival',
  'status',
  'capacity',
]

function flightValues(body, required) {
  const values = {}

  if (required || hasField(body, 'flight_number')) values.flight_number = requiredString(body.flight_number, 'flight_number', 16)
  if (required || hasField(body, 'departure_airport')) values.departure_airport = airportCode(body.departure_airport, 'departure_airport')
  if (required || hasField(body, 'arrival_airport')) values.arrival_airport = airportCode(body.arrival_airport, 'arrival_airport')
  if (required || hasField(body, 'scheduled_departure')) values.scheduled_departure = dateTimeValue(body.scheduled_departure, 'scheduled_departure')
  if (required || hasField(body, 'scheduled_arrival')) values.scheduled_arrival = dateTimeValue(body.scheduled_arrival, 'scheduled_arrival')
  if (hasField(body, 'status')) values.status = enumValue(body.status, 'status', FLIGHT_STATUSES)
  if (required || hasField(body, 'capacity')) {
    values.capacity = nonNegativeInteger(body.capacity, 'capacity')
    if (values.capacity < 1 || values.capacity > 65535) throw createHttpError(400, 'capacity must be between 1 and 65535')
  }

  return values
}

function validateSchedule(departure, arrival) {
  if (new Date(arrival) <= new Date(departure)) {
    throw createHttpError(400, 'scheduled_arrival must be after scheduled_departure')
  }
}

export async function listFlights(request, response) {
  const clauses = []
  const parameters = []

  if (request.query.status !== undefined) {
    clauses.push('status = ?')
    parameters.push(enumValue(request.query.status, 'status', FLIGHT_STATUSES))
  }
  if (request.query.departure_airport !== undefined) {
    clauses.push('departure_airport = ?')
    parameters.push(airportCode(request.query.departure_airport, 'departure_airport'))
  }
  if (request.query.arrival_airport !== undefined) {
    clauses.push('arrival_airport = ?')
    parameters.push(airportCode(request.query.arrival_airport, 'arrival_airport'))
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const [rows] = await pool.query(
    `SELECT * FROM flights ${where} ORDER BY scheduled_departure ASC, id ASC`,
    parameters,
  )

  response.json({ data: rows })
}

export async function getFlight(request, response) {
  const id = getId(request.params.id, 'Flight ID')
  const [rows] = await pool.query('SELECT * FROM flights WHERE id = ?', [id])

  if (!rows.length) throw createHttpError(404, 'Flight not found')

  response.json({ data: rows[0] })
}

export async function createFlight(request, response) {
  const values = flightValues(request.body, true)
  validateSchedule(values.scheduled_departure, values.scheduled_arrival)
  const columns = Object.keys(values)
  const [result] = await pool.query(
    `INSERT INTO flights (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    columns.map((column) => values[column]),
  )
  const [rows] = await pool.query('SELECT * FROM flights WHERE id = ?', [result.insertId])

  response.status(201).json({ data: rows[0] })
}

export async function updateFlight(request, response) {
  const id = getId(request.params.id, 'Flight ID')
  const [existingRows] = await pool.query('SELECT * FROM flights WHERE id = ?', [id])

  if (!existingRows.length) throw createHttpError(404, 'Flight not found')

  const values = flightValues(request.body, false)
  const columns = Object.keys(values).filter((column) => flightFields.includes(column))

  if (!columns.length) throw createHttpError(400, 'No updatable flight fields provided')

  validateSchedule(
    values.scheduled_departure || existingRows[0].scheduled_departure,
    values.scheduled_arrival || existingRows[0].scheduled_arrival,
  )

  await pool.query(
    `UPDATE flights SET ${columns.map((column) => `${column} = ?`).join(', ')} WHERE id = ?`,
    [...columns.map((column) => values[column]), id],
  )
  const [rows] = await pool.query('SELECT * FROM flights WHERE id = ?', [id])

  response.json({ data: rows[0] })
}

export async function deleteFlight(request, response) {
  const id = getId(request.params.id, 'Flight ID')
  const [result] = await pool.query('DELETE FROM flights WHERE id = ?', [id])

  if (!result.affectedRows) throw createHttpError(404, 'Flight not found')

  response.status(204).send()
}
