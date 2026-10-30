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

export async function signup(req, res) {
    try {
        const { username, password, fullname, isAdmin } = req.body

        const account = await authService.signup(username, password, fullname, '' + isAdmin === 'true')
        loggerService.debug(`auth.route - new account created: ` + JSON.stringify(account))

        const user = await authService.checkLogin({username, password})
        const loginToken = authService.getLoginToken(user)

        res.cookie('loginToken', loginToken)
        res.json(user)
    } catch (err) {
        loggerService.error('Failed to signup ' + err)
        res.status(500).send({ err: 'Failed to signup' })
    }
}