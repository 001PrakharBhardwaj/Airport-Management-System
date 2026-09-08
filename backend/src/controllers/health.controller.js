import pool from '../config/db.js'

export function getHealth(_request, response) {
  response.status(200).json({
    status: 'ok',
    message: 'AEROVAULT API is running',
    timestamp: new Date().toISOString(),
  })
}

export async function getDatabaseHealth(_request, response, next) {
  try {
    await pool.query('SELECT 1')

    response.status(200).json({
      status: 'ok',
      database: 'connected',
    })
  } catch (error) {
    error.statusCode = 503
    next(error)
  }
}
