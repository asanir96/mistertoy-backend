
import fs from 'fs'
import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'

export const toyService = {
    query,
    getById,
    remove,
    save,
    getStats
}

const PAGE_SIZE = 5
const toys = utilService.readJsonFile('data/toys.json')

async function query(queryOptions = { filterBy: {}, sort: {} }) {
    try {
        const { filterBy, sort } = queryOptions
        const criteria = {}

        if (filterBy && filterBy.name) {
            criteria.name = { $regex: filterBy.name, $options: 'i' }
        }

        if (filterBy && filterBy.inStock !== undefined) {
            criteria.inStock = filterBy.inStock
        }

        if (filterBy.labels && filterBy.labels.length > 0) {
            criteria.labels = { $in: filterBy.labels }
        }

        const collection = await dbService.getCollection('toy')
        const cursor = collection.find(criteria)

        if (sort) {
            const { sortBy, sortDir } = sort
            cursor.sort({ [sortBy]: sortDir || 1 })
        }
        const toys = await cursor.toArray()

        return { toys }
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }

}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }

}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function save(toy) {
    if (toy._id) {
        try {
            const updatedFields = {
                name: toy.name,
                price: toy.price,
                inStock: toy.inStock,
                labels: toy.labels
            }
            const collection = await dbService.getCollection('toy')
            const updatedToy = await collection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: updatedFields })
            return updatedToy
        } catch (err) {
            loggerService.error(`cannot update toy ${toy._id}`, err)
            throw err
        }
    } else {
        try {
            const collection = await dbService.getCollection('toy')
            await collection.insertOne(toy)
            return toy
        } catch (err) {
            loggerService.error('cannot insert car', err)
            throw err
        }

    }
}


function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 2)
        fs.writeFile('data/toys.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }

            return resolve()
        })
    })
}



function _getSortedToys(toys, sort) {
    let sortedToys = [...toys]

    switch (sort.sortBy) {
        case 'name':
            sortedToys = toys.sort((toy1, toy2) => toy1.name.localeCompare(toy2.name) * sort.sortDir)
            break
        case 'price':
            sortedToys = toys.sort((toy1, toy2) => (toy1.price - toy2.price) * sort.sortDir)
            break
        case 'created':
            sortedToys = toys.sort((toy1, toy2) => (toy1.createdAt - toy2.createdAt) * sort.sortDir)
            break
    }


    return sortedToys
}

async function getStats() {
    const toyCountByLabel = _getToyCountByLabel(toys)
    const priceByLabel = _getPriceByLabel(toys)

    const avgPriceByLabel = {}
    for (var label in priceByLabel) {
        avgPriceByLabel[label] = priceByLabel[label] / toyCountByLabel[label]
    }

    const stats = { avgPriceByLabel, toyCountByLabel }

    return stats
}


function _getToyCountByLabel(toys) {
    return toys.reduce((acc, toy) => {

        toy.labels?.forEach(label => {
            if (label in acc) acc[label]++
            else acc[label] = 1
        })

        return acc
    }, {})
}

function _getPriceByLabel(toys) {
    return toys.reduce((acc, toy) => {

        toy.labels?.forEach(label => {
            if (label in acc) acc[label] += toy.price
            else acc[label] = toy.price
        })

        return acc
    }, {})
}