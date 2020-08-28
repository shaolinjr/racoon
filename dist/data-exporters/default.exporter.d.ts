import * as json2csv from 'json2csv';
import { FILE_EXTENSIONS } from '../constants/fileExtensions.constants';
export declare class DefaultExporter {
    private baseFilePath;
    protected ALLOWED_EXTENSIONS: FILE_EXTENSIONS[];
    protected flatten: json2csv.transforms.Json2CsvTransform<any, any>;
    constructor(baseFilePath: string);
    parseBaseFile(encoding?: string, delimiter?: string, filePath?: string): Promise<any>;
    convertJSONToCSV(options?: json2csv.default.Options<any>, data?: any[]): Promise<string>;
    /**
     * Method to perform the conversion from JSON to CSV in an async fashion. Takes advantage of the Streaming API.
     * @param {boolean} [returnCSV=false] Flag that states wether the resulting CSV should be returned from the method call
     * @param {string} [folderPath] The path to the destination folder of the new file
     * @param {string} [filename] The name that will be given to the new file
     * @param {son2csv.default.Options} [options] Object options to customize the execution of the parse (this is internal stuff of json2csv)
     */
    $convertJSONToCSV(returnCSV?: boolean, folderPath?: string, filename?: string, options?: json2csv.default.Options<any>): Promise<string>;
    exportCSVToFile(folderPath: string, filename: string, textContent: string): Promise<string>;
    exportJSONTofile(folderPath: string, filename: string, jsonData: any[]): Promise<string>;
}
