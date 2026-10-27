import express from 'express'
import { addToy, deleteToy, getToyById, getToys, getToyStats, updateToy } from './toy.controller.js'

export const toyRoutes = express.Router()


toyRoutes.get('/',getToys)
toyRoutes.get('/stats',getToyStats)
toyRoutes.get('/:toyId',getToyById)
toyRoutes.post('/',addToy)
toyRoutes.put('/:toyId',updateToy)
toyRoutes.delete('/:toyId',deleteToy)