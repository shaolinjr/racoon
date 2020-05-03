/// <reference types="bluebird" />
import { Db, MongoClient } from 'mongodb';
import { CrawlerStorage } from '../storage';
import { CrawlerRunOptions, ILink, CrawlerRequestOptions } from '../models';
export declare class BaseCrawler {
    private detailsCollection;
    private urlsCollection;
    protected MIN_REST_TIME: number;
    protected MAX_RETRY_ATTEMPTS: number;
    protected join: typeof import("bluebird").join;
    protected BASE_URL: string;
    protected STORAGE_URL: string;
    protected STORAGE_DB: string;
    protected SOURCE: {
        name: string;
        url: string;
    };
    constructor(detailsCollection?: string, urlsCollection?: string);
    get source(): {
        name: string;
        url: string;
    };
    private defaultCrawlerOptions;
    private defaultCrawlerRequestOptions;
    run(options?: CrawlerRunOptions): Promise<any>;
    protected makeRequest(url: string, options?: CrawlerRequestOptions): any;
    protected extractLinks(options?: any): Promise<string[] | any[]>;
    protected extractDetails(url: string | any): Promise<any[] | any | null>;
    protected formatLink(link: string, source: string): ILink;
    protected setupDB(): Promise<{
        storage: CrawlerStorage;
        client: MongoClient;
        scrapingDB: Db;
    }>;
    protected persistLinks(links: ILink[], db: Db): Promise<import("mongodb").BulkWriteResult>;
    protected persistDetails(details: any[] | any, db: Db): Promise<import("mongodb").InsertOneWriteOpResult<any> | import("mongodb").InsertWriteOpResult<any>>;
    protected getUnusedLinks(db: Db, filter?: any, detailed?: boolean): Promise<any[]>;
    protected useLink(db: Db, url: string): Promise<import("mongodb").FindAndModifyWriteOpResultObject<any>>;
    getDetails(queryFilter: any, db: Db, queryOptions?: any): Promise<import("mongodb").Cursor<any>>;
}
