import * as axios from 'axios'
import winston from 'winston'
import { format } from 'winston'
import { setupCrawlerLogger } from '../loggers'
import * as Helper from '../helpers/functions'
import { Db, MongoClient } from 'mongodb'
import { CrawlerStorage } from '../storage'
import { CrawlerRunOptions, ILink, CrawlerRequestOptions, ExtractDetailsOptions, ExtractLinksOptions } from '../models'
import { Inspection } from 'bluebird'
import { EventEmitter } from 'events'
import { BaseCrawlerEvents } from '../events'
import { EmptyResponseError } from '../errors'

import Bluebird from 'bluebird'
import { Promise as BPromise } from 'bluebird'
// global.BPromise = require("bluebird"); // Workaround for TypeScript
const Axios = axios.default
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

export class BaseCrawler { // extends Crawler 
    public join = Bluebird.join
    protected MIN_REST_TIME = 1000
    protected MAX_RETRY_ATTEMPTS = 3
    protected logger: winston.Logger
    protected BASE_URL = "<this-should-be-overriden>"
    protected STORAGE_URL = "<this-should-be-overriden>"
    protected STORAGE_DB = "<this-should-be-overriden>"
    protected SOURCE: { name: string, url: string } = null

    public events = BaseCrawlerEvents

    constructor(public storage: CrawlerStorage, private detailsCollection: string = "products", private urlsCollection: string = "urls") {
        const loggerName = setupCrawlerLogger()
        this.logger = winston.loggers.get(loggerName)
        this.logger.level = 'info'
        this.logger.format = format.combine(
            format.colorize(),
            format.simple()
        )
    }

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
        retryIn: this.MIN_REST_TIME * 5,
        maxRetries: 3
    }

    public async runExtractLinks(options: ExtractLinksOptions = this.defaultCrawlerOptions.extractLinksOptions): Promise<ILink[]> {
        const db = this.storage.getDB()
        let links = []
        try {
            if (options.linksFromDB) {
                this.logger.debug("About to fetch unused links from the db")
                links = await this.getUnusedLinks(db, options.dbLinksFilter)
                this.logger.debug(`Found ${links.length} links in DB`)
            }
            if (!links.length) {
                links = await this.extractLinks(options)
                // console.log("XLinks: ", links)
                const formattedLinks: ILink[] = links.map((link: any) => this.formatLink(link, this.BASE_URL))
                this.logger.debug("About to start persisting the links!")
                await this.persistLinks(formattedLinks, db) // broke here timed out connection
            }

            this.logger.info(`Found this amount of links: ${links.length}`)
        } catch (error) {
            this.logger.error("runExtractLinks error: " + JSON.stringify(error))
            throw error
        }
        BaseCrawlerEvents.emit("extractLinks:finished")
        return links
    }

    public async runExtractDetails(links: Array<any | ILink>, options: ExtractDetailsOptions = this.defaultCrawlerOptions.extractDetailsOptions) {
        let resultDetails = []
        const db = this.storage.getDB()
        try {
            let detailsCounter = 0
            await BPromise.map(links, async (link: any) => { //.slice(lastIndex)
                this.logger.debug(`Getting details for: ${link}`)
                const details = this.extractDetails(link)
                const rest = Helper.timeoutPromise(options.waitFor)
                return this.join(details, rest, async (details: any, rest) => {
                    if (details) {
                        detailsCounter++;
                        this.logger.info(`Details progress: ${detailsCounter}/${links.length}`)
                        this.logger.debug(`Details: ${JSON.stringify(details)}`)
                        if (details) {
                            if (details.hasOwnProperty("length") && details.length || details) {
                                await this.persistDetails(details, db)
                                this.logger.info(`Persisted details for: ${link}`)
                            }
                        }

                        await db.collection(this.urlsCollection).updateMany({ url: link, used: false }, { $set: { used: true, usedAt: new Date() } })

                        this.logger.debug("Updated the urls state to 'used:true' in db.")
                    }
                    return details
                }).reflect()
            }, { concurrency: options.concurrency })
                .each(async (promise: Inspection<any>) => {
                    if (promise.isFulfilled()) {
                        const result = promise.value()
                        if (result) {
                            if (result.hasOwnProperty("length") && result.length) {
                                resultDetails.push(...result)
                            } else {
                                resultDetails.push(result)
                            }
                        }
                    } else {
                        this.logger.error("runExtractDetails error: " + JSON.stringify(promise.reason()))
                    }
                })
        } catch (error) {
            this.logger.error(`Shit happened on the concurrency part...: ${error}`)
            throw error
        }
        BaseCrawlerEvents.emit("extractDetails:finished")
        return resultDetails
    }

    public async run(options: CrawlerRunOptions = this.defaultCrawlerOptions): Promise<any> {
        // let { storage, client, scrapingDB } = await this.setupDB()

        // get the links
        let links = await this.runExtractLinks(options.extractLinksOptions)
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
        let resultDetails = await this.runExtractDetails(links, options.extractDetailsOptions)
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
        BaseCrawlerEvents.emit("run:finished")
        return resultDetails
    }

    protected async makeRequest(url: string, options?: CrawlerRequestOptions) {
        try {
            options = { ...this.defaultCrawlerRequestOptions, ...options }

            let requestConfig: axios.AxiosRequestConfig = { method: "GET" }
            requestConfig = { ...options.axiosOptions }
            requestConfig.headers = { ...(options.axiosOptions || {}).headers, 'User-Agent': options.userAgent }

            const response = await Axios.request({ url, ...requestConfig }) //url, { headers: { 'User-Agent': options.userAgent } }
            const data = response.data
            if (data) {
                return data
            } else {
                // const child = this.logger.child({ format: format.label({ label: "BaseCrawler > makeRequest" }) })
                // child.error(`response.data for URL: ${url} was empty`)
                throw new EmptyResponseError(`The URL: ${url} response was empty content.`)
                // throw new Error("Response came empty.")
            }

        } catch (error) {
            if (!error.isAxiosError) {
                throw error
            }
            if (error.response) {
                console.log("Notifying error on makeRequest: ", error.response.status)

                if (options.retryCounter >= options.maxRetries || error.response.status == 404) {
                    console.log("Couldn't proceed...: ", url)
                    throw error
                } else {
                    await Helper.timeoutPromise(options.retryIn) // resting for a while and then returning something
                    console.log("Requesting again!: ", url)
                    options.retryCounter++
                    return await this.makeRequest(url, options)
                }
            } else {
                throw error
            }
        }
    }

    protected async extractLinks(options?: any): Promise<string[] | any[]> {
        throw new Error("The method extractLinks should be overriden by your class")
    }

    protected async extractDetails(url: string | any, ...params: any[]): Promise<any[] | any | null> {
        throw new Error("The method extractDetails should be overriden by your class")
    }

    protected formatLink(link: string, source: string): ILink {
        return { url: link, extractedAt: new Date(), source, used: false }
    }

    protected async persistLinks(links: ILink[], db: Db) {
        if (links.length) {
            let counter = 0
            const bulk = db.collection(this.urlsCollection).initializeUnorderedBulkOp()

            links.forEach((link) => {
                // const formattedLink: ILink = { url: link, extractedAt: new Date(), source: this.BASE_URL, used: false }
                counter++
                bulk.find({ url: link, used: false }).upsert().updateOne({ $set: link })
            })

            return bulk.execute().then(() => {
                this.logger.debug(`Persisted ${counter} links to the database!`)
            })
        }
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
        console.log("QUERY FILTER: ", queryFilter)
        let unique = new Set()
        if (detailed) {
            return (await db.collection(this.urlsCollection).find(queryFilter).toArray()).filter((link) => {
                if (!unique.has(link.url)) {
                    unique.add(link.url)
                    return true
                } else {
                    return false
                }
            })
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
