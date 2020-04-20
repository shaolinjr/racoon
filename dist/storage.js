"use strict";
/**
 * This file will contain the basic logic to deal with persistence for the crawlers
 * The goal here is to allow basic CRUD operations over the configured DB for the crawlers
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const errors_1 = require("./errors");
class CrawlerStorage {
    constructor(uri, dbName, options = null, modelSchema = null) {
        this.uri = uri;
        this.dbName = dbName;
        this.options = options;
        this.modelSchema = modelSchema;
    }
    async connectToDB() {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.client.isConnected()) {
                    const client = await mongodb_1.MongoClient.connect(this.uri, this.options);
                    this.client = client;
                    this.db = client.db(this.dbName);
                }
                resolve(this.client);
            }
            catch (error) {
                console.log("Error connecting to the DB...");
                console.error(error.stack);
                reject(error);
                // process.exit(1) // force leave
            }
        });
    }
    async closeDBConnection() {
        return this.client.isConnected() ? this.client.close() : null;
    }
    insertOne(element, collection) {
        if (this.modelSchema && typeof this.modelSchema != typeof element) {
            throw errors_1.WrongSchemaFormatError();
        }
        else {
            return this.db.collection(collection).insertOne(element);
        }
    }
    insertMany(elements, collection) {
        if (this.modelSchema && elements.filter((element) => typeof this.modelSchema != typeof element).length) {
            throw errors_1.WrongSchemaFormatError();
        }
        else {
            return this.db.collection(collection).insertOne(elements);
        }
    }
}
exports.CrawlerStorage = CrawlerStorage;
