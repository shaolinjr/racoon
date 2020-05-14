import { RakoonS3Config } from '../models/s3Config.model';
export declare class S3 {
    private config;
    private S3Client;
    constructor(config: RakoonS3Config);
    getConfig(): RakoonS3Config;
    getBucketURL(): void;
    sendToS3(options?: {
        filePath?: string;
        textContent?: string;
        filename?: string;
    }): Promise<unknown>;
}
