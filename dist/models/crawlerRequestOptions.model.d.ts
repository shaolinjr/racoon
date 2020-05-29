export interface CrawlerRequestOptions {
    retryCounter?: number;
    userAgent?: string;
    retryIn?: number;
    maxRetries?: number;
    axiosOptions?: any;
}
