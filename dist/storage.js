"use strict";
/**
 * This file will contain the basic logic to deal with persistence for the crawlers
 * The goal here is to allow basic CRUD operations over the configured DB for the crawlers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerStorage = void 0;
const mongodb_1 = require("mongodb");
class CrawlerStorage {
    constructor(uri, dbName, options = null) {
        this.uri = uri;
        this.dbName = dbName;
        this.options = options;
    }
    getDB() {
        if (this.db) {
            return this.db;
        }
        else {
            throw new Error("Error. Please check if you connected to the database.");
        }
    }
    getClient() {
        if (this.client) {
            return this.client;
        }
        else {
            throw new Error("Error. Please check if you connected to the database.");
        }
    }
    connectToDB() {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.client) {
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
        if (!this.client) {
            throw new Error("Did you call connectToDB first? The client is undefined.");
        }
        if (this.client.isConnected()) {
            await this.client.close(true);
            this.client = null;
            this.db = null;
            console.log("Closed the connection with the database.");
            return true;
        }
        return null;
    }
    insertOne(element, collection) {
        return this.db.collection(collection).insertOne(element);
    }
    insertMany(elements, collection) {
        return this.db.collection(collection).insertMany(elements);
    }
}
exports.CrawlerStorage = CrawlerStorage;
