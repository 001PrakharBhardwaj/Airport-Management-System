import { Router } from 'express'
import {
  createPassenger,
  deletePassenger,
  getPassenger,
  listPassengers,
  updatePassenger,
} from '../controllers/passenger.controller.js'

const router = Router()

router.route('/').get(listPassengers).post(createPassenger)
router.route('/:id').get(getPassenger).put(updatePassenger).delete(deletePassenger)

export default router
