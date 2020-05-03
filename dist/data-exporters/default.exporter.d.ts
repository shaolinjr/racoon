import * as json2csv from 'json2csv';
import { FILE_EXTENSIONS } from '../constants/fileExtensions.constants';
export declare class DefaultExporter {
    protected baseFilePath: string;
    protected ALLOWED_EXTENSIONS: FILE_EXTENSIONS[];
    protected flatten: json2csv.transforms.Json2CsvTransform<any, any>;
    constructor(baseFilePath: string);
    parseBaseFile(encoding?: string, delimiter?: string): Promise<any>;
    convertJSONToCSV(options?: json2csv.default.Options<any>, data?: any[]): Promise<string>;
    exportCSVToFile(folderPath: string, filename: string, textContent: string): Promise<string>;
    exportJSONTofile(folderPath: string, filename: string, jsonData: any[]): Promise<string>;
}
