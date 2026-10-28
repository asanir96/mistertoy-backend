import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"
import Cryptr from 'cryptr'


export const authService = {
    checkLogin,
    getLoginToken
}

const cryptr = new Cryptr(process.env.SECRET1 || 'secret-puk-1234')



async function checkLogin({ username, password }) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username, password })

        if (!user) throw new Error('No such user')

        return {
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            isAdmin: user.isAdmin
        }
    } catch (err) {
        loggerService.error(`While trying to find user ${username}`, err)
        throw err
    }


}

function getLoginToken(user) {
        const userInfo = {_id : user._id, username: user.username, isAdmin: user.isAdmin}
    return cryptr.encrypt(JSON.stringify(userInfo))  
}