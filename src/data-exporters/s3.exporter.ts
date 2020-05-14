import * as fs from 'fs'
import * as AWS from 'aws-sdk'
import { S3Config } from 'aws-sdk/clients/datasync'
import { RakoonS3Config } from '../models/s3Config.model'

export class S3 {
    private S3Client: AWS.S3
    constructor(private config: RakoonS3Config) {
        this.S3Client = new AWS.S3({ accessKeyId: config.accessKey, secretAccessKey: config.secretAccessKey, region: config.region })
    }

    public getConfig() {
        return this.config
    }

    public getBucketURL() { throw new Error("Method not implemented yet!") }

    public async sendToS3(options: { filePath?: string, textContent?: string, filename?: string } = {}) {
        let payload
        return new Promise((resolve, reject) => {

            if (!this.S3Client) {
                throw new Error("S3 is not configured.")
            }

            if (options.filePath) {
                const fileBuffer = fs.readFileSync(options.filePath)
                payload = {
                    Bucket: this.config.bucketName,
                    Key: `${options.filePath.split("/").reverse()[0]}`,
                    Body: fileBuffer
                }
            } else {
                if (!options.filename) {
                    reject(new Error("Filename must be provided when passing textContent."))
                } else if (!options.textContent) {
                    reject(new Error("textContent must be provided when filePath is not provided."))
                } else {
                    payload = {
                        Bucket: this.config.bucketName,
                        Key: options.filename,
                        Body: options.textContent
                    }
                }
            }

            this.S3Client.upload(payload, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        })
    }
}