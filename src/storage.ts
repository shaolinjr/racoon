/**
 * This file will contain the basic logic to deal with persistence for the crawlers
 * The goal here is to allow basic CRUD operations over the configured DB for the crawlers
 */

import { MongoClientOptions, MongoClient, Collection, Db } from "mongodb";

export class CrawlerStorage {
    protected db: Db
    protected client: MongoClient
    constructor(private uri: string, private dbName: string, private options: MongoClientOptions = { useUnifiedTopology: true }) {
    }

    public getDB() {
        if (this.db) {
            return this.db
        } else {
            throw new Error("Error. Please check if you connected to the database.")
        }
    }

    public getClient() {
        if (this.client) {
            return this.client
        } else {
            throw new Error("Error. Please check if you connected to the database.")
        }
    }

    public connectToDB(): Promise<MongoClient> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.client) {
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
        if (!this.client) { throw new Error("Did you call connectToDB first? The client is undefined.") }
        if (this.client.isConnected()) {
            await this.client.close(true)
            this.client = null
            this.db = null
            console.log("Closed the connection with the database.")
            return true
        }
        return null
    }

    public insertOne(element: any, collection: string): Promise<any> {
        return this.db.collection(collection).insertOne(element)
    }

    public insertMany(elements: any[], collection: string): Promise<any> {
        return (<Collection>this.db.collection(collection)).insertMany(elements)
    }
}
