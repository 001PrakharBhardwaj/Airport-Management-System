import { Router } from 'express'
import { getOverview } from '../controllers/report.controller.js'

const router = Router()

router.get('/overview', getOverview)

export default router
