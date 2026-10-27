import path from 'path'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { toyService } from './API/toys/toy.service.js'
// import { userService } from './services/user.service.js'
import { loggerService } from './services/logger.service.js'
import { storeService } from './API/stores/store.service.js'
import { toyRoutes } from './API/toys/toy.routes.js'
import { storeRoutes } from './API/stores/store.routes.js'

const app = express()
const corsOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173',

        'http://127.0.0.1:5174',
        'http://localhost:5174',
    ],
    credentials: true,
}

// Express Config:
app.use(cors(corsOptions))
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())


app.set('query parser', 'extended') // allow sending arrays and objects in query params

app.use('/api/toy',toyRoutes)


app.use('/api/store',storeRoutes)

// Fallback route
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)
