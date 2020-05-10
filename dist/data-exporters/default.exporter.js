"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const csvtojson_1 = __importDefault(require("csvtojson"));
const json2csv = __importStar(require("json2csv"));
const fs = __importStar(require("fs"));
const fileExtensions_constants_1 = require("../constants/fileExtensions.constants");
const file_1 = require("../helpers/file");
class DefaultExporter {
    constructor(baseFilePath) {
        this.baseFilePath = baseFilePath;
        this.ALLOWED_EXTENSIONS = [fileExtensions_constants_1.FILE_EXTENSIONS.JSON, fileExtensions_constants_1.FILE_EXTENSIONS.CSV];
        this.flatten = json2csv.transforms.flatten({ separator: "_", objects: true, arrays: false });
        file_1.checkFile(this.baseFilePath, this.ALLOWED_EXTENSIONS);
    }
    async parseBaseFile(encoding = "utf-8", delimiter = ";") {
        switch (file_1.getFileExtension(this.baseFilePath)) {
            case ".csv":
                return csvtojson_1.default({ delimiter }).fromFile(this.baseFilePath);
            case ".json":
                return JSON.parse(fs.readFileSync(this.baseFilePath, { encoding }));
        }
    }
    async convertJSONToCSV(options = {}, data) {
        if (!data) {
            data = await this.parseBaseFile();
        }
        options.transforms = [].concat(options.transforms || [], [this.flatten]);
        return json2csv.parse(data, options);
    }
    exportCSVToFile(folderPath, filename, textContent) {
        return new Promise((resolve, reject) => {
            fs.writeFileSync(`${folderPath}/${filename}`, textContent);
            resolve(`${folderPath}/${filename}`);
        });
    }
    exportJSONTofile(folderPath, filename, jsonData) {
        return new Promise((resolve, reject) => {
            fs.writeFileSync(`${folderPath}/${filename}`, JSON.stringify(jsonData));
            resolve(`${folderPath}/${filename}`);
        });
    }
}
exports.DefaultExporter = DefaultExporter;
