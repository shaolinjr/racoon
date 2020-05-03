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
const path = __importStar(require("path"));
function fileExists(filePath) {
    return fs.existsSync(filePath);
}
exports.fileExists = fileExists;
function validFileExtension(filePath, allowedExtensions) {
    return allowedExtensions.includes(path.extname(filePath));
}
exports.validFileExtension = validFileExtension;
function getFileExtension(filePath) {
    return path.extname(filePath);
}
exports.getFileExtension = getFileExtension;
function checkFile(filePath, allowedExtensions) {
    if (!fileExists(filePath)) {
        throw new Error("Make sure the file provided exists");
    }
    else if (!validFileExtension(filePath, allowedExtensions)) {
        throw new Error(`File format not allowed. The allowed extensions are: ${allowedExtensions.join(", ")}`);
    }
}
exports.checkFile = checkFile;
