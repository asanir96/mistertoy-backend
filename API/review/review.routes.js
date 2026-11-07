import express from 'express'
import { addReview, deleteReview, reviewQuery } from './review.controller.js'
import { requireAuth } from '../../middlewear/requireAuth.middlewear.js'

export const reviewRoutes = express.Router()

reviewRoutes.get('/', reviewQuery)
reviewRoutes.post('/', requireAuth, addReview)
reviewRoutes.delete('/:reviewId', requireAuth, deleteReview)