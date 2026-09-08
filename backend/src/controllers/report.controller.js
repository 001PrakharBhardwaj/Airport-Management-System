import pool from '../config/db.js'

export async function getOverview(_request, response) {
  const [rows] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM passengers) AS totalPassengers,
      (SELECT COUNT(*) FROM flights) AS totalFlights,
      (SELECT COUNT(*) FROM flights WHERE status = 'scheduled') AS scheduledFlights,
      (SELECT COUNT(*) FROM flights WHERE status = 'delayed') AS delayedFlights,
      (SELECT COUNT(*) FROM flights WHERE status = 'cancelled') AS cancelledFlights,
      (SELECT COUNT(*) FROM reservations) AS totalReservations,
      (SELECT COUNT(*) FROM reservations WHERE status = 'confirmed') AS confirmedReservations,
      (SELECT COUNT(*) FROM services) AS totalServices,
      (SELECT COUNT(*) FROM services WHERE is_active = TRUE) AS activeServices
  `)

  response.json({ data: rows[0] })
}
