import { ObjectId } from "mongodb"
import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"


export const userService = {
    getByUsername,
    add
}

async function add(user) {
    try {
        const { username, fullname, password, isAdmin } = user
        const existingUser = await getByUsername(username)
        console.log('existingUser',existingUser)
        if (existingUser) throw Error('Username exists')

        const newUser = {
            fullname,
            username,
            password,
            isAdmin
        }
        const collection = await dbService.getCollection('user')
        await collection.insertOne(newUser)
        return newUser
    } catch (err) {
        loggerService.error('cannot insert user', err)
        throw err
    }


}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        console.log('user',user)
        return user
    } catch (err) {
        logger.error(`while finding user ${username}`, err)
        throw err
    }
}