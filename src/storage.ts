/**
 * This file will contain the basic logic to deal with persistence for the crawlers
 * The goal here is to allow basic CRUD operations over the configured DB for the crawlers
 */

import { MongoClientOptions, MongoClient, Collection, Db } from "mongodb";
import { WrongSchemaFormatError } from "./errors";

export class CrawlerStorage {
    private db: Db
    private client: MongoClient
    constructor(private uri: string, private dbName: string, private options: MongoClientOptions = null, private modelSchema: any = null) {
    }

    public async connectToDB(): Promise<MongoClient> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.client.isConnected()) {
                    const client = await MongoClient.connect(this.uri, this.options)
                    this.client = client
                    this.db = client.db(this.dbName)
                }
                resolve(this.client)
            } catch (error) {
                console.log("Error connecting to the DB...")
                console.error(error.stack)
                reject(error)
                // process.exit(1) // force leave
            }
        })
    }

    public async closeDBConnection() {
        return this.client.isConnected() ? this.client.close() : null
    }

    public insertOne(element: any, collection: string): Promise<any> {
        if (this.modelSchema && typeof this.modelSchema != typeof element) {
            throw WrongSchemaFormatError()
        } else {
            return this.db.collection(collection).insertOne(element)
        }
    }

    public insertMany(elements: any, collection: string): Promise<any> {
        if (this.modelSchema && elements.filter((element) => typeof this.modelSchema != typeof element).length) {
            throw WrongSchemaFormatError()
        } else {
            return this.db.collection(collection).insertOne(elements)
        }
    }
}
