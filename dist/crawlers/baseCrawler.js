"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios = __importStar(require("axios"));
const winston_1 = __importDefault(require("winston"));
const winston_2 = require("winston");
const loggers_1 = require("../loggers");
// import { STORAGE_URL, STORAGE_DB } from "../config"
const Helper = __importStar(require("../helpers/functions"));
global.Promise = require("bluebird"); // Workaround for TypeScript
const Axios = axios.default;
class BaseCrawler {
    constructor(storage, detailsCollection = "products", urlsCollection = "urls") {
        this.storage = storage;
        this.detailsCollection = detailsCollection;
        this.urlsCollection = urlsCollection;
        this.join = Promise.join;
        this.MIN_REST_TIME = 1000;
        this.MAX_RETRY_ATTEMPTS = 3;
        this.BASE_URL = "<this-should-be-overriden>";
        this.STORAGE_URL = "<this-should-be-overriden>";
        this.STORAGE_DB = "<this-should-be-overriden>";
        this.SOURCE = null;
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
    async runExtractLinks(options) {
        const db = this.storage.getDB();
        let links = [];
        try {
            if (options.linksFromDB) {
                this.logger.debug("About to fetch unused links from the db");
                links = await this.getUnusedLinks(db, options.dbLinksFilter);
            }
            if (!links.length) {
                links = await this.extractLinks(options);
                // console.log("Links: ", links)
                const formattedLinks = links.map((link) => this.formatLink(link, this.BASE_URL));
                await this.persistLinks(formattedLinks, db); // broke here timed out connection
            }
            this.logger.info(`Found this amount of links: ${links.length}`);
        }
        catch (error) {
            this.logger.error("runExtractLinks error: " + JSON.stringify(error));
        }
        return links;
    }
    async runExtractDetails(options, links) {
        let resultDetails = [];
        const db = this.storage.getDB();
        try {
            let detailsCounter = 0;
            await Promise.map(links, async (link) => {
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
        let resultDetails = await this.runExtractDetails(options.extractDetailsOptions, links);
        // try {
        //     let detailsCounter = 0
        //     await Promise.map(links, async (link: any) => { //.slice(lastIndex)
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
        return resultDetails;
    }
    async makeRequest(url, options = this.defaultCrawlerRequestOptions) {
        try {
            const response = await Axios.get(url, { headers: { 'User-Agent': options.userAgent } });
            const data = response.data;
            if (data) {
                return data;
            }
            else {
                // const child = this.logger.child({ format: format.label({ label: "BaseCrawler > makeRequest" }) })
                // child.error(`response.data for URL: ${url} was empty`)
                throw new Error("Response came empty.");
            }
        }
        catch (error) {
            if (!error.isAxiosError) {
                throw error;
            }
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
    }
    async extractLinks(options) {
        throw new Error("The method extractLinks should be overriden by your class");
    }
    async extractDetails(url) {
        throw new Error("The method extractDetails should be overriden by your class");
    }
    formatLink(link, source) {
        return { url: link, extractedAt: new Date(), source, used: false };
    }
    async persistLinks(links, db) {
        const bulk = db.collection(this.urlsCollection).initializeUnorderedBulkOp();
        links.forEach((link) => {
            // const formattedLink: ILink = { url: link, extractedAt: new Date(), source: this.BASE_URL, used: false }
            bulk.find({ url: link, used: false }).upsert().updateOne(link);
        });
        return bulk.execute();
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
        if (detailed) {
            return db.collection(this.urlsCollection).find(queryFilter).toArray();
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
