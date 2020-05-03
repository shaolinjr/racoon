export declare class S3 {
    private config;
    private S3Client;
    constructor(config: {
        bucketName: string;
        endpoint?: string;
        accessKey: string;
        secretAccessKey: string;
        region: string;
    });
    getConfig(): {
        bucketName: string;
        endpoint?: string;
        accessKey: string;
        secretAccessKey: string;
        region: string;
    };
    getBucketURL(): void;
    sendToS3(options?: {
        filePath?: string;
        textContent?: string;
        filename?: string;
    }): Promise<unknown>;
}
