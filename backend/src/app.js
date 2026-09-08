import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import flightOperationRouter from './routes/flight-operation.routes.js'
import flightRouter from './routes/flight.routes.js'
import healthRouter from './routes/health.routes.js'
import passengerRouter from './routes/passenger.routes.js'
import reportRouter from './routes/report.routes.js'
import reservationRouter from './routes/reservation.routes.js'
import serviceRouter from './routes/service.routes.js'

const app = express()
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({ origin: frontendUrl }))
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/passengers', passengerRouter)
app.use('/api/flights', flightRouter)
app.use('/api/reservations', reservationRouter)
app.use('/api/services', serviceRouter)
app.use('/api/flight-operations', flightOperationRouter)
app.use('/api/reports', reportRouter)

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' })
})

app.use((error, _request, response, _next) => {
  const mysqlErrorStatus = {
    ER_DUP_ENTRY: 409,
    ER_ROW_IS_REFERENCED_2: 409,
    ER_NO_REFERENCED_ROW_2: 400,
    ER_BAD_NULL_ERROR: 400,
    ER_DATA_TOO_LONG: 400,
    ER_TRUNCATED_WRONG_VALUE: 400,
    ER_CHECK_CONSTRAINT_VIOLATED: 400,
    ECONNREFUSED: 503,
  }
  const statusCode = error.statusCode || mysqlErrorStatus[error.code] || 500
  const mysqlErrorMessage = {
    ER_DUP_ENTRY: 'A record with that value already exists',
    ER_ROW_IS_REFERENCED_2: 'Cannot delete this record because it is still referenced',
    ER_NO_REFERENCED_ROW_2: 'A referenced record does not exist',
    ER_BAD_NULL_ERROR: 'A required value is missing',
    ER_DATA_TOO_LONG: 'A value is too long',
    ER_TRUNCATED_WRONG_VALUE: 'Invalid data value',
    ER_CHECK_CONSTRAINT_VIOLATED: 'Data does not meet a database constraint',
    ECONNREFUSED: 'Database unavailable',
  }

  if (statusCode >= 500) {
    console.error(error)
  }

  response.status(statusCode).json({
    error: mysqlErrorMessage[error.code] || (statusCode === 500 ? 'Internal server error' : error.message),
  })
})

export default app
