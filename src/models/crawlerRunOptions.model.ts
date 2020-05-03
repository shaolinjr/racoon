export interface CrawlerRunOptions {
    extractLinksOptions: {
        url?: string,
        concurrency?: number,
        waitFor?: number,
        linksFromDB?: boolean,
        dbLinksFilter?: any
    },
    extractDetailsOptions: {
        url?: string,
        concurrency?: number,
        waitFor?: number
    }
}