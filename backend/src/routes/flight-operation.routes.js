import { Router } from 'express'
import {
  getFlightOperation,
  listFlightOperations,
  updateFlightOperation,
} from '../controllers/flight-operation.controller.js'

const router = Router()

router.route('/').get(listFlightOperations)
router.route('/:id').get(getFlightOperation).put(updateFlightOperation)

export default router
