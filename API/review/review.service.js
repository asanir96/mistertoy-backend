import { asyncLocalStorage } from "../../services/als.service.js"
import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"
import { ObjectId } from 'mongodb'

export const reviewService = {
    query,
    add,
    remove
}

async function query(criteria = {}) {
    try {
        console.log('criteria', criteria)
        const collection = await dbService.getCollection('review')
        const reviews = await collection.aggregate([
            { $match: criteria },
            {
                $lookup: {
                    localField: 'toyId',
                    from: 'toy',
                    foreignField: '_id',
                    as: 'toy',
                },
            },
            {
                $unwind: '$toy',
            },
            {
                $lookup: {
                    localField: 'userId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $project: {
                    'txt': true,
                    'toy._id': true, 'toy.name': true, 'toy.price': true,
                    'user._id': true, 'user.fullname': true
                }
            }

        ]).toArray()
        console.log('reviews', reviews)
        return reviews
    } catch (err) {
        throw err
    }

}

async function add(review) {
    try {
        var addedReview = {
            userId: ObjectId.createFromHexString(review.userId),
            txt: review.txt,
            toyId: ObjectId.createFromHexString(review.toyId)
        }
        const collection = await dbService.getCollection('review')

        addedReview = await collection.insertOne(addedReview)
        console.log('review', review)
        return addedReview
    } catch (err) {
        loggerService.error(`While trying to add a review`, err)
        throw err
    }
}


async function remove(reviewId) {
    try {
        const { loggedInUser } = asyncLocalStorage.getStore()
        console.log(' loggedInUser', loggedInUser)
        
        const collection = await dbService.getCollection('review')
        const criteria = { _id: ObjectId.createFromHexString(reviewId) }

        if (!loggedInUser.isAdmin) {
            criteria.userId = ObjectId.createFromHexString(loggedInUser._id)
        }

        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        loggerService.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}