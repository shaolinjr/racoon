interface LoadBalancerParams {
    /** Number of URLs to balance */
    urlsCount: number,
    /** Time available in hours to distribute the load */
    finishInHours: number,
    /** Amount of hours the process is allowed to run per day */
    hoursPerDay: number,
    /** Minimum threshold for delay per request in ms */
    minRequestDurationMS: number,
    /** Maximum threshold for delay per request ms */
    maxRequestDurationMS: number,
    /** Default value for concurrency */
    // defaultConcurrency: number
}

interface LoadBalancerStrategy {
    delayPerRequestMS: number,
    concurrency: number,
    avgAmountPerDay: number,
    estimateDurationInHours: number,
    estimateDurationInDays: number
}

export function getLoadBalancerStrategy(params: LoadBalancerParams): LoadBalancerStrategy {
    let concurrency = 1

    const idealRequestsPerHour = Math.ceil(params.urlsCount / params.finishInHours) // number of requests/hour that must be made to finish in time
    console.log("IdealRequestsPerHour: ", idealRequestsPerHour)
    const idealRequestsPerSecond = idealRequestsPerHour / 60 / 60
    console.log("idealRequestsPerSecond: ", idealRequestsPerSecond)
    const minRequestsPerSecond = (1 / (params.maxRequestDurationMS / 1000)) // its inversed because the longer the duration, less requests are made per second
    const maxRequestsPerSecond = (1 / (params.minRequestDurationMS / 1000))
    // console.log("maxRequests per Second: ", maxRequestsPerSecond)
    // console.log("minRequests per Second: ", minRequestsPerSecond)
    if (idealRequestsPerSecond > maxRequestsPerSecond) { // per second
        concurrency = Math.ceil(idealRequestsPerSecond / maxRequestsPerSecond)

        const newRequestsPerHour = maxRequestsPerSecond * 60 * 60 * concurrency
        // console.log("newRequestsPerHour: ", newRequestsPerHour)
        const durationInHours = +((params.urlsCount / newRequestsPerHour))
        const durationInDays = Math.ceil(durationInHours / params.hoursPerDay)
        return <LoadBalancerStrategy>{
            delayPerRequestMS: params.maxRequestDurationMS,
            concurrency,
            estimateDurationInHours: durationInHours,
            estimateDurationInDays: durationInDays,
            avgAmountPerDay: Math.ceil(newRequestsPerHour * durationInHours / durationInDays)
        }
    } else if (idealRequestsPerSecond < minRequestsPerSecond) {
        const newRequestsPerHour = minRequestsPerSecond * 60 * 60
        // console.log("newRequestsPerHour: ", newRequestsPerHour)
        const durationInHours = +((params.urlsCount / newRequestsPerHour))
        const durationInDays = Math.ceil(durationInHours / params.hoursPerDay)
        return <LoadBalancerStrategy>{
            delayPerRequestMS: params.minRequestDurationMS,
            concurrency,
            estimateDurationInHours: durationInHours,
            estimateDurationInDays: durationInDays,
            avgAmountPerDay: Math.ceil(newRequestsPerHour * durationInHours / durationInDays)
        }
    } else {
        const durationInDays = Math.ceil(params.finishInHours / params.hoursPerDay)
        return <LoadBalancerStrategy>{
            delayPerRequestMS: +((1 / idealRequestsPerSecond) * 1000).toFixed(2),
            concurrency,
            estimateDurationInHours: params.finishInHours,
            estimateDurationInDays: durationInDays,
            avgAmountPerDay: Math.ceil(idealRequestsPerHour * params.finishInHours / durationInDays)
        }
    }
}

// test cases:
// 12.000 URLS => 2 DIAS
const params = {
    urlsCount: 13446720,
    /** Time available in hours to distribute the load */
    finishInHours: 16 * 13,
    /** Amount of hours the process is allowed to run per day */
    hoursPerDay: 16,
    /** Minimum threshold for delay per request in ms */
    minRequestDurationMS: 8 * 1000,
    /** Maximum threshold for Duration per request ms */
    maxRequestDurationMS: 10 * 1000,
}
console.log("Strategy: ", getLoadBalancerStrategy(params))