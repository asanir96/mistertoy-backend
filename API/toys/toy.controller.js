
import { toyService } from "./toy.service.js"
import { loggerService } from "../../services/logger.service.js"

export async function getToys(req, res) {
    const filterBy = {
        name: req.query.name || '',
        inStock: req.query.inStock === undefined ? undefined : req.query.inStock === 'true',
        labels: req.query.labels || [],
        pageIdx: req.query.pageIdx || undefined,
    }

    const sort = {
        sortBy: req.query.sortBy || '',
        sortDir: +req.query.sortDir || 1
    }

    const queryOptions = { filterBy, sort }

    try {
        const queriedToys = await toyService.query(queryOptions)
        res.send(queriedToys)
    } catch (err) {
        loggerService.error('Cannot get toys', err)
        res.status(400).send('Cannot get toys')
    }
}

export async function getToyStats(req, res) {
    try {
        const stats = await toyService.getStats()
        res.send(stats)
    } catch (err) {
        loggerService.error('Cannot get stats', err)
        res.status(400).send('Cannot get stats')
    }

}
export async function getToyById(req, res) {
    const { toyId } = req.params

    try {
        const toy = await toyService.getById(toyId)
        res.send(toy)
    } catch (err) {
        loggerService.error('Cannot get toy', err)
        res.status(400).send('Cannot get toy')
    }
}

export async function addToy(req, res) {
    const { toyId } = req.params

    if (toyId) return res.status(400).send('Already created toy!')

    const toy = {
        name: req.body.name,
        price: +req.body.price,
        inStock: req.body.inStock,
        labels: req.body.labels || []
    }

    try {
        const savedToy = await toyService.save(toy)
        res.send(savedToy)

    } catch (err) {
        loggerService.error('Cannot save toy', err)
        res.status(400).send('Cannot save toy')
    }
}

export async function updateToy(req, res) {

    const toy = {
        _id: req.params.toyId,
        name: req.body.name,
        price: +req.body.price,
        inStock: req.body.inStock,
        labels: req.body.labels
    }

    try {
        const savedToy = await toyService.save(toy)
        res.send(savedToy)
    } catch (err) {
        loggerService.error('Cannot save toy', err)
        res.status(400).send('Cannot save toy')
    }

}

export async function deleteToy(req, res) {
    const { toyId } = req.params

    try {
        await toyService.remove(toyId)
        res.send('Removed!')
    } catch (err) {
        loggerService.error('Cannot remove toy', err, err.cause)
        res.status(400).send(err)
    }
}