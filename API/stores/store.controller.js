import { storeService } from "./store.service.js"
import { loggerService } from "../../services/logger.service.js"

export async function getStores(req, res) {
    const filterBy = {
        city: req.query.city || '',
    }

    const sort = {
        sortBy: req.query.sortBy || '',
        sortDir: +req.query.sortDir || 1
    }

    const queryOptions = { filterBy, sort }

    try {
        const queriedStores = await storeService.query(queryOptions)
        res.send(queriedStores)
    } catch (err) {
        loggerService.error('Cannot get stores', err)
        res.status(400).send('Cannot get stores')
    }
}