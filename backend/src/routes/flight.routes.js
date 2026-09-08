import { Router } from 'express'
import {
  createFlight,
  deleteFlight,
  getFlight,
  listFlights,
  updateFlight,
} from '../controllers/flight.controller.js'

const router = Router()

router.route('/').get(listFlights).post(createFlight)
router.route('/:id').get(getFlight).put(updateFlight).delete(deleteFlight)

export default router
