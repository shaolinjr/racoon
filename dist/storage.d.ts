/**
 * This file will contain the basic logic to deal with persistence for the crawlers
 * The goal here is to allow basic CRUD operations over the configured DB for the crawlers
 */
import { MongoClientOptions, MongoClient, Db } from "mongodb";
export declare class CrawlerStorage {
    private uri;
    private dbName;
    private options;
    protected db: Db;
    protected client: MongoClient;
    constructor(uri: string, dbName: string, options?: MongoClientOptions);
    getDB(): Db;
    getClient(): MongoClient;
    connectToDB(): Promise<MongoClient>;
    closeDBConnection(): Promise<boolean>;
    insertOne(element: any, collection: string): Promise<any>;
    insertMany(elements: any[], collection: string): Promise<any>;
}
