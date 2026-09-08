export const FLIGHT_STATUSES = ['scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled']
export const RESERVATION_STATUSES = ['reserved', 'confirmed', 'checked_in', 'cancelled']
export const CABIN_CLASSES = ['economy', 'premium_economy', 'business', 'first']
export const SERVICE_TYPES = ['baggage', 'meal', 'lounge', 'onboard', 'other']

export function createHttpError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export function getId(value, label = 'ID') {
  const id = Number(value)

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createHttpError(400, `${label} must be a positive integer`)
  }

  return id
}

export function getPagination(query) {
  const limit = query.limit === undefined ? 50 : Number(query.limit)
  const offset = query.offset === undefined ? 0 : Number(query.offset)

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw createHttpError(400, 'Limit must be an integer between 1 and 100')
  }

  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw createHttpError(400, 'Offset must be a non-negative integer')
  }

  return { limit, offset }
}

export function requiredString(value, field, maxLength) {
  if (typeof value !== 'string' || !value.trim()) {
    throw createHttpError(400, `Missing required field: ${field}`)
  }

  const normalized = value.trim()

  if (maxLength && normalized.length > maxLength) {
    throw createHttpError(400, `${field} must be at most ${maxLength} characters`)
  }

  return normalized
}

export function nullableString(value, field, maxLength) {
  if (value === null || value === '') {
    return null
  }

  return requiredString(value, field, maxLength)
}

export function enumValue(value, field, allowedValues) {
  if (!allowedValues.includes(value)) {
    throw createHttpError(400, `${field} must be one of: ${allowedValues.join(', ')}`)
  }

  return value
}

export function positiveNumber(value, field) {
  const number = Number(value)

  if (!Number.isFinite(number) || number <= 0) {
    throw createHttpError(400, `${field} must be a positive number`)
  }

  return number
}

export function nonNegativeInteger(value, field) {
  const number = Number(value)

  if (!Number.isSafeInteger(number) || number < 0) {
    throw createHttpError(400, `${field} must be a non-negative integer`)
  }

  return number
}

export function booleanValue(value, field) {
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return true
  }

  if (value === false || value === 0 || value === '0' || value === 'false') {
    return false
  }

  throw createHttpError(400, `${field} must be true or false`)
}

export function dateValue(value, field) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw createHttpError(400, `${field} must be a valid YYYY-MM-DD date`)
  }

  const date = new Date(`${value}T00:00:00Z`)

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw createHttpError(400, `${field} must be a valid YYYY-MM-DD date`)
  }

  return value
}

export function dateTimeValue(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw createHttpError(400, `${field} must be a valid date-time`)
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `${field} must be a valid date-time`)
  }

  return date.toISOString().slice(0, 19).replace('T', ' ')
}

export function airportCode(value, field) {
  const code = requiredString(value, field, 3).toUpperCase()

  if (!/^[A-Z]{3}$/.test(code)) {
    throw createHttpError(400, `${field} must be a three-letter airport code`)
  }

  return code
}

export function currencyCode(value, field = 'currency') {
  const code = requiredString(value, field, 3).toUpperCase()

  if (!/^[A-Z]{3}$/.test(code)) {
    throw createHttpError(400, `${field} must be a three-letter currency code`)
  }

  return code
}

export function hasField(object, field) {
  return Object.prototype.hasOwnProperty.call(object, field)
}
