"use strict";
/**
 * This file will contain the basic logic to deal with persistence for the crawlers
 * The goal here is to allow basic CRUD operations over the configured DB for the crawlers
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const errors_1 = require("./errors");
class CrawlerStorage {
    /**
     * This class will expose the basic functionality our persistent layer will have
     * @param uri {string} URI to connect to MongoDB
     * @param options {MongoClientOptions} Object with the options regarding the MongoDB connection
     */
    constructor(uri, options = null, modelSchema = null) {
        this.uri = uri;
        this.options = options;
        this.modelSchema = modelSchema;
    }
    connectToDB() {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await mongodb_1.MongoClient.connect(this.uri, this.options);
                resolve(client);
            }
            catch (error) {
                console.log("Error connecting to the DB...");
                console.error(error.stack);
                reject(error);
                // process.exit(1) // force leave
            }
        });
    }
    insertOne(element, collection) {
        if (this.modelSchema && typeof this.modelSchema != typeof element) {
            throw errors_1.WrongSchemaFormatError();
        }
        else {
            // just do what you've gotta do
        }
    }
    insertMany(elements, collection) {
        if (this.modelSchema && elements.filter((element) => typeof this.modelSchema != typeof element).length) {
            throw errors_1.WrongSchemaFormatError();
        }
        else {
            // just do what you've gotta do
        }
    }
}
