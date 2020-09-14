"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCrawler = void 0;
const axios = __importStar(require("axios"));
const winston_1 = __importDefault(require("winston"));
const winston_2 = require("winston");
const loggers_1 = require("../loggers");
const Helper = __importStar(require("../helpers/functions"));
const events_1 = require("../events");
const errors_1 = require("../errors");
const bluebird_1 = __importDefault(require("bluebird"));
const bluebird_2 = require("bluebird");
// global.BPromise = require("bluebird"); // Workaround for TypeScript
const Axios = axios.default;
// export abstract class Crawler {
//     protected MIN_REST_TIME: number
//     protected MAX_RETRY_ATTEMPTS: number
//     protected BASE_URL: string
//     protected STORAGE_URL: string
//     protected STORAGE_DB: string
//     protected SOURCE: { name: string, url: string }
//     protected async abstract extractLinks(options?: any): BPromise<string[] | any[]>
//     protected async abstract extractDetails(url: string | any): BPromise<any[] | any | null>
//     constructor(public storage: CrawlerStorage) { }
// }
class BaseCrawler {
    constructor(storage, detailsCollection = "products", urlsCollection = "urls") {
        this.storage = storage;
        this.detailsCollection = detailsCollection;
        this.urlsCollection = urlsCollection;
        this.join = bluebird_1.default.join;
        this.MIN_REST_TIME = 1000;
        this.MAX_RETRY_ATTEMPTS = 3;
        this.BASE_URL = "<this-should-be-overriden>";
        this.STORAGE_URL = "<this-should-be-overriden>";
        this.STORAGE_DB = "<this-should-be-overriden>";
        this.SOURCE = null;
        this.events = events_1.BaseCrawlerEvents;
        this.defaultCrawlerOptions = {
            extractDetailsOptions: { concurrency: 1, waitFor: this.MIN_REST_TIME },
            extractLinksOptions: { concurrency: 1, waitFor: this.MIN_REST_TIME, linksFromDB: false, dbLinksFilter: {} }
        };
        this.defaultCrawlerRequestOptions = {
            retryCounter: this.MAX_RETRY_ATTEMPTS,
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
            retryIn: this.MIN_REST_TIME * 5,
            maxRetries: 3
        };
        const loggerName = loggers_1.setupCrawlerLogger();
        this.logger = winston_1.default.loggers.get(loggerName);
        this.logger.level = 'info';
        this.logger.format = winston_2.format.combine(winston_2.format.colorize(), winston_2.format.simple());
    }
    get source() {
        return this.SOURCE;
    }
    async runExtractLinks(options = this.defaultCrawlerOptions.extractLinksOptions) {
        const db = this.storage.getDB();
        let links = [];
        try {
            if (options.linksFromDB) {
                this.logger.debug("About to fetch unused links from the db");
                links = await this.getUnusedLinks(db, options.dbLinksFilter);
                this.logger.debug(`Found ${links.length} links in DB`);
            }
            if (!links.length) {
                links = await this.extractLinks(options);
                // console.log("XLinks: ", links)
                const formattedLinks = links.map((link) => this.formatLink(link, this.BASE_URL));
                this.logger.debug("About to start persisting the links!");
                await this.persistLinks(formattedLinks, db); // broke here timed out connection
            }
            this.logger.info(`Found this amount of links: ${links.length}`);
        }
        catch (error) {
            this.logger.error("runExtractLinks error: " + JSON.stringify(error));
            throw error;
        }
        events_1.BaseCrawlerEvents.emit("extractLinks:finished");
        return links;
    }
    async runExtractDetails(links, options = this.defaultCrawlerOptions.extractDetailsOptions) {
        let resultDetails = [];
        const db = this.storage.getDB();
        try {
            let detailsCounter = 0;
            await bluebird_2.Promise.map(links, async (link) => {
                this.logger.debug(`Getting details for: ${link}`);
                const details = this.extractDetails(link);
                const rest = Helper.timeoutPromise(options.waitFor);
                return this.join(details, rest, async (details, rest) => {
                    if (details) {
                        detailsCounter++;
                        this.logger.info(`Details progress: ${detailsCounter}/${links.length}`);
                        this.logger.debug(`Details: ${JSON.stringify(details)}`);
                        if (details) {
                            if (details.hasOwnProperty("length") && details.length || details) {
                                await this.persistDetails(details, db);
                                this.logger.info(`Persisted details for: ${link}`);
                            }
                        }
                        await db.collection(this.urlsCollection).updateMany({ url: link, used: false }, { $set: { used: true, usedAt: new Date() } });
                        this.logger.debug("Updated the urls state to 'used:true' in db.");
                    }
                    return details;
                }).reflect();
            }, { concurrency: options.concurrency })
                .each(async (promise) => {
                if (promise.isFulfilled()) {
                    const result = promise.value();
                    if (result) {
                        if (result.hasOwnProperty("length") && result.length) {
                            resultDetails.push(...result);
                        }
                        else {
                            resultDetails.push(result);
                        }
                    }
                }
                else {
                    this.logger.error("runExtractDetails error: " + JSON.stringify(promise.reason()));
                }
            });
        }
        catch (error) {
            this.logger.error(`Shit happened on the concurrency part...: ${error}`);
            throw error;
        }
        events_1.BaseCrawlerEvents.emit("extractDetails:finished");
        return resultDetails;
    }
    async run(options = this.defaultCrawlerOptions) {
        // let { storage, client, scrapingDB } = await this.setupDB()
        // get the links
        let links = await this.runExtractLinks(options.extractLinksOptions);
        // if (options.extractLinksOptions.linksFromDB) {
        //     this.logger.debug("About to fetch unused links from the db")
        //     links = await this.getUnusedLinks(scrapingDB, options.extractLinksOptions.dbLinksFilter)
        // }
        // if (!links.length) {
        //     links = await this.extractLinks(options.extractLinksOptions)
        //     // console.log("Links: ", links)
        //     const formattedLinks: ILink[] = links.map((link: any) => this.formatLink(link, this.BASE_URL))
        //     await this.persistLinks(formattedLinks, scrapingDB) // broke here timed out connection
        // }
        // this.logger.info(`Found this amount of links: ${links.length}`)
        // get the details
        let resultDetails = await this.runExtractDetails(links, options.extractDetailsOptions);
        // try {
        //     let detailsCounter = 0
        //     await BPromise.map(links, async (link: any) => { //.slice(lastIndex)
        //         this.logger.debug(`Getting details for: ${link}`)
        //         const details = this.extractDetails(link)
        //         const rest = Helper.timeoutPromise(options.extractDetailsOptions.waitFor)
        //         return this.join(details, rest, async (details: any, rest) => {
        //             if (details) {
        //                 detailsCounter++;
        //                 this.logger.info(`Details progress: ${detailsCounter}/${links.length}`)
        //                 this.logger.debug(`Details: ${JSON.stringify(details)}`)
        //                 if (details.hasOwnProperty("length") && details.length || details) {
        //                     await this.persistDetails(details, scrapingDB)
        //                     this.logger.debug(`Persisted details for: ${link}`)
        //                 }
        //                 await scrapingDB.collection(this.urlsCollection).updateMany({ url: link, used: false }, { $set: { used: true, usedAt: new Date() } })
        //                 this.logger.debug("Updated the urls state to 'used:true' in db.")
        //             }
        //             return details
        //         })
        //     }, { concurrency: options.extractDetailsOptions.concurrency })
        //         .each((batchResult: any) => {
        //             if (batchResult) {
        //                 if (batchResult.hasOwnProperty("length") && batchResult.length) {
        //                     resultDetails.push(...batchResult)
        //                 } else {
        //                     resultDetails.push(batchResult)
        //                 }
        //             }
        //         })
        // } catch (error) {
        //     this.logger.error(`Shit happened on the concurrency part...: ${error}`)
        // }
        // await storage.closeDBConnection()
        events_1.BaseCrawlerEvents.emit("run:finished");
        return resultDetails;
    }
    async makeRequest(url, options) {
        try {
            options = { ...this.defaultCrawlerRequestOptions, ...options };
            let requestConfig = { method: "GET" };
            requestConfig = { ...options.axiosOptions };
            requestConfig.headers = { ...(options.axiosOptions || {}).headers, 'User-Agent': options.userAgent };
            const response = await Axios.request({ url, ...requestConfig }); //url, { headers: { 'User-Agent': options.userAgent } }
            const data = response.data;
            if (data) {
                return data;
            }
            else {
                // const child = this.logger.child({ format: format.label({ label: "BaseCrawler > makeRequest" }) })
                // child.error(`response.data for URL: ${url} was empty`)
                throw new errors_1.EmptyResponseError(`The URL: ${url} response was empty content.`);
                // throw new Error("Response came empty.")
            }
        }
        catch (error) {
            if (!error.isAxiosError) {
                throw error;
            }
            if (error.response) {
                console.log("Notifying error on makeRequest: ", error.response.status);
                if (options.retryCounter >= options.maxRetries || error.response.status == 404) {
                    console.log("Couldn't proceed...: ", url);
                    throw error;
                }
                else {
                    await Helper.timeoutPromise(options.retryIn); // resting for a while and then returning something
                    console.log("Requesting again!: ", url);
                    options.retryCounter++;
                    return await this.makeRequest(url, options);
                }
            }
            else {
                throw error;
            }
        }
    }
    async extractLinks(options) {
        throw new Error("The method extractLinks should be overriden by your class");
    }
    async extractDetails(url, ...params) {
        throw new Error("The method extractDetails should be overriden by your class");
    }
    formatLink(link, source) {
        return { url: link, extractedAt: new Date(), source, used: false };
    }
    async persistLinks(links, db) {
        if (links.length) {
            let counter = 0;
            const bulk = db.collection(this.urlsCollection).initializeUnorderedBulkOp();
            links.forEach((link) => {
                // const formattedLink: ILink = { url: link, extractedAt: new Date(), source: this.BASE_URL, used: false }
                counter++;
                bulk.find({ url: link, used: false }).upsert().updateOne({ $set: link });
            });
            return bulk.execute().then(() => {
                this.logger.debug(`Persisted ${counter} links to the database!`);
            });
        }
    }
    async persistDetails(details, db) {
        if (!details.hasOwnProperty("length")) {
            return db.collection(this.detailsCollection).insertOne(details);
        }
        else {
            if (details.length) {
                return db.collection(this.detailsCollection).insertMany(details);
            }
        }
    }
    async getUnusedLinks(db, filter, detailed = false) {
        const queryFilter = filter ? { ...filter, used: false } : { used: false };
        console.log("QUERY FILTER: ", queryFilter);
        let unique = new Set();
        if (detailed) {
            return (await db.collection(this.urlsCollection).find(queryFilter).toArray()).filter((link) => {
                if (!unique.has(link.url)) {
                    unique.add(link.url);
                    return true;
                }
                else {
                    return false;
                }
            });
        }
        else {
            return [].concat(await db.collection(this.urlsCollection).distinct("url", queryFilter));
        }
    }
    async useLink(db, url) {
        return db.collection(this.urlsCollection).findOneAndUpdate({ url: url, used: false }, { $set: { used: true, usedAt: new Date() } });
    }
    async getDetails(queryFilter, db, queryOptions = null) {
        return db.collection(this.detailsCollection).find(queryFilter, queryOptions);
    }
}
exports.BaseCrawler = BaseCrawler;
