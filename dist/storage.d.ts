/**
 * This file will contain the basic logic to deal with persistence for the crawlers
 * The goal here is to allow basic CRUD operations over the configured DB for the crawlers
 */
import { MongoClientOptions, MongoClient } from "mongodb";
export declare class CrawlerStorage {
    private uri;
    private dbName;
    private options;
    private modelSchema;
    private db;
    private client;
    constructor(uri: string, dbName: string, options?: MongoClientOptions, modelSchema?: any);
    connectToDB(): Promise<MongoClient>;
    closeDBConnection(): Promise<void>;
    insertOne(element: any, collection: string): Promise<any>;
    insertMany(elements: any, collection: string): Promise<any>;
}
