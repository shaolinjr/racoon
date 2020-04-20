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
        const price = priceRegex.exec(priceInText).groups.price;
        return parseInt(price.replace(/[,.]/g, "")) / 100;
    }
    else {
        return null;
    }
}
exports.extractPriceFromString = extractPriceFromString;
/**
 * This function will trigger a automatic scroll on the page and will stop when it reaches the bottom
 * @param page {puppeteer.Page} Puppeteer Page instance
 * @param distanceToScroll {number} Distance in pixels to scroll the page per cycle
 * @param speed {number} Control how fast the page is scrolled (in ms)
 */
async function autoScroll(page, distanceToScroll, speed) {
    await page.evaluate(async (speed, distanceToScroll) => {
        await new Promise((resolve, reject) => {
            let scrolledHeight = 0;
            const timer = setInterval(() => {
                var windowScrollHeight = document.body.scrollHeight;
                console.log("WindowHeight: ", windowScrollHeight);
                window.scrollBy(0, distanceToScroll);
                scrolledHeight += distanceToScroll;
                if (scrolledHeight >= windowScrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, speed);
        });
    }, speed, distanceToScroll);
}
exports.autoScroll = autoScroll;
// This function can be in the rakoon helper
function extractHoursAmountFromString(text) {
    // 440 h – 12 meses
    // 12 meses - 400h
    let hoursPattern = new RegExp("(?:(?<hours>[0-9]+)\\s*h)", "gi");
    let result = hoursPattern.exec(text);
    if (result) {
        return parseInt(result.groups.hours);
    }
    return null;
}
exports.extractHoursAmountFromString = extractHoursAmountFromString;
// This function can be in the rakoon helper
function extractDurationFromString(text) {
    // 440 h – 12 meses
    // 12 meses - 400h
    let durationPattern = new RegExp("(?<months>[0-9]+)\\s*m(?:ês|eses)", "gi");
    let result = durationPattern.exec(text);
    if (result) {
        return parseInt(result.groups.months);
    }
    return null;
}
exports.extractDurationFromString = extractDurationFromString;
