import express from 'express'
import { getStores} from './store.controller.js'

export const storeRoutes = express.Router()


storeRoutes.get('/',getStores)
