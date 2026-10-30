import express from 'express'
import { addToy, deleteToy, getToyById, getToys, getToyStats, updateToy } from './toy.controller.js'
import { requireAuth } from '../../middlewear/requireAuth.middlewear.js'
import { requireAdmin } from '../../middlewear/requireAdmin.middlewear.js'
export const toyRoutes = express.Router()


toyRoutes.get('/', getToys)
toyRoutes.get('/stats', getToyStats)
toyRoutes.get('/:toyId', getToyById)
toyRoutes.post('/', requireAuth, requireAdmin, addToy)
toyRoutes.put('/:toyId', requireAuth, requireAdmin, updateToy)
toyRoutes.delete('/:toyId', requireAuth, requireAdmin, deleteToy)