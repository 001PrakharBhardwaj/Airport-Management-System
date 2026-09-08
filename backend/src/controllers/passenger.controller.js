import pool from '../config/db.js'
import {
  createHttpError,
  dateValue,
  getId,
  getPagination,
  hasField,
  nullableString,
  requiredString,
} from '../utils/validation.js'

const passengerFields = ['first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'passport_number']

function passengerValues(body, requireNames) {
  const values = {}

  if (requireNames || hasField(body, 'first_name')) {
    values.first_name = requiredString(body.first_name, 'first_name', 80)
  }
  if (requireNames || hasField(body, 'last_name')) {
    values.last_name = requiredString(body.last_name, 'last_name', 80)
  }
  if (hasField(body, 'email')) values.email = nullableString(body.email, 'email', 255)
  if (hasField(body, 'phone')) values.phone = nullableString(body.phone, 'phone', 30)
  if (hasField(body, 'passport_number')) {
    values.passport_number = nullableString(body.passport_number, 'passport_number', 50)
  }
  if (hasField(body, 'date_of_birth')) {
    values.date_of_birth = body.date_of_birth === null || body.date_of_birth === ''
      ? null
      : dateValue(body.date_of_birth, 'date_of_birth')
  }

  return values
}

export async function listPassengers(request, response) {
  const { limit, offset } = getPagination(request.query)
  const search = typeof request.query.search === 'string' ? request.query.search.trim() : ''
  const clauses = []
  const parameters = []

  if (search) {
    const term = `%${search}%`
    clauses.push('(CONCAT(first_name, \' \', last_name) LIKE ? OR email LIKE ? OR passport_number LIKE ?)')
    parameters.push(term, term, term)
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const [rows] = await pool.query(
    `SELECT * FROM passengers ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
    [...parameters, limit, offset],
  )

  response.json({ data: rows })
}

export async function getPassenger(request, response) {
  const id = getId(request.params.id, 'Passenger ID')
  const [rows] = await pool.query('SELECT * FROM passengers WHERE id = ?', [id])

  if (!rows.length) throw createHttpError(404, 'Passenger not found')

  response.json({ data: rows[0] })
}

export async function createPassenger(request, response) {
  const values = passengerValues(request.body, true)
  const columns = Object.keys(values)
  const [result] = await pool.query(
    `INSERT INTO passengers (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    columns.map((column) => values[column]),
  )
  const [rows] = await pool.query('SELECT * FROM passengers WHERE id = ?', [result.insertId])

  response.status(201).json({ data: rows[0] })
}

export async function updatePassenger(request, response) {
  const id = getId(request.params.id, 'Passenger ID')
  const values = passengerValues(request.body, false)
  const columns = Object.keys(values).filter((column) => passengerFields.includes(column))

  if (!columns.length) throw createHttpError(400, 'No updatable passenger fields provided')

  const [result] = await pool.query(
    `UPDATE passengers SET ${columns.map((column) => `${column} = ?`).join(', ')} WHERE id = ?`,
    [...columns.map((column) => values[column]), id],
  )

  if (!result.affectedRows) throw createHttpError(404, 'Passenger not found')

  const [rows] = await pool.query('SELECT * FROM passengers WHERE id = ?', [id])
  response.json({ data: rows[0] })
}

export async function deletePassenger(request, response) {
  const id = getId(request.params.id, 'Passenger ID')
  const [result] = await pool.query('DELETE FROM passengers WHERE id = ?', [id])

  if (!result.affectedRows) throw createHttpError(404, 'Passenger not found')

  response.status(204).send()
}
