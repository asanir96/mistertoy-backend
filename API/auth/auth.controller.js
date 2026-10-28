import { authService } from './auth.service.js'
import { loggerService } from "../../services/logger.service.js"

export async function login(req, res) {
    try {
        const { username, password } = req.body
        const user = await authService.checkLogin({ username, password })
        const loginToken = authService.getLoginToken(user)

        res.cookie('loginToken', loginToken)

        res.json(user)
    } catch (err) {
        loggerService.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }

}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Successfully logged out' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}