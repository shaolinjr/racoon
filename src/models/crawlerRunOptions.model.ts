export interface ExtractLinksOptions {
    url?: string,
    concurrency?: number,
    waitFor?: number,
    linksFromDB?: boolean,
    dbLinksFilter?: any
}

export interface ExtractDetailsOptions {
    url?: string,
    concurrency?: number,
    waitFor?: number
}

export interface CrawlerRunOptions {
    extractLinksOptions: ExtractLinksOptions,
    extractDetailsOptions: ExtractDetailsOptions
}