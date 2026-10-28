import { MongoClient } from "mongodb";
import { config } from '../config/index.js'
import { loggerService } from "./logger.service.js";

export const dbService = {
	getCollection,
}

var dbConnection = null

async function getCollection(collectionName) {
    const db = await _connect()
    const collection = db.collection(collectionName)
    return collection
}


async function _connect() {
    if (dbConnection) return dbConnection

    try {
        const client = await MongoClient.connect(config.dbURL)
        const db = client.db(config.dbName)
        dbConnection = db
        return db
    }catch(err){
        loggerService.error(err)
        throw err
    }

}