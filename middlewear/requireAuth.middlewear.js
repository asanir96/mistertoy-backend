import { authService } from "../API/auth/auth.service.js"
import { asyncLocalStorage } from "../services/als.service.js"

export async function requireAuth(req, res, next) {
    let { loggedInUser } = asyncLocalStorage.getStore()

    if (!loggedInUser) {
        return res.status(401).send('Not Authenticated')
    }

    loggedInUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Not Authenticated')

    req.loggedInUser = loggedInUser
    next()

}