import * as axios from 'axios'
// import { STORAGE_URL, STORAGE_DB } from "../config"
import * as Helper from '../helpers/functions'
import { Db, MongoClient } from 'mongodb'
import { CrawlerStorage } from '../storage'
import { CrawlerRunOptions, ILink, CrawlerRequestOptions } from '../models'

global.Promise = require("bluebird"); // Workaround for TypeScript
const Axios = axios.default

export class BaseCrawler {
    protected MIN_REST_TIME = 1000
    protected MAX_RETRY_ATTEMPTS = 3
    protected join = Promise.join

    protected BASE_URL = "<this-should-be-overriden>"
    protected STORAGE_URL = "<this-should-be-overriden>"
    protected STORAGE_DB = "<this-should-be-overriden>"
    protected SOURCE: { name: string, url: string } = null

    constructor(private detailsCollection: string = "products", private urlsCollection: string = "urls") { }

    public get source() {
        return this.SOURCE
    }

    private defaultCrawlerOptions: CrawlerRunOptions = {
        extractDetailsOptions: { concurrency: 1, waitFor: this.MIN_REST_TIME },
        extractLinksOptions: { concurrency: 1, waitFor: this.MIN_REST_TIME, linksFromDB: false, dbLinksFilter: {} }

    }

    private defaultCrawlerRequestOptions: CrawlerRequestOptions = {
        retryCounter: this.MAX_RETRY_ATTEMPTS,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
        retryIn: this.MIN_REST_TIME * 5
    }

    public async run(options: CrawlerRunOptions = this.defaultCrawlerOptions): Promise<any> {
        let { storage, client, scrapingDB } = await this.setupDB()

        // get the links
        let links = []
        if (options.extractLinksOptions.linksFromDB) {
            console.log("About to fetch unused links from the db")
            links = await this.getUnusedLinks(scrapingDB, options.extractLinksOptions.dbLinksFilter)
        }
        if (!links.length) {
            links = await this.extractLinks(options.extractLinksOptions)
            // console.log("Links: ", links)
            const formattedLinks: ILink[] = links.map((link: any) => this.formatLink(link, this.BASE_URL))
            await this.persistLinks(formattedLinks, scrapingDB)
        }

        console.log("Found this amount of links: ", links.length)

        // get the details
        let resultDetails = []
        try {
            let detailsCounter = 0
            await Promise.map(links, async (link: any) => { //.slice(lastIndex)
                console.log("Getting details for: ", link)
                const details = this.extractDetails(link)
                const rest = Helper.timeoutPromise(options.extractDetailsOptions.waitFor)
                return this.join(details, rest, async (details: any, rest) => {
                    if (details) {
                        detailsCounter++;
                        console.log(`Details progress: ${detailsCounter}/${links.length}`)
                        console.log("Details: ", details)
                        if (details.hasOwnProperty("length") && details.length || details) {
                            await this.persistDetails(details, scrapingDB)
                        }
                        await scrapingDB.collection(this.urlsCollection).findOneAndUpdate({ url: link, used: false }, { $set: { used: true, usedAt: new Date() } })
                    }
                    return details
                })
            }, { concurrency: options.extractDetailsOptions.concurrency })
                .each((batchResult: any) => {
                    if (batchResult) {
                        if (batchResult.hasOwnProperty("length") && batchResult.length) {
                            resultDetails.push(...batchResult)
                        } else {
                            resultDetails.push(batchResult)
                        }
                    }
                })
        } catch (error) {
            console.log("Shit happened on the concurrency part...: ", error)
        }

        await storage.closeDBConnection()
        return resultDetails
    }

    protected async makeRequest(url: string, options: CrawlerRequestOptions = this.defaultCrawlerRequestOptions) {
        try {
            const response = await Axios.get(url, { headers: { 'User-Agent': options.userAgent } })

            const data = response.data
            if (data) {
                return data
            } else {
                throw new Error("Response came empty.")
            }

        } catch (error) {
            console.log("Notifying error on makeRequest: ", error.response.status)

            if (options.retryCounter >= 3 || error.response.status == 404) {
                console.log("Couldn't proceed...: ", url)
                throw error
            } else {
                await Helper.timeoutPromise(options.retryIn) // resting for a while and then returning something
                console.log("Requesting again!: ", url)
                options.retryCounter++
                return await this.makeRequest(url, options)
            }
        }
    }

    protected async extractLinks(options?: any): Promise<string[] | any[]> {
        throw new Error("The method extractLinks should be overriden by your class")
    }

    protected async extractDetails(url: string | any): Promise<any[] | any | null> {
        throw new Error("The method extractDetails should be overriden by your class")
    }

    protected formatLink(link: string, source: string): ILink {
        return { url: link, extractedAt: new Date(), source, used: false }
    }

    protected async setupDB(): Promise<{ storage: CrawlerStorage, client: MongoClient, scrapingDB: Db }> {
        console.log(`Setup link: ${this.STORAGE_URL} | ${this.STORAGE_DB}`)
        const storage = new CrawlerStorage(this.STORAGE_URL, this.STORAGE_DB)
        const client = await storage.connectToDB()
        const scrapingDB = storage.getDB()

        return { storage, client, scrapingDB }
    }

    protected async persistLinks(links: ILink[], db: Db) {
        const bulk = db.collection(this.urlsCollection).initializeUnorderedBulkOp()

        links.forEach((link) => {
            // const formattedLink: ILink = { url: link, extractedAt: new Date(), source: this.BASE_URL, used: false }
            bulk.find({ url: link, used: false }).upsert().updateOne(link)
        })

        return bulk.execute()
    }

    protected async persistDetails(details: any[] | any, db: Db) {
        if (!details.hasOwnProperty("length")) {
            return db.collection(this.detailsCollection).insertOne(details)
        } else {
            if (details.length) {
                return db.collection(this.detailsCollection).insertMany(details)
            }
        }
    }

    protected async getUnusedLinks(db: Db, filter?: any, detailed: boolean = false) {
        const queryFilter = filter ? { ...filter, used: false } : { used: false }

        if (detailed) {
            return db.collection(this.urlsCollection).find(queryFilter).toArray()
        } else {
            return [].concat(await db.collection(this.urlsCollection).distinct("url", queryFilter))
        }
    }

    protected async useLink(db: Db, url: string) {
        return db.collection(this.urlsCollection).findOneAndUpdate({ url: url, used: false }, { $set: { used: true, usedAt: new Date() } })
    }

    public async getDetails(queryFilter: any, db: Db, queryOptions: any = null) {
        return db.collection(this.detailsCollection).find(queryFilter, queryOptions)
    }
}
