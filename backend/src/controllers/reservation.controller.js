import pool from '../config/db.js'
import {
  CABIN_CLASSES,
  RESERVATION_STATUSES,
  createHttpError,
  currencyCode,
  enumValue,
  getId,
  hasField,
  nonNegativeInteger,
  positiveNumber,
  requiredString,
} from '../utils/validation.js'

const reservationFields = [
  'booking_reference',
  'passenger_id',
  'flight_id',
  'seat_number',
  'cabin_class',
  'status',
  'fare_amount',
  'currency',
]

const reservationSelect = `
  SELECT r.*, p.first_name AS passenger_first_name, p.last_name AS passenger_last_name,
         f.flight_number, f.departure_airport, f.arrival_airport, f.scheduled_departure
  FROM reservations r
  INNER JOIN passengers p ON p.id = r.passenger_id
  INNER JOIN flights f ON f.id = r.flight_id
`

function reservationValues(body, required) {
  const values = {}

  if (required || hasField(body, 'booking_reference')) {
    values.booking_reference = requiredString(body.booking_reference, 'booking_reference', 8)
    if (values.booking_reference.length !== 8) throw createHttpError(400, 'booking_reference must be exactly 8 characters')
  }
  if (required || hasField(body, 'passenger_id')) values.passenger_id = getId(body.passenger_id, 'passenger_id')
  if (required || hasField(body, 'flight_id')) values.flight_id = getId(body.flight_id, 'flight_id')
  if (hasField(body, 'seat_number')) {
    values.seat_number = body.seat_number === null || body.seat_number === ''
      ? null
      : requiredString(body.seat_number, 'seat_number', 8)
  }
  if (hasField(body, 'cabin_class')) values.cabin_class = enumValue(body.cabin_class, 'cabin_class', CABIN_CLASSES)
  if (hasField(body, 'status')) values.status = enumValue(body.status, 'status', RESERVATION_STATUSES)
  if (required || hasField(body, 'fare_amount')) values.fare_amount = positiveNumber(body.fare_amount, 'fare_amount')
  if (hasField(body, 'currency')) values.currency = currencyCode(body.currency)

  return values
}

async function ensurePassengerAndFlight(connection, passengerId, flightId) {
  if (passengerId) {
    const [passengers] = await connection.query('SELECT id FROM passengers WHERE id = ?', [passengerId])
    if (!passengers.length) throw createHttpError(400, 'Referenced passenger not found')
  }

  if (flightId) {
    const [flights] = await connection.query('SELECT id FROM flights WHERE id = ?', [flightId])
    if (!flights.length) throw createHttpError(400, 'Referenced flight not found')
  }
}

export async function listReservations(_request, response) {
  const [rows] = await pool.query(`${reservationSelect} ORDER BY r.booked_at DESC, r.id DESC`)
  response.json({ data: rows })
}

export async function getReservation(request, response) {
  const id = getId(request.params.id, 'Reservation ID')
  const [rows] = await pool.query(`${reservationSelect} WHERE r.id = ?`, [id])

  if (!rows.length) throw createHttpError(404, 'Reservation not found')

  response.json({ data: rows[0] })
}

export async function createReservation(request, response) {
  const values = reservationValues(request.body, true)
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    await ensurePassengerAndFlight(connection, values.passenger_id, values.flight_id)
    const columns = Object.keys(values)
    const [result] = await connection.query(
      `INSERT INTO reservations (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      columns.map((column) => values[column]),
    )
    await connection.commit()
    const [rows] = await pool.query(`${reservationSelect} WHERE r.id = ?`, [result.insertId])
    response.status(201).json({ data: rows[0] })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export async function updateReservation(request, response) {
  const id = getId(request.params.id, 'Reservation ID')
  const values = reservationValues(request.body, false)
  const columns = Object.keys(values).filter((column) => reservationFields.includes(column))

  if (!columns.length) throw createHttpError(400, 'No updatable reservation fields provided')

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const [existingRows] = await connection.query('SELECT * FROM reservations WHERE id = ?', [id])
    if (!existingRows.length) throw createHttpError(404, 'Reservation not found')

    await ensurePassengerAndFlight(
      connection,
      values.passenger_id || existingRows[0].passenger_id,
      values.flight_id || existingRows[0].flight_id,
    )
    await connection.query(
      `UPDATE reservations SET ${columns.map((column) => `${column} = ?`).join(', ')} WHERE id = ?`,
      [...columns.map((column) => values[column]), id],
    )
    await connection.commit()
    const [rows] = await pool.query(`${reservationSelect} WHERE r.id = ?`, [id])
    response.json({ data: rows[0] })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export async function deleteReservation(request, response) {
  const id = getId(request.params.id, 'Reservation ID')
  const [result] = await pool.query('DELETE FROM reservations WHERE id = ?', [id])

  if (!result.affectedRows) throw createHttpError(404, 'Reservation not found')

  response.status(204).send()
}

export async function listReservationServices(request, response) {
  const reservationId = getId(request.params.reservationId, 'Reservation ID')
  const [reservations] = await pool.query('SELECT id FROM reservations WHERE id = ?', [reservationId])
  if (!reservations.length) throw createHttpError(404, 'Reservation not found')

  const [rows] = await pool.query(
    `SELECT rs.reservation_id, rs.service_id, rs.quantity, rs.unit_price, rs.created_at,
            s.service_code, s.name, s.description, s.service_type, s.currency
     FROM reservation_services rs
     INNER JOIN services s ON s.id = rs.service_id
     WHERE rs.reservation_id = ?
     ORDER BY s.name ASC`,
    [reservationId],
  )

  response.json({ data: rows })
}

export async function addReservationService(request, response) {
  const reservationId = getId(request.params.reservationId, 'Reservation ID')
  const serviceId = getId(request.body.service_id, 'service_id')
  const quantity = hasField(request.body, 'quantity')
    ? nonNegativeInteger(request.body.quantity, 'quantity')
    : 1
  if (quantity < 1 || quantity > 65535) throw createHttpError(400, 'quantity must be between 1 and 65535')

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const [reservations] = await connection.query('SELECT id FROM reservations WHERE id = ?', [reservationId])
    if (!reservations.length) throw createHttpError(404, 'Reservation not found')

    const [services] = await connection.query('SELECT id, price FROM services WHERE id = ?', [serviceId])
    if (!services.length) throw createHttpError(404, 'Service not found')

    const unitPrice = hasField(request.body, 'unit_price')
      ? positiveNumber(request.body.unit_price, 'unit_price')
      : services[0].price
    await connection.query(
      'INSERT INTO reservation_services (reservation_id, service_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
      [reservationId, serviceId, quantity, unitPrice],
    )
    await connection.commit()
    const [rows] = await pool.query(
      `SELECT rs.reservation_id, rs.service_id, rs.quantity, rs.unit_price, rs.created_at,
              s.service_code, s.name, s.description, s.service_type, s.currency
       FROM reservation_services rs
       INNER JOIN services s ON s.id = rs.service_id
       WHERE rs.reservation_id = ? AND rs.service_id = ?`,
      [reservationId, serviceId],
    )
    response.status(201).json({ data: rows[0] })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export async function deleteReservationService(request, response) {
  const reservationId = getId(request.params.reservationId, 'Reservation ID')
  const serviceId = getId(request.params.serviceId, 'Service ID')
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const [reservations] = await connection.query('SELECT id FROM reservations WHERE id = ?', [reservationId])
    if (!reservations.length) throw createHttpError(404, 'Reservation not found')
    const [services] = await connection.query('SELECT id FROM services WHERE id = ?', [serviceId])
    if (!services.length) throw createHttpError(404, 'Service not found')

    const [result] = await connection.query(
      'DELETE FROM reservation_services WHERE reservation_id = ? AND service_id = ?',
      [reservationId, serviceId],
    )
    if (!result.affectedRows) throw createHttpError(404, 'Reservation service not found')
    await connection.commit()
    response.status(204).send()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
