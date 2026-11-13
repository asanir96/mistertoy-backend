import express from 'express'
import {requireAuth} from '../../middlewear/requireAuth.middlewear.js'
import { getUserById } from './user.controller.js'

export const userRoutes = express.Router()

userRoutes.get('/:userId',requireAuth,getUserById)