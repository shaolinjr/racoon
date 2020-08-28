import csvtojson from 'csvtojson'
import * as json2csv from 'json2csv'
import { AsyncParser } from 'json2csv'
import * as fs from 'fs'
import { createReadStream, createWriteStream } from 'fs'
import { FILE_EXTENSIONS } from '../constants/fileExtensions.constants'
import { getFileExtension, checkFile } from '../helpers/file'

export class FileParser {

    protected ALLOWED_EXTENSIONS = [FILE_EXTENSIONS.JSON, FILE_EXTENSIONS.CSV]

    protected flatten = json2csv.transforms.flatten({ separator: "_", objects: true, arrays: false })

    constructor(private baseFilePath: string) {
        checkFile(this.baseFilePath, this.ALLOWED_EXTENSIONS)
    }

    public async parseBaseFile(options?: { encoding?: string, delimiter?: string, filePath?: string }) {
        const { encoding, delimiter, filePath } = options

        switch (getFileExtension(filePath || this.baseFilePath)) {
            case ".csv":
                return csvtojson({ delimiter: delimiter || ";" }).fromFile(filePath || this.baseFilePath)
            case ".json":
                return JSON.parse(fs.readFileSync(filePath || this.baseFilePath, { encoding: encoding || "utf-8" }))
        }
    }

    public async convertJSONToCSV(options: json2csv.default.Options<any> = {}, data?: any[]): Promise<string> {
        if (!data) {
            data = await this.parseBaseFile()
        }

        options.transforms = [].concat(options.transforms || [], [this.flatten])
        return json2csv.parse(data, options)
    }
    /**
     * Method to perform the conversion from JSON to CSV in an async fashion. Takes advantage of the Streaming API.
     * @param {boolean} [returnCSV=false] Flag that states wether the resulting CSV should be returned from the method call
     * @param {string} [folderPath] The path to the destination folder of the new file
     * @param {string} [filename] The name that will be given to the new file
     * @param {son2csv.default.Options} [options] Object options to customize the execution of the parse (this is internal stuff of json2csv)
     */
    public async $convertJSONToCSV(returnCSV: boolean = false, folderPath?: string, filename?: string, options: json2csv.default.Options<any> = {}) {
        if (!returnCSV && (!folderPath || !filename)) {
            throw new Error("If you choose not to return the CSV in memory you must pass a folderPath and filename as parameter")
        }
        const opts: json2csv.default.Options<any> = { ...options } || {}
        opts.transforms = [].concat(options.transforms || [], [this.flatten])
        // console.log("OPTS: ", opts)
        const transformOptions = { highWaterMark: 6144, encoding: "utf-8" } // 6GB WATERMARK
        const input = createReadStream(this.baseFilePath, { encoding: "utf-8" })
        const asyncParser = new AsyncParser(opts, transformOptions)
        if (!returnCSV) {
            // const jsonTransform = new json2csv.Transform(opts, transformOptions)
            const output = createWriteStream(`${folderPath}/${filename}`, { encoding: "utf-8" })
            return asyncParser.fromInput(input).toOutput(output).promise(returnCSV)
        } else {
            return asyncParser.fromInput(input).promise(returnCSV)
        }
    }

    public exportCSVToFile(folderPath: string, filename: string, textContent: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.writeFileSync(`${folderPath}/${filename}`, textContent)
            resolve(`${folderPath}/${filename}`)
        })
    }

    public exportJSONTofile(folderPath: string, filename: string, jsonData: any[]): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.writeFileSync(`${folderPath}/${filename}`, JSON.stringify(jsonData))
            resolve(`${folderPath}/${filename}`)
        })
    }
}