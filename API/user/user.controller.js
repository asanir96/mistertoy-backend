import { userService } from "./user.service.js";
import { loggerService } from "../../services/logger.service.js";

export async function getUserById(req, res) {
    const { loggedInUser } = req
    const { userId } = req.params

    try {
        if (!loggedInUser.isAdmin && loggedInUser._id !== userId) {
            return res.status(403).send('Not Authorized')
        }

        const user = await userService.getById(userId)
        res.send(user)
    } catch (err) {
        loggerService.error('Cannot get the user', err)
        res.status(400).send('Cannot get the user')
    }
}