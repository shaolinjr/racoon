export interface ICrawlerRequest {
    /** URL for the crawler to request */
    url: string;
    /** Information that identifies that robot */
    crawler?: {
        name: string;
        identifier?: string;
    };
    /** The source website to be used */
    source: {
        url: string;
        name: string;
    };
    /** Extra metadata to help guide the robot on the details extraction or URL request for example */
    data?: any;
    /** Flag to mark URL as used */
    used: boolean;
    /** Status for the request state */
    status: "AVAILABLE" | "USED" | "FAILED" | "RETRYING";
    /** Amount of retries  left for that URL in case of error*/
    retriesLeft?: number;
    /** Details about where to store the details obtained from the URL */
    db?: {
        name: string;
        collection: string;
        extra?: any;
    };
    createdAt: Date;
    updatedAt: Date;
    usedAt: Date;
}
/**
 *
 * CRAWLER STATES (in order):
 * -> IDLE
 * -> RUNNING
 * -> STOPPED
 * -> FAILED
 *
 --------------------------------
 *
 * REQUEST STATES (in order):
 * -> AVAILABLE
 * -> USED
 * -> FAILED
 * -> RETRYING
 *
 */ 
