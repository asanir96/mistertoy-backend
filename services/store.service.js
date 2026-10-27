
import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const storeService = {
    query,
    getById,
    remove,
}

const stores = utilService.readJsonFile('data/stores.json')

async function query(queryOptions = { filterBy: {}, sort: {} }) {
    const { filterBy, sort } = queryOptions
    let storesToReturn = [...stores]

    if (filterBy && filterBy.city) {
        const regExp = new RegExp(filterBy.city, 'i')
        storesToReturn = storesToReturn.filter(store => regExp.test(store.city))
    }

    if (sort) storesToReturn = _getSortedStores(storesToReturn, sort)

    return stores
}

async function getById(storeId) {
    const stores = stores.find(store => store._id === storeId)
    return stores
}

async function remove(storeId) {
    const idx = stores.findIndex(store => store._id === storeId)

    if (idx === -1) throw new Error('No such store')

    stores.splice(idx, 1)

    try {
        await _saveStoresToFile()
    } catch (err) {
        throw new Error('Could not save stores', { cause: err })
    }
}


function _saveStoresToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(stores, null, 2)
        fs.writeFile('data/stores.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to store file', err)
                return reject(err)
            }

            return resolve()
        })
    })
}



function _getSortedStores(stores, sort) {
    let sortedStores = [...stores]

    switch (sort.sortBy) {
        case 'city':
            sortedStores = stores.sort((store1, store2) => store1.name.localeCompare(store2.name) * sort.sortDir)
            break
        case 'name':
            sortedStores = stores.sort((store1, store2) => store1.name.localeCompare(store2.name) * sort.sortDir)
            break
    }


    return sortedStores
}
