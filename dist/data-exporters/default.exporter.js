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
const json2csv_1 = require("json2csv");
const fs = __importStar(require("fs"));
const fs_1 = require("fs");
const fileExtensions_constants_1 = require("../constants/fileExtensions.constants");
const file_1 = require("../helpers/file");
class FileParser {
    constructor(baseFilePath) {
        this.baseFilePath = baseFilePath;
        this.ALLOWED_EXTENSIONS = [fileExtensions_constants_1.FILE_EXTENSIONS.JSON, fileExtensions_constants_1.FILE_EXTENSIONS.CSV];
        this.flatten = json2csv.transforms.flatten({ separator: "_", objects: true, arrays: false });
        file_1.checkFile(this.baseFilePath, this.ALLOWED_EXTENSIONS);
    }
    async parseBaseFile(options) {
        // const { encoding, delimiter, filePath } = options
        var _a, _b, _c, _d, _e;
        switch (file_1.getFileExtension(((_a = options) === null || _a === void 0 ? void 0 : _a.filePath) || this.baseFilePath)) {
            case ".csv":
                return csvtojson_1.default({ delimiter: ((_b = options) === null || _b === void 0 ? void 0 : _b.delimiter) || ";" }).fromFile(((_c = options) === null || _c === void 0 ? void 0 : _c.filePath) || this.baseFilePath);
            case ".json":
                return JSON.parse(fs.readFileSync(((_d = options) === null || _d === void 0 ? void 0 : _d.filePath) || this.baseFilePath, { encoding: ((_e = options) === null || _e === void 0 ? void 0 : _e.encoding) || "utf-8" }));
        }
    }
    async convertJSONToCSV(options = {}, data) {
        if (!data) {
            data = await this.parseBaseFile();
        }
        options.transforms = [].concat(options.transforms || [], [this.flatten]);
        return json2csv.parse(data, options);
    }
    /**
     * Method to perform the conversion from JSON to CSV in an async fashion. Takes advantage of the Streaming API.
     * @param {boolean} [returnCSV=false] Flag that states wether the resulting CSV should be returned from the method call
     * @param {string} [folderPath] The path to the destination folder of the new file
     * @param {string} [filename] The name that will be given to the new file
     * @param {son2csv.default.Options} [options] Object options to customize the execution of the parse (this is internal stuff of json2csv)
     */
    async $convertJSONToCSV(returnCSV = false, folderPath, filename, options = {}) {
        if (!returnCSV && (!folderPath || !filename)) {
            throw new Error("If you choose not to return the CSV in memory you must pass a folderPath and filename as parameter");
        }
        const opts = { ...options } || {};
        opts.transforms = [].concat(options.transforms || [], [this.flatten]);
        // console.log("OPTS: ", opts)
        const transformOptions = { highWaterMark: 6144, encoding: "utf-8" }; // 6GB WATERMARK
        const input = fs_1.createReadStream(this.baseFilePath, { encoding: "utf-8" });
        const asyncParser = new json2csv_1.AsyncParser(opts, transformOptions);
        if (!returnCSV) {
            // const jsonTransform = new json2csv.Transform(opts, transformOptions)
            const output = fs_1.createWriteStream(`${folderPath}/${filename}`, { encoding: "utf-8" });
            return asyncParser.fromInput(input).toOutput(output).promise(returnCSV);
        }
        else {
            return asyncParser.fromInput(input).promise(returnCSV);
        }
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
exports.FileParser = FileParser;
