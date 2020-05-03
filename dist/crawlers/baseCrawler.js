"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios = __importStar(require("axios"));
// import { STORAGE_URL, STORAGE_DB } from "../config"
const Helper = __importStar(require("../helpers/functions"));
const storage_1 = require("../storage");
global.Promise = require("bluebird"); // Workaround for TypeScript
const Axios = axios.default;
class BaseCrawler {
    constructor(detailsCollection = "products", urlsCollection = "urls") {
        this.detailsCollection = detailsCollection;
        this.urlsCollection = urlsCollection;
        this.MIN_REST_TIME = 1000;
        this.MAX_RETRY_ATTEMPTS = 3;
        this.join = Promise.join;
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
            retryIn: this.MIN_REST_TIME * 5
        };
    }
    get source() {
        return this.SOURCE;
    }
    async run(options = this.defaultCrawlerOptions) {
        let { storage, client, scrapingDB } = await this.setupDB();
        // get the links
        let links = [];
        if (options.extractLinksOptions.linksFromDB) {
            console.log("About to fetch unused links from the db");
            links = await this.getUnusedLinks(scrapingDB, options.extractLinksOptions.dbLinksFilter);
        }
        if (!links.length) {
            links = await this.extractLinks(options.extractLinksOptions);
            // console.log("Links: ", links)
            const formattedLinks = links.map((link) => this.formatLink(link, this.BASE_URL));
            await this.persistLinks(formattedLinks, scrapingDB);
        }
        console.log("Found this amount of links: ", links.length);
        // get the details
        let resultDetails = [];
        try {
            let detailsCounter = 0;
            await Promise.map(links, async (link) => {
                console.log("Getting details for: ", link);
                const details = this.extractDetails(link);
                const rest = Helper.timeoutPromise(options.extractDetailsOptions.waitFor);
                return this.join(details, rest, async (details, rest) => {
                    if (details) {
                        detailsCounter++;
                        console.log(`Details progress: ${detailsCounter}/${links.length}`);
                        console.log("Details: ", details);
                        if (details.hasOwnProperty("length") && details.length || details) {
                            await this.persistDetails(details, scrapingDB);
                        }
                        await scrapingDB.collection(this.urlsCollection).findOneAndUpdate({ url: link, used: false }, { $set: { used: true, usedAt: new Date() } });
                    }
                    return details;
                });
            }, { concurrency: options.extractDetailsOptions.concurrency })
                .each((batchResult) => {
                if (batchResult) {
                    if (batchResult.hasOwnProperty("length") && batchResult.length) {
                        resultDetails.push(...batchResult);
                    }
                    else {
                        resultDetails.push(batchResult);
                    }
                }
            });
        }
        catch (error) {
            console.log("Shit happened on the concurrency part...: ", error);
        }
        await storage.closeDBConnection();
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
                throw new Error("Response came empty.");
            }
        }
        catch (error) {
            console.log("Notifying error on makeRequest: ", error.response.status);
            if (options.retryCounter >= 3 || error.response.status == 404) {
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
    async setupDB() {
        console.log(`Setup link: ${this.STORAGE_URL} | ${this.STORAGE_DB}`);
        const storage = new storage_1.CrawlerStorage(this.STORAGE_URL, this.STORAGE_DB);
        const client = await storage.connectToDB();
        const scrapingDB = storage.getDB();
        return { storage, client, scrapingDB };
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
