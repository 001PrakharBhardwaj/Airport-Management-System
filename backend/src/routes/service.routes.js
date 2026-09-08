import { Router } from 'express'
import {
  createService,
  deleteService,
  getService,
  listServices,
  updateService,
} from '../controllers/service.controller.js'

const router = Router()

router.route('/').get(listServices).post(createService)
router.route('/:id').get(getService).put(updateService).delete(deleteService)

export default router
