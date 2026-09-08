import { Router } from 'express'
import {
  addReservationService,
  createReservation,
  deleteReservation,
  deleteReservationService,
  getReservation,
  listReservationServices,
  listReservations,
  updateReservation,
} from '../controllers/reservation.controller.js'

const router = Router()

router.route('/').get(listReservations).post(createReservation)
router.route('/:id').get(getReservation).put(updateReservation).delete(deleteReservation)
router.route('/:reservationId/services').get(listReservationServices).post(addReservationService)
router.delete('/:reservationId/services/:serviceId', deleteReservationService)

export default router
