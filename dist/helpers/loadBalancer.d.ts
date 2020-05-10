interface LoadBalancerParams {
    /** Number of URLs to balance */
    urlsCount: number;
    /** Time available in hours to distribute the load */
    finishInHours: number;
    /** Amount of hours the process is allowed to run per day */
    hoursPerDay: number;
    /** Minimum threshold for delay per request in ms */
    minRequestDurationMS: number;
    /** Maximum threshold for delay per request ms */
    maxRequestDurationMS: number;
}
interface LoadBalancerStrategy {
    delayPerRequestMS: number;
    concurrency: number;
    avgAmountPerDay: number;
    estimateDurationInHours: number;
    estimateDurationInDays: number;
}
export declare function getLoadBalancerStrategy(params: LoadBalancerParams): LoadBalancerStrategy;
export {};
