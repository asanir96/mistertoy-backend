import { asyncLocalStorage } from "../../services/als.service.js"
import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"
import { ObjectId } from 'mongodb'
import { toyService } from "../toys/toy.service.js"
import { userService } from "../user/user.service.js"

export const reviewService = {
    query,
    add,
    remove
}

async function query(filterBy, sort) {
    try {
        const { FilterByCriteria, sortCriteria } = await _getCriteria(filterBy,sort)

        const collection = await dbService.getCollection('review')
        const reviews = await collection.aggregate([
            { $match: FilterByCriteria },
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
                    as: 'by',
                },
            },
            {
                $unwind: '$by',
            },
            {
                $sort: sortCriteria,
            },
            {
                $project: {
                    'txt': true, 'rating': true, 'createdAt': true,
                    'toy._id': true, 'toy.name': true, 'toy.price': true, 'toy.imgUrl': true,
                    'by._id': true, 'by.fullname': true
                }
            },
        ]).toArray()

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
            rating: review.rating,
            toyId: ObjectId.createFromHexString(review.toyId),
            createdAt: Date.now()
        }
        const collection = await dbService.getCollection('review')

        await collection.insertOne(addedReview)
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


async function _getCriteria(filterBy={}, sort={}) {
    const { userFullname, toyName, rating } = filterBy
    const { sortBy, sortDir } = sort
    const FilterByCriteria = {}
    const sortCriteria = {}

    if (userFullname) {
        const users = await userService.getByFullname(userFullname)
        const userIds = users.map(user => user._id)
        FilterByCriteria.userId = { $in: userIds }
    }

    if (toyName) {
        const toys = await toyService.getByName(toyName)
        const toyIds = toys.map(toy => toy._id)
        FilterByCriteria.toyId = { $in: toyIds }
    }

    if (rating) {
        FilterByCriteria.rating = { $gte: +rating }
    }


    if (sortBy) {
        const sortDirection = +sortDir
        sortCriteria[sortBy] = sortDirection
    } else sortCriteria.createdAt = -1

    return { FilterByCriteria, sortCriteria }
}