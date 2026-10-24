
import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

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
    const { filterBy, sort } = queryOptions
    let toysToReturn = [...toys]

    if (filterBy && filterBy.name) {
        const regExp = new RegExp(filterBy.name, 'i')
        toysToReturn = toysToReturn.filter(toy => regExp.test(toy.name))
    }

    if (filterBy && filterBy.inStock !== undefined) {
        toysToReturn = toysToReturn.filter(toy => toy.inStock === filterBy.inStock)
    }

    if (filterBy.labels && filterBy.labels.length > 0) {
        toysToReturn = toysToReturn.filter(toy => toy.labels?.some(label => filterBy.labels.includes(label)))
    }

    if (sort) toysToReturn = _getSortedToys(toysToReturn, sort)

    return {  toys: toysToReturn }
}

async function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return toy
}

async function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)

    if (idx === -1) throw new Error('No such toy')

    toys.splice(idx, 1)

    try {
        await _saveToysToFile()
    } catch (err) {
        throw new Error('Could not save toys',{ cause: err })
    }
}

async function save(toy) {
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)

        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
        toyToUpdate.inStock = toy.inStock
        toyToUpdate.labels = toy.labels

        toy = toyToUpdate
    } else {
        toy._id = utilService.makeId()
        toys.push(toy)
    }

    try {
        await _saveToysToFile()
        return toy

    } catch (err) {
        throw new Error('Could not save toys',{ cause: err })
    }
}


function _saveToysToFile() {
    throw new Error('hi')
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 2)
        fs.writeFile('data/toys.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            
            // return resolve()
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