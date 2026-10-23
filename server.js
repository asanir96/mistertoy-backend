import path from 'path'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { toyService } from './services/toy.service.js'
// import { userService } from './services/user.service.js'
import { loggerService } from './services/logger.service.js'

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

// Express Routing:

// REST API for toys
app.get('/api/toy', async (req, res) => {
    const filterBy = {
        name: req.query.name || '',
        inStock: req.query.inStock === undefined ? undefined : req.query.inStock === 'true',
        labels: req.query.labels || [],
        pageIdx: req.query.pageIdx || undefined,
    }

    const sort = {
        sortBy: req.query.sortBy || '',
        sortDir: +req.query.sortDir || 1
    }

    const queryOptions = { filterBy, sort }

    try {
        const queriedToys = await toyService.query(queryOptions)
        res.send(queriedToys)
    } catch (err) {
        loggerService.error('Cannot get toys', err)
        res.status(400).send('Cannot get toys')
    }
})

app.get('/api/toy/stats', async (req, res) => {
    try {
        const stats = await toyService.getStats()
        res.send(stats)
    } catch (err) {
        loggerService.error('Cannot get stats', err)
        res.status(400).send('Cannot get stats')
    }
})

app.get('/api/toy/:toyId', async (req, res) => {
    const { toyId } = req.params

    try {
        const toy = await toyService.getById(toyId)
        res.send(toy)
    } catch (err) {
        loggerService.error('Cannot get toy', err)
        res.status(400).send('Cannot get toy')
    }
})

app.post('/api/toy', async (req, res) => {
    const { toyId } = req.params

    if (toyId) return res.status(400).send('Already created toy!')

    const toy = {
        name: req.body.name,
        price: +req.body.price,
        inStock: req.body.inStock,
        labels: req.body.labels || []
    }

    try {
        const savedToy = await toyService.save(toy)
        res.send(savedToy)

    } catch (err) {
        loggerService.error('Cannot save toy', err)
        res.status(400).send('Cannot save toy')
    }
})

app.put('/api/toy/:toyId', async (req, res) => {

    const toy = {
        _id: req.params.toyId,
        name: req.body.name,
        price: +req.body.price,
        inStock: req.body.inStock,
        labels: req.body.labels
    }

    try {
        const savedToy = await toyService.save(toy)
        res.send(savedToy)
    } catch (err) {
        loggerService.error('Cannot save toy', err)
        res.status(400).send('Cannot save toy')
    }
})

app.delete('/api/toy/:toyId', async (req, res) => {

    const { toyId } = req.params

    try {
        await toyService.remove(toyId)
        res.send('Removed!')
    } catch (err) {
        loggerService.error('Cannot remove toy', err)
        res.status(400).send('Cannot remove toy')
    }
})

// User API
// app.get('/api/user', (req, res) => {
//     userService.query()
//         .then(users => res.send(users))
//         .catch(err => {
//             loggerService.error('Cannot load users', err)
//             res.status(400).send('Cannot load users')
//         })
// })



// app.get('/api/user/:userId', (req, res) => {
//     const { userId } = req.params

//     userService.getById(userId)
//         .then(user => res.send(user))
//         .catch(err => {
//             loggerService.error('Cannot load user', err)
//             res.status(400).send('Cannot load user')
//         })
// })

// Auth API
// app.post('/api/auth/login', (req, res) => {
//     const credentials = req.body

//     userService.checkLogin(credentials)
//         .then(user => {
//             if (user) {
//                 const loginToken = userService.getLoginToken(user)
//                 res.cookie('loginToken', loginToken)
//                 res.send(user)
//             } else {
//                 res.status(401).send('Invalid Credentials')
//             }
//         })
// })

// app.post('/api/auth/signup', (req, res) => {
//     const credentials = req.body

//     userService.save(credentials)
//         .then(user => {
//             if (user) {
//                 const loginToken = userService.getLoginToken(user)
//                 res.cookie('loginToken', loginToken)
//                 res.send(user)
//             } else {
//                 res.status(400).send('Cannot signup')
//             }
//         })
// })

// app.post('/api/auth/logout', (req, res) => {
//     res.clearCookie('loginToken')
//     res.send('logged-out!')
// })


// app.put('/api/user', (req, res) => {
//     const loggedinUser = userService.validateToken(req.cookies.loginToken)
//     if (!loggedinUser) return res.status(400).send('No logged in user')
//     const { diff } = req.body
//     if (loggedinUser.score + diff < 0) return res.status(400).send('No credit')
//     loggedinUser.score += diff
//     return userService.save(loggedinUser).then(user => {
//         const token = userService.getLoginToken(user)
//         res.cookie('loginToken', token)
//         res.send(user)
//     })
// })


// Fallback route
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)
