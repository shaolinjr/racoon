"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const AWS = __importStar(require("aws-sdk"));
class S3 {
    constructor(config) {
        this.config = config;
        this.S3Client = new AWS.S3({ accessKeyId: config.accessKey, secretAccessKey: config.secretAccessKey, region: config.region });
    }
    getConfig() {
        return this.config;
    }
    getBucketURL() { throw new Error("Method not implemented yet!"); }
    async sendToS3(options = {}) {
        let payload;
        return new Promise((resolve, reject) => {
            if (!this.S3Client) {
                throw new Error("S3 is not configured.");
            }
            if (options.filePath) {
                const fileBuffer = fs.readFileSync(options.filePath);
                payload = {
                    Bucket: this.config.bucketName,
                    Key: `${options.filePath.split("/").reverse()[0]}`,
                    Body: fileBuffer
                };
            }
            else {
                if (!options.filename) {
                    reject(new Error("Filename must be provided when passing textContent."));
                }
                else if (!options.textContent) {
                    reject(new Error("textContent must be provided when filePath is not provided."));
                }
                else {
                    payload = {
                        Bucket: this.config.bucketName,
                        Key: options.filename,
                        Body: options.textContent
                    };
                }
            }
            this.S3Client.upload(payload, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
}
exports.S3 = S3;
