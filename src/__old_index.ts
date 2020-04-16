// // import { Browser, Page } from 'puppeteer'
// import * as fs from 'fs'
// import * as cheerio from 'cheerio'
// import csv from 'csvtojson';
// import * as axios from 'axios'

// // Defining the Crawler structure:


// // Page Navigation Stop Strategies:
// // 1. Error on request 4xx or 5xx
// // 2. HTML selector verification
// // 2.1 The selector can be a not-found selector in HTML
// // 2.2 The selector can be a not-found selector specific for the pagination structure in HTML
// // 3. Custom strategy - The behavior can be extended if the user needs

// // One interesting possibility is the following scenario we found on drogamaxi.com.br:
// // The navigation process is very simple, using regular numbered list with links to next pages,
// // one catch is that if a request is made with a value that is bigger than the last page, the server
// // responds with the last page with content and don't return any errors. We found two possible ways
// // to detect the last page:

// // 1. Keep requesting page after page and check if the currentPage requested on the URL is bigger than the current-page
// // on the paginator selector.

// // 2. Check if there's a nextSiblingElement on the current-page element in HTML. If it's not null, than request the next link,
// // if it's null, stop navigating.

// export enum HTMLElementsType {
//     LINK,
//     PARAGRAPH,
//     IMAGE
// }

// export interface ProductData {
//     selector: string,
//     byAttribute: boolean,
//     valueAcessor?: string,
//     key: string,
//     regex?: string
// }

// export interface NavigationOptions {
//     type?: "html" | "api",
//     stopCondition: { selector: string, valueToCheck: string } | ((...args: any[]) => boolean),
//     // productListSelector: string, // should this be here?
//     startingPage?: number,
//     paginationSelector?: string,
//     // productData: Array<ProductData>,
//     // partiallySave?: { threshold: number, name: string, overwrite: boolean },
//     // finalSave: { name: string },
//     // reportTime?: { threshold: number },
//     // pageReport?: { threshold: number },
//     waitTimePerPage?: number
// }

// interface CrawlerConfigurations {
//     productData: Array<ProductData>,
//     partiallySave?: { threshold: number, name: string, overwrite: boolean },
//     finalSave: { name: string },
//     reportTime?: { threshold: number },
//     pageReport?: { threshold: number },
// }

// export class CrawlerNavigation implements NavigationOptions {
//     type: "html" | "api"
//     stopCondition: { selector: string, valueToCheck: string } | ((...args: any[]) => boolean)
//     productListSelector: string
//     startingPage?: number
//     paginationSelector?: string
//     // productData: Array<ProductData>
//     // partiallySave?: { threshold: number, name: string, overwrite: boolean }
//     // finalSave: { name: string }
//     // reportTime?: { threshold: number }
//     // pageReport?: { threshold: number }
//     waitTimePerPage: number


//     constructor(options: NavigationOptions) {
//         this.type = options.type || "html";
//         this.stopCondition = options.stopCondition
//         // this.productListSelector = options.productListSelector
//         this.paginationSelector = options.paginationSelector
//         this.startingPage = options.startingPage || 1
//         // this.productData = options.productData
//         // this.partiallySave = options.partiallySave || { threshold: 200, name: "partial.json", overwrite: true }
//         // this.finalSave = options.finalSave
//         // this.reportTime = options.reportTime || { threshold: 200 }
//         // this.pageReport = options.pageReport || { threshold: 200 }
//         this.waitTimePerPage = options.waitTimePerPage || 200
//     }
// }


// export class Crawler {
//     private axios = axios.default

//     constructor(private baseUrl: string, private method: "puppeteer" | "axios") { }

//     public getProductLinks() { }

//     // Crawler Statistics Methods:

//     private progressBar(current: number, total: number) {
//         /**
//          * This method prints a progress-bar into the console
//          */
//         let bar = "|"
//         const percentage = Math.ceil(current / total * 10)
//         for (let i = 0; i < percentage; i++) {
//             bar += "*"
//         }
//         for (let i = 0; i < 10 - percentage; i++) {
//             bar += " "
//         }
//         bar += "|"
//         return bar
//     }

//     public getBreakDownReport(threshold: number, foundProducts: number, totalProducts: number) {
//         if ((foundProducts) % threshold == 0 && foundProducts > 0) {
//             console.log(`*******************************************`)
//             console.log(`*********** IT'S REPORT TIME!!! ***********`)
//             console.log(`*******************************************`)
//             console.log(`* Number of products searched: ${totalProducts}`)
//             console.log(`* Number of products found: ${foundProducts}`)
//             console.log(`* BreakDown Percentage: ${((1 - (foundProducts / totalProducts)) * 100).toFixed(2)}%`)
//             console.log(`*******************************************`)
//             // this.lastReportCounter = totalProducts
//         }
//     }

//     public getProgressReport(threshold: number, foundProducts: number, totalProducts: number) {
//         if ((foundProducts) % threshold == 0 && foundProducts > 0) {
//             console.log(`*******************************************`)
//             console.log(`*********** IT'S REPORT TIME!!! ***********`)
//             console.log(`*******************************************`)
//             console.log(`* Number of products searched: ${totalProducts}`)
//             console.log(`* Number of products found: ${foundProducts}`)
//             console.log(`* Progress Percentage: ${(foundProducts / totalProducts * 100).toFixed(2)}%`)
//             console.log(`* Progress Bar: ${this.progressBar(foundProducts, totalProducts)}`)
//             console.log(`*******************************************`)
//             // this.lastReportCounter = totalProducts
//         }
//     }

//     public getPageReport(threshold: number, currentPage: number, productsFound: number, currentLink: string) {
//         if ((currentPage) % threshold == 0 && currentPage > 0) {
//             console.log(`*******************************************`)
//             console.log(`******** IT'S PAGE REPORT TIME!!! *********`)
//             console.log(`*******************************************`)
//             console.log(`* Current Page: ${currentPage}`)
//             console.log(`* Number of products found: ${productsFound}`)
//             console.log(`* Current Link: ${currentLink}`)
//             console.log(`*******************************************`)
//         }
//     }

//     // Navigation Methods:

//     public async navigateByPage(pageUrl: string, options: PageNavigationOptions | APINavigationOptions) {
//         // TODO: This method is going to collect first level data from all the pages
//         // How should we call the method that will enter on each link, going to the details page?
//         if (options.type == "api") {
//             // Do something here
//         } else if (options.type == "html") {
//             const stopCondition: any = options.stopCondition
//             const productListSelector: string = options.productListSelector
//             const partialSaveConfig = options.partiallySave ? options.partiallySave : null

//             let pageNumber: number = options.startingPage || 1
//             let results = []

//             if (this.method == "puppeteer") {
//             } else { // axios
//                 while (true) {
//                     try {
//                         if (options.pageReport) {
//                             const link = this.getPageLink(pageNumber, pageUrl)
//                             this.getPageReport(options.pageReport.threshold, pageNumber, results.length, link)
//                         }
//                         let response: any = await this.goToPage(pageNumber, pageUrl)
//                         let $ = cheerio.load(response.data)
//                         // Check stopCondition:
//                         let shouldStop: boolean = false
//                         $(stopCondition.selector).each((i, el) => {
//                             if ($(el).text() == stopCondition.valueToCheck) {
//                                 shouldStop = true
//                                 return
//                             }
//                         })
//                         if (shouldStop) {
//                             console.log(">> Reached the bottom of the ocean! Going out!")
//                             break
//                         }
//                         let productList: any = $(productListSelector)
//                         let productsInfo = this.getInfoFromProductList(productList, ...options.productData)
//                         results.push(...productsInfo)

//                         if (partialSaveConfig) {
//                             this.partiallySave(partialSaveConfig.threshold,
//                                 results,
//                                 `${partialSaveConfig.name}${partialSaveConfig.overwrite ? '' : new Date().getTime()}`)
//                         }
//                         pageNumber++
//                         if (options.waitTimePerPage > 0) {
//                             console.log(`>> About to wait for ${options.waitTimePerPage}ms before going to next page!`)
//                             await this.timeoutPromise(options.waitTimePerPage)
//                         }
//                     } catch (error) {
//                         console.log("Ops... Error happened: ", error)
//                         break
//                     }
//                 }
//                 this.finalSave(results, options.finalSave.name)
//             }
//         }
//     }

//     public goToPage(pageNumber: number, pageUrl: string) {
//         if (this.method == "puppeteer") {

//         } else {
//             return this.axios.get(`${this.baseUrl}${pageUrl}${pageNumber}`)
//         }
//     }

//     public goToLink(link: string) {
//         if (this.method == "puppeteer") {

//         } else {
//             if (link.indexOf(this.baseUrl) >= 0) {
//                 return this.axios.get(`${this.removeExtraSlashesFromUrl(link)}`)
//             }
//             return this.axios.get(`${this.removeExtraSlashesFromUrl((this.baseUrl + link))}`)
//         }
//     }

//     // Data Extraction Methods:

//     public getProductList(productListSelector: string, parsedHTML: any) {
//         if (this.method == "puppeteer") {
//             // DO THINGS HERE
//         } else {
//             let $ = cheerio.load(parsedHTML)
//             return $(productListSelector)
//         }
//     }

//     public searchProductBySearchBar(term: string, searchBarSelector: string, resultsSelector: string) { }


//     public async searchProductByURL(term: string, searchURL: string, resultsSelector: string, ) {
//         if (this.method == "puppeteer") {

//         } else {
//             let response = await this.axios.get(`${this.baseUrl}${searchURL}${encodeURI(term)}`)
//             let $ = cheerio.load(response.data)
//             let results = $(resultsSelector)
//             console.log("Results length: ", results.length)
//             return results
//         }
//     }

//     public getProductInfo(product: any | Cheerio, ...productInfo: Array<ProductData>) {
//         let $ = cheerio.load(product)
//         let productData: any = {}
//         for (let info of productInfo) {
//             // console.log("Getting this info: ", info.key)
//             const data = $(product).find(info.selector)
//             if (data) {
//                 if (info.byAttribute) {
//                     let value = data.attr(info.valueAcessor) || null
//                     productData[info.key] = value
//                 } else {
//                     // consider only .text() for now
//                     productData[info.key] = data.text() || null
//                 }
//                 if (info.regex && productData[info.key]) {
//                     const re = new RegExp(info.regex)
//                     const match = re.exec(productData[info.key])
//                     if (match) {
//                         productData[info.key] = match[0]
//                     } else {
//                         productData[info.key] = null
//                     }
//                 }
//             } else {
//                 console.log("Product element not found!")
//             }
//         }
//         return productData
//     }

//     public getInfoFromProductList(productList: any, ...productInfo: Array<ProductData>): Array<any> {
//         let results = []
//         for (let product of productList) {
//             const productData = this.getProductInfo(product, ...productInfo)
//             results.push(productData)
//             console.log("Product data: ", productData)
//         }
//         return results
//     }

//     // Utils Methods

//     public glueFileContents(prefix: string, directoryPath: string) {
//         const files = fs.readdirSync(directoryPath)
//         const toBeGlued = files.filter((filename) => filename.includes(prefix)).map((filename) => `${directoryPath}/${filename}`)
//         let complete = []
//         for (let filePath of toBeGlued) {
//             const rawContent = fs.readFileSync(filePath)
//             const content = JSON.parse(rawContent.toString())
//             complete.push(...content)
//         }
//         return complete
//     }

//     private getPageLink(pageNumber?: number, pageUrl?: string) {
//         //TOFIX: This method is very limited and focused in one type of url, we must improve this
//         return `${this.baseUrl}${pageUrl || ''}${pageNumber || ''}`
//     }

//     private removeExtraSlashesFromUrl(url: string) {
//         return url.replace(/([^:]\/)\/+/g, "$1")
//     }

//     public async timeoutPromise(timeout: number) {
//         return new Promise(resolve => setTimeout(resolve, timeout));
//     }

//     public restartIndex(products: Array<any>, lastEAN: string | number) {
//         let index = products.findIndex(el => el.ean.toString() == lastEAN.toString());
//         if (index >= 0) {
//             return index
//         }
//         return 0
//     }

//     public createGTINWithZeros(ean: any) {
//         let newEAN = ean.toString();
//         while (newEAN.length < 14) {
//             newEAN = "0" + newEAN;
//         }
//         return newEAN;
//     }

//     public formatEAN(ean: string) {
//         for (let i = 0; i < ean.length; i++) {
//             if (ean[i] != "0") {
//                 ean = ean.slice(i)
//                 break
//             }
//         }
//         return ean
//     }

//     public formatJsonToCSV(jsonArray: Array<any>) {
//         jsonArray = jsonArray.filter((result) => result != null)
//         let columns = Object.keys(jsonArray[0]);
//         // console.log(columns);
//         let result = columns.join(",");
//         result += "\n";
//         // console.log(result)
//         for (let el of jsonArray) {
//             //console.log("El: ",el);
//             let row = ""
//             for (let col of columns) {
//                 //console.log("el[col]: ",el[col])
//                 if (el.hasOwnProperty(col)) {
//                     row += `"${el[col]}",`
//                 } else {
//                     row += ','
//                 }
//             }
//             //console.log("bef: ",row)
//             row = row.substring(0, row.length - 1);
//             //console.log("row: ",row);
//             result += row + '\n';
//         }
//         //console.log("result: ",result);
//         return result;
//     }

//     public readCSVFromFile(filePath: string, delimiter: string): Promise<any> {
//         return new Promise((resolve, reject) => {
//             csv({ delimiter }).fromFile(filePath)
//                 .then((result) => resolve(result))
//         });
//     }

//     // Persistence Methods

//     public partiallySave(threshold: number, products: Array<any>, name: string) {
//         if ((products.length) % threshold == 0 && products.length > 0) {
//             console.log(">> About to save partially <<")
//             fs.writeFileSync(`./results/partials/${name}.json`, JSON.stringify(products))
//             // this.lastPartialCounter = products.length
//         }
//     }

//     public finalSave(products: Array<any>, name: string) {
//         fs.writeFileSync(`./results/${name}.json`, JSON.stringify(products))
//     }
// }

// export class CrawlerPersistence {

// }

// // POSSIBLE CONCURRENCY QUEUE
// function enqueueProcesses(processes: any, concurrency: number) {
//     let executionQueue: any[] = []
//     for (let i = 0; i < processes.length; i += concurrency) {
//         if (i + concurrency > processes.length) {
//             executionQueue.push(processes.slice(i))
//         } else {
//             executionQueue.push(processes.slice(i, i + concurrency))
//         }
//     }
//     return executionQueue
// }

// async function executeProcesses(queue: any[]) {
//     for (let processes of queue) {
//         await Promise.all(processes.map((process: any) => process.func(process.parameters)))
//     }
// }

// // interface IStorage {
// //     uuid?: string,
// //     createdAt?: Date,
// //     items?: number,
// //     updatedAt?: Date,
// //     create: (name: string, id?: string, path?: string) => Promise<boolean>,
// //     drop: (name: string, path?: string) => Promise<boolean>,
// //     insert: (obj: any) => Promise<boolean>,
// //     bulkInsert: (obj: any[]) => Promise<boolean>,
// //     open: (name: string, path?: string) => Promise<any>,
// // }

// // export class FileStorage implements IStorage {
// //     uuid?: string;
// //     createdAt?: Date;
// //     items?: number;
// //     updatedAt?: Date;

// //     constructor(private name: string, private path: string) { }

// //     async insert(obj: any): Promise<boolean> {

// //     }
// //     async bulkInsert(obj: any[]): Promise<boolean> {

// //     }

// //     async create(name: string, id?: string, path?: string): Promise<boolean> {

// //     }

// //     async drop(name: string, path?: string): Promise<boolean> {

// //     }

// //     async open(name: string, path?: string): Promise<any> {

// //     }
// // }

// // export class MongoDBStorage { }


// // export class CrawlerStorage { }