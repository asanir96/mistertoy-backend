import { authService } from "../API/auth/auth.service.js"
import { loggerService } from "../services/logger.service.js"

export async function requireAdmin(req, res, next) {
    
    if (!req?.cookies?.loginToken) {
        return res.status(401).send('Not Authenticated')
    }

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    console.log('loggedinUser',loggedinUser)
    if (!loggedinUser.isAdmin) {
        loggerService.warn(loggedinUser.username + ' attempted to perform admin action')
        res.status(403).end('Not Authorized')
        return
    }
    next()
}