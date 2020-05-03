import csvtojson from 'csvtojson'
import * as json2csv from 'json2csv'
import * as fs from 'fs'
import { FILE_EXTENSIONS } from '../constants/fileExtensions.constants'
import { getFileExtension, checkFile } from '../helpers/file'

export class DefaultExporter {

    protected ALLOWED_EXTENSIONS = [FILE_EXTENSIONS.JSON, FILE_EXTENSIONS.CSV]

    protected flatten = json2csv.transforms.flatten({ separator: "_", objects: true, arrays: false })

    constructor(protected baseFilePath: string) {
        checkFile(this.baseFilePath, this.ALLOWED_EXTENSIONS)
    }

    public async parseBaseFile(encoding: string = "utf-8", delimiter: string = ";") {
        switch (getFileExtension(this.baseFilePath)) {
            case ".csv":
                return csvtojson({ delimiter }).fromFile(this.baseFilePath)
            case ".json":
                return JSON.parse(fs.readFileSync(this.baseFilePath, { encoding }))
        }
    }

    public async convertJSONToCSV(options: json2csv.default.Options<any> = {}, data?: any[]): Promise<string> {
        if (!data) {
            data = await this.parseBaseFile()
        }

        options.transforms = [].concat(options.transforms || [], [this.flatten])
        return json2csv.parse(data, options)
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

// const test = new DefaultExporter("./testingProducts.csv")
// test.parseBaseFile().then(async (result) => await test.exportJSONTofile("./", "testingJSON_export.json", result))