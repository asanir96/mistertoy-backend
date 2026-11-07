import { loggerService } from "../../services/logger.service.js";
import { reviewService } from "./review.service.js";
import { userService } from "../user/user.service.js";
import { toyService } from "../toys/toy.service.js";
export async function reviewQuery(req, res) {
    try {
        const reviews = await reviewService.query()
        res.send(reviews)
    } catch (err) {
        loggerService.error('While getting reviews', err)
        res.status(400).send('Cannot get reviews')
    }
}


export async function addReview(req, res) {
    try {
        const { loggedInUser } = req
        const { txt, toyId } = req.body
        console.log('loggedInUser', loggedInUser)
        console.log('loggedInUser._id', loggedInUser._id)
        var review = {
            userId: loggedInUser._id,
            txt,
            toyId
        }

        review = await reviewService.add(review)
        res.send(review)
    } catch (err) {
        loggerService.error('Cannot add a review', err)
        res.status(400).send('Cannot get reviews')
    }

}

export async function deleteReview(req, res) {
    try {
        const { reviewId } = req.params
        const deleteCount = await reviewService.remove(reviewId)

        if (deleteCount < 1) {
            res.status(400).send({ err: 'Could not remove review' })
        } else {
            res.send('Deleted successfully')
        }
    } catch (err) {
        loggerService.error('Failed to delete review',err)
        res.status(400).send({ err: 'Could not remove review' })
    }
}