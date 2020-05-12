import { AxiosRequestConfig } from 'axios';
export interface CrawlerRequestOptions {
    retryCounter: number;
    userAgent: string;
    retryIn: number;
    maxRetries: number;
    axiosOptions?: AxiosRequestConfig;
}
