import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"
import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'
import { userService } from "../user/user.service.js"


export const authService = {
    checkLogin,
    getLoginToken,
    validateToken
}

const cryptr = new Cryptr(process.env.SECRET1 || 'secret-puk-1234')



async function checkLogin({ username, password }) {
    try {
        const user = await userService.getByUsername(username)
        if (!user) throw new Error('Invalid username or password')

        const match = await bcrypt.compare(password, user.password)
        if (!match) throw new Error('Invalid username or password')

        return {
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            isAdmin: user.isAdmin
        }
    } catch (err) {
        loggerService.error(`While trying to find user ${username}`, err)
        throw err
    }


}

function getLoginToken(user) {
    const userInfo = { _id: user._id, username: user.username, isAdmin: user.isAdmin }
    return cryptr.encrypt(JSON.stringify(userInfo))
}
function validateToken(loginToken) {
    try {
        const decryptedToken = cryptr.decrypt(loginToken)
        const loggedInUser = JSON.parse(decryptedToken)
        return loggedInUser
    } catch (err) {
        console.log('Not a valid token')
    }
    return null
}