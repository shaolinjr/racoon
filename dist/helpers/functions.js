"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const csv = __importStar(require("csvtojson"));
function removeExtraSlashesFromUrl(url) {
    return url.replace(/([^:]\/)\/+/g, "$1");
}
exports.removeExtraSlashesFromUrl = removeExtraSlashesFromUrl;
async function timeoutPromise(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
exports.timeoutPromise = timeoutPromise;
function restartIndex(products, lastEAN) {
    let index = products.findIndex(el => el.ean.toString() == lastEAN.toString());
    if (index >= 0) {
        return index;
    }
    return 0;
}
exports.restartIndex = restartIndex;
function createGTINWithZeros(ean) {
    let newEAN = ean.toString();
    while (newEAN.length < 14) {
        newEAN = "0" + newEAN;
    }
    return newEAN;
}
exports.createGTINWithZeros = createGTINWithZeros;
function stripLeftZerosFromGTIN(ean) {
    for (let i = 0; i < ean.length; i++) {
        if (ean[i] != "0") {
            ean = ean.slice(i);
            break;
        }
    }
    return ean;
}
exports.stripLeftZerosFromGTIN = stripLeftZerosFromGTIN;
function readCSVFromFile(filePath, delimiter) {
    return new Promise((resolve, reject) => {
        csv.default({ delimiter }).fromFile(filePath)
            .then((result) => resolve(result));
    });
}
exports.readCSVFromFile = readCSVFromFile;
function extractNumbersFromString(text) {
    const numbersOnly = new RegExp("[0-9]+", "g");
    return text.match(numbersOnly);
}
exports.extractNumbersFromString = extractNumbersFromString;
function extractPriceFromString(priceInText) {
    // Example: R$ 240,00 até 5 dia(s) antes do início do curso.
    const priceRegex = new RegExp("(?<price>(?:(?:[0-9]{1,3}[.]{1})+[0-9]{3,}|[0-9]+),[0-9]{2})");
    const match = priceInText.match(priceRegex);
    if (match) {
        return parseInt(match.groups.price.replace(/[,.]/g, "")) / 100;
    }
    else {
        return null;
    }
}
exports.extractPriceFromString = extractPriceFromString;
