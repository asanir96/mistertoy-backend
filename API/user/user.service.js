import { ObjectId } from "mongodb"
import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"
import { reviewService } from "../review/review.service.js"

export const userService = {
    getByUsername,
    add,
    getById,
    getByFullname
}

async function add(user) {
    try {
        const { username, fullname, password } = user
        const existingUser = await getByUsername(username)
        console.log('existingUser',existingUser)
        if (existingUser) throw Error('Username exists')

        const newUser = {
            fullname,
            username,
            password,
            isAdmin:false
        }
        const collection = await dbService.getCollection('user')
        await collection.insertOne(newUser)
        return newUser
    } catch (err) {
        loggerService.error('cannot insert user', err)
        throw err
    }


}

async function getById(userId) {
    try {
        const userCollection = await dbService.getCollection('user')
        const user = await userCollection.findOne({ _id: ObjectId.createFromHexString(userId) })
        
        const reviews = await reviewService.query({userId: ObjectId.createFromHexString(userId)})
        user.toyReviews=reviews.map(review=>{
            delete review.by
            return review
        })
        
        return user
    } catch (err) {
        loggerService.error(`while finding user ${userId}`, err)
        throw err
    }
}


async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user ${username}`, err)
        throw err
    }
}
async function getByFullname(fullname) {
    try {
        const collection = await dbService.getCollection('user')
        const users = await collection.find({ fullname: { $regex: fullname, $options: "i"} }).toArray()
        return users
    } catch (err) {
        logger.error(`while finding user ${username}`, err)
        throw err
    }
}